import { Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function BlocoInstrucao({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-3 rounded-lg border-l-4 border-primary bg-[var(--primary-soft)]/50 p-4">
      <Info className="mt-1 h-4 w-4 shrink-0 text-primary" />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Instrução passo a passo..."
        className="min-h-[70px] resize-y border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
