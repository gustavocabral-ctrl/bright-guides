import type { Categoria, FaqNode } from "./faq-types";
import { makeNode } from "./faq-tree";

export const CATEGORIAS: Categoria[] = [
  { id: "c1", nome: "Operacional", cor: "#2563eb" },
  { id: "c2", nome: "Financeiro", cor: "#16a34a" },
  { id: "c3", nome: "Administrativo", cor: "#7c3aed" },
  { id: "c4", nome: "Configuração", cor: "#ea580c" },
  { id: "c5", nome: "Cadastro", cor: "#db2777" },
];

// Fixed seed timestamp to avoid SSR hydration mismatch
const today = "2026-06-16T20:59:00.000Z";

const assunto = (id: string, nome: string, categoriaIds: string[] = []) =>
  makeNode({ id, nome, tipo: "assunto", categoriaIds, updatedAt: today });

export const SEED_NODES: FaqNode[] = [
  {
    id: "g1",
    tipo: "tema",
    nome: "FAQ Operacional",
    categoriaIds: ["c1"],
    updatedAt: today,
    updatedBy: "Maria Silva",
    blocos: [
      {
        tipo: "texto",
        id: "b1",
        conteudo:
          "Bem-vindo ao FAQ Operacional. Aqui você encontra os principais procedimentos do sistema da Jump Tecnologia.",
      },
    ],
    filhos: [
      {
        id: "g1-1",
        tipo: "guia",
        nome: "Cadastro de Estabelecimento",
        categoriaIds: ["c5"],
        updatedAt: today,
        updatedBy: "João Souza",
        blocos: [
          {
            tipo: "texto",
            id: "b-cad-1",
            conteudo:
              "Para cadastrar um novo estabelecimento, acesse o menu Administrativo > Estabelecimentos e clique em Novo.",
          },
          {
            tipo: "instrucao",
            id: "b-cad-2",
            itens: [
              { id: "i-1", texto: "Acesse o menu Administrativo." },
              { id: "i-2", texto: "Clique em Estabelecimentos." },
              { id: "i-3", texto: "Clique em Novo." },
              { id: "i-4", texto: "Preencha os dados obrigatórios." },
            ],
          },
        ],
        filhos: [
          assunto("g1-1-1", "Criar estabelecimento", ["c5"]),
          assunto("g1-1-2", "Editar estabelecimento", ["c5"]),
          assunto("g1-1-3", "Excluir estabelecimento", ["c5"]),
        ],
      },
      makeNode({ id: "g1-2", nome: "Usuários", tipo: "guia", categoriaIds: ["c3"], updatedAt: today }),
      makeNode({ id: "g1-3", nome: "Pagamentos", tipo: "guia", categoriaIds: ["c2"], updatedAt: today }),
    ],
  },
  {
    id: "g2",
    tipo: "tema",
    nome: "Tabela de Estacionamento",
    categoriaIds: ["c4"],
    updatedAt: today,
    updatedBy: "Você",
    blocos: [],
    filhos: [
      {
        ...makeNode({ id: "g2-1", nome: "Tabela Simples", tipo: "guia", updatedAt: today }),
        filhos: [
          assunto("g2-1-1", "Criar tabela simples"),
          assunto("g2-1-2", "Configurar valores"),
          assunto("g2-1-3", "Aplicar tabela"),
        ],
      },
      makeNode({ id: "g2-2", nome: "Tabela Pernoite", tipo: "guia", updatedAt: today }),
      makeNode({ id: "g2-3", nome: "Tabela Especial", tipo: "guia", updatedAt: today }),
    ],
  },
  {
    id: "g3",
    tipo: "tema",
    nome: "Convênio Estacionamento",
    categoriaIds: ["c1"],
    updatedAt: today,
    updatedBy: "Você",
    blocos: [],
    filhos: [
      makeNode({ id: "g3-1", nome: "Criar Convênio", tipo: "guia", updatedAt: today }),
      makeNode({ id: "g3-2", nome: "Vincular Cliente", tipo: "guia", updatedAt: today }),
    ],
  },
];

/** Alias retrocompatível. */
export const SEED_GUIAS = SEED_NODES;
