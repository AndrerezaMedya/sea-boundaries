from __future__ import annotations

import argparse
import os
from pathlib import Path

DEFAULT_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py"}
COMMENT_PREFIXES = {"//", "/*", "*", "#"}
SKIP_DIRECTORIES = {
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".turbo",
    "out",
}


def count_lines(path: Path, include_extensions: set[str]) -> int:
    total = 0
    for root, dirs, files in os.walk(path):
        dirs[:] = [name for name in dirs if name not in SKIP_DIRECTORIES]
        for name in files:
            ext = Path(name).suffix.lower()
            if ext not in include_extensions:
                continue
            file_path = Path(root) / name
            try:
                with file_path.open("r", encoding="utf-8", errors="ignore") as handle:
                    for line in handle:
                        stripped = line.strip()
                        if not stripped:
                            continue
                        if any(stripped.startswith(prefix) for prefix in COMMENT_PREFIXES):
                            continue
                        total += 1
            except OSError:
                continue
    return total


def main() -> None:
    parser = argparse.ArgumentParser(description="Count functional lines of code.")
    parser.add_argument("path", nargs="?", default=".", help="Root directory to scan")
    parser.add_argument(
        "--ext",
        nargs="*",
        default=sorted(DEFAULT_EXTENSIONS),
        help="File extensions to include (default: %(default)s)",
    )
    args = parser.parse_args()
    extensions = {ext if ext.startswith(".") else f".{ext}" for ext in args.ext}
    result = count_lines(Path(args.path), extensions)
    print(result)


if __name__ == "__main__":
    main()
