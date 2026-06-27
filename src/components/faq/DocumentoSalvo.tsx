import type { Bloco, BlocoInstrucao as BlocoInstrucaoT } from "@/lib/faq-types";
import {
  CONTEXTO_HEADER,
  INSTRUCAO_HEADER,
  OBSERVACAO_HEADER,
} from "@/lib/faq-types";
import { MARKER_BY_KIND, ordinal } from "@/lib/faq-markers";
import { ArrowSVG, RectShape } from "./blocos/BlocoImagem";
import { toEmbedSrc } from "./blocos/BlocoVideo";

function instrucaoItens(b: BlocoInstrucaoT) {
  if (b.itens && b.itens.length > 0) return b.itens;
  if (b.conteudo) {
    return b.conteudo
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((texto, i) => ({ id: `legacy-${i}`, texto }));
  }
  return [];
}

export function DocumentoSalvo({ blocos }: { blocos: Bloco[] }) {
  if (blocos.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        Este documento ainda não possui conteúdo publicado.
      </p>
    );
  }

  return (
    <article className="space-y-4 text-[15px] leading-relaxed text-foreground">
      {blocos.map((b) => {
        if (b.tipo === "texto") {
          return b.conteudo.split(/\n{2,}/).map((p, i) => (
            <p key={`${b.id}-${i}`} className="whitespace-pre-wrap">
              {p}
            </p>
          ));
        }

        if (b.tipo === "contexto") {
          return (
            <p key={b.id} className="whitespace-pre-wrap">
              <span className="font-medium">{CONTEXTO_HEADER}</span>{" "}
              {b.conteudo}
            </p>
          );
        }

        if (b.tipo === "observacao") {
          return (
            <p key={b.id} className="whitespace-pre-wrap">
              <span className="font-medium">{OBSERVACAO_HEADER}</span>{" "}
              {b.conteudo}
            </p>
          );
        }

        if (b.tipo === "instrucao") {
          const itens = instrucaoItens(b);
          return (
            <div key={b.id} className="space-y-1.5">
              <p className="font-medium">{INSTRUCAO_HEADER}</p>
              {itens.map((i, idx) => (
                <p key={i.id} className="whitespace-pre-wrap">
                  {ordinal(idx + 1)} {i.texto}
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
            <div key={b.id} className="space-y-2 py-2">
              {b.src ? (
                <div className="relative inline-block max-w-full">
                  <img
                    src={b.src}
                    alt={b.nome || "Imagem"}
                    className="block max-h-[480px] w-auto max-w-full rounded-md"
                  />
                  {markers.map((m, idx) => {
                    const meta = MARKER_BY_KIND[m.kind];
                    return (
                      <div
                        key={m.id}
                        className="absolute"
                        style={{
                          left: `${m.x * 100}%`,
                          top: `${m.y * 100}%`,
                          width: `${m.w * 100}%`,
                          height: `${m.h * 100}%`,
                          transform: `rotate(${m.rotation}deg)`,
                          transformOrigin: "center center",
                        }}
                      >
                        {meta.shape === "seta" ? (
                          <ArrowSVG color={meta.color} />
                        ) : (
                          <RectShape color={meta.color} />
                        )}
                        <div
                          className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow ring-2 ring-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          {idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <div className="text-[13px] italic text-muted-foreground">
                {b.nome && <div>Imagem: {b.nome}</div>}
                {b.interfaceTipo && <div>Interface: {b.interfaceTipo}</div>}
              </div>
              {instrucoes.length > 0 ? (
                <div className="space-y-1">
                  {instrucoes.map((i, idx) => (
                    <p key={i.id} className="text-[14px]">
                      {ordinal(idx + 1)} {i.texto}
                    </p>
                  ))}
                </div>
              ) : b.instrucoes ? (
                <p className="text-[14px] italic text-muted-foreground">{b.instrucoes}</p>
              ) : null}
            </div>
          );
        }

        if (b.tipo === "video") {
          const src = toEmbedSrc(b.url);
          return (
            <div key={b.id} className="space-y-2 py-2">
              {src ? (
                <div className="overflow-hidden rounded-md bg-black">
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: "16 / 9", maxHeight: 480 }}
                  >
                    <iframe
                      src={src}
                      title={b.titulo || "Vídeo"}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}
              <div className="text-[13px] italic text-muted-foreground">
                {b.titulo && <div className="not-italic font-medium text-foreground">{b.titulo}</div>}
                {b.descricao && <div>{b.descricao}</div>}
              </div>
            </div>
          );
        }

        return null;
      })}
    </article>
  );
}
