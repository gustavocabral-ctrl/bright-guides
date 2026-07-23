/**
 * Mock centralizado para as telas administrativas do FAQ interno da Jump.
 * Cobre: sessões de chat, análise de respostas da IA, itens de melhorias (Kanban)
 * e usuários. Nenhum backend real — apenas dados coerentes entre si.
 */

export type FeedbackValue = "positive" | "negative";
export type FeedbackReviewStatus = "not_reviewed" | "in_review" | "reviewed";

export type FaqCoverage =
  | "complete"
  | "partial"
  | "indirect"
  | "no_basis"
  | "conflicting"
  | "outdated"
  | "unsupported";

export type ResolutionStatus =
  | "open"
  | "resolved_by_ai"
  | "escalated"
  | "unresolved"
  | "abandoned";

export const NEGATIVE_REASONS = [
  "Não respondeu à pergunta",
  "Resposta incorreta",
  "Resposta incompleta",
  "Informação desatualizada",
  "Resposta confusa",
  "Procedimento não funcionou",
  "Não entendeu a dúvida",
  "Resposta muito genérica",
  "Resposta muito longa",
  "Outro",
] as const;

export const COVERAGE_LABEL: Record<FaqCoverage, string> = {
  complete: "Completa",
  partial: "Parcial",
  indirect: "Indireta",
  no_basis: "Sem base",
  conflicting: "Conflitante",
  outdated: "Desatualizada",
  unsupported: "Não sustentada",
};

export const COVERAGE_COLOR: Record<FaqCoverage, string> = {
  complete: "#16a34a",
  partial: "#f59e0b",
  indirect: "#3b82f6",
  no_basis: "#ef4444",
  conflicting: "#8b5cf6",
  outdated: "#a3a3a3",
  unsupported: "#991b1b",
};

export interface RetrievedFaqItem {
  id: string;
  documentTitle: string;
  excerpt: string;
  similarityScore: number;
  rerankerScore?: number;
  rank: number;
  relation: "retrieved" | "selected" | "used" | "discarded";
  reason: string;
}

export interface ChatMessageAnalysis {
  interpretedQuestion: string;
  detectedIntent: string;
  chatSubject: string;
  entities: Array<{ label: string; value: string }>;
  presentInformation: string[];
  missingInformation: string[];
  usedConversationContext: string[];
  retrieval: {
    query: string;
    alternativeQueries: string[];
    retrievedCount: number;
    selectedCount: number;
    usedCount: number;
    bestScore: number;
    avgScore: number;
    items: RetrievedFaqItem[];
  };
  evidence: {
    coverage: FaqCoverage;
    contradictions: string;
    upToDate: string;
    missing: string;
    safety: string;
    exceptions: string;
    riskOfWrong: string;
  };
  decision: {
    action: string;
    reason: string;
    included: string[];
    avoided: string[];
    askedFollowUp: boolean;
    nextStep: string;
    needsEscalation: boolean;
  };
  validation: {
    answeredQuestion: boolean;
    allClaimsSupported: boolean;
    preservedExceptions: boolean;
    usedContextCorrectly: boolean;
    possibleHallucination: boolean;
    shouldAskMore: boolean;
    escalationNeeded: boolean;
    finalResult: string;
  };
}

export interface MessageFeedback {
  value: FeedbackValue;
  negativeReason?: string;
  comment?: string;
  reviewStatus: FeedbackReviewStatus;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "human";
  content: string;
  createdAt: string;
  feedback?: MessageFeedback;
  analysis?: ChatMessageAnalysis;
}

export interface ChatSession {
  id: string;
  number: number;
  title: string;
  automaticSummary: string;
  startedAt: string;
  messageCount: number;
  assistantMessageCount: number;
  primarySubject: string;
  primaryIntent: string;
  feedbackSummary: { positive: number; negative: number; none: number };
  coverageSummary: Partial<Record<FaqCoverage, number>>;
  unresolvedNegativeCount: number;
  resolutionStatus: ResolutionStatus;
  recommendedAction?: string;
  lastMessagePreview: string;
  messages: ChatMessage[];
}

const SUBJECTS = [
  "Erro de máquina",
  "Emissão de nota fiscal",
  "Segunda via de boleto",
  "Acesso ou login",
  "Integração com ERP",
  "Configuração de impressora",
  "Cancelamento",
  "Instalação do aplicativo",
  "Versão do aplicativo",
  "Relatório financeiro",
];

