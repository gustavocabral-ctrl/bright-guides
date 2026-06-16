import { useState } from "react";
import { ChevronRight, FileText, Folder, MoreHorizontal, Plus, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFaq } from "@/lib/faq-store";
import type { Guia } from "@/lib/faq-types";
import { cn } from "@/lib/utils";

function TreeNode({ guia, depth }: { guia: Guia; depth: number }) {
  const { selectedId, setSelectedId, addGuia, renameGuia, deleteGuia } = useFaq();
  const [open, setOpen] = useState(true);
  const hasChildren = guia.filhos.length > 0;
  const isActive = selectedId === guia.id;

  return (
    <div>
      <div
        className={cn(
          "group relative flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-[var(--primary-soft)] text-primary font-medium"
            : "hover:bg-muted text-foreground/80",
        )}
        style={{ paddingLeft: depth * 12 + 6 }}
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
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")}
          />
        </button>
        {hasChildren ? (
          <Folder className="h-4 w-4 shrink-0 text-primary/70" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <button
          type="button"
          onClick={() => setSelectedId(guia.id)}
          className="flex-1 truncate text-left"
          title={guia.nome}
        >
          {guia.nome}
        </button>
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-primary" />
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
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                const nome = window.prompt("Novo nome da guia", guia.nome);
                if (nome) renameGuia(guia.id, nome);
              }}
            >
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const nome = window.prompt("Nome da subguia");
                if (nome) {
                  addGuia(guia.id, nome);
                  setOpen(true);
                }
              }}
            >
              Nova subguia
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Tag className="mr-2 h-3.5 w-3.5" /> Associar categoria
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
      {open && hasChildren && (
        <div className="mt-0.5">
          {guia.filhos.map((f) => (
            <TreeNode key={f.id} guia={f} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FaqSidebar() {
  const { guias, addGuia } = useFaq();

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
                const nome = window.prompt("Nome da nova guia principal");
                if (nome) addGuia(null, nome);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nova guia</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {guias.map((g) => (
          <TreeNode key={g.id} guia={g} depth={0} />
        ))}
      </div>
    </aside>
  );
}
