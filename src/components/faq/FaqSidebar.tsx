import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Folder,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useFaq, guiaMatchAnyCategoria } from "@/lib/faq-store";
import type { Guia } from "@/lib/faq-types";
import { MAX_DEPTH } from "@/lib/faq-types";
import { cn } from "@/lib/utils";
import { VincularCategoriaDialog } from "./VincularCategoriaDialog";
import { AdicionarCategoriaDialog } from "./AdicionarCategoriaDialog";
import { FiltroCategoriaDropdown } from "./FiltroCategoriaDropdown";
import { CategoriaDots } from "./CategoriaDots";

const LEVEL_LABEL = ["Tema", "Guia", "Assunto"] as const;
const CHILD_LABEL = ["Guia", "Assunto", ""] as const;

function levelIcon(depth: number, className?: string) {
  if (depth === 0) return <BookOpen className={cn("h-4 w-4 shrink-0 text-primary/80", className)} />;
  if (depth === 1) return <Folder className={cn("h-4 w-4 shrink-0 text-primary/70", className)} />;
  return <FileText className={cn("h-4 w-4 shrink-0 text-muted-foreground", className)} />;
}

function filterTreeByTerm(guias: Guia[], term: string): Guia[] {
  if (!term) return guias;
  const t = term.toLowerCase();
  const walk = (list: Guia[]): Guia[] => {
    const out: Guia[] = [];
    for (const g of list) {
      const filhos = walk(g.filhos);
      if (g.nome.toLowerCase().includes(t) || filhos.length > 0) {
        out.push({ ...g, filhos });
      }
    }
    return out;
  };
  return walk(guias);
}

function filterTreeByCategorias(guias: Guia[], cats: string[]): Guia[] {
  if (cats.length === 0) return guias;
  const walk = (list: Guia[]): Guia[] => {
    const out: Guia[] = [];
    for (const g of list) {
      if (!guiaMatchAnyCategoria(g, cats)) continue;
      out.push({ ...g, filhos: walk(g.filhos) });
    }
    return out;
  };
  return walk(guias);
}

function CategoriaChips({ guia }: { guia: Guia }) {
  if (guia.categorias.length === 0) {
    return <span className="text-xs italic text-muted-foreground">Sem categoria</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {guia.categorias.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
          style={{
            color: c.cor,
            borderColor: `${c.cor}55`,
            backgroundColor: `${c.cor}14`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.cor }} />
          {c.nome}
        </span>
      ))}
    </div>
  );
}

