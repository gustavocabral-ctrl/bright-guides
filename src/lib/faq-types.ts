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
  /** position of top-left, relative (0..1) to image */
  x: number;
  y: number;
  /** size relative (0..1) to image */
  w: number;
  h: number;
  /** rotation in degrees */
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
  /** legacy / fallback free-form instructions */
  instrucoes: string;
  /** ordered visual markings placed on the image */
  markers?: Marker[];
  /** parallel array to markers (same index) */
  instrucoesItens?: InstrucaoItem[];
};
export type BlocoInstrucao = {
  tipo: "instrucao";
  id: string;
  /** new multi-item structure */
  itens?: InstrucaoItem[];
  /** legacy single-textarea field, kept for back-compat */
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

export type Guia = {
  id: string;
  nome: string;
  categorias: Categoria[];
  filhos: Guia[];
  blocos: Bloco[];
  updatedAt: string;
  updatedBy: string;
};

/** Fixed instruction header texts shown at the top of certain blocks. */
export const CONTEXTO_HEADER =
  "Contexto: Este parágrafo de contexto explica a situação que deve ser dada a resposta do bloco seguinte, mas ela não será dita ao usuário:";
export const OBSERVACAO_HEADER =
  "Observação: Esta observação é uma informação importante que deve ser levada em consideração ao usuário acompanhar a resposta ao usuário:";
export const INSTRUCAO_HEADER =
  "Instrução: Siga as etapas abaixo para orientar corretamente o usuário:";

/** Max hierarchy depth in the sidebar tree (root=0, child=1, grandchild=2). */
export const MAX_DEPTH = 2;
