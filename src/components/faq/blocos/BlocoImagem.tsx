import { useEffect, useRef, useState } from "react";
import { Upload, ImagePlus, Sparkles, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlocoImagem as BlocoImagemT, Marker, MarkerKind } from "@/lib/faq-types";
import { MARKERS, MARKER_BY_KIND } from "@/lib/faq-markers";
import { cn } from "@/lib/utils";

const mid = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const DRAG_NEW = "application/x-faq-marker-kind";

/* -------------------- Shape renderers -------------------- */

/** Renders an arrow inside its bounding box, pointing right by default.
 *  Rotation is applied by the parent wrapper. */
export function ArrowSVG({ color, className }: { color: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={cn("block h-full w-full", className)}
    >
      <defs>
        <marker
          id={`ah-${color.replace("#", "")}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
      </defs>
      <line
        x1="4"
        y1="15"
        x2="92"
        y2="15"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        markerEnd={`url(#ah-${color.replace("#", "")})`}
      />
    </svg>
  );
}

export function RectShape({ color, className }: { color: string; className?: string }) {
  return (
    <div
      className={cn("h-full w-full rounded-[3px] border-[3px]", className)}
      style={{ borderColor: color, backgroundColor: "transparent" }}
    />
  );
}

/** Small static preview of a shape used inside the palette list. */
function PalettePreview({ kind }: { kind: MarkerKind }) {
  const meta = MARKER_BY_KIND[kind];
  if (meta.shape === "seta") {
    return (
      <div className="h-5 w-12 shrink-0">
        <ArrowSVG color={meta.color} />
      </div>
    );
  }
  if (meta.shape === "quadrado") {
    return <div className="h-8 w-8 shrink-0"><RectShape color={meta.color} /></div>;
  }
  return <div className="h-5 w-12 shrink-0"><RectShape color={meta.color} /></div>;
}

/* -------------------- Defaults & helpers -------------------- */

function defaultSize(kind: MarkerKind): { w: number; h: number } {
  const meta = MARKER_BY_KIND[kind];
  if (meta.shape === "seta") return { w: 0.18, h: 0.06 };
  if (meta.shape === "quadrado") return { w: 0.1, h: 0.1 };
  return { w: 0.22, h: 0.1 };
}

type DragState =
  | { mode: "move"; id: string; startX: number; startY: number; origX: number; origY: number }
  | {
      mode: "resize";
      id: string;
      corner: "nw" | "ne" | "sw" | "se";
      startX: number;
      startY: number;
      orig: { x: number; y: number; w: number; h: number };
    }
  | {
      mode: "rotate";
      id: string;
      centerX: number;
      centerY: number;
      startAngle: number;
      origRotation: number;
    };

/* -------------------- Marker on canvas -------------------- */

function MarkerOnImage({
  marker,
  number,
  selected,
  containerRect,
  onSelect,
  onDelete,
  onPointerDownBody,
  onPointerDownHandle,
}: {
  marker: Marker;
  number: number;
  selected: boolean;
  containerRect: DOMRect | null;
  onSelect: () => void;
  onDelete: () => void;
  onPointerDownBody: (e: React.PointerEvent) => void;
  onPointerDownHandle: (
    e: React.PointerEvent,
    handle: "nw" | "ne" | "sw" | "se" | "rotate",
  ) => void;
}) {
  const meta = MARKER_BY_KIND[marker.kind];
  if (!containerRect) return null;
  const left = marker.x * 100;
  const top = marker.y * 100;
  const widthPct = marker.w * 100;
  const heightPct = marker.h * 100;

  return (
    <div
      className="absolute"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        transform: `rotate(${marker.rotation}deg)`,
        transformOrigin: "center center",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
        onPointerDownBody(e);
      }}
    >
      {/* shape */}
      <div className="pointer-events-none absolute inset-0">
        {meta.shape === "seta" ? (
          <ArrowSVG color={meta.color} />
        ) : (
          <RectShape color={meta.color} />
        )}
      </div>

      {/* numbered badge */}
      <div
        className="pointer-events-none absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow ring-2 ring-white"
        style={{ backgroundColor: meta.color }}
      >
        {number}
      </div>

      {selected && (
        <>
          {/* selection box */}
          <div className="pointer-events-none absolute inset-0 border border-dashed border-primary/70" />
          {/* corners */}
          {(["nw", "ne", "sw", "se"] as const).map((c) => {
            const pos: React.CSSProperties = { position: "absolute" };
            if (c.includes("n")) pos.top = -5;
            else pos.bottom = -5;
            if (c.includes("w")) pos.left = -5;
            else pos.right = -5;
            const cursor =
              c === "nw" || c === "se" ? "nwse-resize" : "nesw-resize";
            return (
              <div
                key={c}
                role="button"
                aria-label={`Redimensionar ${c}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onPointerDownHandle(e, c);
                }}
                style={{ ...pos, cursor }}
                className="h-2.5 w-2.5 rounded-sm border border-primary bg-white"
              />
            );
          })}
          {/* rotate handle */}
          <div
            role="button"
            aria-label="Rotacionar"
            onPointerDown={(e) => {
              e.stopPropagation();
              onPointerDownHandle(e, "rotate");
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: -22,
              transform: "translateX(-50%)",
              cursor: "grab",
            }}
            className="h-3 w-3 rounded-full border border-primary bg-white"
          />
          {/* delete */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-foreground shadow"
            aria-label="Excluir marcação"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      )}
    </div>
  );
}

/* -------------------- Main block -------------------- */

export function BlocoImagem({
  bloco,
  onChange,
}: {
  bloco: BlocoImagemT;
  onChange: (patch: Partial<BlocoImagemT>) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const markers = bloco.markers ?? [];
  const instrucoes =
    bloco.instrucoesItens ??
    markers.map((m) => ({ id: m.id, texto: MARKER_BY_KIND[m.kind].sugestao({}) }));

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ src: url, nome: bloco.nome || file.name.replace(/\.[^.]+$/, "") });
  };

  /* Drop from palette */
  const onImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData(DRAG_NEW) as MarkerKind | "";
    if (!kind) return;
    const el = imgWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = defaultSize(kind);
    const cx = (e.clientX - rect.left) / rect.width;
    const cy = (e.clientY - rect.top) / rect.height;
    const marker: Marker = {
      id: mid(),
      kind,
      x: Math.max(0, Math.min(1 - size.w, cx - size.w / 2)),
      y: Math.max(0, Math.min(1 - size.h, cy - size.h / 2)),
      w: size.w,
      h: size.h,
      rotation: 0,
    };
    onChange({
      markers: [...markers, marker],
      instrucoesItens: [
        ...instrucoes,
        { id: marker.id, texto: MARKER_BY_KIND[kind].sugestao({}) },
      ],
    });
    setSelectedId(marker.id);
  };

  /* Pointer interactions: move / resize / rotate */
  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      const st = dragRef.current;
      if (!st) return;
      const el = imgWrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      if (st.mode === "move") {
        const dx = (ev.clientX - st.startX) / rect.width;
        const dy = (ev.clientY - st.startY) / rect.height;
        onChange({
          markers: markers.map((m) => {
            if (m.id !== st.id) return m;
            return {
              ...m,
              x: Math.max(0, Math.min(1 - m.w, st.origX + dx)),
              y: Math.max(0, Math.min(1 - m.h, st.origY + dy)),
            };
          }),
        });
      } else if (st.mode === "resize") {
        const dx = (ev.clientX - st.startX) / rect.width;
        const dy = (ev.clientY - st.startY) / rect.height;
        let { x, y, w, h } = st.orig;
        if (st.corner.includes("e")) w = Math.max(0.02, st.orig.w + dx);
        if (st.corner.includes("s")) h = Math.max(0.02, st.orig.h + dy);
        if (st.corner.includes("w")) {
          w = Math.max(0.02, st.orig.w - dx);
          x = st.orig.x + (st.orig.w - w);
        }
        if (st.corner.includes("n")) {
          h = Math.max(0.02, st.orig.h - dy);
          y = st.orig.y + (st.orig.h - h);
        }
        onChange({
          markers: markers.map((m) => (m.id === st.id ? { ...m, x, y, w, h } : m)),
        });
      } else if (st.mode === "rotate") {
        const angle = Math.atan2(ev.clientY - st.centerY, ev.clientX - st.centerX);
        const deg = (angle - st.startAngle) * (180 / Math.PI) + st.origRotation;
        onChange({
          markers: markers.map((m) =>
            m.id === st.id ? { ...m, rotation: Math.round(deg) } : m,
          ),
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [markers, onChange]);

  const startMove = (e: React.PointerEvent, m: Marker) => {
    dragRef.current = {
      mode: "move",
      id: m.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: m.x,
      origY: m.y,
    };
  };

  const startHandle = (
    e: React.PointerEvent,
    m: Marker,
    handle: "nw" | "ne" | "sw" | "se" | "rotate",
  ) => {
    const el = imgWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (handle === "rotate") {
      const cx = rect.left + (m.x + m.w / 2) * rect.width;
      const cy = rect.top + (m.y + m.h / 2) * rect.height;
      dragRef.current = {
        mode: "rotate",
        id: m.id,
        centerX: cx,
        centerY: cy,
        startAngle: Math.atan2(e.clientY - cy, e.clientX - cx),
        origRotation: m.rotation,
      };
    } else {
      dragRef.current = {
        mode: "resize",
        id: m.id,
        corner: handle,
        startX: e.clientX,
        startY: e.clientY,
        orig: { x: m.x, y: m.y, w: m.w, h: m.h },
      };
    }
  };

  const removeMarker = (id: string) => {
    onChange({
      markers: markers.filter((m) => m.id !== id),
      instrucoesItens: instrucoes.filter((i) => i.id !== id),
    });
    if (selectedId === id) setSelectedId(null);
  };

  const updateInstrucao = (id: string, texto: string) => {
    onChange({
      instrucoesItens: instrucoes.map((i) => (i.id === id ? { ...i, texto } : i)),
    });
  };

  const addManual = () => {
    const id = mid();
    onChange({ instrucoesItens: [...instrucoes, { id, texto: "" }] });
  };

  const gerarComIA = () => {
    const ctx = { nome: bloco.nome, interfaceTipo: bloco.interfaceTipo };
    const refined = markers.map((m, idx) => {
      const meta = MARKER_BY_KIND[m.kind];
      const base = meta.sugestao(ctx);
      const ref = bloco.nome ? ` na tela "${bloco.nome}"` : "";
      return {
        id: m.id,
        texto:
          idx === 0
            ? `${base.replace(/\.$/, "")}${ref} para iniciar o procedimento.`
            : base,
      };
    });
    const extra = instrucoes.filter((i) => !markers.some((m) => m.id === i.id));
    onChange({ instrucoesItens: [...refined, ...extra] });
  };

  const containerRect = imgWrapRef.current?.getBoundingClientRect() ?? null;

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div className="space-y-4">
        {/* Image + canvas */}
        <div>
          {!bloco.src ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card px-6 py-12 text-center transition-colors",
                dragOver ? "border-primary bg-[var(--primary-soft)]" : "border-border",
              )}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Arraste uma imagem aqui</p>
              <p className="mb-3 text-xs text-muted-foreground">PNG, JPG ou GIF até 10MB</p>
              <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                Selecionar imagem
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                ref={imgWrapRef}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onImageDrop}
                onPointerDown={() => setSelectedId(null)}
                className="relative inline-block w-full overflow-hidden rounded-lg border border-border bg-card"
              >
                <img
                  src={bloco.src}
                  alt={bloco.nome || "Preview"}
                  className="block max-h-[720px] w-full object-contain"
                  draggable={false}
                />
                {markers.map((m, idx) => (
                  <MarkerOnImage
                    key={m.id}
                    marker={m}
                    number={idx + 1}
                    selected={selectedId === m.id}
                    containerRect={containerRect}
                    onSelect={() => setSelectedId(m.id)}
                    onDelete={() => removeMarker(m.id)}
                    onPointerDownBody={(e) => startMove(e, m)}
                    onPointerDownHandle={(e, h) => startHandle(e, m, h)}
                  />
                ))}
                {markers.length === 0 && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 text-center text-xs font-medium text-white">
                    Arraste formas da legenda abaixo para marcar a imagem
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus className="mr-1.5 h-4 w-4" /> Trocar imagem
                </Button>
                {selectedId && (
                  <span className="text-xs text-muted-foreground">
                    Forma selecionada — arraste para mover, use as alças para
                    redimensionar e o ponto superior para rotacionar.
                  </span>
                )}
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
          />
        </div>

        {/* Palette below image */}
        <aside className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Legenda — arraste para a imagem
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MARKERS.map((m) => (
              <li
                key={m.kind}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_NEW, m.kind);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="group flex cursor-grab items-start gap-2.5 rounded-md border border-transparent p-2 hover:border-border hover:bg-muted/40 active:cursor-grabbing"
              >
                <div className="flex h-8 w-12 shrink-0 items-center justify-center">
                  <PalettePreview kind={m.kind} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold leading-tight">
                    {m.label}
                  </div>
                  <div className="text-[11px] leading-snug text-muted-foreground">
                    {m.descricao}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Metadata */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Nome da imagem</Label>
          <Input
            value={bloco.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            placeholder="Ex: Tela de cadastro de estabelecimento"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tipo de interface</Label>
          <Select
            value={bloco.interfaceTipo}
            onValueChange={(v) =>
              onChange({ interfaceTipo: v as BlocoImagemT["interfaceTipo"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aplicativo">Aplicativo</SelectItem>
              <SelectItem value="Site Administrativo">Site Administrativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs font-medium">Instruções da imagem</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={gerarComIA}
              disabled={markers.length === 0}
            >
              <Sparkles className="mr-1.5 h-4 w-4" /> Gerar instruções com IA
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addManual}>
              <Plus className="mr-1.5 h-4 w-4" /> Adicionar instrução
            </Button>
          </div>
        </div>
        {instrucoes.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-card px-3 py-4 text-center text-xs italic text-muted-foreground">
            Arraste formas da legenda para a imagem e as instruções serão criadas
            automaticamente em ordem.
          </p>
        ) : (
          <ol className="space-y-2">
            {instrucoes.map((item, idx) => (
              <li key={item.id} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-muted-foreground">
                  {idx + 1}°
                </span>
                <Input
                  value={item.texto}
                  onChange={(e) => updateInstrucao(item.id, e.target.value)}
                  placeholder="Descreva esta etapa…"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMarker(item.id)}
                  aria-label="Remover"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ol>

        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          A ordem das formas inseridas na imagem define a ordem das instruções
          numeradas (1º, 2º, 3º…).
        </p>
      </div>
    </div>
  );
}
