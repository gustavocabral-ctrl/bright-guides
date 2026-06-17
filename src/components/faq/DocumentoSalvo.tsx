import { Info, AlertCircle } from "lucide-react";
import type { Bloco } from "@/lib/faq-types";
import { MARKER_BY_KIND, ordinal } from "@/lib/faq-markers";
import { MarkerShape } from "./blocos/BlocoImagem";

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
          const markers = b.markers ?? [];
          const instrucoes =
            b.instrucoesItens ??
            markers.map((m) => ({ id: m.id, texto: MARKER_BY_KIND[m.kind].sugestao({}) }));
          return (
            <figure key={b.id} className="my-2 flex flex-col items-center">
              {b.src ? (
                <div className="relative inline-block max-w-full">
                  <img
                    src={b.src}
                    alt={b.nome || "Imagem"}
                    className="block max-h-[480px] w-auto max-w-full rounded-md"
                  />
                  {markers.map((m, idx) => (
                    <div
                      key={m.id}
                      className="absolute"
                      style={{
                        left: `${m.x * 100}%`,
                        top: `${m.y * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <MarkerShape kind={m.kind} number={idx + 1} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-md bg-muted text-xs italic text-muted-foreground">
                  Imagem não carregada
                </div>
              )}
              <figcaption className="mt-3 w-full max-w-xl space-y-1 text-[13px] italic text-muted-foreground">
                {b.nome && <div>Imagem: {b.nome}</div>}
                {b.interfaceTipo && <div>Interface: {b.interfaceTipo}</div>}
                {(instrucoes.length > 0 || b.instrucoes) && (
                  <div className="mt-2 not-italic text-foreground">
                    {instrucoes.length > 0 ? (
                      <ol className="space-y-1">
                        {instrucoes.map((i, idx) => (
                          <li key={i.id} className="italic">
                            <span className="mr-1.5 font-semibold not-italic text-foreground">
                              {ordinal(idx + 1)}
                            </span>
                            {i.texto}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="italic">{b.instrucoes}</p>
                    )}
                  </div>
                )}
              </figcaption>
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