function TreeNode({
  guia,
  depth,
  forceOpen,
  onOpenCategoria,
}: {
  guia: Guia;
  depth: number;
  forceOpen: boolean;
  onOpenCategoria: (id: string) => void;
}) {
  const { selectedId, setSelectedId, addGuia, renameGuia, deleteGuia } = useFaq();
  const [open, setOpen] = useState(true);
  const isOpen = forceOpen || open;
  const hasChildren = guia.filhos.length > 0;
  const isActive = selectedId === guia.id;
  const canAddChild = depth < MAX_DEPTH;
  const levelLabel = LEVEL_LABEL[depth] ?? "";
  const childLabel = CHILD_LABEL[depth] ?? "";

  const handleAddChild = () => {
    const nome = window.prompt(`Nome do(a) novo(a) ${childLabel}`);
    if (nome) {
      addGuia(guia.id, nome);
      setOpen(true);
    }
  };

  return (
    <div>
      <Tooltip delayDuration={350}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "group relative flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-[var(--primary-soft)] text-primary font-medium"
                : "hover:bg-muted text-foreground/80",
            )}
            style={{ paddingLeft: depth * 14 + 6 }}
          >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-black/5",
                !hasChildren && "invisible",
              )}
              aria-label="Expandir"
            >
              <ChevronRight
                className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")}
              />
            </button>
            {levelIcon(depth)}
            <button
              type="button"
              onClick={() => setSelectedId(guia.id)}
              className="flex-1 truncate text-left"
              title={`${levelLabel}: ${guia.nome}`}
            >
              {guia.nome}
            </button>
            <CategoriaDots categorias={guia.categorias} />
            {isActive && (
              <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-primary" />
            )}
            {canAddChild && (
              <button
                type="button"
                onClick={handleAddChild}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-black/5 hover:text-primary group-hover:opacity-100"
                aria-label={`Adicionar ${childLabel}`}
                title={`Adicionar ${childLabel}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded opacity-0 hover:bg-black/5 group-hover:opacity-100 data-[state=open]:opacity-100"
                  aria-label="Ações"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    const nome = window.prompt(`Renomear ${levelLabel}`, guia.nome);
                    if (nome) renameGuia(guia.id, nome);
                  }}
                >
                  Renomear
                </DropdownMenuItem>
                {canAddChild && (
                  <DropdownMenuItem onClick={handleAddChild}>
                    <Plus className="mr-2 h-3.5 w-3.5" /> Nova(o) {childLabel}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onOpenCategoria(guia.id)}>
                  <Tag className="mr-2 h-3.5 w-3.5" /> Vincular categoria
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm(`Excluir "${guia.nome}"?`)) deleteGuia(guia.id);
                  }}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="max-w-[260px] bg-popover text-popover-foreground border">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {levelLabel}
            </p>
            <p className="text-xs font-medium">{guia.nome}</p>
            <div className="pt-1">
              <CategoriaChips guia={guia} />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
      {isOpen && hasChildren && (
        <div className="mt-0.5">
          {guia.filhos.map((f) => (
            <TreeNode
              key={f.id}
              guia={f}
              depth={depth + 1}
              forceOpen={forceOpen}
              onOpenCategoria={onOpenCategoria}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FaqSidebar() {
  const { guias, addGuia, categoriasFiltro } = useFaq();
  const [term, setTerm] = useState("");
  const [catGuiaId, setCatGuiaId] = useState<string | null>(null);
  const [addCatOpen, setAddCatOpen] = useState(false);

  const filtered = useMemo(() => {
    const byCat = filterTreeByCategorias(guias, categoriasFiltro);
    return filterTreeByTerm(byCat, term);
  }, [guias, term, categoriasFiltro]);

  const findGuia = (id: string): Guia | null => {
    const walk = (list: Guia[]): Guia | null => {
      for (const g of list) {
        if (g.id === id) return g;
        const f = walk(g.filhos);
        if (f) return f;
      }
      return null;
    };
    return walk(guias);
  };
  const currentCat = catGuiaId ? findGuia(catGuiaId) : null;
  const filtersActive = categoriasFiltro.length > 0;

  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-border bg-[var(--surface)] md:flex">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Guias do documento</h2>
          <p className="text-xs text-muted-foreground">FAQ Jump Tecnologia</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => {
                const nome = window.prompt("Nome do novo Tema");
                if (nome) addGuia(null, nome);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Novo Tema</TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-2 border-b border-border px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar guia..."
            className="h-8 rounded-md pl-8 text-xs"
          />
        </div>
        <FiltroCategoriaDropdown />
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-start text-xs"
          onClick={() => setAddCatOpen(true)}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar categoria
        </Button>
      </div>



      <div className="flex-1 overflow-y-auto px-2 py-3">
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs italic text-muted-foreground">
            {filtersActive
              ? "Nenhum item encontrado para os filtros selecionados."
              : "Nenhum tema encontrado."}
          </p>
        ) : (
          filtered.map((g) => (
            <TreeNode
              key={g.id}
              guia={g}
              depth={0}
              forceOpen={!!term || filtersActive}
              onOpenCategoria={setCatGuiaId}
            />
          ))
        )}
      </div>

      {currentCat && (
        <VincularCategoriaDialog
          open={!!catGuiaId}
          onOpenChange={(v) => !v && setCatGuiaId(null)}
          guiaId={currentCat.id}
          selecionadasIniciais={currentCat.categorias.map((c) => c.id)}
        />
      )}

      <AdicionarCategoriaDialog open={addCatOpen} onOpenChange={setAddCatOpen} />
    </aside>
  );
}