const INTENTS = [
  "Resolver problema",
  "Obter informação",
  "Executar procedimento",
  "Contestar cobrança",
  "Solicitar cancelamento",
];

const RECOMMENDED_ACTIONS = [
  "Revisar artigo do FAQ",
  "Criar novo artigo",
  "Atualizar procedimento",
  "Consolidar artigos conflitantes",
  "Melhorar prompt",
  "Nenhuma ação",
];

function baseAnalysis(subject: string, intent: string, coverage: FaqCoverage): ChatMessageAnalysis {
  return {
    interpretedQuestion: `Como resolver: ${subject.toLowerCase()}`,
    detectedIntent: intent,
    chatSubject: subject,
    entities: [
      { label: "Assunto", value: subject },
      { label: "Módulo", value: "Retaguarda" },
    ],
    presentInformation: ["Descrição do problema", "Passo já tentado"],
    missingInformation: ["Versão do sistema", "Código de erro"],
    usedConversationContext: ["Mensagem anterior sobre o mesmo tema"],
    retrieval: {
      query: `${subject} solução`,
      alternativeQueries: [`${subject} como resolver`, `${subject} passo a passo`],
      retrievedCount: 8,
      selectedCount: 3,
      usedCount: 2,
      bestScore: 0.87,
      avgScore: 0.71,
      items: [
        {
          id: "r1",
          documentTitle: `${subject} — Guia oficial`,
          excerpt: "Passo 1: verifique o cabo de rede. Passo 2: reinicie o equipamento…",
          similarityScore: 0.87,
          rerankerScore: 0.91,
          rank: 1,
          relation: "used",
          reason: "Melhor cobertura do problema descrito",
        },
        {
          id: "r2",
          documentTitle: `${subject} — Perguntas frequentes`,
          excerpt: "Em caso de falha recorrente, contate o suporte técnico da unidade…",
          similarityScore: 0.74,
          rerankerScore: 0.72,
          rank: 2,
          relation: "selected",
          reason: "Complementa o cenário de reincidência",
        },
        {
          id: "r3",
          documentTitle: `${subject} — Procedimento antigo`,
          excerpt: "Este procedimento foi atualizado em 2024 — consultar versão vigente…",
          similarityScore: 0.65,
          rerankerScore: 0.4,
          rank: 3,
          relation: "discarded",
          reason: "Conteúdo marcado como desatualizado",
        },
      ],
    },
    evidence: {
      coverage,
      contradictions: coverage === "conflicting" ? "Artigos A e B com passos diferentes" : "Nenhuma",
      upToDate: coverage === "outdated" ? "Conteúdo com mais de 12 meses" : "Sim",
      missing: coverage === "no_basis" ? "Não há artigo específico" : "Nenhuma informação relevante",
      safety: "Sem risco identificado",
      exceptions: "Cenários com equipamento fora de garantia não cobertos",
      riskOfWrong: coverage === "complete" ? "Baixo" : "Médio",
    },
    decision: {
      action: "Responder com base no artigo principal",
      reason: "Cobertura suficiente e conteúdo atualizado",
      included: ["Passo a passo do artigo principal"],
      avoided: ["Especulação sobre causas não documentadas"],
      askedFollowUp: false,
      nextStep: "Confirmar resolução com o usuário",
      needsEscalation: coverage === "no_basis",
    },
    validation: {
      answeredQuestion: coverage !== "no_basis",
      allClaimsSupported: coverage === "complete",
      preservedExceptions: true,
      usedContextCorrectly: true,
      possibleHallucination: coverage === "unsupported",
      shouldAskMore: coverage === "partial",
      escalationNeeded: coverage === "no_basis",
      finalResult:
        coverage === "complete"
          ? "Resposta consistente e sustentada"
          : "Resposta parcialmente sustentada",
    },
  };
}

function rand<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

function mkMessage(
  seed: number,
  role: ChatMessage["role"],
  content: string,
  opts?: Partial<Pick<ChatMessage, "feedback" | "analysis">>,
): ChatMessage {
  return {
    id: `m-${seed}`,
    role,
    content,
    createdAt: new Date(2026, 6, 1 + (seed % 25), 9 + (seed % 8), seed % 60).toISOString(),
    ...opts,
  };
}

const COVERAGES: FaqCoverage[] = [
  "complete",
  "partial",
  "indirect",
  "no_basis",
  "conflicting",
  "outdated",
  "unsupported",
];

