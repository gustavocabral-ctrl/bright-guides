import shutil

Regressão visual do editor de conteúdo do Documento FAQ.

Captura estados determinísticos do editor em mobile / tablet / desktop e
compara com baselines em `tests/responsive/baselines-editor/`.

Estados capturados (por viewport):
  - editor-empty     → `?node=g1-1-1` (assunto vazio, modo edição automático).
  - editor-filled    → `?node=g1-1` (guia com blocos, modo leitura salvo).
  - editor-edit-mode → `?node=g1-1` em modo edição (blocos editáveis).
  - editor-menu-open → `?node=g1-1-1` com dropdown "Adicionar bloco" aberto.

Uso:
    python3 tests/responsive/editor_visual_regression.py --update   # baselines
    python3 tests/responsive/editor_visual_regression.py            # comparar
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
BASELINE_DIR = ROOT / "baselines-editor"
DIFF_DIR = Path("/tmp/browser/editor-visual-regression")
BASELINE_DIR.mkdir(parents=True, exist_ok=True)
DIFF_DIR.mkdir(parents=True, exist_ok=True)

PIXEL_TOLERANCE = 8
DEFAULT_THRESHOLD = 0.008  # 0,8% — editor tem mais tipografia dinâmica


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
    await page.wait_for_timeout(250)


async def enter_edit_mode(page: Page) -> None:
    btn = page.get_by_role("button", name="Editar documento")
    if await btn.count():
        await btn.first.click()
        await page.wait_for_timeout(250)


async def open_block_menu(page: Page) -> None:
    add_btn = page.get_by_role("button", name="Adicionar bloco").last
    await add_btn.click()
    await page.wait_for_selector('[role="menu"]', timeout=3000)
    await page.wait_for_timeout(150)


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
    """Retorna lista de (state_key, path_actual) capturada para este viewport."""
    shots: list[tuple[str, Path]] = []

    # 1. empty (assunto sem blocos → renderiza EmptyDocumento no modo edit)
    await prepare(page, f"{BASE_URL}/faq?node=g1-1-1")
    p = DIFF_DIR / f"editor-empty__{vp.name}.actual.png"
    await capture(page, p)
    shots.append(("editor-empty", p))

    # 2. filled read-mode (guia g1-1 com blocos salvos)
    await prepare(page, f"{BASE_URL}/faq?node=g1-1")
    p = DIFF_DIR / f"editor-filled__{vp.name}.actual.png"
    await capture(page, p)
    shots.append(("editor-filled", p))

    # 3. filled edit-mode
    await enter_edit_mode(page)
    p = DIFF_DIR / f"editor-edit-mode__{vp.name}.actual.png"
    await capture(page, p)
    shots.append(("editor-edit-mode", p))

    # 4. menu de blocos aberto no assunto vazio
    await prepare(page, f"{BASE_URL}/faq?node=g1-1-1")
    await open_block_menu(page)
    p = DIFF_DIR / f"editor-menu-open__{vp.name}.actual.png"
    await capture(page, p)
    shots.append(("editor-menu-open", p))

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
                        actual.replace(baseline)
                        report.append(f"{'BASELINE' if update else 'NEW':8s} [{vp.name:7s}] {state}")
                        continue
                    ratio, mismatch = compare(baseline, actual, diff_out)
                    pct = ratio * 100
                    tag = f"[{vp.name:7s}] {state:20s} diff={pct:6.3f}%"
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
