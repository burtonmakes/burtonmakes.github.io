from __future__ import annotations

import base64
import copy
import gzip
import hashlib
import json
import math
import re
import shutil
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "src/data/cocometric-model"
BACKUP_DIR = ROOT / "src/data/cocometric-model-backup/pre-shape-revision"
PUBLIC_DIR = ROOT / "public/models"
ORIGINAL_GLB = PUBLIC_DIR / "cocometric-original-before-shape-revision.glb"
REVISED_GLB = PUBLIC_DIR / "cocometric-shape-revision.glb"
MANIFEST = MODEL_DIR / "shape-revision-manifest.json"
PART_COUNT = 6


def read_part(path: Path) -> str:
    source = path.read_text(encoding="utf-8")
    match = re.fullmatch(r'\s*export\s+default\s+("(?:[^"\\]|\\.)*")\s*;?\s*', source, re.S)
    if not match:
        raise RuntimeError(f"Could not parse embedded model part: {path}")
    return json.loads(match.group(1))


def read_embedded_glb() -> bytes:
    encoded = "".join(read_part(MODEL_DIR / f"part-{index}.js") for index in range(PART_COUNT))
    return gzip.decompress(base64.b64decode(encoded))


def preserve_original_parts() -> None:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    for index in range(PART_COUNT):
        source = MODEL_DIR / f"part-{index}.js"
        destination = BACKUP_DIR / source.name
        if not destination.exists():
            shutil.copyfile(source, destination)


def apply_material(mesh: trimesh.Trimesh, material: object) -> trimesh.Trimesh:
    mesh.visual = trimesh.visual.TextureVisuals(material=copy.deepcopy(material))
    return mesh


def box(extents: list[float], center: list[float], material: object) -> trimesh.Trimesh:
    mesh = trimesh.creation.box(extents=extents)
    mesh.apply_translation(center)
    return apply_material(mesh, material)


def cylinder(
    radius: float,
    height: float,
    center: list[float],
    material: object,
    *,
    sections: int = 24,
    axis: str = "z",
    tilt: float = 0.0,
) -> trimesh.Trimesh:
    mesh = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    if axis == "y":
        mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
        if tilt:
            mesh.apply_transform(trimesh.transformations.rotation_matrix(tilt, [0, 0, 1]))
    mesh.apply_translation(center)
    return apply_material(mesh, material)


def annulus(
    r_min: float,
    r_max: float,
    height: float,
    center: np.ndarray,
    material: object,
    *,
    sections: int = 48,
) -> trimesh.Trimesh:
    mesh = trimesh.creation.annulus(r_min=r_min, r_max=r_max, height=height, sections=sections)
    mesh.apply_translation(center)
    return apply_material(mesh, material)


def swept_blade(center: np.ndarray, base_angle: float, material: object) -> trimesh.Trimesh:
    r0, r1 = 0.045, 0.128
    angles = [base_angle - 0.055, base_angle + 0.070, base_angle + 0.205, base_angle + 0.115]
    points = np.array(
        [
            [r0 * np.cos(angles[0]), r0 * np.sin(angles[0])],
            [r0 * np.cos(angles[1]), r0 * np.sin(angles[1])],
            [r1 * np.cos(angles[2]), r1 * np.sin(angles[2])],
            [r1 * np.cos(angles[3]), r1 * np.sin(angles[3])],
        ]
    )
    z0, z1 = center[2] - 0.006, center[2] + 0.006
    vertices = np.vstack(
        [
            np.column_stack([points + center[:2], np.full(4, z0)]),
            np.column_stack([points + center[:2], np.full(4, z1)]),
        ]
    )
    faces = np.array(
        [
            [0, 1, 2], [0, 2, 3],
            [4, 6, 5], [4, 7, 6],
            [0, 4, 5], [0, 5, 1],
            [1, 5, 6], [1, 6, 2],
            [2, 6, 7], [2, 7, 3],
            [3, 7, 4], [3, 4, 0],
        ]
    )
    return apply_material(trimesh.Trimesh(vertices=vertices, faces=faces, process=False), material)


def add(scene: trimesh.Scene, name: str, mesh: trimesh.Trimesh) -> None:
    scene.add_geometry(mesh, geom_name=name, node_name=name)


def replace(scene: trimesh.Scene, name: str, mesh: trimesh.Trimesh) -> None:
    scene.delete_geometry(name)
    add(scene, name, mesh)


