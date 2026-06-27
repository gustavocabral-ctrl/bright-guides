import { useEffect, useState } from "react";
import { useFaq } from "@/lib/faq-store";

type Marker = { id: number; topPct: number };

/** Renders dots on a thin vertical strip representing search hit positions
 *  within `contentRef` relative to the document. Clicking a dot activates it. */
export function SearchScrollMarkers({
  contentRef,
}: {
  contentRef: React.RefObject<HTMLElement | null>;
}) {
  const { search, searchTotal, searchIndex, setSearchIndex } = useFaq();
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    if (!search || searchTotal === 0) {
      setMarkers([]);
      return;
    }
    const recompute = () => {
      const el = contentRef.current;
      if (!el) return;
      const hits = el.querySelectorAll<HTMLElement>("mark.faq-search-hit");
      const total = el.scrollHeight || el.clientHeight || 1;
      const out: Marker[] = [];
      hits.forEach((h, i) => {
        // Position relative to the scrollable content (offsetTop is relative
        // to the nearest positioned ancestor; we set contentRef as `relative`).
        let top = 0;
        let node: HTMLElement | null = h;
        while (node && node !== el) {
          top += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        out.push({ id: i, topPct: Math.max(0, Math.min(100, (top / total) * 100)) });
      });
      setMarkers(out);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [search, searchTotal, contentRef]);

  if (!search || markers.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-1 top-0 z-20 h-full w-2"
    >
      {markers.map((m) => {
        const active = m.id === searchIndex;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => setSearchIndex(m.id)}
            aria-label={`Ir para ocorrência ${m.id + 1}`}
            className={
              "pointer-events-auto absolute left-0 right-0 mx-auto rounded-full transition " +
              (active
                ? "h-2.5 w-2.5 bg-amber-500 shadow ring-2 ring-amber-300"
                : "h-1.5 w-1.5 bg-yellow-400/70 hover:bg-yellow-500")
            }
            style={{ top: `calc(${m.topPct}% - 4px)` }}
          />
        );
      })}
    </div>
  );
}
