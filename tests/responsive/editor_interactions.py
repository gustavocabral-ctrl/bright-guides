"""
Testes de interação do editor de conteúdo do Documento FAQ.

Cobre, em mobile / tablet / desktop:
  1. Estado vazio  → mensagem placeholder + botão "Adicionar bloco".
  2. Inserção pelo empty-state  → adiciona o primeiro bloco (texto).
  3. Menu de blocos (dropdown "Adicionar bloco")  → abre e lista os
     tipos permitidos para o nível "assunto" (6 tipos).
  4. Inserção de bloco Texto via menu + digitação no textarea.
  5. Inserção de bloco Imagem  → renderiza área de upload/canvas.
  6. Reordenar / remover blocos  → botões de ação existem no DOM.
  7. Nenhuma quebra de layout (scroll horizontal) durante o fluxo.

Usa deep-link `?node=g1-1-1` (assunto vazio no seed) para partir de
um estado determinístico sem mexer em outros nós.

Rodar:
    python3 tests/responsive/editor_interactions.py
"""

from __future__ import annotations

import asyncio
import sys
from dataclasses import dataclass
from pathlib import Path

from playwright.async_api import async_playwright, Page, expect

BASE_URL = "http://localhost:8080"
EMPTY_NODE = "g1-1-1"  # assunto vazio no seed (permite todos os blocos)
OUT_DIR = Path("/tmp/browser/editor-interactions")
OUT_DIR.mkdir(parents=True, exist_ok=True)


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


async def assert_no_hscroll(page: Page, label: str) -> None:
    overflow = await page.evaluate(
        "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 1, f"[{label}] overflow horizontal = {overflow}px"


async def open_node(page: Page, vp: Viewport, node_id: str) -> None:
    await page.goto(f"{BASE_URL}/faq?node={node_id}", wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle", timeout=8000)
    # Fecha eventual hamburger aberto por default no mobile.
    await page.keyboard.press("Escape")
    await page.wait_for_timeout(150)


async def run_viewport(page: Page, vp: Viewport) -> list[str]:
    results: list[str] = []

    # ---- 1. Estado vazio ----
    await open_node(page, vp, EMPTY_NODE)
    empty_msg = page.get_by_text("Nenhum conteúdo adicionado", exact=False)
    await expect(empty_msg).to_be_visible(timeout=5000)
    await assert_no_hscroll(page, f"{vp.name}:empty")
    await page.screenshot(path=str(OUT_DIR / f"{vp.name}_1_empty.png"))
    results.append(f"[{vp.name}] empty state OK")

    # ---- 2. Inserção pelo empty-state (primeiro tipo permitido: texto) ----
    await empty_msg.locator("..").get_by_role("button", name="Adicionar bloco").click()
    textarea = page.locator("textarea").first
    await expect(textarea).to_be_visible(timeout=3000)
    await assert_no_hscroll(page, f"{vp.name}:first-insert")
    results.append(f"[{vp.name}] inserção via empty-state OK")

    # Digitar conteúdo
    await textarea.click()
    await textarea.fill("Conteúdo inserido pelo teste automatizado.")
    await expect(textarea).to_have_value("Conteúdo inserido pelo teste automatizado.")
    await page.screenshot(path=str(OUT_DIR / f"{vp.name}_2_texto.png"))
    results.append(f"[{vp.name}] digitação texto OK")

    # ---- 3. Menu de blocos (dropdown no rodapé) ----
    add_btn = page.get_by_role("button", name="Adicionar bloco").last
    await add_btn.click()
    menu = page.get_by_role("menu")
    await expect(menu).to_be_visible(timeout=3000)
    # 6 tipos permitidos para "assunto"
    items = menu.get_by_role("menuitem")
    count = await items.count()
    assert count == 6, f"esperava 6 tipos no menu, achou {count}"
    for label in ("Texto", "Contexto", "Imagem", "Vídeo", "Instrução", "Observação"):
        await expect(menu.get_by_text(label, exact=True)).to_be_visible()
    await assert_no_hscroll(page, f"{vp.name}:menu-open")
    await page.screenshot(path=str(OUT_DIR / f"{vp.name}_3_menu.png"))
    results.append(f"[{vp.name}] menu de blocos com 6 tipos OK")

    # ---- 4. Adicionar bloco Imagem via menu ----
    await menu.get_by_text("Imagem", exact=True).click()
    # BlocoImagem contém input file
    file_input = page.locator('input[type="file"]').first
    await expect(file_input).to_have_count(1)
    await assert_no_hscroll(page, f"{vp.name}:imagem-inserted")
    await page.screenshot(path=str(OUT_DIR / f"{vp.name}_4_imagem.png"))
    results.append(f"[{vp.name}] inserção bloco imagem OK")

    # ---- 5. Botões de reordenar/remover existem no DOM ----
    # Ficam com `hidden group-hover:flex` — invisíveis até hover. Locator CSS
    # ignora visibilidade, então validamos presença no DOM.
    up_btns = page.locator('button[aria-label="Mover para cima"]')
    down_btns = page.locator('button[aria-label="Mover para baixo"]')
    del_btns = page.locator('button[aria-label="Remover bloco"]')
    assert await up_btns.count() >= 2, "faltam botões mover-cima"
    assert await down_btns.count() >= 2, "faltam botões mover-baixo"
    assert await del_btns.count() >= 2, "faltam botões remover"
    results.append(f"[{vp.name}] controles de reordenar/remover presentes")

    # ---- 6. Remover o bloco imagem via clique (força visibilidade) ----
    await del_btns.last.click(force=True)
    # Aguarda file input desaparecer
    await expect(file_input).to_have_count(0, timeout=3000)
    await assert_no_hscroll(page, f"{vp.name}:after-remove")
    results.append(f"[{vp.name}] remoção de bloco OK")

    return results


async def main() -> int:
    failures: list[str] = []
    report: list[str] = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            for vp in VIEWPORTS:
                ctx = await browser.new_context(
                    viewport={"width": vp.width, "height": vp.height}
                )
                page = await ctx.new_page()
                try:
                    report.extend(await run_viewport(page, vp))
                except AssertionError as e:
                    failures.append(f"[{vp.name}] {e}")
                    report.append(f"FAIL [{vp.name}] {e}")
                    await page.screenshot(path=str(OUT_DIR / f"{vp.name}_FAIL.png"))
                except Exception as e:  # noqa: BLE001
                    failures.append(f"[{vp.name}] {type(e).__name__}: {e}")
                    report.append(f"ERROR [{vp.name}] {type(e).__name__}: {e}")
                    await page.screenshot(path=str(OUT_DIR / f"{vp.name}_ERROR.png"))
                await ctx.close()
        finally:
            await browser.close()

    print("\n".join(report))
    print(f"\nScreenshots em: {OUT_DIR}")
    print(f"Falhas: {len(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