def revise_shapes(original: bytes) -> bytes:
    source_path = PUBLIC_DIR / ".cocometric-shape-source.glb"
    source_path.write_bytes(original)
    scene = trimesh.load(source_path, force="scene")
    source_path.unlink(missing_ok=True)

    fan_material = copy.deepcopy(scene.geometry["GPU_0_Fan_0"].visual.material)
    hub_material = copy.deepcopy(scene.geometry["GPU_0_Hub_0"].visual.material)
    metal_material = copy.deepcopy(scene.geometry["NIC_Bracket"].visual.material)
    router_material = copy.deepcopy(scene.geometry["PSU_0"].visual.material)

    # Stage 05: replace the four oversized plain discs with compact recessed
    # fan assemblies that have a rim, nine swept blades, and a smaller hub.
    for gpu_index, y_center in [(0, -1.85), (1, -1.35)]:
        for fan_index, x_center in enumerate([-0.20, 0.45]):
            center = np.array([x_center, y_center, 0.535])
            aperture = cylinder(
                0.145,
                0.012,
                [x_center, y_center, 0.523],
                hub_material,
                sections=48,
            )
            rim = annulus(0.132, 0.158, 0.014, center, fan_material, sections=48)
            blades = [
                swept_blade(center, blade_index * 2 * np.pi / 9, fan_material)
                for blade_index in range(9)
            ]
            fan = apply_material(trimesh.util.concatenate([aperture, rim, *blades]), fan_material)
            replace(scene, f"GPU_{gpu_index}_Fan_{fan_index}", fan)
            replace(
                scene,
                f"GPU_{gpu_index}_Hub_{fan_index}",
                cylinder(
                    0.038,
                    0.018,
                    [x_center, y_center, 0.545],
                    hub_material,
                    sections=28,
                ),
            )

    # Stage 07: replace the abstract L-shaped NIC card with a compact edge
    # router/gateway that has three antennas and three visible network ports.
    for name in ["NIC_PCB", "NIC_Bracket", "NIC_Port_0", "NIC_Port_1", "NIC_Port_2"]:
        if name in scene.geometry:
            scene.delete_geometry(name)

    add(scene, "NIC_Router_Body", box([1.16, 0.30, 0.58], [2.40, -1.78, 0.84], router_material))
    add(scene, "NIC_Router_Top", box([1.06, 0.025, 0.48], [2.40, -1.617, 0.84], metal_material))
    for port_index, z_position in enumerate([0.69, 0.84, 0.99]):
        add(
            scene,
            f"NIC_Port_{port_index}",
            box([0.055, 0.095, 0.105], [1.79, -1.78, z_position], metal_material),
        )

    for antenna_index, (x_position, tilt) in enumerate(
        zip([1.98, 2.40, 2.82], [-0.15, 0.0, 0.15], strict=True)
    ):
        add(
            scene,
            f"NIC_Antenna_Base_{antenna_index}",
            cylinder(
                0.050,
                0.065,
                [x_position, -1.595, 1.075],
                metal_material,
                sections=20,
                axis="y",
                tilt=tilt,
            ),
        )
        add(
            scene,
            f"NIC_Antenna_{antenna_index}",
            cylinder(
                0.025,
                0.40,
                [x_position, -1.38, 1.075],
                hub_material,
                sections=20,
                axis="y",
                tilt=tilt,
            ),
        )

    revised = scene.export(file_type="glb")
    check_path = PUBLIC_DIR / ".cocometric-shape-check.glb"
    check_path.write_bytes(revised)
    check = trimesh.load(check_path, force="scene")
    check_path.unlink(missing_ok=True)

    names = set(check.geometry)
    required = {"GPU_0_Body", "GPU_1_Body", "NIC_Router_Body", "NIC_Antenna_0", "PSU_0"}
    missing = sorted(required - names)
    if missing:
        raise RuntimeError(f"Revised GLB is missing required geometry: {missing}")
    if sum(name.startswith("GPU_") for name in names) < 18:
        raise RuntimeError("Revised GLB does not contain the expected GPU geometry")
    if sum(name.startswith("NIC_") for name in names) < 11:
        raise RuntimeError("Revised GLB does not contain the expected router geometry")

    return revised


def write_parts(glb: bytes) -> None:
    encoded = base64.b64encode(gzip.compress(glb, compresslevel=9, mtime=0)).decode("ascii")
    chunk_size = math.ceil(len(encoded) / PART_COUNT / 4) * 4
    for index in range(PART_COUNT):
        start = index * chunk_size
        end = len(encoded) if index == PART_COUNT - 1 else min(len(encoded), start + chunk_size)
        content = f"export default {json.dumps(encoded[start:end])};\n"
        (MODEL_DIR / f"part-{index}.js").write_text(content, encoding="utf-8")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    preserve_original_parts()

    if ORIGINAL_GLB.exists():
        original = ORIGINAL_GLB.read_bytes()
    else:
        original = read_embedded_glb()
        ORIGINAL_GLB.write_bytes(original)

    revised = revise_shapes(original)
    REVISED_GLB.write_bytes(revised)
    write_parts(revised)

    manifest = {
        "profile": "shape-revision-v1",
        "geometryChanged": True,
        "backupBranch": "backup/cocometric-glb-original-2026-07-12",
        "original": {
            "path": str(ORIGINAL_GLB.relative_to(ROOT)),
            "bytes": len(original),
            "sha256": sha256(original),
        },
        "revised": {
            "path": str(REVISED_GLB.relative_to(ROOT)),
            "bytes": len(revised),
            "sha256": sha256(revised),
        },
        "changes": [
            "Replaced oversized GPU discs with compact recessed fan assemblies and swept blades.",
            "Replaced the abstract NIC card with a compact router/gateway appliance and three antennas.",
            "Preserved all non-target geometry and the original material palette.",
        ],
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Original GLB: {len(original):,} bytes ({sha256(original)})")
    print(f"Revised GLB: {len(revised):,} bytes ({sha256(revised)})")
    print("Cocometric GPU and router geometry revised successfully.")


if __name__ == "__main__":
    main()
