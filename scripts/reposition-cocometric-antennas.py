from __future__ import annotations

import base64
import copy
import gzip
import hashlib
import json
import math
import shutil
from pathlib import Path

import trimesh

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "src/data/cocometric-model"
PUBLIC_DIR = ROOT / "public/models"
SOURCE_GLB = PUBLIC_DIR / "cocometric-shape-revision.glb"
BACKUP_GLB = PUBLIC_DIR / "cocometric-before-router-cleanup.glb"
OUTPUT_GLB = PUBLIC_DIR / "cocometric-shape-revision.glb"
MANIFEST = MODEL_DIR / "shape-revision-manifest.json"
PART_COUNT = 6
ANTENNA_ORANGE = [232, 131, 74, 255]
ROUTER_REAR_Y = -1.90
ROUTER_TOP_Z = 1.13


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def write_parts(glb: bytes) -> None:
    encoded = base64.b64encode(gzip.compress(glb, compresslevel=9, mtime=0)).decode("ascii")
    chunk_size = math.ceil(len(encoded) / PART_COUNT / 4) * 4
    for index in range(PART_COUNT):
        start = index * chunk_size
        end = len(encoded) if index == PART_COUNT - 1 else min(len(encoded), start + chunk_size)
        (MODEL_DIR / f"part-{index}.js").write_text(
            f"export default {json.dumps(encoded[start:end])};\n",
            encoding="utf-8",
        )


def load_scene(path: Path) -> trimesh.Scene:
    loaded = trimesh.load(path, force="scene")
    if not isinstance(loaded, trimesh.Scene):
        raise RuntimeError("Cocometric model did not load as a scene")
    return loaded


def add_geometry(scene: trimesh.Scene, name: str, mesh: trimesh.Trimesh) -> None:
    scene.add_geometry(mesh, geom_name=name, node_name=name)


def apply_material(mesh: trimesh.Trimesh, material: object) -> trimesh.Trimesh:
    mesh.visual = trimesh.visual.TextureVisuals(material=copy.deepcopy(material))
    return mesh


def vertical_base(x_position: float, material: object) -> trimesh.Trimesh:
    height = 0.12
    mesh = trimesh.creation.cylinder(radius=0.052, height=height, sections=28)
    mesh.apply_translation([x_position, ROUTER_REAR_Y, ROUTER_TOP_Z + 0.01])
    return apply_material(mesh, material)


def vertical_antenna(
    x_position: float,
    tilt: float,
    material: object,
) -> trimesh.Trimesh:
    height = 0.52
    mesh = trimesh.creation.cylinder(radius=0.027, height=height, sections=28)

    # Build from the attachment point upward, then tilt around that attachment
    # point. This keeps each antenna physically connected to the rear edge.
    mesh.apply_translation([0.0, 0.0, height / 2])
    if tilt:
        mesh.apply_transform(trimesh.transformations.rotation_matrix(tilt, [0.0, 1.0, 0.0]))
    mesh.apply_translation([x_position, ROUTER_REAR_Y, ROUTER_TOP_Z + 0.06])
    return apply_material(mesh, material)


def rebuild_router_hardware(scene: trimesh.Scene) -> None:
    names = set(scene.geometry)
    if "NIC_Router_Body" not in names:
        raise RuntimeError("Router body is missing from the Cocometric model")

    # The old NIC_Router_Top was authored as a thin vertical slab, which read
    # as a detached back wall. The old antennas ran along the depth axis, so
    # the camera saw their circular ends as three floating dots. Remove all of
    # those pieces and rebuild only attached vertical rear antennas.
    removable = {"NIC_Router_Top"}
    removable.update(f"NIC_Antenna_Base_{index}" for index in range(3))
    removable.update(f"NIC_Antenna_{index}" for index in range(3))
    for name in removable:
        if name in scene.geometry:
            scene.delete_geometry(name)

    orange_material = trimesh.visual.material.PBRMaterial(
        name="Cocometric_Antenna_Orange",
        baseColorFactor=ANTENNA_ORANGE,
        metallicFactor=0.28,
        roughnessFactor=0.34,
    )

    antenna_layout = [
        (2.02, -0.14),
        (2.40, 0.0),
        (2.78, 0.14),
    ]
    for index, (x_position, tilt) in enumerate(antenna_layout):
        add_geometry(
            scene,
            f"NIC_Antenna_Base_{index}",
            vertical_base(x_position, orange_material),
        )
        add_geometry(
            scene,
            f"NIC_Antenna_{index}",
            vertical_antenna(x_position, tilt, orange_material),
        )


