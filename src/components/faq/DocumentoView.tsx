import { useState } from "react";
import { Plus, Save, Send, Trash2, X, FileText, Image as ImageIcon, Info, AlertCircle } from "lucide-react";
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
import { BlocoTexto } from "./blocos/BlocoTexto";
import { BlocoImagem } from "./blocos/BlocoImagem";
import { BlocoInstrucao } from "./blocos/BlocoInstrucao";
import { BlocoObservacao } from "./blocos/BlocoObservacao";
import { EmptyDocumento } from "./EmptyDocumento";

const nid = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function DocumentoView() {
  const { selected, updateBlocos, renameGuia } = useFaq();
  const [titleEditing, setTitleEditing] = useState(false);

  if (!selected) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Selecione uma guia no menu lateral.
      </div>
    );
  }

  const blocos = selected.blocos;

  const addBloco = (tipo: Bloco["tipo"]) => {
    const base = { id: nid() };
    const novo: Bloco =
      tipo === "imagem"
        ? { ...base, tipo: "imagem", nome: "", interfaceTipo: "Aplicativo", instrucoes: "" }
        : { ...base, tipo, conteudo: "" } as Bloco;
    updateBlocos(selected.id, [...blocos, novo]);
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

  const formatted = new Date(selected.updatedAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b border-border px-8 pb-6 pt-8">
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
            {selected.categorias.length > 0 ? (
              selected.categorias.map((c) => (
                <Badge key={c.id} variant="secondary" className="bg-[var(--primary-soft)] text-primary hover:bg-[var(--primary-soft)]">
                  {c.nome}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Sem categoria</Badge>
            )}
            <span className="text-muted-foreground/60">·</span>
            <span>Atualizado em {formatted}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>por {selected.updatedBy}</span>
          </div>
        </div>

        {/* Blocos */}
        <div className="space-y-4 px-8 py-8">
          {blocos.length === 0 ? (
            <EmptyDocumento onAdd={() => addBloco("texto")} />
          ) : (
            blocos.map((b) => (
              <div key={b.id} className="group relative">
                <button
                  type="button"
                  onClick={() => removeBloco(b.id)}
                  className="absolute -right-2 -top-2 z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-destructive group-hover:flex"
                  aria-label="Remover bloco"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {b.tipo === "texto" && (
                  <BlocoTexto value={b.conteudo} onChange={(v) => patchBloco(b.id, { conteudo: v })} />
                )}
                {b.tipo === "imagem" && (
                  <BlocoImagem bloco={b} onChange={(patch) => patchBloco(b.id, patch)} />
                )}
                {b.tipo === "instrucao" && (
                  <BlocoInstrucao value={b.conteudo} onChange={(v) => patchBloco(b.id, { conteudo: v })} />
                )}
                {b.tipo === "observacao" && (
                  <BlocoObservacao value={b.conteudo} onChange={(v) => patchBloco(b.id, { conteudo: v })} />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-8 py-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <X className="mr-1.5 h-4 w-4" /> Cancelar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-1.5 h-4 w-4" /> Adicionar bloco
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addBloco("texto")}>
                  <FileText className="mr-2 h-4 w-4" /> Texto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBloco("imagem")}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Imagem
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBloco("instrucao")}>
                  <Info className="mr-2 h-4 w-4" /> Instrução
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBloco("observacao")}>
                  <AlertCircle className="mr-2 h-4 w-4" /> Observação
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Send className="mr-1.5 h-4 w-4" /> Publicar FAQ
            </Button>
            <Button size="sm">
              <Save className="mr-1.5 h-4 w-4" /> Salvar alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
