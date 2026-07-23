"""
Testes de interação responsiva (Playwright) para o FAQ interno.

Cobre em cada breakpoint (mobile / tablet / desktop):
  1. Abrir e fechar o menu hambúrguer (mobile/tablet) sem overflow horizontal.
  2. Alternar entre as tabs Documento ↔ Chat FAQ, verificando URL, presença
     condicional do sidebar de Guias e ausência de overflow após cada troca.
  3. Abrir e fechar o filtro de data (Radix Select "Data de ajuste"),
     verificando que o popover renderiza e que a página continua sem overflow
     horizontal enquanto aberto e após fechar.

Rodar (dev server já em :8080):
    python3 tests/responsive/interactions.py
"""

from __future__ import annotations

import asyncio
import sys
from dataclasses import dataclass
from pathlib import Path
from playwright.async_api import async_playwright, Page, ConsoleMessage

BASE_URL = "http://localhost:8080"
OUT_DIR = Path("/tmp/browser/responsive-interactions")
OUT_DIR.mkdir(parents=True, exist_ok=True)

LG = 1024


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


def check(cond: bool, msg: str, errors: list[str]) -> None:
    if not cond:
        errors.append(msg)


async def h_overflow(page: Page) -> tuple[bool, int, int]:
    m = await page.evaluate(
        """() => ({s: document.documentElement.scrollWidth,
                    c: document.documentElement.clientWidth})"""
    )
    return (m["s"] <= m["c"] + 1, m["s"], m["c"])


async def assert_no_overflow(page: Page, label: str, errors: list[str]) -> None:
    ok, s, c = await h_overflow(page)
    check(ok, f"overflow horizontal {label}: scrollWidth={s} > clientWidth={c}", errors)


async def guias_sidebar_visible(page: Page) -> bool:
    return await page.evaluate(
        """() => {
            for (const a of document.querySelectorAll('aside')) {
                if (a.textContent && a.textContent.includes('Guias do documento')) {
                    const r = a.getBoundingClientRect();
                    if (r.width > 0 && r.height > 0) return true;
                }
            }
            return false;
        }"""
    )


async def sheet_open(page: Page) -> bool:
    """Radix Sheet renderiza um dialog role="dialog" com data-state=open."""
    return await page.evaluate(
        """() => !!document.querySelector('[role="dialog"][data-state="open"]')"""
    )


async def open_menu_if_needed(page: Page, vp: Viewport, errors: list[str]) -> None:
    if vp.width >= LG:
        return
    btn = page.get_by_role("button", name="Abrir menu")
    await btn.click()
    try:
        await page.wait_for_function(
            """() => !!document.querySelector('[role="dialog"][data-state="open"]')""",
            timeout=2000,
        )
    except Exception:
        errors.append(f"sheet não abriu após clicar no hambúrguer ({vp.name})")


