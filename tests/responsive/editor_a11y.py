"""Accessibility checks for the editor loading and error states.

Validates:
- Save button exposes aria-busy while saving and keeps a text label.
- Loader icon is aria-hidden (decorative); "Salvando..." remains announced.
- A polite live status region announces save progress.
- Error banner uses role="alert" + aria-live="assertive" + aria-atomic.
- Focus lands on the error banner when a save failure appears.
- Spinner text and error banner text meet WCAG AA contrast (>= 4.5:1
  for body text) against their effective backgrounds.

Run:
    python3 tests/responsive/editor_a11y.py
"""

from __future__ import annotations

import asyncio
import re
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
NODE = "g1-1"  # seeded node with existing blocks (see src/lib/faq-seed.ts)
SHOTS = Path(__file__).parent / "screenshots-a11y"
SHOTS.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [
    ("mobile", 390, 844),
    ("tablet", 820, 1180),
    ("desktop", 1440, 900),
]


def _parse_color(value: str) -> tuple[float, float, float, float]:
    m = re.match(r"rgba?\(([^)]+)\)", value.strip())
    if not m:
        raise ValueError(f"Unsupported color: {value}")
    parts = [p.strip() for p in m.group(1).split(",")]
    r, g, b = (float(parts[0]), float(parts[1]), float(parts[2]))
    a = float(parts[3]) if len(parts) == 4 else 1.0
    return r, g, b, a


def _blend(fg: tuple[float, float, float, float], bg: tuple[float, float, float, float]) -> tuple[float, float, float]:
    fr, fgc, fb, fa = fg
    br, bgc, bb, _ = bg
    return (
        fr * fa + br * (1 - fa),
        fgc * fa + bgc * (1 - fa),
        fb * fa + bb * (1 - fa),
    )


def _relative_luminance(rgb: tuple[float, float, float]) -> float:
    def channel(c: float) -> float:
        c /= 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast_ratio(fg_css: str, bg_css: str) -> float:
    fg = _parse_color(fg_css)
    bg = _parse_color(bg_css)
    if bg[3] < 1:
        # Assume white page underneath if bg is translucent.
        bg = _blend(bg, (255.0, 255.0, 255.0, 1.0)) + (1.0,)  # type: ignore
    blended = _blend(fg, bg)
    l1 = _relative_luminance(blended)
    l2 = _relative_luminance((bg[0], bg[1], bg[2]))
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


async def _effective_bg(locator) -> str:
    """Walk up the tree until an element with a non-transparent bg is found.
    Returns an rgb()/rgba() string (canvas-normalized so oklch/lch work)."""
    return await locator.evaluate(
        """el => {
            const norm = (c) => {
                const cv = document.createElement('canvas');
                cv.width = cv.height = 1;
                const ctx = cv.getContext('2d');
                ctx.fillStyle = '#000';
                ctx.fillStyle = c;
                ctx.fillRect(0,0,1,1);
                const [r,g,b,a] = ctx.getImageData(0,0,1,1).data;
                return `rgba(${r}, ${g}, ${b}, ${a/255})`;
            };
            let node = el;
            while (node) {
                const bg = getComputedStyle(node).backgroundColor;
                if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return norm(bg);
                node = node.parentElement;
            }
            return 'rgba(255, 255, 255, 1)';
        }"""
    )


async def _color_of(locator) -> str:
    return await locator.evaluate(
        """el => {
            const c = getComputedStyle(el).color;
            const cv = document.createElement('canvas');
            cv.width = cv.height = 1;
            const ctx = cv.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillStyle = c;
            ctx.fillRect(0,0,1,1);
            const [r,g,b,a] = ctx.getImageData(0,0,1,1).data;
            return `rgba(${r}, ${g}, ${b}, ${a/255})`;
        }"""
    )



