export type Categoria = { id: string; nome: string };

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
  x: number; // 0..1 relative to image
  y: number; // 0..1 relative to image
};

export type InstrucaoItem = { id: string; texto: string };

export type BlocoTexto = { tipo: "texto"; id: string; conteudo: string };
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
export type BlocoInstrucao = { tipo: "instrucao"; id: string; conteudo: string };
export type BlocoObservacao = { tipo: "observacao"; id: string; conteudo: string };
export type Bloco = BlocoTexto | BlocoImagem | BlocoInstrucao | BlocoObservacao;

export type Guia = {
  id: string;
  nome: string;
  categorias: Categoria[];
  filhos: Guia[];
  blocos: Bloco[];
  updatedAt: string;
  updatedBy: string;
};
