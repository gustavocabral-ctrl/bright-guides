import { Quote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CONTEXTO_HEADER } from "@/lib/faq-types";

export function BlocoContexto({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-3 rounded-lg border-l-4 border-slate-400 bg-slate-50 p-4">
      <Quote className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
      <div className="flex-1 space-y-2">
        <p className="select-none text-sm italic font-normal text-slate-700">
          {CONTEXTO_HEADER}
        </p>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Descreva o contexto que orienta a resposta da IA..."
          className="mt-2 min-h-[80px] resize-y bg-white text-sm"
        />
      </div>
    </div>
  );
}
