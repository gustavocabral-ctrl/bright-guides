import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Save,
  Send,
  Trash2,
  X,
  FileText,
  Image as ImageIcon,
  Info,
  AlertCircle,
  Pencil,
  Tag,
  Quote,
  Video as VideoIcon,
  ArrowUp,
  ArrowDown,
  Loader2,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFaq } from "@/lib/faq-store";
import type { Bloco } from "@/lib/faq-types";
import { blocosPermitidos, nivelLabel } from "@/lib/faq-types";
import { BlocoTexto } from "./blocos/BlocoTexto";
import { BlocoContexto } from "./blocos/BlocoContexto";
import { BlocoImagem } from "./blocos/BlocoImagem";
import { BlocoInstrucao } from "./blocos/BlocoInstrucao";
import { BlocoObservacao } from "./blocos/BlocoObservacao";
import { BlocoVideo } from "./blocos/BlocoVideo";
import { EmptyDocumento } from "./EmptyDocumento";
import { DocumentoSalvo } from "./DocumentoSalvo";
import { DocumentoConsolidado } from "./DocumentoConsolidado";
import { SearchScrollMarkers } from "./SearchScrollMarkers";
import { useSearchHighlight } from "@/hooks/useSearchHighlight";
import { VincularCategoriaDialog } from "./VincularCategoriaDialog";

const nid = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const BLOCO_META: Record<
  Bloco["tipo"],
  { label: string; icon: typeof FileText }
> = {
  texto: { label: "Texto", icon: FileText },
  contexto: { label: "Contexto", icon: Quote },
  imagem: { label: "Imagem", icon: ImageIcon },
  video: { label: "Vídeo", icon: VideoIcon },
  instrucao: { label: "Instrução", icon: Info },
  observacao: { label: "Observação", icon: AlertCircle },
};

