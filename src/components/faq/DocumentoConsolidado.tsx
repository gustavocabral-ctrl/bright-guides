import type { Guia } from "@/lib/faq-types";
import { nivelLabel } from "@/lib/faq-types";
import { DocumentoSalvo } from "./DocumentoSalvo";

function emptyMessage(depth: number) {
  if (depth === 0) return "Este tema ainda não possui guias ou assuntos cadastrados.";
  if (depth === 1) return "Esta guia ainda não possui assuntos cadastrados.";
  return "Nenhum conteúdo adicionado neste assunto ainda.";
}

function Nivel({ guia, depth }: { guia: Guia; depth: number }) {
  const HeaderTag = (depth === 0 ? "h1" : depth === 1 ? "h2" : "h3") as
    | "h1"
    | "h2"
    | "h3";
  const headerClass =
    depth === 0
      ? "text-2xl font-semibold tracking-tight"
      : depth === 1
        ? "mt-6 text-xl font-semibold tracking-tight"
        : "mt-5 text-lg font-semibold tracking-tight";

  const hasBlocos = guia.blocos.length > 0;
  const hasFilhos = guia.filhos.length > 0;

  return (
    <section className="space-y-3">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {nivelLabel(depth)}
        </p>
        <HeaderTag className={headerClass}>{guia.nome}</HeaderTag>
      </div>

      {hasBlocos ? (
        <DocumentoSalvo blocos={guia.blocos} />
      ) : !hasFilhos ? (
        <p className="text-sm italic text-muted-foreground">
          {emptyMessage(depth)}
        </p>
      ) : null}

      {hasFilhos && (
        <div className="space-y-6">
          {guia.filhos.map((f) => (
            <Nivel key={f.id} guia={f} depth={depth + 1} />
          ))}
        </div>
      )}
    </section>
  );
}

export function DocumentoConsolidado({
  guia,
  depth,
}: {
  guia: Guia;
  depth: number;
}) {
  return (
    <div className="space-y-6">
      <Nivel guia={guia} depth={depth} />
    </div>
  );
}
