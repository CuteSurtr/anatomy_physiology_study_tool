#!/usr/bin/env python3
"""Extract individual slides from Servier Medical Art PowerPoint kits.

The Servier SMART kits (https://smart.servier.com, CC BY 4.0) ship as
.pptx files in ServierMedicalArt-all-kits/ (gitignored). Each slide is
one anatomical illustration with a title bar, a colored corner shape, a
"All SMART images are licensed..." footer, and the Servier logo bottom-right.

Pipeline:
  1. soffice --headless --convert-to pdf  (each pptx -> single PDF)
  2. gs renders each PDF page to a PNG at 200 dpi
  3. crop_servier_slide() strips title + footer + paints over the logo

Usage:
    python3 scripts/extract_servier_slides.py kits         # convert all pptx -> PDF
    python3 scripts/extract_servier_slides.py render       # render all PDFs -> per-slide PNGs
    python3 scripts/extract_servier_slides.py manifest     # rebuild slide-title CSV
    python3 scripts/extract_servier_slides.py crop SRC DST # crop one slide
"""

import argparse
import csv
import re
import subprocess
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image, ImageDraw, ImageOps

REPO_ROOT = Path(__file__).resolve().parents[1]
KITS_DIR = REPO_ROOT / "ServierMedicalArt-all-kits"
WORK_DIR = Path("/tmp/servier-png")
SOFFICE = "/Applications/LibreOffice.app/Contents/MacOS/soffice"

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}


# --- manifest ---------------------------------------------------------------

def slide_title(slide_xml: bytes) -> str:
    try:
        root = ET.fromstring(slide_xml)
    except ET.ParseError:
        return ""
    for sp in root.iter("{%s}sp" % NS["p"]):
        ph = sp.find(".//{%s}ph" % NS["p"])
        if ph is not None and ph.get("type") in {"title", "ctrTitle"}:
            texts = [t.text or "" for t in sp.iter("{%s}t" % NS["a"])]
            joined = " ".join(t.strip() for t in texts if t and t.strip())
            if joined:
                return joined
    for t in root.iter("{%s}t" % NS["a"]):
        s = (t.text or "").strip()
        if s and len(s) > 2:
            return s
    return ""


def slide_number(name: str) -> int:
    m = re.search(r"slide(\d+)\.xml$", name)
    return int(m.group(1)) if m else 0


def build_manifest():
    WORK_DIR.mkdir(exist_ok=True)
    out = WORK_DIR / "servier_slides.csv"
    pptx_files = sorted(KITS_DIR.glob("*.pptx"))
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["kit", "slide", "title"])
        for p in pptx_files:
            with zipfile.ZipFile(p) as zf:
                slides = sorted(
                    (n for n in zf.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
                    key=slide_number,
                )
                for i, name in enumerate(slides, 1):
                    title = slide_title(zf.read(name))
                    w.writerow([p.stem, i, title])
            print(f"  {p.name}: {len(slides)} slides", file=sys.stderr)
    print(f"wrote {out}", file=sys.stderr)


# --- conversion -------------------------------------------------------------

def make_clean_pptx(src: Path, dst: Path) -> list[str]:
    """Strip the Servier template's colored-fan background + bottom-right logo
    from a copy of the .pptx, so the rendered slide is just the title + anatomy.

    The decoration lives as <p:bg><a:blipFill r:embed="..."/></p:bg> on both the
    slide master and the slide layouts; the Servier logo is a <p:pic> in the
    slide master, embedded as rId6 (consistent across all SMART kits). Without
    this step, the colored triangles bleed into the upper-left of every cropped
    figure (often clipping or visually 'cutting off' the actual illustration).
    """
    with zipfile.ZipFile(src, "r") as zin:
        files = {name: zin.read(name) for name in zin.namelist()}
    changed: list[str] = []
    for key in list(files.keys()):
        is_layout_or_master = (
            ("slideLayouts/slideLayout" in key or "slideMasters/slideMaster" in key)
            and key.endswith(".xml")
        )
        if not is_layout_or_master:
            continue
        c = files[key].decode("utf-8")
        new = re.sub(r"<p:bg>.*?</p:bg>", "", c, flags=re.DOTALL)
        if "slideMaster" in key:
            # Drop the Servier logo picture (always embedded as rId6 in SMART kits)
            new = re.sub(
                r'<p:pic>(?:(?!<p:pic).)*?r:embed="rId6"(?:(?!</p:pic>).)*?</p:pic>',
                "",
                new,
                flags=re.DOTALL,
            )
        if new != c:
            files[key] = new.encode("utf-8")
            changed.append(key)
    with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)
    return changed