export function DocumentoView() {
  const {
    selected,
    updateBlocos,
    moveBloco,
    renameGuia,
    depthOf,
    search,
    searchIndex,
    setSearchTotal,
    resolveCategorias,
  } = useFaq();
  const [titleEditing, setTitleEditing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const readRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Deterministic loading/error states for visual regression / debugging.
  // Pin via URL params: ?saveState=loading | ?saveState=error
  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search).get("saveState");
    if (s === "loading") {
      setSaving(true);
      setSaveError(null);
    } else if (s === "error") {
      setSaving(false);
      setSaveError("Não foi possível salvar. Verifique sua conexão e tente novamente.");
    }
  }, [selected?.id]);

  useEffect(() => {
    setEditing(false);
  }, [selected?.id]);

  const nivel = selected ? depthOf(selected.id) : 2;
  const selectedCategorias = selected ? resolveCategorias(selected) : [];
  const tiposPermitidos = useMemo(() => blocosPermitidos(nivel), [nivel]);

  // Re-run highlight whenever selection, edit mode, or search/index change.
  const contentKey = useMemo(
    () => ({ id: selected?.id, editing, nivel }),
    [selected?.id, editing, nivel],
  );
  useSearchHighlight(readRef, search, searchIndex, setSearchTotal, contentKey);

  if (!selected) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Selecione uma guia no menu lateral.
      </div>
    );
  }

  const blocos = selected.blocos;
  const isEmpty = blocos.length === 0;

  const addBloco = (tipo: Bloco["tipo"]) => {
    if (!tiposPermitidos.includes(tipo)) return;
    const id = nid();
    let novo: Bloco;
    switch (tipo) {
      case "imagem":
        novo = { tipo: "imagem", id, nome: "", interfaceTipo: "Aplicativo", instrucoes: "" };
        break;
      case "instrucao":
        novo = { tipo: "instrucao", id, itens: [] };
        break;
      case "video":
        novo = { tipo: "video", id, url: "", titulo: "", descricao: "" };
        break;
      case "texto":
      case "contexto":
      case "observacao":
        novo = { tipo, id, conteudo: "" };
        break;
    }
    updateBlocos(selected.id, [...blocos, novo!]);
    setEditing(true);
  };

  const patchBloco = (id: string, patch: Partial<Bloco>) => {
    updateBlocos(
      selected.id,
      blocos.map((b) => (b.id === id ? ({ ...b, ...patch } as Bloco) : b)),
    );
  };

  const removeBloco = (id: string) => {
    updateBlocos(selected.id, blocos.filter((b) => b.id !== id));
  };

  const handleSave = async () => {
    if (isEmpty || saving) return;
    setSaveError(null);
    setSaving(true);
    try {
      // Persistência é local; simulamos latência mínima para permitir feedback
      // consistente e reproduzir o estado de "salvando" no editor.
      await new Promise((r) => setTimeout(r, 600));
      setSaving(false);
      setEditing(false);
    } catch (err) {
      setSaving(false);
      setSaveError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar. Tente novamente.",
      );
    }
  };

  const formatted = mounted
    ? new Date(selected.updatedAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b border-border px-8 pb-6 pt-8">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary/80">
            {nivelLabel(nivel)}
          </p>
          {titleEditing ? (
            <input
              autoFocus
              defaultValue={selected.nome}
              onBlur={(e) => {
                setTitleEditing(false);
                const v = e.target.value.trim();
                if (v && v !== selected.nome) renameGuia(selected.id, v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="w-full border-b border-primary/40 bg-transparent text-3xl font-semibold tracking-tight outline-none"
            />
          ) : (
            <h1
              onClick={() => setTitleEditing(true)}
              className="cursor-text text-3xl font-semibold tracking-tight"
              title="Clique para editar"
            >
              {selected.nome}
            </h1>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {selectedCategorias.length > 0 ? (
              selectedCategorias.map((c) => (
                <Badge
                  key={c.id}
                  variant="secondary"
                  className="border"
                  style={{
                    color: c.cor,
                    borderColor: `${c.cor}55`,
                    backgroundColor: `${c.cor}14`,
                  }}
                >
                  <span
                    className="mr-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: c.cor }}
                  />
                  {c.nome}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Sem categoria</Badge>
            )}
            <button
              type="button"
              onClick={() => setCatDialogOpen(true)}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-primary hover:bg-[var(--primary-soft)]"
            >
              <Tag className="h-3 w-3" /> Vincular categoria
            </button>
            <span className="text-muted-foreground/60">·</span>
            <span suppressHydrationWarning>Atualizado em {formatted}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>por {selected.updatedBy}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {editing || isEmpty ? (
            <div className="space-y-4">
              {isEmpty ? (
                <EmptyDocumento onAdd={() => addBloco(tiposPermitidos[0])} />
              ) : (
                blocos.map((b, idx) => (
                  <div key={b.id} className="group relative">
                    <div className="absolute -right-2 -top-2 z-10 hidden items-center gap-1 group-hover:flex">
                      <button
                        type="button"
                        onClick={() => moveBloco(selected.id, idx, idx - 1)}
                        disabled={idx === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-primary disabled:opacity-40"
                        aria-label="Mover para cima"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBloco(selected.id, idx, idx + 1)}
                        disabled={idx === blocos.length - 1}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-primary disabled:opacity-40"
                        aria-label="Mover para baixo"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBloco(b.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-destructive"
                        aria-label="Remover bloco"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {b.tipo === "texto" && (
                      <BlocoTexto
                        value={b.conteudo}
                        onChange={(v) => patchBloco(b.id, { conteudo: v })}
                      />
                    )}
                    {b.tipo === "contexto" && (
                      <BlocoContexto
                        value={b.conteudo}
                        onChange={(v) => patchBloco(b.id, { conteudo: v })}
                      />
                    )}
                    {b.tipo === "imagem" && (
                      <BlocoImagem bloco={b} onChange={(patch) => patchBloco(b.id, patch)} />
                    )}
                    {b.tipo === "video" && (
                      <BlocoVideo bloco={b} onChange={(patch) => patchBloco(b.id, patch)} />
                    )}
                    {b.tipo === "instrucao" && (
                      <BlocoInstrucao
                        bloco={b}
                        onChange={(patch) => patchBloco(b.id, patch)}
                      />
                    )}
                    {b.tipo === "observacao" && (
                      <BlocoObservacao
                        value={b.conteudo}
                        onChange={(v) => patchBloco(b.id, { conteudo: v })}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div ref={readRef} className="relative pr-6">
              <SearchScrollMarkers contentRef={readRef} />
              {nivel < 2 ? (
                <DocumentoConsolidado guia={selected} depth={nivel} />
              ) : (
                <DocumentoSalvo blocos={blocos} />
              )}
            </div>
          )}
        </div>

        {/* Save error banner */}
        {saveError && (editing || isEmpty) && (
          <div
            role="alert"
            aria-live="polite"
            data-testid="save-error-banner"
            className="mx-8 mt-4 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Erro ao salvar</p>
              <p className="text-destructive/80">{saveError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saving || isEmpty}
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <RotateCw className="mr-1.5 h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-8 py-4">
          <div className="flex gap-2">
            {editing || isEmpty ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => !isEmpty && setEditing(false)}
                  disabled={isEmpty || saving}
                >
                  <X className="mr-1.5 h-4 w-4" /> Cancelar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={saving}>
                      <Plus className="mr-1.5 h-4 w-4" /> Adicionar bloco
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {tiposPermitidos.map((t) => {
                      const meta = BLOCO_META[t];
                      const Icon = meta.icon;
                      return (
                        <DropdownMenuItem key={t} onClick={() => addBloco(t)}>
                          <Icon className="mr-2 h-4 w-4" /> {meta.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="mr-1.5 h-4 w-4" /> Editar documento
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={saving}>
              <Send className="mr-1.5 h-4 w-4" /> Publicar FAQ
            </Button>
            {(editing || isEmpty) && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isEmpty || saving}
                data-testid="save-button"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-4 w-4" /> Salvar alterações
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <VincularCategoriaDialog
        open={catDialogOpen}
        onOpenChange={setCatDialogOpen}
        guiaId={selected.id}
        selecionadasIniciais={selected.categoriaIds}
      />
    </div>
  );
}
