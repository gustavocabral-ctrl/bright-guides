"""
Testes de responsividade end-to-end (Playwright) para o FAQ interno.

Cobre os breakpoints mobile / tablet / desktop nas telas:
Documento, Chat FAQ, Estatísticas, Chats, Melhorias e Usuários.

Verifica em cada combinação (rota × viewport):
  - a página carrega sem erros de console
  - não há overflow horizontal (scroll lateral inesperado)
  - elementos-chave estão visíveis:
      * mobile/tablet: botão hambúrguer da topbar
      * desktop:       grupo de tabs (Documento/Chat/Estatísticas/Chats)
  - no /faq (Documento) o sidebar de Guias aparece só em desktop
  - screenshot salvo para inspeção manual

Rodar (dev server já em :8080):
    python3 tests/responsive/run.py
"""

from __future__ import annotations

import asyncio
import sys
from dataclasses import dataclass
from pathlib import Path
from playwright.async_api import async_playwright, Page, ConsoleMessage

BASE_URL = "http://localhost:8080"
OUT_DIR = Path("/tmp/browser/responsive")
OUT_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class Viewport:
    name: str
    width: int
    height: int


VIEWPORTS = [
    Viewport("mobile", 390, 844),     # iPhone 14-ish
    Viewport("tablet", 820, 1180),    # iPad Air-ish (< lg 1024 → mobile UI)
    Viewport("desktop", 1440, 900),   # padrão desktop (≥ lg)
]

ROUTES = [
    ("documento", "/faq"),
    ("chat", "/faq/chat"),
    ("stats", "/faq/stats"),
    ("admin-chats", "/faq/admin/chats"),
    ("improvements", "/faq/admin/improvements"),
    ("users", "/faq/admin/users"),
]

# lg breakpoint do Tailwind
LG = 1024


class TestFailure(Exception):
    pass


def check(cond: bool, msg: str, errors: list[str]) -> None:
    if not cond:
        errors.append(msg)


async def check_no_h_overflow(page: Page) -> tuple[bool, int, int]:
    metrics = await page.evaluate(
        """() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
        })"""
    )
    scroll, client = metrics["scroll"], metrics["client"]
    # 1px de tolerância para arredondamento
    return (scroll <= client + 1, scroll, client)


async def run_one(page: Page, route_name: str, path: str, vp: Viewport) -> list[str]:
    errors: list[str] = []
    console_errors: list[str] = []

    def on_console(m: ConsoleMessage) -> None:
        if m.type == "error":
            text = m.text
            # Ignorar ruídos comuns de dev/HMR
            noisy = ("Download the React DevTools", "[HMR]", "vite")
            if not any(n in text for n in noisy):
                console_errors.append(text)

    page.on("console", on_console)

    url = f"{BASE_URL}{path}"
    resp = await page.goto(url, wait_until="domcontentloaded")
    check(resp is not None and resp.ok, f"resposta HTTP inválida em {path}", errors)

    await page.wait_for_load_state("networkidle", timeout=8000)
    # pequena espera para animações / sheet
    await page.wait_for_timeout(200)

    ok_overflow, sw, cw = await check_no_h_overflow(page)
    check(ok_overflow, f"overflow horizontal em {path}: scrollWidth={sw} > clientWidth={cw}", errors)

    is_desktop = vp.width >= LG

    if is_desktop:
        # grupo de tabs de navegação principal deve estar visível
        tab = page.get_by_role("link", name="Documento").first
        try:
            await tab.wait_for(state="visible", timeout=3000)
        except Exception:
            errors.append(f"tabs de navegação não visíveis em desktop ({path})")
    else:
        # botão de menu hambúrguer deve estar visível
        menu_btn = page.get_by_role("button", name="Abrir menu")
        try:
            await menu_btn.wait_for(state="visible", timeout=3000)
        except Exception:
            errors.append(f"botão de menu (hambúrguer) não visível em {vp.name} ({path})")

    # regra: sidebar de "Guias do documento" só aparece na tela Documento e a
    # partir de md (>=768). Identificamos pelo título dentro do aside.
    guias_sidebar_visible = await page.evaluate(
        """() => {
            const asides = Array.from(document.querySelectorAll('aside'));
            for (const a of asides) {
                if (a.textContent && a.textContent.includes('Guias do documento')) {
                    const r = a.getBoundingClientRect();
                    if (r.width > 0 && r.height > 0) return true;
                }
            }
            return false;
        }"""
    )
    should_show = route_name == "documento" and vp.width >= 768
    if should_show:
        check(guias_sidebar_visible, f"sidebar de Guias deveria aparecer em {path} ({vp.name})", errors)
    else:
        check(not guias_sidebar_visible, f"sidebar de Guias não deveria aparecer em {path} ({vp.name})", errors)

    # screenshot para revisão manual
    shot = OUT_DIR / f"{route_name}__{vp.name}.png"
    await page.screenshot(path=str(shot))

    if console_errors:
        errors.append(f"erros de console em {path}: {console_errors[:3]}")

    page.remove_listener("console", on_console)
    return errors


async def main() -> int:
    total_failures = 0
    report: list[str] = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            for vp in VIEWPORTS:
                context = await browser.new_context(viewport={"width": vp.width, "height": vp.height})
                page = await context.new_page()
                for route_name, path in ROUTES:
                    errs = await run_one(page, route_name, path, vp)
                    tag = f"[{vp.name:7s}] {path:32s}"
                    if errs:
                        total_failures += len(errs)
                        report.append(f"FAIL {tag}")
                        for e in errs:
                            report.append(f"      - {e}")
                    else:
                        report.append(f"PASS {tag}")
                await context.close()
        finally:
            await browser.close()

    print("\n".join(report))
    print(f"\nScreenshots em {OUT_DIR}")
    print(f"\nTotal de falhas: {total_failures}")
    return 1 if total_failures else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