def validate_router_hardware(scene: trimesh.Scene) -> None:
    names = set(scene.geometry)
    required = {
        "NIC_Router_Body",
        *(f"NIC_Antenna_Base_{index}" for index in range(3)),
        *(f"NIC_Antenna_{index}" for index in range(3)),
    }
    missing = sorted(required - names)
    if missing:
        raise RuntimeError(f"Revised GLB is missing router geometry: {missing}")
    if "NIC_Router_Top" in names:
        raise RuntimeError("Detached router wall geometry was not removed")

    for index in range(3):
        base = scene.geometry[f"NIC_Antenna_Base_{index}"]
        rod = scene.geometry[f"NIC_Antenna_{index}"]
        if base.bounds[0][2] < 1.0 or rod.bounds[0][2] < 1.0:
            raise RuntimeError(f"Antenna {index} is detached below the router")
        if rod.bounds[1][2] < 1.55:
            raise RuntimeError(f"Antenna {index} is not vertically visible")
        if base.bounds[1][1] > -1.82 or rod.bounds[1][1] > -1.82:
            raise RuntimeError(f"Antenna {index} is not mounted on the router rear edge")


def main() -> None:
    if not SOURCE_GLB.exists():
        raise RuntimeError(f"Missing source GLB: {SOURCE_GLB}")

    if not BACKUP_GLB.exists():
        shutil.copyfile(SOURCE_GLB, BACKUP_GLB)

    scene = load_scene(SOURCE_GLB)
    rebuild_router_hardware(scene)
    validate_router_hardware(scene)

    revised = scene.export(file_type="glb")
    OUTPUT_GLB.write_bytes(revised)
    write_parts(revised)

    check_path = PUBLIC_DIR / ".cocometric-router-cleanup-check.glb"
    check_path.write_bytes(revised)
    check = load_scene(check_path)
    check_path.unlink(missing_ok=True)
    validate_router_hardware(check)

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    manifest.update(
        {
            "profile": "shape-revision-v3-attached-rear-antennas",
            "geometryChanged": True,
            "antennaPlacement": "rear-mounted-vertical",
            "antennaColor": "#E8834A",
            "routerWallRemoved": True,
            "routerCleanupBackup": {
                "path": str(BACKUP_GLB.relative_to(ROOT)),
                "bytes": BACKUP_GLB.stat().st_size,
                "sha256": sha256(BACKUP_GLB.read_bytes()),
            },
            "revised": {
                "path": str(OUTPUT_GLB.relative_to(ROOT)),
                "bytes": len(revised),
                "sha256": sha256(revised),
            },
        }
    )
    changes = [
        change
        for change in manifest.get("changes", [])
        if "antenna" not in change.lower() and "router" not in change.lower()
    ]
    changes.extend(
        [
            "Removed the detached vertical router slab that appeared as a strange back wall.",
            "Removed the depth-facing antenna parts that appeared as three floating dots.",
            "Added three attached vertical antennas along the rear edge of the router box.",
            "Kept the antennas in the Cocometric coral-orange palette color #E8834A.",
        ]
    )
    manifest["changes"] = changes
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Clean router GLB: {len(revised):,} bytes ({sha256(revised)})")


if __name__ == "__main__":
    main()
