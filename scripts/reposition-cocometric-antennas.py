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
BACKUP_GLB = PUBLIC_DIR / "cocometric-before-rear-antennas.glb"
OUTPUT_GLB = PUBLIC_DIR / "cocometric-shape-revision.glb"
MANIFEST = MODEL_DIR / "shape-revision-manifest.json"
PART_COUNT = 6
ANTENNA_ORANGE = [232, 131, 74, 255]


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


def main() -> None:
    if not SOURCE_GLB.exists():
        raise RuntimeError(f"Missing source GLB: {SOURCE_GLB}")

    if not BACKUP_GLB.exists():
        shutil.copyfile(SOURCE_GLB, BACKUP_GLB)

    scene = load_scene(SOURCE_GLB)
    required = {
        *(f"NIC_Antenna_Base_{index}" for index in range(3)),
        *(f"NIC_Antenna_{index}" for index in range(3)),
    }
    missing = sorted(required - set(scene.geometry))
    if missing:
        raise RuntimeError(f"Missing antenna geometry: {missing}")

    orange_material = trimesh.visual.material.PBRMaterial(
        name="Cocometric_Antenna_Orange",
        baseColorFactor=ANTENNA_ORANGE,
        metallicFactor=0.28,
        roughnessFactor=0.36,
    )

    # Move the mounting bases to the rear face of the router body and move the
    # antenna rods farther behind it so their connection points are concealed.
    for index in range(3):
        base = scene.geometry[f"NIC_Antenna_Base_{index}"]
        rod = scene.geometry[f"NIC_Antenna_{index}"]

        base.apply_translation([0.0, -0.37, 0.0])
        rod.apply_translation([0.0, -0.80, 0.0])

        base.visual = trimesh.visual.TextureVisuals(material=orange_material.copy())
        rod.visual = trimesh.visual.TextureVisuals(material=orange_material.copy())

    revised = scene.export(file_type="glb")
    OUTPUT_GLB.write_bytes(revised)
    write_parts(revised)

    check_path = PUBLIC_DIR / ".cocometric-rear-antenna-check.glb"
    check_path.write_bytes(revised)
    check = load_scene(check_path)
    check_path.unlink(missing_ok=True)

    check_missing = sorted(required - set(check.geometry))
    if check_missing:
        raise RuntimeError(f"Revised GLB lost antenna geometry: {check_missing}")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    manifest.update(
        {
            "profile": "shape-revision-v2-rear-orange-antennas",
            "geometryChanged": True,
            "antennaPlacement": "rear-mounted",
            "antennaColor": "#E8834A",
            "antennaBackup": {
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
        if "antenna" not in change.lower()
    ]
    changes.extend(
        [
            "Moved all three router antennas to the rear face so the mounting connections are concealed.",
            "Applied the Cocometric coral-orange palette color #E8834A to the antenna bases and rods.",
        ]
    )
    manifest["changes"] = changes
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Rear-mounted orange antenna GLB: {len(revised):,} bytes ({sha256(revised)})")


if __name__ == "__main__":
    main()
