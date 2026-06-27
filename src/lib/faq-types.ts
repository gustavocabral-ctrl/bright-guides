export type Categoria = { id: string; nome: string; cor: string };

/** Paleta fixa de cores disponíveis para categorias. */
export const CATEGORIA_CORES = [
  { nome: "Azul", valor: "#2563eb" },
  { nome: "Verde", valor: "#16a34a" },
  { nome: "Roxo", valor: "#7c3aed" },
  { nome: "Amarelo", valor: "#eab308" },
  { nome: "Laranja", valor: "#ea580c" },
  { nome: "Vermelho", valor: "#dc2626" },
  { nome: "Rosa", valor: "#db2777" },
  { nome: "Cinza", valor: "#64748b" },
  { nome: "Marrom", valor: "#854d0e" },
] as const;

export const CATEGORIA_COR_PADRAO = "#64748b";

export type MarkerKind =
  | "clique"
  | "digitacao"
  | "filtro"
  | "dropdown"
  | "ativacao"
  | "relatorios"
  | "explicacao"
  | "naoEditavel";

export type Marker = {
  id: string;
  kind: MarkerKind;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
};

export type InstrucaoItem = { id: string; texto: string };

export type BlocoTexto = { tipo: "texto"; id: string; conteudo: string };
export type BlocoContexto = { tipo: "contexto"; id: string; conteudo: string };
export type BlocoImagem = {
  tipo: "imagem";
  id: string;
  src?: string;
  nome: string;
  interfaceTipo: "Aplicativo" | "Site Administrativo";
  instrucoes: string;
  markers?: Marker[];
  instrucoesItens?: InstrucaoItem[];
};
export type BlocoInstrucao = {
  tipo: "instrucao";
  id: string;
  itens?: InstrucaoItem[];
  conteudo?: string;
};
export type BlocoObservacao = { tipo: "observacao"; id: string; conteudo: string };
export type BlocoVideo = {
  tipo: "video";
  id: string;
  url: string;
  titulo: string;
  descricao: string;
};
export type Bloco =
  | BlocoTexto
  | BlocoContexto
  | BlocoImagem
  | BlocoInstrucao
  | BlocoObservacao
  | BlocoVideo;

/** Tipo hierárquico de um nó na árvore da FAQ. */
export type FaqNodeTipo = "tema" | "guia" | "assunto";

/**
 * Entidade principal da árvore da FAQ.
 * Representa Tema, Guia ou Assunto conforme `tipo`.
 * Categorias são guardadas como IDs; a lista oficial vive no store.
 */
export type FaqNode = {
  id: string;
  tipo: FaqNodeTipo;
  nome: string;
  categoriaIds: string[];
  filhos: FaqNode[];
  blocos: Bloco[];
  updatedAt: string;
  updatedBy: string;
};

/** Alias retrocompatível — código antigo pode continuar referenciando `Guia`. */
export type Guia = FaqNode;

export const CONTEXTO_HEADER =
  "Contexto: Este parágrafo de contexto explica a situação que deve ser dada a resposta do bloco seguinte, mas ela não será dita ao usuário:";
export const OBSERVACAO_HEADER =
  "Observação: Esta observação é uma informação importante que deve ser levada em consideração ao usuário acompanhar a resposta ao usuário:";
export const INSTRUCAO_HEADER =
  "Instrução: Siga as etapas abaixo para orientar corretamente o usuário:";

/** Max hierarchy depth in the sidebar tree (root=0, child=1, grandchild=2). */
export const MAX_DEPTH = 2;

export const NIVEL_LABEL = ["Tema", "Guia", "Assunto"] as const;
export function nivelLabel(depth: number): string {
  return NIVEL_LABEL[depth] ?? "Item";
}

export const TIPO_POR_NIVEL: Record<number, FaqNodeTipo> = {
  0: "tema",
  1: "guia",
  2: "assunto",
};
export function tipoForDepth(depth: number): FaqNodeTipo {
  return TIPO_POR_NIVEL[depth] ?? "assunto";
}

export const BLOCOS_POR_NIVEL: Record<number, Array<Bloco["tipo"]>> = {
  0: ["texto", "contexto", "observacao"],
  1: ["texto", "contexto", "observacao"],
  2: ["texto", "contexto", "imagem", "video", "instrucao", "observacao"],
};

export function blocosPermitidos(depth: number): Array<Bloco["tipo"]> {
  return BLOCOS_POR_NIVEL[depth] ?? BLOCOS_POR_NIVEL[2];
}
