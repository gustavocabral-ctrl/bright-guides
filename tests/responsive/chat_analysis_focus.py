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
        await page.wait_for_timeout(500)

        # Wait for the analysis panel to render before checking.
        if width < 768:
            try:
                await page.wait_for_selector("[data-testid='analysis-overlay']", state="visible", timeout=3000)
            except Exception:
                FAILURES.append(f"{label}: overlay did not open")
                await browser.close()
                return
        else:
            try:
                await page.wait_for_selector("[data-testid='analysis-drawer']", state="visible", timeout=3000)
            except Exception:
                FAILURES.append(f"{label}: drawer did not open")
                await browser.close()
                return

        # Verify the dialog has proper ARIA attributes for screen readers.
        drawer = page.locator("[data-testid='analysis-drawer']").filter(visible=True)
        attrs = await drawer.evaluate("""
            (el) => ({
                role: el.getAttribute('role'),
                ariaModal: el.getAttribute('aria-modal'),
                labelledBy: el.getAttribute('aria-labelledby'),
                describedBy: el.getAttribute('aria-describedby'),
            })
        """)
        if attrs.get("role") != "dialog":
            FAILURES.append(f"{label}: analysis panel is missing role='dialog'")
        if attrs.get("ariaModal") != "true":
            FAILURES.append(f"{label}: analysis panel is missing aria-modal='true'")
        if not attrs.get("labelledBy"):
            FAILURES.append(f"{label}: analysis panel is missing aria-labelledby")
        if not attrs.get("describedBy"):
            FAILURES.append(f"{label}: analysis panel is missing aria-describedby")

        # Ensure the referenced label and description elements exist.
        if attrs.get("labelledBy") and not await page.locator(f"#{attrs['labelledBy']}").count():
            FAILURES.append(f"{label}: aria-labelledby target does not exist")
        if attrs.get("describedBy") and not await page.locator(f"#{attrs['describedBy']}").count():
            FAILURES.append(f"{label}: aria-describedby target does not exist")

        await page.screenshot(path=str(SCREENSHOTS / f"{label}_open.png"))

        # Press Escape to close.
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(500)
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

        # Reopen the overlay to test backdrop click behavior.
        await btn.click()
        await page.wait_for_timeout(500)
        if width < 768:
            try:
                await page.wait_for_selector("[data-testid='analysis-overlay']", state="visible", timeout=3000)
            except Exception:
                FAILURES.append(f"{label}: overlay did not reopen for backdrop test")
                await browser.close()
                return

            # Click inside the drawer content; it should NOT close the overlay.
            drawer = page.locator("[data-testid='analysis-overlay'] [data-testid='analysis-drawer']")
            await drawer.click()
            await page.wait_for_timeout(300)
            if await page.locator("[data-testid='analysis-overlay']").count() == 0:
                FAILURES.append(f"{label}: overlay closed when clicking inside content")
                await browser.close()
                return

            # Click on the dark backdrop (outside the drawer) to close.
            overlay = page.locator("[data-testid='analysis-overlay']")
            # Click near the top-left corner of the overlay, outside the centered drawer.
            box = await overlay.bounding_box()
            if box:
                await page.mouse.click(box["x"] + 10, box["y"] + 10)
            await page.wait_for_timeout(500)
            if await page.locator("[data-testid='analysis-overlay']").count() != 0:
                FAILURES.append(f"{label}: overlay did not close on backdrop click")

            # Reopen the overlay to test focus trap.
            await btn.click()
            await page.wait_for_timeout(500)
            try:
                await page.wait_for_selector("[data-testid='analysis-overlay']", state="visible", timeout=3000)
            except Exception:
                FAILURES.append(f"{label}: overlay did not reopen for focus-trap test")
                await browser.close()
                return

            def focused_in_drawer_js():
                return """
                () => {
                    const drawer = document.querySelector("[data-testid='analysis-overlay'] [data-testid='analysis-drawer']");
                    return !!(drawer && drawer.contains(document.activeElement));
                }
                """

            if not await page.evaluate(focused_in_drawer_js()):
                FAILURES.append(f"{label}: initial focus is not inside the drawer")

            for _ in range(12):
                await page.keyboard.press("Tab")
                await page.wait_for_timeout(50)

            if not await page.evaluate(focused_in_drawer_js()):
                active = await page.evaluate("() => document.activeElement?.outerHTML?.slice(0, 80) || '(none)'")
                FAILURES.append(f"{label}: Tab moved focus outside the drawer (active: {active})")

            await page.keyboard.press("Escape")
            await page.wait_for_timeout(500)

        await browser.close()


async def main() -> None:
    await run_viewport(390, 844, "mobile")
    await run_viewport(1280, 900, "desktop")

    if FAILURES:
        print("FAILURES:")
        for f in FAILURES:
            print(f"  - {f}")
        sys.exit(1)

    print("PASS: chat analysis Escape, focus return, and backdrop click work on mobile and desktop")


if __name__ == "__main__":
    asyncio.run(main())
