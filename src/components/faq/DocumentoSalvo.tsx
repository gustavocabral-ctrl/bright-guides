import { Info, AlertCircle } from "lucide-react";
import type { Bloco } from "@/lib/faq-types";

export function DocumentoSalvo({ blocos }: { blocos: Bloco[] }) {
  if (blocos.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        Este documento ainda não possui conteúdo publicado.
      </p>
    );
  }

  return (
    <article className="prose-faq space-y-6 text-[15px] leading-relaxed text-foreground">
      {blocos.map((b) => {
        if (b.tipo === "texto") {
          return (
            <div key={b.id} className="space-y-4">
              {b.conteudo.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {p}
                </p>
              ))}
            </div>
          );
        }
        if (b.tipo === "imagem") {
          return (
            <figure key={b.id} className="my-2 flex flex-col items-center">
              {b.src ? (
                <img
                  src={b.src}
                  alt={b.nome || "Imagem"}
                  className="max-h-[480px] w-auto max-w-full rounded-md"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-md bg-muted text-xs italic text-muted-foreground">
                  Imagem não carregada
                </div>
              )}
              {(b.nome || b.interfaceTipo || b.instrucoes) && (
                <figcaption className="mt-3 space-y-0.5 text-center text-xs italic text-muted-foreground">
                  {b.nome && <div>{b.nome}</div>}
                  {b.interfaceTipo && <div>Interface: {b.interfaceTipo}</div>}
                  {b.instrucoes && <div>Instrução: {b.instrucoes}</div>}
                </figcaption>
              )}
            </figure>
          );
        }
        if (b.tipo === "instrucao") {
          return (
            <p key={b.id} className="flex gap-2 text-[15px] leading-relaxed">
              <Info className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <span className="whitespace-pre-wrap">{b.conteudo}</span>
            </p>
          );
        }
        return (
          <p key={b.id} className="flex gap-2 text-[15px] leading-relaxed text-amber-900">
            <AlertCircle className="mt-1 h-4 w-4 shrink-0 text-amber-600" />
            <span className="whitespace-pre-wrap">{b.conteudo}</span>
          </p>
        );
      })}
    </article>
  );
}
