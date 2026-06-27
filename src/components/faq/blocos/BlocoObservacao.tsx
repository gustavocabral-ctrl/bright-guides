import { AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { OBSERVACAO_HEADER } from "@/lib/faq-types";

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
      <div className="flex-1 space-y-2">
        <p className="select-none text-sm italic font-normal text-amber-900">
          {OBSERVACAO_HEADER}
        </p>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escreva a observação importante..."
          className="mt-2 min-h-[80px] resize-y bg-white text-sm"
        />
      </div>
    </div>
  );
}
