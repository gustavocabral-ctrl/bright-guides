import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFaq } from "@/lib/faq-store";
import { CATEGORIA_CORES, CATEGORIA_COR_PADRAO } from "@/lib/faq-types";
import { cn } from "@/lib/utils";

export function AdicionarCategoriaDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const { addCategoria } = useFaq();
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState<string>(CATEGORIA_COR_PADRAO);

  const reset = () => {
    setNome("");
    setCor(CATEGORIA_COR_PADRAO);
  };

  const onChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const salvar = () => {
    const n = nome.trim();
    if (!n) return;
    const nova = addCategoria(n, cor);
    onCreated?.(nova.id);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Adicionar categoria</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nome da categoria</Label>
            <Input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Suporte técnico"
              onKeyDown={(e) => {
                if (e.key === "Enter") salvar();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Cor da categoria</Label>
            <div className="grid grid-cols-9 gap-2">
              {CATEGORIA_CORES.map((c) => {
                const selected = cor === c.valor;
                return (
                  <button
                    key={c.valor}
                    type="button"
                    aria-label={c.nome}
                    title={c.nome}
                    onClick={() => setCor(c.valor)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition",
                      selected
                        ? "border-foreground/70 scale-110"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: c.valor }}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={!nome.trim()}>
            Salvar categoria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
