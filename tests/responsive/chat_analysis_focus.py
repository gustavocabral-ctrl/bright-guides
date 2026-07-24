"""Test focus return and Escape behavior on chat analysis overlay/drawer.

Covers both mobile (fullscreen overlay) and desktop (right drawer) breakpoints.
"""

import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

SCREENSHOTS = Path(__file__).parent / "screenshots-chat-analysis"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

FAILURES = []


async def run_viewport(width: int, height: int, label: str) -> None:
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": width, "height": height})
        page = await context.new_page()
        await page.goto("http://localhost:8080/faq/admin/chats")
        await page.wait_for_load_state("networkidle")

        # Click the first visible "Análise da resposta" button.
        btn = page.locator("button:has-text('Análise da resposta'):visible").first
        try:
            await btn.wait_for(state="visible", timeout=5000)
        except Exception:
            FAILURES.append(f"{label}: analysis button not visible")
            await browser.close()
            return

        await btn.click()
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(SCREENSHOTS / f"{label}_open.png"))

        if width < 768:
            overlay = page.locator("[data-testid='analysis-overlay']").first
            if not await overlay.is_visible():
                FAILURES.append(f"{label}: overlay did not open")
                await browser.close()
                return
        else:
            drawer = page.locator("[data-testid='analysis-drawer']").first
            if not await drawer.is_visible():
                FAILURES.append(f"{label}: drawer did not open")
                await browser.close()
                return

        # Press Escape to close.
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(300)
        await page.screenshot(path=str(SCREENSHOTS / f"{label}_closed.png"))

        if width < 768:
            overlay_count = await page.locator("[data-testid='analysis-overlay']").count()
            if overlay_count != 0:
                FAILURES.append(f"{label}: overlay still visible after Escape")
        else:
            drawer_count = await page.locator("[data-testid='analysis-drawer']").count()
            if drawer_count != 0:
                FAILURES.append(f"{label}: drawer still visible after Escape")

        focus_is_button = await page.evaluate("""
            () => {
                const el = document.activeElement;
                return el && el.tagName === 'BUTTON' && el.textContent.includes('Análise da resposta');
            }
        """)
        if not focus_is_button:
            active_text = await page.evaluate("() => document.activeElement?.textContent?.trim() || '(none)'")
            FAILURES.append(f"{label}: focus did not return to analysis button (active: {active_text})")

        await browser.close()


async def main() -> None:
    await run_viewport(390, 844, "mobile")
    await run_viewport(1280, 900, "desktop")

    if FAILURES:
        print("FAILURES:")
        for f in FAILURES:
            print(f"  - {f}")
        sys.exit(1)

    print("PASS: chat analysis Escape and focus return work on mobile and desktop")


if __name__ == "__main__":
    asyncio.run(main())
