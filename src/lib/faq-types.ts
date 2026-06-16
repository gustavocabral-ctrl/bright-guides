export type Categoria = { id: string; nome: string };

export type BlocoTexto = { tipo: "texto"; id: string; conteudo: string };
export type BlocoImagem = {
  tipo: "imagem";
  id: string;
  src?: string;
  nome: string;
  interfaceTipo: "Aplicativo" | "Site Administrativo";
  instrucoes: string;
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
