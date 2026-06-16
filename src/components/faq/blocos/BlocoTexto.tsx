import { Textarea } from "@/components/ui/textarea";

export function BlocoTexto({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Digite aqui a explicação ou instrução deste FAQ..."
      className="min-h-[110px] resize-y border-border bg-transparent text-base leading-relaxed shadow-none focus-visible:ring-1"
    />
  );
}
