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
BACKUP_GLB = PUBLIC_DIR / "cocometric-before-antenna-axis-fix.glb"
OUTPUT_GLB = PUBLIC_DIR / "cocometric-shape-revision.glb"
MANIFEST = MODEL_DIR / "shape-revision-manifest.json"
PART_COUNT = 6
ANTENNA_ORANGE = [232, 131, 74, 255]

# The Cocometric GLB uses Y as vertical and Z as front/back.
ROUTER_CENTER_X = 2.40
ROUTER_CENTER_Y = -1.78
ROUTER_CENTER_Z = 0.84
ROUTER_WIDTH = 1.16
ROUTER_HEIGHT = 0.30
ROUTER_DEPTH = 0.58
ROUTER_TOP_Y = ROUTER_CENTER_Y + ROUTER_HEIGHT / 2
ROUTER_REAR_Z = ROUTER_CENTER_Z - ROUTER_DEPTH / 2


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


def y_axis_cylinder(
    radius: float,
    height: float,
    x_position: float,
    y_start: float,
    z_position: float,
    material: object,
    *,
    tilt: float = 0.0,
    sections: int = 28,
) -> trimesh.Trimesh:
    mesh = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)

    # Start with the cylinder anchored at Z=0, then rotate its axis from +Z
    # into +Y. The previous model left the cylinder on Z, which made it point
    # horizontally toward the camera.
    mesh.apply_translation([0.0, 0.0, height / 2])
    mesh.apply_transform(
        trimesh.transformations.rotation_matrix(-math.pi / 2, [1.0, 0.0, 0.0])
    )

    # Fan the outer antennas slightly left and right while keeping them in the
    # rear plane of the router.
    if tilt:
        mesh.apply_transform(
            trimesh.transformations.rotation_matrix(tilt, [0.0, 0.0, 1.0])
        )

    mesh.apply_translation([x_position, y_start, z_position])
    return apply_material(mesh, material)


def rebuild_router_antennas(scene: trimesh.Scene) -> None:
    names = set(scene.geometry)
    if "NIC_Router_Body" not in names:
        raise RuntimeError("Router body is missing from the Cocometric model")

    removable = {"NIC_Router_Top"}
    removable.update(f"NIC_Antenna_Base_{index}" for index in range(3))
    removable.update(f"NIC_Antenna_{index}" for index in range(3))
    for name in removable:
        if name in scene.geometry:
            scene.delete_geometry(name)

    orange_material = trimesh.visual.material.PBRMaterial(
        name="Cocometric_Antenna_Orange",
        baseColorFactor=ANTENNA_ORANGE,
        metallicFactor=0.24,
        roughnessFactor=0.38,
    )

    # Mount the antennas just inside the router's rear edge. From the stage-07
    # camera, the enclosure hides the connection points while the rods rise
    # cleanly above the box.
    rear_z = ROUTER_REAR_Z + 0.035
    root_y = ROUTER_TOP_Y - 0.025
    antenna_layout = [
        (2.06, 0.10),
        (2.40, 0.0),
        (2.74, -0.10),
    ]

    for index, (x_position, tilt) in enumerate(antenna_layout):
        add_geometry(
            scene,
            f"NIC_Antenna_Base_{index}",
            y_axis_cylinder(
                0.038,
                0.10,
                x_position,
                root_y,
                rear_z,
                orange_material,
                tilt=tilt,
            ),
        )
        add_geometry(
            scene,
            f"NIC_Antenna_{index}",
            y_axis_cylinder(
                0.022,
                0.48,
                x_position,
                root_y + 0.055,
                rear_z,
                orange_material,
                tilt=tilt,
            ),
        )


def validate_router_antennas(scene: trimesh.Scene) -> None:
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
        raise RuntimeError("Detached router panel was not removed")

    for index in range(3):
        base = scene.geometry[f"NIC_Antenna_Base_{index}"]
        rod = scene.geometry[f"NIC_Antenna_{index}"]
        rod_extent = rod.bounds[1] - rod.bounds[0]

        if rod_extent[1] < 0.42:
            raise RuntimeError(f"Antenna {index} is not vertical along the Y axis")
        if rod_extent[2] > 0.08:
            raise RuntimeError(f"Antenna {index} still projects along the Z depth axis")
        if rod.bounds[0][1] > ROUTER_TOP_Y + 0.08:
            raise RuntimeError(f"Antenna {index} is detached above the router")
        if base.bounds[1][2] > ROUTER_CENTER_Z:
            raise RuntimeError(f"Antenna base {index} is on the visible front half")
        if rod.bounds[1][1] < ROUTER_TOP_Y + 0.40:
            raise RuntimeError(f"Antenna {index} is not visibly above the router")


def main() -> None:
    if not SOURCE_GLB.exists():
        raise RuntimeError(f"Missing source GLB: {SOURCE_GLB}")

    if not BACKUP_GLB.exists():
        shutil.copyfile(SOURCE_GLB, BACKUP_GLB)

    scene = load_scene(SOURCE_GLB)
    rebuild_router_antennas(scene)
    validate_router_antennas(scene)

    revised = scene.export(file_type="glb")
    OUTPUT_GLB.write_bytes(revised)
    write_parts(revised)

    check_path = PUBLIC_DIR / ".cocometric-antenna-axis-check.glb"
    check_path.write_bytes(revised)
    check = load_scene(check_path)
    check_path.unlink(missing_ok=True)
    validate_router_antennas(check)

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    manifest.update(
        {
            "profile": "shape-revision-v4-rear-y-axis-antennas",
            "geometryChanged": True,
            "antennaPlacement": "rear-mounted-y-axis",
            "antennaColor": "#E8834A",
            "routerWallRemoved": True,
            "antennaAxisFixBackup": {
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
            "Removed the detached router panel and the forward-facing antenna rods.",
            "Rebuilt three coral-orange antennas on the GLB Y axis so they rise vertically.",
            "Mounted the antenna roots inside the rear edge of the router so the connections are hidden.",
        ]
    )
    manifest["changes"] = changes
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Corrected antenna GLB: {len(revised):,} bytes ({sha256(revised)})")


if __name__ == "__main__":
    main()
