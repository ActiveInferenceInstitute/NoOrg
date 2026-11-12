#!/usr/bin/env python3
"""Pinned GNN conformance check.

Reads .github/gnn-pin.json, installs the pinned parser revision, and verifies
that the repository's GNN sketches parse, validate, and type-check. When the
repository has no sketch, the pinned upstream exemplar is checked instead.

The check is a pipeline and pin conformance baseline. It does not claim that
the repository contains a GNN model.

Usage: python3 scripts/gnn-conformance.py
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PIN_PATH = ROOT / ".github" / "gnn-pin.json"
PIN_SCHEMA = "gnn-importer-pin/v1"
PARSER_DEPENDENCIES = (
    ("defusedxml", "defusedxml"),
    ("psutil", "psutil"),
    ("yaml", "pyyaml"),
)
EXEMPLAR_PATH = "input/gnn_files/basics/static_perception.md"


def fail(message: str) -> None:
    raise SystemExit(message)


def load_pin() -> dict[str, str]:
    if not PIN_PATH.is_file():
        fail(f"{PIN_PATH.relative_to(ROOT)} is missing")
    pin = json.loads(PIN_PATH.read_text(encoding="utf-8"))
    if pin.get("schema") != PIN_SCHEMA:
        fail(f"pin schema is {pin.get('schema')!r}, expected {PIN_SCHEMA!r}")
    for field in ("repository", "revision", "tag"):
        value = pin.get(field)
        if not isinstance(value, str) or not value:
            fail(f"pin field {field!r} is missing")
    revision = pin["revision"]
    if len(revision) != 40 or any(character not in "0123456789abcdef" for character in revision):
        fail(f"pin revision {revision!r} is not a 40-character commit id")
    if not pin["tag"].startswith("v"):
        fail(f"pin tag {pin['tag']!r} is not a version tag")
    return pin


def verify_dependencies() -> None:
    missing = []
    for module, requirement in PARSER_DEPENDENCIES:
        try:
            __import__(module)
        except ModuleNotFoundError:
            missing.append(requirement)
    if missing:
        fail(
            "missing parser dependencies: "
            + ", ".join(missing)
            + "; install them with python3 -m pip install "
            + " ".join(missing)
        )


def install_parser(pin: dict[str, str]) -> None:
    spec = (
        "generalized-notation-notation @ "
        f"git+https://github.com/{pin['repository']}.git@{pin['revision']}"
    )
    command = [sys.executable, "-m", "pip", "install", "--disable-pip-version-check", "--no-deps", spec]
    try:
        subprocess.check_call(command)
    except subprocess.CalledProcessError:
        version = sys.version.split()[0]
        fail(
            f"the pinned parser could not be installed for Python {version}; "
            "CI uses Python 3.12 and the parser declares its own supported range. "
            f"Retry with a supported interpreter: {sys.executable} {Path(__file__).name}"
        )


def verify_parser(pin: dict[str, str]) -> str:
    from gnn import __version__

    expected = pin["tag"].removeprefix("v")
    if __version__ != expected:
        fail(f"installed GNN {__version__!r} does not match {pin['tag']!r}")
    return __version__


def check_sketches() -> tuple[int, str]:
    from gnn.parsers.basic import parse_gnn_formal, validate_gnn_syntax
    from gnn.type_checker import GNNTypeChecker

    sketches = sorted(ROOT.rglob("*.gnn.md"))
    if not sketches:
        return check_exemplar()
    for sketch in sketches:
        parsed = parse_gnn_formal(sketch)
        if parsed is None or getattr(parsed, "parse_errors", None):
            fail(f"{sketch.relative_to(ROOT)} did not parse cleanly")
        valid, errors = validate_gnn_syntax(sketch.read_text(encoding="utf-8"))
        if not valid:
            fail(f"{sketch.relative_to(ROOT)} syntax errors: {errors!r}")
    with tempfile.TemporaryDirectory(prefix="repo-gnn-") as output_dir:
        model_dir = Path(output_dir) / "models"
        model_dir.mkdir()
        for index, sketch in enumerate(sketches):
            shutil.copy2(sketch, model_dir / f"{index:03d}_{sketch.name}")
        if not GNNTypeChecker().validate_gnn_files(model_dir, Path(output_dir)):
            fail("GNN type checker rejected the repository sketches")
    return len(sketches), "repository"


def check_exemplar() -> tuple[int, str]:
    from gnn.parsers.basic import parse_gnn_formal, validate_gnn_syntax
    from gnn.type_checker import GNNTypeChecker

    pin = load_pin()
    exemplar_url = (
        "https://raw.githubusercontent.com/"
        f"{pin['repository']}/{pin['revision']}/{EXEMPLAR_PATH}"
    )
    with tempfile.TemporaryDirectory(prefix="pinned-exemplar-") as output_dir:
        exemplar = Path(output_dir) / Path(EXEMPLAR_PATH).name
        urllib.request.urlretrieve(exemplar_url, exemplar)
        parsed = parse_gnn_formal(exemplar)
        if parsed is None or getattr(parsed, "parse_errors", None):
            fail("pinned exemplar did not parse cleanly")
        valid, errors = validate_gnn_syntax(exemplar.read_text(encoding="utf-8"))
        if not valid:
            fail(f"pinned exemplar syntax errors: {errors!r}")
        model_dir = Path(output_dir) / "models"
        model_dir.mkdir()
        shutil.copy2(exemplar, model_dir / exemplar.name)
        if not GNNTypeChecker().validate_gnn_files(model_dir, Path(output_dir)):
            fail("GNN type checker rejected the pinned exemplar")
    return 1, "pinned-exemplar"


def main() -> None:
    pin = load_pin()
    verify_dependencies()
    install_parser(pin)
    version = verify_parser(pin)
    models, source = check_sketches()
    print(
        json.dumps(
            {
                "gnn-version": version,
                "pin-revision": pin["revision"],
                "models": models,
                "source": source,
                "result": "verified",
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
