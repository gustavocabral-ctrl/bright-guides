import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyDocumento({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)] text-primary">
        <FileText className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        Nenhum conteúdo adicionado nesta guia ainda. Clique em "Adicionar bloco" para começar.
      </p>
      <Button onClick={onAdd} className="mt-5" size="sm">
        <Plus className="mr-1.5 h-4 w-4" /> Adicionar bloco
      </Button>
    </div>
  );
}
