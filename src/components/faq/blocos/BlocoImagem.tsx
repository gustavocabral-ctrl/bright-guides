import { useRef, useState } from "react";
import { Upload, ImagePlus, Sparkles, Plus, X, GripVertical } from "lucide-react";
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
import { MARKERS, MARKER_BY_KIND, ordinal } from "@/lib/faq-markers";
import { cn } from "@/lib/utils";

const mid = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const DRAG_NEW = "application/x-faq-marker-kind";
const DRAG_MOVE = "application/x-faq-marker-move";

export function MarkerShape({
  kind,
  number,
  onDelete,
  draggable,
  onDragStart,
}: {
  kind: MarkerKind;
  number: number;
  onDelete?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const meta = MARKER_BY_KIND[kind];
  const base =
    "flex items-center justify-center text-[11px] font-bold text-white shadow-md ring-2 ring-white";
  let shapeCls = "";
  let w = 28, h = 28;
  if (meta.shape === "seta") {
    shapeCls = "rounded-full";
  } else if (meta.shape === "quadrado") {
    shapeCls = "rounded";
  } else {
    shapeCls = "rounded";
    w = 44;
    h = 22;
  }
  return (
    <div
      className={cn(base, shapeCls, "group relative cursor-move select-none")}
      draggable={draggable}
      onDragStart={onDragStart}
      style={{ width: w, height: h, backgroundColor: meta.color }}
      title={meta.descricao}
    >
      {number}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full border border-border bg-white text-foreground shadow group-hover:flex"
          aria-label="Excluir marcação"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}

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

  const markers = bloco.markers ?? [];
  const instrucoes =
    bloco.instrucoesItens ??
    markers.map((m) => ({ id: m.id, texto: MARKER_BY_KIND[m.kind].sugestao({}) }));

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ src: url, nome: bloco.nome || file.name.replace(/\.[^.]+$/, "") });
  };

  const computeRelative = (e: React.DragEvent): { x: number; y: number } | null => {
    const el = imgWrapRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const onImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const pos = computeRelative(e);
    if (!pos) return;
    const newKind = e.dataTransfer.getData(DRAG_NEW) as MarkerKind | "";
    const moveId = e.dataTransfer.getData(DRAG_MOVE);
    if (moveId) {
      const newMarkers = markers.map((m) => (m.id === moveId ? { ...m, ...pos } : m));
      onChange({ markers: newMarkers });
      return;
    }
    if (newKind) {
      const marker: Marker = { id: mid(), kind: newKind, x: pos.x, y: pos.y };
      const newMarkers = [...markers, marker];
      const newInstrucoes = [
        ...instrucoes,
        { id: marker.id, texto: MARKER_BY_KIND[newKind].sugestao({}) },
      ];
      onChange({ markers: newMarkers, instrucoesItens: newInstrucoes });
    }
  };

  const removeMarker = (id: string) => {
    onChange({
      markers: markers.filter((m) => m.id !== id),
      instrucoesItens: instrucoes.filter((i) => i.id !== id),
    });
  };

  const updateInstrucao = (id: string, texto: string) => {
    onChange({
      instrucoesItens: instrucoes.map((i) => (i.id === id ? { ...i, texto } : i)),
    });
  };

  const addManual = () => {
    const id = mid();
    onChange({
      instrucoesItens: [...instrucoes, { id, texto: "" }],
    });
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
    // include any extra manual items (without markers) untouched
    const extra = instrucoes.filter((i) => !markers.some((m) => m.id === i.id));
    onChange({ instrucoesItens: [...refined, ...extra] });
  };

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        {/* Left: image + drop zone */}
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
                className="relative inline-block w-full overflow-hidden rounded-lg border border-border bg-card"
              >
                <img
                  src={bloco.src}
                  alt={bloco.nome || "Preview"}
                  className="block max-h-[460px] w-full object-contain"
                  draggable={false}
                />
                {markers.map((m, idx) => (
                  <div
                    key={m.id}
                    className="absolute"
                    style={{
                      left: `${m.x * 100}%`,
                      top: `${m.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <MarkerShape
                      kind={m.kind}
                      number={idx + 1}
                      onDelete={() => removeMarker(m.id)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_MOVE, m.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    />
                  </div>
                ))}
                {markers.length === 0 && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 text-center text-xs font-medium text-white">
                    Arraste itens da legenda à direita para marcar pontos da imagem
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus className="mr-1.5 h-4 w-4" /> Trocar imagem
              </Button>
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

        {/* Right: legend palette */}
        <aside className="rounded-lg border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Legenda — arraste para a imagem
          </p>
          <ul className="space-y-1.5">
            {MARKERS.map((m) => (
              <li
                key={m.kind}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_NEW, m.kind);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="group flex cursor-grab items-start gap-2 rounded-md border border-transparent p-2 hover:border-border hover:bg-muted/40 active:cursor-grabbing"
              >
                <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                <div className="mt-0.5">
                  <MarkerShape kind={m.kind} number={0} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold leading-tight">{m.label}</div>
                  <div className="text-[11px] leading-snug text-muted-foreground">
                    {m.descricao}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Below: metadata fields */}
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
            onValueChange={(v) => onChange({ interfaceTipo: v as BlocoImagemT["interfaceTipo"] })}
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

      {/* Instructions list */}
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
            Arraste itens da legenda para a imagem e as instruções serão criadas
            automaticamente em ordem.
          </p>
        ) : (
          <ol className="space-y-2">
            {instrucoes.map((item, idx) => {
              const marker = markers.find((m) => m.id === item.id);
              return (
                <li key={item.id} className="flex items-start gap-2">
                  <div className="flex w-10 shrink-0 items-center justify-center pt-2">
                    {marker ? (
                      <MarkerShape kind={marker.kind} number={idx + 1} />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {ordinal(idx + 1)}
                      </span>
                    )}
                  </div>
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
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
