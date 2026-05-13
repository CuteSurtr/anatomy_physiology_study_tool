#!/usr/bin/env python3

from __future__ import annotations

import argparse
import csv
import math
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


MIN_WIDTH = 250
MIN_HEIGHT = 250
MIN_AREA = 80_000
MAX_WIDE_ASPECT = 3.0
MAX_WIDE_LOW_ENTROPY = 2.9


@dataclass(frozen=True)
class PdfImageRow:
    page: int
    num: int
    kind: str
    width: int
    height: int
    encoding: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract lecture PDF images into a dedicated folder."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Directory containing the lecture PDFs. Defaults to the current directory.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("_medical-images"),
        help="Output directory for the extracted images.",
    )
    return parser.parse_args()


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
    return slug or "lecture"


def numeric_suffix(path: Path) -> int:
    match = re.search(r"-(\d+)\.[^.]+$", path.name)
    if not match:
        raise ValueError(f"Unexpected extracted asset name: {path}")
    return int(match.group(1))


def grayscale_entropy(image_path: Path) -> float:
    with Image.open(image_path) as image:
        histogram = image.convert("L").histogram()

    total = sum(histogram)
    if total == 0:
        return 0.0

    entropy = 0.0
    for count in histogram:
        if count == 0:
            continue
        probability = count / total
        entropy -= probability * math.log2(probability)
    return entropy


def read_pdfimages_table(pdf_path: Path) -> list[PdfImageRow]:
    result = subprocess.run(
        ["pdfimages", "-list", str(pdf_path)],
        capture_output=True,
        text=True,
        check=True,
    )

    rows: list[PdfImageRow] = []
    for line in result.stdout.splitlines()[2:]:
        parts = line.split()
        if len(parts) < 9 or not parts[0].isdigit():
            continue
        rows.append(
            PdfImageRow(
                page=int(parts[0]),
                num=int(parts[1]),
                kind=parts[2],
                width=int(parts[3]),
                height=int(parts[4]),
                encoding=parts[8],
            )
        )
    return rows


def extract_pdf_assets(pdf_path: Path, temp_dir: Path) -> list[Path]:
    prefix = temp_dir / "img"
    subprocess.run(["pdfimages", "-all", str(pdf_path), str(prefix)], check=True)
    return sorted(temp_dir.glob("img-*"), key=numeric_suffix)


def should_keep(row: PdfImageRow, asset_path: Path) -> tuple[bool, str]:
    if row.kind != "image":
        return False, "non-image"

    if row.width < MIN_WIDTH or row.height < MIN_HEIGHT:
        return False, "small-dimension"

    if row.width * row.height < MIN_AREA:
        return False, "small-area"

    aspect = max(row.width / row.height, row.height / row.width)
    if aspect > MAX_WIDE_ASPECT:
        entropy = grayscale_entropy(asset_path)
        if entropy <= MAX_WIDE_LOW_ENTROPY:
            return False, "wide-low-entropy"

    return True, "kept"


def discover_pdfs(root: Path) -> list[Path]:
    return sorted(path for path in root.iterdir() if path.is_file() and path.suffix.lower() == ".pdf")


def ensure_clean_output(output_dir: Path) -> None:
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    output_dir = (root / args.output).resolve()

    pdfs = discover_pdfs(root)
    if not pdfs:
        print(f"No PDFs found in {root}", file=sys.stderr)
        return 1

    ensure_clean_output(output_dir)

    summary_rows: list[dict[str, object]] = []
    manifest_path = output_dir / "manifest.csv"
    summary_path = output_dir / "summary.csv"

    with manifest_path.open("w", newline="") as manifest_file:
        manifest_writer = csv.DictWriter(
            manifest_file,
            fieldnames=[
                "lecture",
                "source_pdf",
                "page",
                "pdf_image_num",
                "width",
                "height",
                "encoding",
                "output_file",
            ],
        )
        manifest_writer.writeheader()

        for pdf_path in pdfs:
            lecture_slug = slugify(pdf_path.stem)
            lecture_dir = output_dir / lecture_slug
            lecture_dir.mkdir(parents=True, exist_ok=True)

            kept_count = 0
            skipped_counts = {
                "non-image": 0,
                "small-dimension": 0,
                "small-area": 0,
                "wide-low-entropy": 0,
            }

            rows = read_pdfimages_table(pdf_path)
            with tempfile.TemporaryDirectory(prefix="medical-images-") as temp_root:
                temp_dir = Path(temp_root)
                assets = extract_pdf_assets(pdf_path, temp_dir)

                if len(rows) != len(assets):
                    raise RuntimeError(
                        f"{pdf_path.name}: pdfimages row count ({len(rows)}) does not match extracted assets ({len(assets)})"
                    )

                for row, asset_path in zip(rows, assets, strict=True):
                    keep, reason = should_keep(row, asset_path)
                    if not keep:
                        skipped_counts[reason] = skipped_counts.get(reason, 0) + 1
                        continue

                    output_name = f"page-{row.page:03d}-img-{row.num:04d}{asset_path.suffix.lower()}"
                    destination = lecture_dir / output_name
                    shutil.copy2(asset_path, destination)
                    manifest_writer.writerow(
                        {
                            "lecture": lecture_slug,
                            "source_pdf": pdf_path.name,
                            "page": row.page,
                            "pdf_image_num": row.num,
                            "width": row.width,
                            "height": row.height,
                            "encoding": row.encoding,
                            "output_file": destination.relative_to(root),
                        }
                    )
                    kept_count += 1

            summary_rows.append(
                {
                    "lecture": lecture_slug,
                    "source_pdf": pdf_path.name,
                    "kept_images": kept_count,
                    "skipped_non_image": skipped_counts["non-image"],
                    "skipped_small_dimension": skipped_counts["small-dimension"],
                    "skipped_small_area": skipped_counts["small-area"],
                    "skipped_wide_low_entropy": skipped_counts["wide-low-entropy"],
                }
            )

    with summary_path.open("w", newline="") as summary_file:
        summary_writer = csv.DictWriter(
            summary_file,
            fieldnames=[
                "lecture",
                "source_pdf",
                "kept_images",
                "skipped_non_image",
                "skipped_small_dimension",
                "skipped_small_area",
                "skipped_wide_low_entropy",
            ],
        )
        summary_writer.writeheader()
        summary_writer.writerows(summary_rows)

    total_kept = sum(int(row["kept_images"]) for row in summary_rows)
    print(f"Extracted {total_kept} images into {output_dir}")
    for row in summary_rows:
        print(f"{row['source_pdf']}: {row['kept_images']}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
