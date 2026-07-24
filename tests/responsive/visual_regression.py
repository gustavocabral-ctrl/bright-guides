"""
Testes de regressão visual (Playwright + PIL) para o FAQ interno.

Captura screenshots das 6 telas principais em mobile / tablet / desktop e
compara com baselines versionadas em `tests/responsive/baselines/`.

Uso:
    # 1ª vez (ou após mudança visual intencional): gerar baselines
    python3 tests/responsive/visual_regression.py --update

    # Execuções normais (CI / local): comparar contra baselines
    python3 tests/responsive/visual_regression.py

Falha se qualquer par (rota × viewport) divergir mais que --threshold
(percentual de pixels com diferença > tolerância por canal).

Saídas quando há diff:
    /tmp/browser/visual-regression/<rota>__<vp>.actual.png
    /tmp/browser/visual-regression/<rota>__<vp>.diff.png
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
BASELINE_DIR = ROOT / "baselines"
DIFF_DIR = Path("/tmp/browser/visual-regression")
BASELINE_DIR.mkdir(parents=True, exist_ok=True)
DIFF_DIR.mkdir(parents=True, exist_ok=True)


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

ROUTES = [
    ("documento",    "/faq"),
    ("chat",         "/faq/chat"),
    ("stats",        "/faq/stats"),
    ("admin-chats",  "/faq/admin/chats"),
    ("improvements", "/faq/admin/improvements"),
    ("users",        "/faq/admin/users"),
]

# Tolerância por-canal (0-255) para descartar ruído de anti-aliasing.
PIXEL_TOLERANCE = 8
# Percentual máximo de pixels "diferentes" antes de falhar (0.0 - 1.0).
DEFAULT_THRESHOLD = 0.005  # 0,5%


async def prepare_page(page: Page, url: str) -> None:
    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle", timeout=8000)
    # Desativar animações / caret / seleção — reduz flakiness visual.
    await page.add_style_tag(content="""
        *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            caret-color: transparent !important;
        }
        html { scroll-behavior: auto !important; }
    """)
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(250)


async def capture(page: Page, out: Path) -> None:
    # Screenshot só do viewport (full_page=False é o default). Full-page
    # gera imagens gigantes e mais suscetíveis a flakes.
    await page.screenshot(path=str(out), full_page=False)


def compare(baseline_path: Path, actual_path: Path, diff_path: Path) -> tuple[float, tuple[int, int] | None]:
    """
    Retorna (proporção de pixels diferentes, dimensões se mismatch).
    Se as imagens tiverem tamanhos diferentes → considera 100% de diff.
    Salva imagem de diff amplificada se houver divergência.
    """
    a = Image.open(baseline_path).convert("RGB")
    b = Image.open(actual_path).convert("RGB")
    if a.size != b.size:
        # Salva o "actual" como referência do que mudou.
        b.save(diff_path)
        return 1.0, b.size

    diff = ImageChops.difference(a, b)
    # Máscara de pixels acima da tolerância em qualquer canal.
    mask = diff.point(lambda v: 255 if v > PIXEL_TOLERANCE else 0)
    # Reduz para 1 canal (max sobre RGB) para contar pixels.
    r, g, bch = mask.split()
    merged = ImageChops.lighter(ImageChops.lighter(r, g), bch)
    total = merged.width * merged.height
    changed = sum(1 for px in merged.getdata() if px > 0)
    ratio = changed / total if total else 0.0

    if ratio > 0:
        # Diff visual: pixels diferentes em vermelho sobre baseline esmaecido.
        base_faded = Image.eval(a, lambda v: v // 3 + 60)
        red = Image.new("RGB", a.size, (255, 0, 0))
        composed = Image.composite(red, base_faded, merged)
        composed.save(diff_path)

    return ratio, None


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
                for route_name, path in ROUTES:
                    key = f"{route_name}__{vp.name}"
                    baseline = BASELINE_DIR / f"{key}.png"
                    actual = DIFF_DIR / f"{key}.actual.png"
                    diff_out = DIFF_DIR / f"{key}.diff.png"

                    await prepare_page(page, f"{BASE_URL}{path}")

                    if update or not baseline.exists():
                        await capture(page, baseline)
                        state = "BASELINE" if update else "NEW"
                        report.append(f"{state:8s} [{vp.name:7s}] {path}")
                        continue

                    await capture(page, actual)
                    ratio, mismatch = compare(baseline, actual, diff_out)
                    pct = ratio * 100
                    tag = f"[{vp.name:7s}] {path:32s} diff={pct:6.3f}%"
                    if mismatch is not None:
                        failures.append(f"{tag} (dimensões divergem: {mismatch})")
                        report.append(f"FAIL {tag} (size mismatch)")
                    elif ratio > threshold:
                        failures.append(tag)
                        report.append(f"FAIL {tag}")
                    else:
                        # limpar artefatos se passou
                        for p in (actual, diff_out):
                            if p.exists():
                                p.unlink()
                        report.append(f"PASS {tag}")
                await ctx.close()
        finally:
            await browser.close()

    print("\n".join(report))
    print(f"\nBaselines: {BASELINE_DIR}")
    print(f"Diffs (quando falham): {DIFF_DIR}")
    print(f"Threshold: {threshold*100:.2f}% | Tolerância por canal: {PIXEL_TOLERANCE}")
    print(f"\nTotal de falhas: {len(failures)}")
    return 1 if failures else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--update", action="store_true",
                    help="Regrava as baselines em vez de comparar (usar após mudanças visuais intencionais).")
    ap.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD,
                    help=f"Percentual máximo de pixels diferentes (0-1). Default: {DEFAULT_THRESHOLD}.")
    args = ap.parse_args()
    return asyncio.run(run(args.update, args.threshold))


if __name__ == "__main__":
    sys.exit(main())
