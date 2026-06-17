import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFaq } from "@/lib/faq-store";

export function VincularCategoriaDialog({
  open,
  onOpenChange,
  guiaId,
  selecionadasIniciais,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  guiaId: string;
  selecionadasIniciais: string[];
}) {
  const { categorias, addCategoria, setGuiaCategorias } = useFaq();
  const [busca, setBusca] = useState("");
  const [selecionadas, setSelecionadas] = useState<Set<string>>(
    () => new Set(selecionadasIniciais),
  );
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  // Sync when reopening
  const onOpenChangeWrapped = (v: boolean) => {
    if (v) {
      setSelecionadas(new Set(selecionadasIniciais));
      setBusca("");
      setCriando(false);
      setNovoNome("");
    }
    onOpenChange(v);
  };

  const lista = useMemo(
    () =>
      categorias.filter((c) =>
        c.nome.toLowerCase().includes(busca.trim().toLowerCase()),
      ),
    [categorias, busca],
  );

  const toggle = (id: string) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSalvarNova = () => {
    const nome = novoNome.trim();
    if (!nome) return;
    const nova = addCategoria(nome);
    setSelecionadas((prev) => new Set(prev).add(nova.id));
    setCriando(false);
    setNovoNome("");
  };

  const handleVincular = () => {
    const cats = categorias.filter((c) => selecionadas.has(c.id));
    setGuiaCategorias(guiaId, cats);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrapped}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Vincular categoria</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar categoria..."
              className="pl-9"
            />
          </div>

          <div className="max-h-[260px] space-y-1 overflow-y-auto rounded-lg border border-border bg-muted/20 p-1">
            {lista.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nenhuma categoria encontrada.
              </p>
            ) : (
              lista.map((c) => {
                const checked = selecionadas.has(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-background"
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggle(c.id)} />
                    <span className="flex-1">{c.nome}</span>
                  </label>
                );
              })
            )}
          </div>

          {criando ? (
            <div className="space-y-2 rounded-lg border border-dashed border-primary/40 bg-[var(--primary-soft)]/40 p-3">
              <label className="text-xs font-medium">Nome da categoria</label>
              <Input
                autoFocus
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Suporte técnico"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSalvarNova();
                }}
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCriando(false);
                    setNovoNome("");
                  }}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" /> Cancelar
                </Button>
                <Button size="sm" onClick={handleSalvarNova} disabled={!novoNome.trim()}>
                  Salvar categoria
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center border-dashed"
              onClick={() => setCriando(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Incluir categoria
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleVincular}>Vincular categorias</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
