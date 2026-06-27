import type { Categoria } from "@/lib/faq-types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CategoriaDots({ categorias }: { categorias: Categoria[] }) {
  if (!categorias || categorias.length === 0) return null;
  const visiveis = categorias.slice(0, 3);
  const extras = categorias.length - visiveis.length;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="inline-flex shrink-0 items-center gap-0.5">
          {visiveis.map((c) => (
            <span
              key={c.id}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: c.cor }}
            />
          ))}
          {extras > 0 && (
            <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">
              +{extras}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="bg-popover text-popover-foreground border"
      >
        <div className="space-y-1">
          {categorias.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c.cor }}
              />
              <span style={{ color: c.cor }}>{c.nome}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
