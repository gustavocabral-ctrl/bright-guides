import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useFaq } from "@/lib/faq-store";
import { cn } from "@/lib/utils";

export function FiltroCategoriaDropdown() {
  const {
    categorias,
    categoriasFiltro,
    toggleCategoriaFiltro,
    clearCategoriasFiltro,
  } = useFaq();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const n = categoriasFiltro.length;
  const label =
    n === 0
      ? "Filtrar por categoria"
      : n === 1
        ? "1 categoria selecionada"
        : `${n} categorias selecionadas`;

  const filtered = categorias.filter((c) =>
    c.nome.toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2.5 text-xs",
            "hover:bg-muted/60",
            n > 0 && "border-primary/40 text-primary",
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar categoria..."
            className="h-8 rounded-md pl-7 text-xs"
          />
        </div>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {categorias.length === 0 ? (
            <p className="px-1 py-2 text-[11px] italic text-muted-foreground">
              Nenhuma categoria cadastrada.
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-1 py-2 text-[11px] italic text-muted-foreground">
              Nenhuma categoria corresponde.
            </p>
          ) : (
            filtered.map((c) => {
              const checked = categoriasFiltro.includes(c.id);
              return (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-muted"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleCategoriaFiltro(c.id)}
                  />
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.cor }}
                  />
                  <span className="truncate">{c.nome}</span>
                </label>
              );
            })
          )}
        </div>
        {n > 0 && (
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="text-[11px] text-muted-foreground">
              {n} selecionada{n > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={clearCategoriasFiltro}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <X className="h-3 w-3" /> Limpar categorias
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
