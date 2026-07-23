/**
 * Mock data para a tela de Estatísticas do Chat FAQ.
 *
 * Este arquivo isola todos os dados simulados que alimentam os componentes de
 * apresentação. Quando o backend estiver disponível, basta substituir estas
 * funções por chamadas reais (Supabase, API, etc.) preservando os tipos.
 */

export type PeriodoStats = "hoje" | "7d" | "30d" | "custom";

export type KpiCard = {
  id: string;
  titulo: string;
  valor: string;
  variacao: number; // % vs. período anterior (positivo = melhora)
  descricao: string;
};

export type AvaliacaoDonut = {
  positivo: number;
  negativo: number;
  semAvaliacao: number;
};

export type MotivoNegativo = {
  motivo: string;
  quantidade: number;
  percentual: number;
};

export type AssuntoLinha = {
  assunto: string;
  conversas: number;
  positivos: number;
  negativos: number;
  semAvaliacao: number;
  resolucao: number; // 0-100
  encaminhamento: number; // 0-100
  cobertura: "completa" | "parcial" | "indireta" | "sem-base";
};

export type CoberturaLinha = {
  classificacao:
    | "Completa"
    | "Parcial"
    | "Indireta"
    | "Sem base"
    | "Conflitante"
    | "Desatualizada"
    | "Não sustentada";
  quantidade: number;
  percentual: number;
  cor: string;
  acao: string;
};

export type ResolucaoFatia = {
  tipo: "Resolvida pela IA" | "Encaminhada" | "Não resolvida" | "Abandonada";
  valor: number;
  cor: string;
};

export type EvolucaoPonto = {
  data: string;
  positivo: number;
  negativo: number;
  resolucao: number;
};

export type DocumentoTopLinha = {
  titulo: string;
  guia: string;
  subguia: string;
  utilizacoes: number;
  positivos: number;
  negativos: number;
  taxaNegativa: number;
  ultimaAtualizacao: string;
  status: "Publicado" | "Rascunho" | "Desatualizado";
};

export const KPIS: KpiCard[] = [
  {
    id: "conversas",
    titulo: "Total de conversas",
    valor: "1.284",
    variacao: 12.4,
    descricao: "Conversas iniciadas no período",
  },
  {
    id: "respostas",
    titulo: "Respostas da IA",
    valor: "4.921",
    variacao: 8.7,
    descricao: "Mensagens enviadas pela IA",
  },
  {
    id: "avaliacao",
    titulo: "Taxa de avaliação",
    valor: "38%",
    variacao: 3.2,
    descricao: "Respostas avaliadas com joinha",
  },
  {
    id: "positivo",
    titulo: "Joinha positivo",
    valor: "72%",
    variacao: 4.5,
    descricao: "Sobre respostas avaliadas",
  },
  {
    id: "negativo",
    titulo: "Joinha negativo",
    valor: "28%",
    variacao: -4.5,
    descricao: "Sobre respostas avaliadas",
  },
  {
    id: "resolucao",
    titulo: "Resolução pela IA",
    valor: "64%",
    variacao: 2.1,
    descricao: "Conversas encerradas sem humano",
  },
  {
    id: "encaminhamento",
    titulo: "Encaminhadas p/ humano",
    valor: "22%",
    variacao: -1.3,
    descricao: "Conversas enviadas a uma pessoa",
  },
  {
    id: "tempo",
    titulo: "Tempo médio de resposta",
    valor: "3,4s",
    variacao: -6.8,
    descricao: "Média · mediana 2,9s · P95 7,1s",
  },
];

export const AVALIACAO: AvaliacaoDonut = {
  positivo: 1348,
  negativo: 524,
  semAvaliacao: 3049,
};

export const MOTIVOS_NEGATIVOS: MotivoNegativo[] = [
  { motivo: "Não respondeu à minha pergunta", quantidade: 142, percentual: 27.1 },
  { motivo: "Resposta incorreta", quantidade: 98, percentual: 18.7 },
  { motivo: "Resposta incompleta", quantidade: 84, percentual: 16.0 },
  { motivo: "Informação desatualizada", quantidade: 61, percentual: 11.6 },
  { motivo: "A IA não entendeu minha dúvida", quantidade: 55, percentual: 10.5 },
  { motivo: "Resposta confusa", quantidade: 38, percentual: 7.2 },
  { motivo: "Procedimento não funcionou", quantidade: 26, percentual: 5.0 },
  { motivo: "Resposta muito genérica", quantidade: 20, percentual: 3.9 },
];

