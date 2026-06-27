import type { Guia, Categoria } from "./faq-types";

export const CATEGORIAS: Categoria[] = [
  { id: "c1", nome: "Operacional", cor: "#2563eb" },
  { id: "c2", nome: "Financeiro", cor: "#16a34a" },
  { id: "c3", nome: "Administrativo", cor: "#7c3aed" },
  { id: "c4", nome: "Configuração", cor: "#ea580c" },
  { id: "c5", nome: "Cadastro", cor: "#db2777" },
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
            itens: [
              { id: "i-1", texto: "Acesse o menu Administrativo." },
              { id: "i-2", texto: "Clique em Estabelecimentos." },
              { id: "i-3", texto: "Clique em Novo." },
              { id: "i-4", texto: "Preencha os dados obrigatórios." },
            ],
          },
        ],
        filhos: [
          leaf("g1-1-1", "Criar estabelecimento", [CATEGORIAS[4]]),
          leaf("g1-1-2", "Editar estabelecimento", [CATEGORIAS[4]]),
          leaf("g1-1-3", "Excluir estabelecimento", [CATEGORIAS[4]]),
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
      {
        ...leaf("g2-1", "Tabela Simples"),
        filhos: [
          leaf("g2-1-1", "Criar tabela simples"),
          leaf("g2-1-2", "Configurar valores"),
          leaf("g2-1-3", "Aplicar tabela"),
        ],
      },
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