# ---------------------------------------------------------------- #
# 1. Hamburger open / close
# ---------------------------------------------------------------- #
async def test_hamburger(page: Page, vp: Viewport) -> list[str]:
    errors: list[str] = []
    await page.goto(f"{BASE_URL}/faq", wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle", timeout=8000)

    if vp.width >= LG:
        # Em desktop o hambúrguer é hidden; garantir que não está visível.
        btn = page.get_by_role("button", name="Abrir menu")
        visible = await btn.is_visible()
        check(not visible, f"hambúrguer não deveria aparecer em desktop", errors)
        return errors

    # abrir
    btn = page.get_by_role("button", name="Abrir menu")
    check(await btn.is_visible(), f"hambúrguer invisível em {vp.name}", errors)
    await btn.click()
    try:
        await page.wait_for_function(
            """() => !!document.querySelector('[role="dialog"][data-state="open"]')""",
            timeout=2000,
        )
    except Exception:
        errors.append(f"sheet não abriu em {vp.name}")
        return errors

    await page.wait_for_timeout(150)
    await assert_no_overflow(page, f"com sheet aberto ({vp.name})", errors)
    await (OUT_DIR / f"hamburger-open__{vp.name}.png").parent.mkdir(exist_ok=True, parents=True)
    await page.screenshot(path=str(OUT_DIR / f"hamburger-open__{vp.name}.png"))

    # fechar via Escape
    await page.keyboard.press("Escape")
    try:
        await page.wait_for_function(
            """() => !document.querySelector('[role="dialog"][data-state="open"]')""",
            timeout=2000,
        )
    except Exception:
        errors.append(f"sheet não fechou após Escape em {vp.name}")

    await page.wait_for_timeout(150)
    await assert_no_overflow(page, f"após fechar sheet ({vp.name})", errors)
    return errors


# ---------------------------------------------------------------- #
# 2. Tabs: Documento <-> Chat FAQ
# ---------------------------------------------------------------- #
async def test_tabs(page: Page, vp: Viewport) -> list[str]:
    errors: list[str] = []

    # Começa em Documento
    await page.goto(f"{BASE_URL}/faq", wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle", timeout=8000)

    # -> Chat FAQ
    await open_menu_if_needed(page, vp, errors)
    await page.get_by_role("link", name="Chat FAQ").first.click()
    try:
        await page.wait_for_url("**/faq/chat", timeout=4000)
    except Exception:
        errors.append(f"não navegou para /faq/chat ({vp.name})")
    await page.wait_for_load_state("networkidle", timeout=6000)
    await page.wait_for_timeout(200)
    await assert_no_overflow(page, f"em /faq/chat ({vp.name})", errors)

    sidebar = await guias_sidebar_visible(page)
    check(not sidebar, f"sidebar de Guias não deveria aparecer em /faq/chat ({vp.name})", errors)

    # -> Documento
    await open_menu_if_needed(page, vp, errors)
    await page.get_by_role("link", name="Documento").first.click()
    try:
        await page.wait_for_url(lambda u: u.rstrip("/").endswith("/faq"), timeout=4000)
    except Exception:
        errors.append(f"não voltou para /faq ({vp.name})")
    await page.wait_for_load_state("networkidle", timeout=6000)
    await page.wait_for_timeout(200)
    await assert_no_overflow(page, f"após voltar para /faq ({vp.name})", errors)

    sidebar = await guias_sidebar_visible(page)
    expected = vp.width >= 768
    check(
        sidebar == expected,
        f"sidebar de Guias visibilidade inesperada em /faq ({vp.name}): got={sidebar} expected={expected}",
        errors,
    )

    await page.screenshot(path=str(OUT_DIR / f"tabs-final__{vp.name}.png"))
    return errors


# ---------------------------------------------------------------- #
# 3. Filtro de data (Radix Select) abre/fecha
# ---------------------------------------------------------------- #
async def test_date_filter(page: Page, vp: Viewport) -> list[str]:
    errors: list[str] = []
    await page.goto(f"{BASE_URL}/faq", wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle", timeout=8000)

    # o filtro só está no DOM quando visível: em mobile/tablet mora dentro do
    # sheet — abrir primeiro.
    await open_menu_if_needed(page, vp, errors)

    # Radix Select trigger = combobox com aria-label ou placeholder "Data de ajuste"
    trigger = page.get_by_role("combobox").filter(has_text="Data de").first
    try:
        await trigger.wait_for(state="visible", timeout=3000)
    except Exception:
        errors.append(f"trigger do filtro de data não visível ({vp.name})")
        return errors

    await trigger.click()
    # Radix Select popup: role="listbox" data-state="open"
    try:
        await page.wait_for_function(
            """() => !!document.querySelector('[role="listbox"][data-state="open"]')""",
            timeout=2000,
        )
    except Exception:
        errors.append(f"popup do filtro de data não abriu ({vp.name})")
        return errors

    await page.wait_for_timeout(150)
    await assert_no_overflow(page, f"filtro de data aberto ({vp.name})", errors)
    await page.screenshot(path=str(OUT_DIR / f"date-open__{vp.name}.png"))

    # fechar
    await page.keyboard.press("Escape")
    try:
        await page.wait_for_function(
            """() => !document.querySelector('[role="listbox"][data-state="open"]')""",
            timeout=2000,
        )
    except Exception:
        errors.append(f"popup do filtro de data não fechou ({vp.name})")

    await page.wait_for_timeout(150)
    await assert_no_overflow(page, f"após fechar filtro de data ({vp.name})", errors)
    return errors


# ---------------------------------------------------------------- #
async def run_all(page: Page, vp: Viewport) -> list[tuple[str, list[str]]]:
    console_errors: list[str] = []

    def on_console(m: ConsoleMessage) -> None:
        if m.type == "error":
            t = m.text
            if not any(n in t for n in ("Download the React DevTools", "[HMR]", "vite")):
                console_errors.append(t)

    page.on("console", on_console)

    results: list[tuple[str, list[str]]] = []
    results.append(("hamburger", await test_hamburger(page, vp)))
    results.append(("tabs",       await test_tabs(page, vp)))
    results.append(("date-filter", await test_date_filter(page, vp)))

    if console_errors:
        results.append(("console", [f"erros de console: {console_errors[:3]}"]))

    page.remove_listener("console", on_console)
    return results


async def main() -> int:
    total = 0
    report: list[str] = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            for vp in VIEWPORTS:
                ctx = await browser.new_context(viewport={"width": vp.width, "height": vp.height})
                page = await ctx.new_page()
                results = await run_all(page, vp)
                for name, errs in results:
                    tag = f"[{vp.name:7s}] {name:12s}"
                    if errs:
                        total += len(errs)
                        report.append(f"FAIL {tag}")
                        for e in errs:
                            report.append(f"      - {e}")
                    else:
                        report.append(f"PASS {tag}")
                await ctx.close()
        finally:
            await browser.close()

    print("\n".join(report))
    print(f"\nScreenshots em {OUT_DIR}")
    print(f"\nTotal de falhas: {total}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