export const ASSUNTOS_FREQUENTES: AssuntoLinha[] = [
  {
    assunto: "Erro de máquina",
    conversas: 128,
    positivos: 62,
    negativos: 46,
    semAvaliacao: 20,
    resolucao: 48,
    encaminhamento: 32,
    cobertura: "parcial",
  },
  {
    assunto: "Emissão de nota fiscal",
    conversas: 104,
    positivos: 71,
    negativos: 12,
    semAvaliacao: 21,
    resolucao: 74,
    encaminhamento: 14,
    cobertura: "completa",
  },
  {
    assunto: "Segunda via de boleto",
    conversas: 92,
    positivos: 68,
    negativos: 9,
    semAvaliacao: 15,
    resolucao: 81,
    encaminhamento: 10,
    cobertura: "completa",
  },
  {
    assunto: "Acesso ou login",
    conversas: 87,
    positivos: 52,
    negativos: 21,
    semAvaliacao: 14,
    resolucao: 62,
    encaminhamento: 22,
    cobertura: "parcial",
  },
  {
    assunto: "Integração com ERP",
    conversas: 61,
    positivos: 22,
    negativos: 27,
    semAvaliacao: 12,
    resolucao: 34,
    encaminhamento: 48,
    cobertura: "sem-base",
  },
  {
    assunto: "Configuração de impressora",
    conversas: 54,
    positivos: 33,
    negativos: 14,
    semAvaliacao: 7,
    resolucao: 58,
    encaminhamento: 24,
    cobertura: "indireta",
  },
  {
    assunto: "Cancelamento",
    conversas: 41,
    positivos: 19,
    negativos: 12,
    semAvaliacao: 10,
    resolucao: 44,
    encaminhamento: 40,
    cobertura: "parcial",
  },
];

export const COBERTURA: CoberturaLinha[] = [
  { classificacao: "Completa", quantidade: 2140, percentual: 43.5, cor: "#16a34a", acao: "Manter" },
  { classificacao: "Parcial", quantidade: 1180, percentual: 24.0, cor: "#f59e0b", acao: "Complementar artigo" },
  { classificacao: "Indireta", quantidade: 620, percentual: 12.6, cor: "#3b82f6", acao: "Revisar relevância" },
  { classificacao: "Sem base", quantidade: 480, percentual: 9.8, cor: "#ef4444", acao: "Criar novo artigo" },
  { classificacao: "Conflitante", quantidade: 210, percentual: 4.3, cor: "#8b5cf6", acao: "Consolidar versões" },
  { classificacao: "Desatualizada", quantidade: 180, percentual: 3.7, cor: "#a3a3a3", acao: "Atualizar conteúdo" },
  { classificacao: "Não sustentada", quantidade: 111, percentual: 2.1, cor: "#991b1b", acao: "Revisar prompt" },
];

export const RESOLUCAO: ResolucaoFatia[] = [
  { tipo: "Resolvida pela IA", valor: 820, cor: "#16a34a" },
  { tipo: "Encaminhada", valor: 282, cor: "#3b82f6" },
  { tipo: "Não resolvida", valor: 118, cor: "#ef4444" },
  { tipo: "Abandonada", valor: 64, cor: "#a3a3a3" },
];

export const EVOLUCAO: EvolucaoPonto[] = [
  { data: "01/07", positivo: 68, negativo: 32, resolucao: 60 },
  { data: "05/07", positivo: 70, negativo: 30, resolucao: 61 },
  { data: "10/07", positivo: 69, negativo: 31, resolucao: 63 },
  { data: "15/07", positivo: 71, negativo: 29, resolucao: 62 },
  { data: "20/07", positivo: 73, negativo: 27, resolucao: 65 },
  { data: "25/07", positivo: 72, negativo: 28, resolucao: 64 },
  { data: "30/07", positivo: 74, negativo: 26, resolucao: 66 },
];

export const DOCUMENTOS_TOP: DocumentoTopLinha[] = [
  {
    titulo: "Erro E101 — Falha de comunicação",
    guia: "Suporte Técnico",
    subguia: "Equipamentos",
    utilizacoes: 214,
    positivos: 138,
    negativos: 41,
    taxaNegativa: 22.9,
    ultimaAtualizacao: "12/07/2026",
    status: "Publicado",
  },
  {
    titulo: "Como emitir NFC-e",
    guia: "Financeiro",
    subguia: "Fiscal",
    utilizacoes: 189,
    positivos: 152,
    negativos: 14,
    taxaNegativa: 8.4,
    ultimaAtualizacao: "18/07/2026",
    status: "Publicado",
  },
  {
    titulo: "Recuperar acesso administrador",
    guia: "Suporte Técnico",
    subguia: "Acessos",
    utilizacoes: 141,
    positivos: 88,
    negativos: 32,
    taxaNegativa: 22.7,
    ultimaAtualizacao: "02/06/2026",
    status: "Desatualizado",
  },
  {
    titulo: "Integração com Bling",
    guia: "Integrações",
    subguia: "ERP",
    utilizacoes: 96,
    positivos: 31,
    negativos: 44,
    taxaNegativa: 45.8,
    ultimaAtualizacao: "20/03/2026",
    status: "Desatualizado",
  },
  {
    titulo: "Segunda via de boleto",
    guia: "Financeiro",
    subguia: "Cobrança",
    utilizacoes: 88,
    positivos: 72,
    negativos: 6,
    taxaNegativa: 6.8,
    ultimaAtualizacao: "10/07/2026",
    status: "Publicado",
  },
];

export const COBERTURA_COR: Record<AssuntoLinha["cobertura"], string> = {
  completa: "#16a34a",
  parcial: "#f59e0b",
  indireta: "#3b82f6",
  "sem-base": "#ef4444",
};
