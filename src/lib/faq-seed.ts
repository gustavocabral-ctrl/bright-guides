import type { Guia, Categoria } from "./faq-types";

export const CATEGORIAS: Categoria[] = [
  { id: "c1", nome: "Operacional" },
  { id: "c2", nome: "Financeiro" },
  { id: "c3", nome: "Administrativo" },
  { id: "c4", nome: "Configuração" },
  { id: "c5", nome: "Cadastro" },
];

// Fixed seed timestamp to avoid SSR hydration mismatch
const today = "2026-06-16T20:59:00.000Z";

const leaf = (id: string, nome: string, cats: Categoria[] = []): Guia => ({
  id,
  nome,
  categorias: cats,
  filhos: [],
  blocos: [],
  updatedAt: today,
  updatedBy: "Você",
});

export const SEED_GUIAS: Guia[] = [
  {
    id: "g1",
    nome: "FAQ Operacional",
    categorias: [CATEGORIAS[0]],
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
        ...leaf("g1-1", "Cadastro de Estabelecimento", [CATEGORIAS[4]]),
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
            conteudo: "Tenha em mãos o CNPJ, endereço completo e dados bancários antes de iniciar.",
          },
        ],
      },
      leaf("g1-2", "Usuários", [CATEGORIAS[2]]),
      leaf("g1-3", "Pagamentos", [CATEGORIAS[1]]),
    ],
  },
  {
    id: "g2",
    nome: "Tabela de Estacionamento",
    categorias: [CATEGORIAS[3]],
    updatedAt: today,
    updatedBy: "Você",
    blocos: [],
    filhos: [
      leaf("g2-1", "Tabela Simples"),
      leaf("g2-2", "Tabela Pernoite"),
      leaf("g2-3", "Tabela Especial"),
    ],
  },
  {
    id: "g3",
    nome: "Convênio Estacionamento",
    categorias: [CATEGORIAS[0]],
    updatedAt: today,
    updatedBy: "Você",
    blocos: [],
    filhos: [leaf("g3-1", "Criar Convênio"), leaf("g3-2", "Vincular Cliente")],
  },
];
