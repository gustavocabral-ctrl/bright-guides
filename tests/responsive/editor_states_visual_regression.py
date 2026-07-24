"""
Regressão visual dos estados de carregamento e erro do editor de Documento FAQ.

Estados capturados por viewport (mobile / tablet / desktop):
  - editor-saving       → botão "Salvando..." com spinner, ações desabilitadas.
  - editor-save-error   → banner de erro com CTA "Tentar novamente".

Os estados são pinados de forma determinística via query param
`?saveState=loading|error` lido pelo `DocumentoView` no client (ver
useEffect que consome URLSearchParams).

Uso:
    python3 tests/responsive/editor_states_visual_regression.py --update
    python3 tests/responsive/editor_states_visual_regression.py
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops
from playwright.async_api import async_playwright, Page

BASE_URL = "http://localhost:8080"
ROOT = Path(__file__).parent
BASELINE_DIR = ROOT / "baselines-editor-states"
DIFF_DIR = Path("/tmp/browser/editor-states-visual-regression")
BASELINE_DIR.mkdir(parents=True, exist_ok=True)
DIFF_DIR.mkdir(parents=True, exist_ok=True)

PIXEL_TOLERANCE = 8
DEFAULT_THRESHOLD = 0.008


@dataclass
class Viewport:
    name: str
    width: int
    height: int


VIEWPORTS = [
    Viewport("mobile", 390, 844),
    Viewport("tablet", 820, 1180),
    Viewport("desktop", 1440, 900),
]

# Estado: (chave, query string após o node)
STATES = [
    ("editor-saving", "saveState=loading"),
    ("editor-save-error", "saveState=error"),
]

# Nó com blocos salvos (permite ver botão Salvar habilitado / banner de erro).
NODE_ID = "g1-1"


async def prepare(page: Page, url: str) -> None:
    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle", timeout=8000)
    await page.add_style_tag(content="""
        *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            caret-color: transparent !important;
        }
        html { scroll-behavior: auto !important; }
    """)
    await page.keyboard.press("Escape")
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)


async def capture(page: Page, out: Path) -> None:
    await page.screenshot(path=str(out), full_page=False)


def compare(baseline: Path, actual: Path, diff: Path) -> tuple[float, tuple[int, int] | None]:
    a = Image.open(baseline).convert("RGB")
    b = Image.open(actual).convert("RGB")
    if a.size != b.size:
        b.save(diff)
        return 1.0, b.size
    d = ImageChops.difference(a, b)
    mask = d.point(lambda v: 255 if v > PIXEL_TOLERANCE else 0)
    r, g, bch = mask.split()
    merged = ImageChops.lighter(ImageChops.lighter(r, g), bch)
    total = merged.width * merged.height
    changed = sum(1 for px in merged.getdata() if px > 0)
    ratio = changed / total if total else 0.0
    if ratio > 0:
        faded = Image.eval(a, lambda v: v // 3 + 60)
        red = Image.new("RGB", a.size, (255, 0, 0))
        Image.composite(red, faded, merged).save(diff)
    return ratio, None


async def snapshot_states(page: Page, vp: Viewport) -> list[tuple[str, Path]]:
    shots: list[tuple[str, Path]] = []
    for key, qs in STATES:
        await prepare(page, f"{BASE_URL}/faq?node={NODE_ID}&{qs}")
        # Aguarda o botão refletir o estado pinado.
        if key == "editor-saving":
            await page.get_by_text("Salvando...").first.wait_for(timeout=4000)
        else:
            await page.get_by_test_id("save-error-banner").wait_for(timeout=4000)
        await page.wait_for_timeout(200)
        p = DIFF_DIR / f"{key}__{vp.name}.actual.png"
        await capture(page, p)
        shots.append((key, p))
    return shots


async def run(update: bool, threshold: float) -> int:
    failures: list[str] = []
    report: list[str] = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            for vp in VIEWPORTS:
                ctx = await browser.new_context(
                    viewport={"width": vp.width, "height": vp.height},
                    device_scale_factor=1,
                    reduced_motion="reduce",
                )
                page = await ctx.new_page()
                for state, actual in await snapshot_states(page, vp):
                    baseline = BASELINE_DIR / f"{state}__{vp.name}.png"
                    diff_out = DIFF_DIR / f"{state}__{vp.name}.diff.png"
                    if update or not baseline.exists():
                        import shutil as _sh
                        _sh.move(str(actual), str(baseline))
                        report.append(
                            f"{'BASELINE' if update else 'NEW':8s} [{vp.name:7s}] {state}"
                        )
                        continue
                    ratio, mismatch = compare(baseline, actual, diff_out)
                    pct = ratio * 100
                    tag = f"[{vp.name:7s}] {state:22s} diff={pct:6.3f}%"
                    if mismatch is not None:
                        failures.append(f"{tag} (size {mismatch})")
                        report.append(f"FAIL {tag} (size mismatch)")
                    elif ratio > threshold:
                        failures.append(tag)
                        report.append(f"FAIL {tag}")
                    else:
                        for p in (actual, diff_out):
                            if p.exists():
                                p.unlink()
                        report.append(f"PASS {tag}")
                await ctx.close()
        finally:
            await browser.close()

    print("\n".join(report))
    print(f"\nBaselines: {BASELINE_DIR}")
    print(f"Diffs: {DIFF_DIR}")
    print(f"Threshold: {threshold*100:.2f}% | Tolerância canal: {PIXEL_TOLERANCE}")
    print(f"\nFalhas: {len(failures)}")
    return 1 if failures else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--update", action="store_true")
    ap.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD)
    args = ap.parse_args()
    return asyncio.run(run(args.update, args.threshold))


if __name__ == "__main__":
    sys.exit(main())
