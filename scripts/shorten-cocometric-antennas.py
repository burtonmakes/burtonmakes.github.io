from __future__ import annotations

import base64
import gzip
import hashlib
import json
import math
import shutil
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "src/data/cocometric-model"
PUBLIC_DIR = ROOT / "public/models"
SOURCE_GLB = PUBLIC_DIR / "cocometric-shape-revision.glb"
BACKUP_GLB = PUBLIC_DIR / "cocometric-before-shorter-antennas.glb"
OUTPUT_GLB = PUBLIC_DIR / "cocometric-shape-revision.glb"
MANIFEST = MODEL_DIR / "shape-revision-manifest.json"
PART_COUNT = 6
ROD_HEIGHT_SCALE = 0.58
ROD_DIAMETER_SCALE = 0.82
BASE_HEIGHT_SCALE = 0.65
BASE_DIAMETER_SCALE = 0.78


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
        raise RuntimeError("Cocometric GLB did not load as a scene")
    return loaded


def scale_about_bottom(
    mesh: trimesh.Trimesh,
    *,
    height_scale: float,
    diameter_scale: float,
) -> None:
    bounds = mesh.bounds.copy()
    anchor = np.array(
        [
            (bounds[0, 0] + bounds[1, 0]) / 2,
            bounds[0, 1],
            (bounds[0, 2] + bounds[1, 2]) / 2,
        ],
        dtype=float,
    )
    transform = (
        trimesh.transformations.translation_matrix(anchor)
        @ np.diag([diameter_scale, height_scale, diameter_scale, 1.0])
        @ trimesh.transformations.translation_matrix(-anchor)
    )
    mesh.apply_transform(transform)


def shorten_antennas(scene: trimesh.Scene) -> dict[str, float]:
    original_heights: dict[str, float] = {}
    for index in range(3):
        rod_name = f"NIC_Antenna_{index}"
        base_name = f"NIC_Antenna_Base_{index}"
        if rod_name not in scene.geometry or base_name not in scene.geometry:
            raise RuntimeError(f"Missing antenna geometry for index {index}")

        rod = scene.geometry[rod_name]
        base = scene.geometry[base_name]
        original_heights[rod_name] = float(rod.extents[1])

        scale_about_bottom(
            rod,
            height_scale=ROD_HEIGHT_SCALE,
            diameter_scale=ROD_DIAMETER_SCALE,
        )
        scale_about_bottom(
            base,
            height_scale=BASE_HEIGHT_SCALE,
            diameter_scale=BASE_DIAMETER_SCALE,
        )

    return original_heights


def validate(scene: trimesh.Scene, original_heights: dict[str, float]) -> None:
    for index in range(3):
        rod_name = f"NIC_Antenna_{index}"
        base_name = f"NIC_Antenna_Base_{index}"
        rod = scene.geometry[rod_name]
        base = scene.geometry[base_name]

        expected = original_heights[rod_name] * ROD_HEIGHT_SCALE
        actual = float(rod.extents[1])
        if not math.isclose(actual, expected, rel_tol=0.03, abs_tol=0.01):
            raise RuntimeError(
                f"Antenna {index} height mismatch: expected about {expected:.4f}, got {actual:.4f}"
            )
        if actual >= original_heights[rod_name] * 0.7:
            raise RuntimeError(f"Antenna {index} was not shortened enough")
        if actual <= 0.12:
            raise RuntimeError(f"Antenna {index} became too short to read as an antenna")
        if float(base.extents[0]) >= float(rod.extents[0]) * 4.5:
            raise RuntimeError(f"Antenna base {index} remains too visually prominent")


def main() -> None:
    if not SOURCE_GLB.exists():
        raise RuntimeError(f"Missing source GLB: {SOURCE_GLB}")

    if not BACKUP_GLB.exists():
        shutil.copyfile(SOURCE_GLB, BACKUP_GLB)

    scene = load_scene(SOURCE_GLB)
    original_heights = shorten_antennas(scene)
    validate(scene, original_heights)

    revised = scene.export(file_type="glb")
    OUTPUT_GLB.write_bytes(revised)
    write_parts(revised)

    check_path = PUBLIC_DIR / ".cocometric-short-antenna-check.glb"
    check_path.write_bytes(revised)
    check = load_scene(check_path)
    check_path.unlink(missing_ok=True)
    validate(check, original_heights)

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    manifest.update(
        {
            "profile": "shape-revision-v5-short-rear-antennas",
            "geometryChanged": True,
            "antennaPlacement": "rear-mounted-y-axis",
            "antennaColor": "#E8834A",
            "antennaLengthScale": ROD_HEIGHT_SCALE,
            "antennaDiameterScale": ROD_DIAMETER_SCALE,
            "shortAntennaBackup": {
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
        if "short" not in change.lower() and "pronounced" not in change.lower()
    ]
    changes.append(
        "Shortened the three rear router antennas to 58% of their previous height and reduced their diameter so they remain present but visually subdued."
    )
    manifest["changes"] = changes
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Short-antenna GLB: {len(revised):,} bytes ({sha256(revised)})")


if __name__ == "__main__":
    main()
