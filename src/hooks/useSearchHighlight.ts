import { useEffect, useLayoutEffect, useRef } from "react";

const HIT_CLASS = "faq-search-hit";
const HIT_ACTIVE_CLASS = "faq-search-hit-active";

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Remove previously inserted <mark> wrappers from the container. */
function clearMarks(container: HTMLElement) {
  const marks = container.querySelectorAll<HTMLElement>(`mark.${HIT_CLASS}`);
  marks.forEach((m) => {
    const parent = m.parentNode;
    if (!parent) return;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize();
  });
}

/** Walk text nodes (skipping script/style/inputs) and wrap matches. */
function applyMarks(container: HTMLElement, term: string): number {
  if (!term) return 0;
  const needle = normalize(term);
  if (!needle) return 0;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (
        tag === "SCRIPT" ||
        tag === "STYLE" ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        parent.closest("mark." + HIT_CLASS)
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets: Text[] = [];
  let cur: Node | null = walker.nextNode();
  while (cur) {
    targets.push(cur as Text);
    cur = walker.nextNode();
  }

  let total = 0;
  for (const textNode of targets) {
    const raw = textNode.nodeValue ?? "";
    const norm = normalize(raw);
    if (!norm.includes(needle)) continue;

    // Find all matches in normalized text — indexes map 1:1 to raw because
    // NFD removal only drops combining marks; length stays consistent for
    // typical Latin scripts after stripping diacritics. We rebuild via splits.
    const frag = document.createDocumentFragment();
    let i = 0;
    while (i < raw.length) {
      const idx = norm.indexOf(needle, i);
      if (idx === -1) {
        frag.appendChild(document.createTextNode(raw.slice(i)));
        break;
      }
      if (idx > i) frag.appendChild(document.createTextNode(raw.slice(i, idx)));
      const mark = document.createElement("mark");
      mark.className = HIT_CLASS;
      mark.dataset.hitIndex = String(total);
      mark.textContent = raw.slice(idx, idx + needle.length);
      frag.appendChild(mark);
      total += 1;
      i = idx + needle.length;
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }
  return total;
}

export function useSearchHighlight(
  containerRef: React.RefObject<HTMLElement | null>,
  term: string,
  activeIndex: number,
  onTotal: (n: number) => void,
  /** Any dependency that, when changed, requires re-applying highlights. */
  contentKey: unknown,
) {
  // (Re)apply marks whenever term/content changes.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    clearMarks(el);
    const total = applyMarks(el, term.trim());
    onTotal(total);
    return () => {
      // Clean on unmount/dep-change.
      const el2 = containerRef.current;
      if (el2) clearMarks(el2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, contentKey]);

  // Move "active" highlight + scroll into view.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const all = el.querySelectorAll<HTMLElement>(`mark.${HIT_CLASS}`);
    all.forEach((m) => m.classList.remove(HIT_ACTIVE_CLASS));
    const target = all[activeIndex];
    if (target) {
      target.classList.add(HIT_ACTIVE_CLASS);
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, term, contentKey, containerRef]);
}