export const SESSIONS: ChatSession[] = Array.from({ length: 22 }).map((_, i) => {
  const number = 400 + i;
  const subject = SUBJECTS[i % SUBJECTS.length];
  const intent = INTENTS[i % INTENTS.length];
  const messageCount = 5 + (i % 8);
  const messages: ChatMessage[] = [];
  let pos = 0;
  let neg = 0;
  let none = 0;
  let unresolved = 0;
  const coverageSummary: Partial<Record<FaqCoverage, number>> = {};

  for (let j = 0; j < messageCount; j++) {
    const seed = i * 100 + j;
    if (j % 2 === 0) {
      messages.push(
        mkMessage(seed, "user", `Preciso de ajuda com ${subject.toLowerCase()} (parte ${j / 2 + 1}).`),
      );
    } else {
      const cov = COVERAGES[(i + j) % COVERAGES.length];
      coverageSummary[cov] = (coverageSummary[cov] ?? 0) + 1;
      // Distribuição: alguns positivos, alguns negativos, alguns sem avaliação
      const mod = (i + j) % 6;
      let feedback: MessageFeedback | undefined;
      if (mod === 0 || mod === 1) {
        pos++;
        feedback = { value: "positive", reviewStatus: "reviewed" };
      } else if (mod === 2 || mod === 3) {
        neg++;
        const reviewStatus: FeedbackReviewStatus =
          mod === 2 ? "not_reviewed" : "in_review";
        unresolved++;
        feedback = {
          value: "negative",
          negativeReason: NEGATIVE_REASONS[(i + j) % NEGATIVE_REASONS.length],
          comment: "A resposta não resolveu meu problema.",
          reviewStatus,
        };
      } else {
        none++;
      }
      messages.push(
        mkMessage(
          seed,
          "assistant",
          `Para resolver ${subject.toLowerCase()}, siga: 1) verifique o item A; 2) confirme o item B; 3) reinicie o processo. Caso persista, consulte o artigo relacionado.`,
          {
            feedback,
            analysis: j % 3 === 1 ? undefined : baseAnalysis(subject, intent, cov),
          },
        ),
      );
    }
  }

  const resolutionStatus: ResolutionStatus =
    neg > pos ? "escalated" : pos > 0 ? "resolved_by_ai" : none > 0 ? "unresolved" : "open";

  return {
    id: `s-${number}`,
    number,
    title: `${subject} — Sessão ${number}`,
    automaticSummary: `Usuário reportou dúvida sobre ${subject.toLowerCase()} e recebeu ${messages.filter((m) => m.role === "assistant").length} respostas da IA.`,
    startedAt: new Date(2026, 6, 1 + (i % 25), 9, 0).toISOString(),
    messageCount,
    assistantMessageCount: messages.filter((m) => m.role === "assistant").length,
    primarySubject: subject,
    primaryIntent: intent,
    feedbackSummary: { positive: pos, negative: neg, none },
    coverageSummary,
    unresolvedNegativeCount: unresolved,
    resolutionStatus,
    recommendedAction: rand(RECOMMENDED_ACTIONS, i),
    lastMessagePreview: messages[messages.length - 1]?.content.slice(0, 90) ?? "",
    messages,
  };
});

/* ---------- Kanban de Melhorias ---------- */

export type KanbanColumn =
  | "not_reviewed"
  | "in_analysis"
  | "needs_fix"
  | "in_improvement"
  | "resolved"
  | "not_applicable";

export const KANBAN_COLUMN_LABEL: Record<KanbanColumn, string> = {
  not_reviewed: "Não revisada",
  in_analysis: "Em análise",
  needs_fix: "Correção necessária",
  in_improvement: "Em melhoria",
  resolved: "Resolvida",
  not_applicable: "Não procede",
};

export type Priority = "baixa" | "média" | "alta" | "crítica";

export const PRIORITY_COLOR: Record<Priority, string> = {
  baixa: "#94a3b8",
  média: "#3b82f6",
  alta: "#f59e0b",
  crítica: "#ef4444",
};

export interface ImprovementItem {
  id: string;
  sessionNumber: number;
  questionSnippet: string;
  answerSnippet: string;
  subject: string;
  intent: string;
  negativeReason: string;
  coverage: FaqCoverage;
  relatedArticle: string;
  recommendedAction: string;
  responsible: string;
  priority: Priority;
  deadline: string;
  conversationDate: string;
  status: KanbanColumn;
  cause?: string;
}