async def check_loading(page, results: list[dict], label: str) -> None:
    await page.goto(f"{BASE}/faq?node={NODE}&saveState=loading", wait_until="domcontentloaded")
    save_btn = page.get_by_test_id("save-button")
    await save_btn.wait_for(state="visible", timeout=4000)

    aria_busy = await save_btn.get_attribute("aria-busy")
    aria_label = await save_btn.get_attribute("aria-label")
    text = (await save_btn.text_content() or "").strip()

    # Loader icon must be decorative.
    loader = save_btn.locator("svg.animate-spin")
    loader_hidden = await loader.get_attribute("aria-hidden")

    # Status region present and announcing.
    status = page.get_by_test_id("save-status-region")
    status_role = await status.get_attribute("role")
    status_live = await status.get_attribute("aria-live")
    status_text = (await status.text_content() or "").strip()

    # Contrast of the visible "Salvando..." label vs button background.
    label_span = save_btn.locator("span").first
    fg = await label_span.evaluate("el => getComputedStyle(el).color")
    bg = await _effective_bg(save_btn)
    ratio = contrast_ratio(fg, bg)

    await page.screenshot(path=str(SHOTS / f"{label}-loading.png"))

    results.append({
        "case": f"{label}/loading",
        "aria_busy": aria_busy == "true",
        "aria_label_ok": (aria_label or "").lower().startswith("salvando"),
        "text_has_salvando": "Salvando" in text,
        "loader_aria_hidden": loader_hidden == "true",
        "status_role": status_role == "status",
        "status_aria_live": status_live == "polite",
        "status_announces": "Salvando" in status_text,
        "contrast_ratio": round(ratio, 2),
        "contrast_ok": ratio >= 4.5,
    })


async def check_error(page, results: list[dict], label: str) -> None:
    await page.goto(f"{BASE}/faq?node={NODE}&saveState=error", wait_until="domcontentloaded")
    banner = page.get_by_test_id("save-error-banner")
    await banner.wait_for(state="visible", timeout=4000)

    role = await banner.get_attribute("role")
    live = await banner.get_attribute("aria-live")
    atomic = await banner.get_attribute("aria-atomic")
    tabindex = await banner.get_attribute("tabindex")

    # Focus should be on the banner (moved by the effect on mount).
    focused = await page.evaluate(
        "el => document.activeElement === el",
        await banner.element_handle(),
    )

    # Contrast: title paragraph vs banner background.
    title = banner.locator("p.font-medium").first
    fg_title = await title.evaluate("el => getComputedStyle(el).color")
    bg = await _effective_bg(banner)
    ratio_title = contrast_ratio(fg_title, bg)

    body = banner.locator("p").nth(1)
    fg_body = await body.evaluate("el => getComputedStyle(el).color")
    ratio_body = contrast_ratio(fg_body, bg)

    # Retry button has accessible name.
    retry = banner.get_by_role("button", name=re.compile("Tentar novamente"))
    retry_visible = await retry.is_visible()

    await page.screenshot(path=str(SHOTS / f"{label}-error.png"))

    results.append({
        "case": f"{label}/error",
        "role_alert": role == "alert",
        "aria_live_assertive": live == "assertive",
        "aria_atomic": atomic == "true",
        "focusable": tabindex == "-1",
        "focused_on_mount": focused,
        "retry_visible": retry_visible,
        "contrast_title": round(ratio_title, 2),
        "contrast_body": round(ratio_body, 2),
        "contrast_ok": ratio_title >= 4.5 and ratio_body >= 4.5,
    })


async def main() -> int:
    results: list[dict] = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for label, w, h in VIEWPORTS:
            ctx = await browser.new_context(viewport={"width": w, "height": h})
            page = await ctx.new_page()
            await check_loading(page, results, label)
            await check_error(page, results, label)
            await ctx.close()
        await browser.close()

    failures: list[str] = []
    for r in results:
        checks = {k: v for k, v in r.items() if k not in ("case", "contrast_ratio", "contrast_title", "contrast_body")}
        bad = [k for k, v in checks.items() if v is False]
        status = "PASS" if not bad else "FAIL"
        print(f"[{status}] {r['case']}  ->  {r}")
        if bad:
            failures.append(f"{r['case']}: {bad}")

    if failures:
        print("\nFAILURES:")
        for f in failures:
            print(" -", f)
        return 1
    print(f"\nAll {len(results)} a11y checks passed. Screenshots: {SHOTS}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
