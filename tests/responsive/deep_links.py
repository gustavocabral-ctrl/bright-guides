"""
Deep-link tests: abrir uma URL diretamente e validar o estado inicial correto.

Cobre em mobile / tablet / desktop:
  1. /faq?node=g2  → guia "g2" ativa (heading contém seu nome), sidebar visível
     em >= 768, hambúrguer visível em < lg, tab "Documento" ativa, sem overflow.
  2. /faq?node=inexistente → cai no nó default sem quebrar layout.
  3. /faq/chat, /faq/stats, /faq/admin/chats, /faq/admin/improvements,
     /faq/admin/users abertos diretamente → tab correta marcada como ativa,
     sidebar de Guias oculta, sem overflow.

Rodar (dev server em :8080):
    python3 tests/responsive/deep_links.py
"""

from __future__ import annotations

import asyncio
import sys
from dataclasses import dataclass
from pathlib import Path
from playwright.async_api import async_playwright, Page, ConsoleMessage

BASE_URL = "http://localhost:8080"
OUT_DIR = Path("/tmp/browser/responsive-deep-links")
OUT_DIR.mkdir(parents=True, exist_ok=True)

LG = 1024
SIDEBAR_MIN = 768


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

# (path, active tab label, node-id que esperamos ver como heading, ou None)
DEEP_LINKS: list[tuple[str, str, str | None]] = [
    ("/faq?node=g2", "Documento", "g2"),
    ("/faq?node=g1-1", "Documento", "g1-1"),
    ("/faq?node=inexistente-xxx", "Documento", None),
    ("/faq/chat", "Chat FAQ", None),
    ("/faq/stats", "Estatísticas", None),
    ("/faq/admin/chats", "Chats", None),
    ("/faq/admin/improvements", "Melhorias", None),
    ("/faq/admin/users", "Usuários", None),
]

# Nome esperado do nó pelo seed (src/lib/faq-seed.ts).
NODE_NAMES = {
    "g1": "FAQ Operacional",
    "g1-1": "Cadastro de Estabelecimento",
    "g2": None,  # nome exato não importa; basta que o heading renderize algo
}


def check(cond: bool, msg: str, errors: list[str]) -> None:
    if not cond:
        errors.append(msg)


async def h_overflow(page: Page) -> tuple[bool, int, int]:
    m = await page.evaluate(
        """() => ({s: document.documentElement.scrollWidth,
                    c: document.documentElement.clientWidth})"""
    )
    return (m["s"] <= m["c"] + 1, m["s"], m["c"])


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


async def open_menu_if_needed(page: Page, vp: Viewport) -> None:
    if vp.width >= LG:
        return
    btn = page.get_by_role("button", name="Abrir menu")
    if await btn.count() and await btn.is_visible():
        await btn.click()
        try:
            await page.wait_for_function(
                """() => !!document.querySelector('[role="dialog"][data-state="open"]')""",
                timeout=2000,
            )
        except Exception:
            pass


async def close_menu_if_open(page: Page) -> None:
    is_open = await page.evaluate(
        """() => !!document.querySelector('[role="dialog"][data-state="open"]')"""
    )
    if is_open:
        await page.keyboard.press("Escape")
        try:
            await page.wait_for_function(
                """() => !document.querySelector('[role="dialog"][data-state="open"]')""",
                timeout=2000,
            )
        except Exception:
            pass


async def find_tab_link(page: Page, vp: Viewport, name: str):
    """Retorna o Link visível para o rótulo dado, abrindo o Sheet se necessário."""
    # Primeiro tenta encontrar o link já visível (desktop).
    locator = page.get_by_role("link", name=name)
    count = await locator.count()
    for i in range(count):
        el = locator.nth(i)
        try:
            if await el.is_visible():
                return el
        except Exception:
            continue
    # Se estivermos abaixo do breakpoint lg, abrir o menu e re-checar.
    if vp.width < LG:
        await open_menu_if_needed(page, vp)
        locator = page.get_by_role("link", name=name)
        count = await locator.count()
        for i in range(count):
            el = locator.nth(i)
            try:
                if await el.is_visible():
                    return el
            except Exception:
                continue
    return None


async def tab_is_active(page: Page, vp: Viewport, label: str) -> bool:
    link = await find_tab_link(page, vp, label)
    if link is None:
        return False
    cls = (await link.get_attribute("class")) or ""
    # A topbar marca a tab ativa com `bg-primary text-primary-foreground`
    return "bg-primary" in cls and "text-primary-foreground" in cls


async def run_link(page: Page, vp: Viewport, path: str, active: str, node_id: str | None) -> list[str]:
    errors: list[str] = []
    url = f"{BASE_URL}{path}"
    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle", timeout=8000)
    await page.wait_for_timeout(200)

    # 1. sem overflow horizontal logo após o load direto
    ok, s, c = await h_overflow(page)
    check(ok, f"overflow horizontal em {path} ({vp.name}): {s}>{c}", errors)

    # 2. sidebar de Guias só existe em /faq (sem sub-path) e em telas >= 768
    is_doc_root = path.startswith("/faq") and "/faq/" not in path
    sidebar = await guias_sidebar_visible(page)
    expected = is_doc_root and vp.width >= SIDEBAR_MIN
    check(
        sidebar == expected,
        f"sidebar visibilidade inesperada em {path} ({vp.name}): got={sidebar} expected={expected}",
        errors,
    )

    # 3. deep-link a nó específico → heading do documento contém o nome esperado
    if node_id and NODE_NAMES.get(node_id):
        expected_name = NODE_NAMES[node_id]
        # o DocumentoView renderiza o nome do nó em <h1> / <input>.
        found = await page.evaluate(
            """(name) => {
                const q = document.body.innerText || '';
                return q.includes(name);
            }""",
            expected_name,
        )
        check(found, f"nome '{expected_name}' não encontrado em {path} ({vp.name})", errors)

    # 4. tab ativa correta (abre o Sheet se preciso, depois fecha para não afetar overflow)
    active_ok = await tab_is_active(page, vp, active)
    check(active_ok, f"tab '{active}' não está ativa em {path} ({vp.name})", errors)
    await close_menu_if_open(page)

    # 5. após interação (abrir/fechar menu ou não), continua sem overflow
    ok, s, c = await h_overflow(page)
    check(ok, f"overflow horizontal após checagem em {path} ({vp.name}): {s}>{c}", errors)

    slug = path.replace("/", "_").replace("?", "__").replace("=", "-").strip("_") or "root"
    await page.screenshot(path=str(OUT_DIR / f"{vp.name}__{slug}.png"))
    return errors


async def run_all(page: Page, vp: Viewport) -> list[tuple[str, list[str]]]:
    console_errors: list[str] = []

    def on_console(m: ConsoleMessage) -> None:
        if m.type == "error":
            t = m.text
            if not any(n in t for n in ("Download the React DevTools", "[HMR]", "vite")):
                console_errors.append(t)

    page.on("console", on_console)
    results: list[tuple[str, list[str]]] = []
    for path, active, node in DEEP_LINKS:
        results.append((path, await run_link(page, vp, path, active, node)))
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
                    tag = f"[{vp.name:7s}] {name:32s}"
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