const RESPONSIBLES = [
  "Ana Souza",
  "Bruno Lima",
  "Carla Dias",
  "Diego Alves",
  "Eduarda Ramos",
  "—",
];

const CAUSES = [
  "FAQ ausente",
  "FAQ incompleto",
  "FAQ desatualizado",
  "Conflito entre artigos",
  "Busca RAG incorreta",
  "Prompt/regra de geração",
  "Resposta não sustentada",
];

export const IMPROVEMENTS: ImprovementItem[] = Array.from({ length: 15 }).map((_, i) => {
  const sess = SESSIONS[i % SESSIONS.length];
  const cov = COVERAGES[i % COVERAGES.length];
  const columns: KanbanColumn[] = [
    "not_reviewed",
    "not_reviewed",
    "in_analysis",
    "needs_fix",
    "in_improvement",
    "resolved",
    "not_applicable",
  ];
  return {
    id: `imp-${i + 1}`,
    sessionNumber: sess.number,
    questionSnippet: `Como resolver ${sess.primarySubject.toLowerCase()}?`,
    answerSnippet: "Verifique o item A e confirme o item B antes de reiniciar…",
    subject: sess.primarySubject,
    intent: sess.primaryIntent,
    negativeReason: NEGATIVE_REASONS[i % NEGATIVE_REASONS.length],
    coverage: cov,
    relatedArticle: `${sess.primarySubject} — Guia oficial`,
    recommendedAction: RECOMMENDED_ACTIONS[i % RECOMMENDED_ACTIONS.length],
    responsible: RESPONSIBLES[i % RESPONSIBLES.length],
    priority: (["baixa", "média", "alta", "crítica"] as Priority[])[i % 4],
    deadline: new Date(2026, 6, 20 + (i % 8)).toISOString(),
    conversationDate: sess.startedAt,
    status: columns[i % columns.length],
    cause: CAUSES[i % CAUSES.length],
  };
});

/* ---------- Usuários ---------- */

export type UserRole =
  | "Administrador"
  | "Gestor"
  | "Analista de qualidade"
  | "Editor do FAQ"
  | "Somente leitura";

export type UserStatus = "ativo" | "inativo";

export const RESPONSIBILITIES = [
  "Revisar respostas negativas",
  "Gerenciar melhorias",
  "Editar FAQ",
  "Criar artigos",
  "Analisar estatísticas",
  "Administrar usuários",
  "Revisar conteúdos conflitantes",
  "Validar correções",
] as const;

export const PERMISSIONS = [
  "Visualizar estatísticas",
  "Visualizar sessões",
  "Visualizar conteúdo das conversas",
  "Visualizar feedback",
  "Visualizar análise da resposta",
  "Alterar status de revisão",
  "Gerenciar Kanban",
  "Editar FAQ",
  "Criar FAQ",
  "Excluir/arquivar sessão",
  "Administrar usuários",
] as const;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  responsibilities: string[];
  permissions: string[];
  lastAccess: string;
}

