import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function BlocoObservacao({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
      <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-amber-600" />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Observação importante..."
        className="min-h-[70px] resize-y border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
