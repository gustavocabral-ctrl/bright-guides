import { Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INSTRUCAO_HEADER, type BlocoInstrucao as BlocoInstrucaoT, type InstrucaoItem } from "@/lib/faq-types";
import { ordinal } from "@/lib/faq-markers";

const nid = () => `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function deriveItens(bloco: BlocoInstrucaoT): InstrucaoItem[] {
  if (bloco.itens) return bloco.itens;
  if (bloco.conteudo) {
    return bloco.conteudo
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((texto) => ({ id: nid(), texto }));
  }
  return [];
}

export function BlocoInstrucao({
  bloco,
  onChange,
}: {
  bloco: BlocoInstrucaoT;
  onChange: (patch: Partial<BlocoInstrucaoT>) => void;
}) {
  const itens = deriveItens(bloco);

  const update = (next: InstrucaoItem[]) => onChange({ itens: next, conteudo: undefined });

  const add = () => update([...itens, { id: nid(), texto: "" }]);
  const remove = (id: string) => update(itens.filter((i) => i.id !== id));
  const edit = (id: string, texto: string) =>
    update(itens.map((i) => (i.id === id ? { ...i, texto } : i)));

  return (
    <div className="rounded-lg border-l-4 border-primary bg-[var(--primary-soft)]/50 p-4">
      <div className="flex items-start gap-3">
        <Info className="mt-1 h-4 w-4 shrink-0 text-primary" />
        <div className="flex-1 space-y-3">
          <p className="select-none text-xs font-medium text-primary">
            {INSTRUCAO_HEADER}
          </p>

          {itens.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-card px-3 py-3 text-center text-xs italic text-muted-foreground">
              Nenhuma instrução adicionada ainda.
            </p>
          ) : (
            <ol className="space-y-2">
              {itens.map((item, idx) => (
                <li key={item.id} className="flex items-start gap-2">
                  <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-primary px-2 text-[11px] font-bold text-primary-foreground">
                    {ordinal(idx + 1)}
                  </div>
                  <Input
                    value={item.texto}
                    onChange={(e) => edit(item.id, e.target.value)}
                    placeholder={`Descreva a etapa ${idx + 1}...`}
                    className="flex-1 bg-card"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(item.id)}
                    aria-label="Remover instrução"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ol>
          )}

          <Button type="button" variant="outline" size="sm" onClick={add}>
            <Plus className="mr-1.5 h-4 w-4" /> Adicionar instrução
          </Button>
        </div>
      </div>
    </div>
  );
}