export const USERS: AdminUser[] = [
  {
    id: "u1",
    name: "Ana Souza",
    email: "ana.souza@jump.com.br",
    role: "Administrador",
    status: "ativo",
    responsibilities: [...RESPONSIBILITIES],
    permissions: [...PERMISSIONS],
    lastAccess: "22/07/2026 09:14",
  },
  {
    id: "u2",
    name: "Bruno Lima",
    email: "bruno.lima@jump.com.br",
    role: "Gestor",
    status: "ativo",
    responsibilities: ["Gerenciar melhorias", "Analisar estatísticas", "Validar correções"],
    permissions: [
      "Visualizar estatísticas",
      "Visualizar sessões",
      "Visualizar conteúdo das conversas",
      "Visualizar feedback",
      "Visualizar análise da resposta",
      "Alterar status de revisão",
      "Gerenciar Kanban",
    ],
    lastAccess: "21/07/2026 18:02",
  },
  {
    id: "u3",
    name: "Carla Dias",
    email: "carla.dias@jump.com.br",
    role: "Analista de qualidade",
    status: "ativo",
    responsibilities: ["Revisar respostas negativas", "Revisar conteúdos conflitantes"],
    permissions: [
      "Visualizar estatísticas",
      "Visualizar sessões",
      "Visualizar conteúdo das conversas",
      "Visualizar feedback",
      "Visualizar análise da resposta",
      "Alterar status de revisão",
    ],
    lastAccess: "22/07/2026 11:44",
  },
  {
    id: "u4",
    name: "Diego Alves",
    email: "diego.alves@jump.com.br",
    role: "Editor do FAQ",
    status: "ativo",
    responsibilities: ["Editar FAQ", "Criar artigos"],
    permissions: ["Visualizar estatísticas", "Editar FAQ", "Criar FAQ"],
    lastAccess: "20/07/2026 15:30",
  },
  {
    id: "u5",
    name: "Eduarda Ramos",
    email: "eduarda.ramos@jump.com.br",
    role: "Analista de qualidade",
    status: "ativo",
    responsibilities: ["Revisar respostas negativas"],
    permissions: ["Visualizar sessões", "Visualizar feedback", "Alterar status de revisão"],
    lastAccess: "19/07/2026 10:11",
  },
  {
    id: "u6",
    name: "Felipe Torres",
    email: "felipe.torres@jump.com.br",
    role: "Somente leitura",
    status: "ativo",
    responsibilities: [],
    permissions: ["Visualizar estatísticas", "Visualizar sessões"],
    lastAccess: "18/07/2026 08:20",
  },
  {
    id: "u7",
    name: "Gabriela Nunes",
    email: "gabriela.nunes@jump.com.br",
    role: "Gestor",
    status: "inativo",
    responsibilities: ["Analisar estatísticas"],
    permissions: ["Visualizar estatísticas"],
    lastAccess: "05/06/2026 14:00",
  },
  {
    id: "u8",
    name: "Henrique Melo",
    email: "henrique.melo@jump.com.br",
    role: "Editor do FAQ",
    status: "ativo",
    responsibilities: ["Editar FAQ"],
    permissions: ["Editar FAQ", "Criar FAQ"],
    lastAccess: "21/07/2026 19:47",
  },
];

/* ---------- Filtro helper para /faq/admin/chats ---------- */

export function filterSessions(
  sessions: ChatSession[],
  q: URLSearchParams,
): ChatSession[] {
  const feedback = q.get("feedback");
  const negativeReason = q.get("negativeReason");
  const coverage = q.get("faqCoverage");
  const subject = q.get("subject");
  const resolution = q.get("resolution");
  const reviewStatus = q.get("reviewStatus");
  const search = q.get("q")?.toLowerCase();

  return sessions.filter((s) => {
    if (feedback === "positive" && s.feedbackSummary.positive === 0) return false;
    if (feedback === "negative" && s.feedbackSummary.negative === 0) return false;
    if (feedback === "none" && s.feedbackSummary.none === 0) return false;
    if (negativeReason) {
      const hit = s.messages.some(
        (m) =>
          m.feedback?.value === "negative" &&
          m.feedback.negativeReason?.toLowerCase().includes(negativeReason.toLowerCase()),
      );
      if (!hit) return false;
    }
    if (coverage && !(coverage in s.coverageSummary)) return false;
    if (subject && !s.primarySubject.toLowerCase().includes(subject.toLowerCase())) return false;
    if (resolution && s.resolutionStatus !== resolution) return false;
    if (reviewStatus === "not_reviewed" && s.unresolvedNegativeCount === 0) return false;
    if (search) {
      const hay = (s.title + " " + s.automaticSummary + " " + s.lastMessagePreview).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

export function humanFilterLabel(q: URLSearchParams): string | null {
  const parts: string[] = [];
  const feedback = q.get("feedback");
  if (feedback === "negative") parts.push("respostas com joinha negativo");
  if (feedback === "positive") parts.push("respostas com joinha positivo");
  if (feedback === "none") parts.push("respostas sem avaliação");
  const negativeReason = q.get("negativeReason");
  if (negativeReason) parts.push(`motivo “${negativeReason}”`);
  const coverage = q.get("faqCoverage");
  if (coverage) parts.push(`cobertura ${COVERAGE_LABEL[coverage as FaqCoverage] ?? coverage}`);
  const subject = q.get("subject");
  if (subject) parts.push(`assunto “${subject}”`);
  const resolution = q.get("resolution");
  if (resolution) parts.push(`resolução ${resolution}`);
  const review = q.get("reviewStatus");
  if (review === "not_reviewed") parts.push("negativas não revisadas");
  return parts.length ? `Exibindo sessões com ${parts.join(" e ")}.` : null;
}