def convert_kits_to_pdf():
    """Convert each .pptx to PDF, first stripping the template decoration.

    Writes the cleaned .pptx to a sibling .clean.pptx in WORK_DIR before
    converting, so the LibreOffice render output has no fan triangles + no
    Servier logo to crop around.
    """
    WORK_DIR.mkdir(exist_ok=True)
    for pptx in sorted(KITS_DIR.glob("*.pptx")):
        out_pdf = WORK_DIR / f"{pptx.stem}.pdf"
        if out_pdf.exists():
            continue
        clean = WORK_DIR / f"{pptx.stem}.clean.pptx"
        make_clean_pptx(pptx, clean)
        subprocess.run(
            [SOFFICE, "--headless", "--convert-to", "pdf", "--outdir", str(WORK_DIR), str(clean)],
            check=False,
        )
        # LibreOffice names the output after the source file name. Rename to drop ".clean".
        produced = WORK_DIR / f"{pptx.stem}.clean.pdf"
        if produced.exists():
            produced.rename(out_pdf)


def render_pdfs_to_pngs():
    for pdf in sorted(WORK_DIR.glob("*.pdf")):
        outdir = WORK_DIR / pdf.stem
        if outdir.exists() and any(outdir.glob("slide-*.png")):
            continue
        outdir.mkdir(exist_ok=True)
        subprocess.run(
            [
                "gs",
                "-dNOPAUSE",
                "-dBATCH",
                "-sDEVICE=png16m",
                "-r200",
                "-dGraphicsAlphaBits=4",
                "-dTextAlphaBits=4",
                f"-sOutputFile={outdir}/slide-%02d.png",
                str(pdf),
            ],
            check=False,
            stdout=subprocess.DEVNULL,
        )


# --- cropping ---------------------------------------------------------------

def trim_whitespace(img: Image.Image, threshold: int = 245, margin: int = 24) -> Image.Image:
    gray = img.convert("L")
    inv = ImageOps.invert(gray)
    mask = inv.point(lambda p: 255 if p > (255 - threshold) else 0)
    bbox = mask.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - margin)
    t = max(0, t - margin)
    r = min(img.width, r + margin)
    b = min(img.height, b + margin)
    return img.crop((l, t, r, b))


def paint_logo_area(img: Image.Image, w_frac: float = 0.18, h_frac: float = 0.12) -> Image.Image:
    out = img.copy()
    w, h = out.size
    draw = ImageDraw.Draw(out)
    draw.rectangle((w - int(w * w_frac), h - int(h * h_frac), w, h), fill=(255, 255, 255))
    return out


def crop_servier_slide(
    src: Path,
    dst: Path,
    *,
    top_trim: int = 280,
    bottom_trim: int = 110,
    left_trim: int = 0,
    right_trim: int = 0,
    paint_logo: bool = True,
    final_trim_whitespace: bool = True,
) -> tuple[int, int]:
    """Strip the title bar, license footer, and Servier logo from a rendered slide PNG.

    Defaults trim ~280 px off the top (title) and ~110 px off the bottom (footer),
    paint a white rect over the bottom-right logo, then auto-crop to non-white content.
    """
    img = Image.open(src).convert("RGB")
    if paint_logo:
        img = paint_logo_area(img)
    w, h = img.size
    img = img.crop((left_trim, top_trim, w - right_trim, h - bottom_trim))
    if final_trim_whitespace:
        img = trim_whitespace(img)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, optimize=True)
    return img.size


# --- CLI --------------------------------------------------------------------

def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("kits", help="convert all pptx -> PDF (LibreOffice)")
    sub.add_parser("render", help="render PDFs to per-slide PNG strips")
    sub.add_parser("manifest", help="rebuild slide-title CSV manifest")
    c = sub.add_parser("crop", help="crop one slide PNG into a publish-ready image")
    c.add_argument("src", type=Path)
    c.add_argument("dst", type=Path)
    c.add_argument("--top", type=int, default=280)
    c.add_argument("--bottom", type=int, default=110)
    c.add_argument("--left", type=int, default=0)
    c.add_argument("--right", type=int, default=0)

    args = p.parse_args()
    if args.cmd == "kits":
        convert_kits_to_pdf()
    elif args.cmd == "render":
        render_pdfs_to_pngs()
    elif args.cmd == "manifest":
        build_manifest()
    elif args.cmd == "crop":
        w, h = crop_servier_slide(
            args.src,
            args.dst,
            top_trim=args.top,
            bottom_trim=args.bottom,
            left_trim=args.left,
            right_trim=args.right,
        )
        print(f"{args.dst}  ({w}x{h})")


if __name__ == "__main__":
    main()
