import type { MarkerKind } from "./faq-types";

export type MarkerMeta = {
  kind: MarkerKind;
  label: string;
  descricao: string;
  shape: "seta" | "quadrado" | "retangulo";
  /** Tailwind/text color classes */
  color: string; // hex (used for inline styles + ring)
  sugestao: (ctx: { nome?: string; interfaceTipo?: string }) => string;
};

export const MARKERS: MarkerMeta[] = [
  {
    kind: "clique",
    label: "Seta vermelha — Clique / Seleção",
    descricao: "Ação de clique para selecionar itens ou executar ações.",
    shape: "seta",
    color: "#dc2626",
    sugestao: () => "Clique no botão indicado para continuar.",
  },
  {
    kind: "digitacao",
    label: "Seta roxa — Digitação",
    descricao: "Inserção manual de dados.",
    shape: "seta",
    color: "#7c3aed",
    sugestao: () => "Digite as informações solicitadas no campo indicado.",
  },
  {
    kind: "filtro",
    label: "Seta verde — Filtro / Pesquisa",
    descricao: "Aplicação de filtros e busca de informações.",
    shape: "seta",
    color: "#16a34a",
    sugestao: () => "Utilize este campo para pesquisar ou filtrar as informações.",
  },
  {
    kind: "dropdown",
    label: "Seta azul — Dropdown",
    descricao: "Seleção de opções em listas suspensas.",
    shape: "seta",
    color: "#2563eb",
    sugestao: () => "Selecione a opção desejada na lista suspensa.",
  },
  {
    kind: "ativacao",
    label: "Seta amarela — Ativação / Desativação",
    descricao: "Habilitação ou desabilitação de funcionalidades.",
    shape: "seta",
    color: "#eab308",
    sugestao: () => "Ative ou desative esta opção conforme a necessidade.",
  },
  {
    kind: "relatorios",
    label: "Quadrado marrom — Relatórios / Resultados",
    descricao: "Exibição de relatórios, dados consolidados e resultados.",
    shape: "quadrado",
    color: "#854d0e",
    sugestao: () => "Confira nesta área os resultados ou dados consolidados.",
  },
  {
    kind: "explicacao",
    label: "Quadrado laranja — Explicação / Sugestões",
    descricao: "Exibição de explicações, orientações e sugestões de escolha no sistema.",
    shape: "quadrado",
    color: "#ea580c",
    sugestao: () => "Observe esta informação para entender melhor a escolha recomendada.",
  },
  {
    kind: "naoEditavel",
    label: "Retângulo rosa — Informações não editáveis",
    descricao:
      "Identificação de cliente, status e detalhes do sistema que não podem ser editados. Apenas consulta.",
    shape: "retangulo",
    color: "#db2777",
    sugestao: () => "Esta informação é apenas para consulta e não pode ser editada.",
  },
];

export const MARKER_BY_KIND: Record<MarkerKind, MarkerMeta> = MARKERS.reduce(
  (acc, m) => {
    acc[m.kind] = m;
    return acc;
  },
  {} as Record<MarkerKind, MarkerMeta>,
);

export function ordinal(n: number): string {
  return `${n}º`;
}
