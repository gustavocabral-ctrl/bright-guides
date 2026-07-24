import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch, useNavigate, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  X,
  Info,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  SESSIONS,
  filterSessions,
  humanFilterLabel,
  COVERAGE_LABEL,
  COVERAGE_COLOR,
  type ChatSession,
  type ChatMessage,
  type FaqCoverage,
} from "@/lib/admin-mock";
import { cn } from "@/lib/utils";

const RELATION_LABEL: Record<string, string> = {
  retrieved: "Recuperado",
  selected: "Selecionado",
  used: "Utilizado",
  discarded: "Descartado",
};

export function ChatsView() {
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const navigate = useNavigate();
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => {
      if (v != null && v !== "") p.set(k, String(v));
    });
    return p;
  }, [search]);

  const filtered = useMemo(() => filterSessions(SESSIONS, params), [params]);
  const banner = humanFilterLabel(params);

  const [selectedId, setSelectedId] = useState<string>(filtered[0]?.id ?? SESSIONS[0].id);
  const selected = useMemo(
    () => SESSIONS.find((s) => s.id === selectedId) ?? SESSIONS[0],
    [selectedId],
  );

  const [analysisMsgId, setAnalysisMsgId] = useState<string | null>(null);
  const analysisMessages = useMemo(
    () => selected.messages.filter((m) => m.role === "assistant" && m.analysis),
    [selected],
  );
  const analysisIndex = analysisMessages.findIndex((m) => m.id === analysisMsgId);
  const analysisMsg = analysisIndex >= 0 ? analysisMessages[analysisIndex] : null;

  const removeChip = (key: string) => {
    const next: Record<string, string | undefined> = { ...search };
    delete next[key];
    navigate({ to: "/faq/admin/chats", search: next as never });
  };

  const clearAll = () => navigate({ to: "/faq/admin/chats", search: {} as never });

  const chips = Object.entries(search).filter(([, v]) => v != null && v !== "");

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-border bg-[var(--surface)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Chats</h1>
            <p className="text-xs text-muted-foreground">
              {filtered.length} sessão(ões) · {SESSIONS.length} no total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar em sessões..."
              className="h-9 w-64 text-sm"
              value={search.q ?? ""}
              onChange={(e) =>
                navigate({
                  to: "/faq/admin/chats",
                  search: { ...search, q: e.target.value || undefined } as never,
                })
              }
            />
            <Button variant="outline" size="sm" onClick={() => toast.info("Atualizado (mock).")}>
              Atualizar
            </Button>
          </div>
        </div>
        {banner && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{banner}</span>
          </div>
        )}
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {chips.map(([k, v]) => (
              <Badge key={k} variant="secondary" className="gap-1 pl-2 pr-1">
                <span className="text-[11px]">
                  {k}: {v}
                </span>
                <button
                  aria-label={`Remover filtro ${k}`}
                  onClick={() => removeChip(k)}
                  className="rounded p-0.5 hover:bg-muted-foreground/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={clearAll}
            >
              Limpar todos
            </Button>
          </div>
        )}
      </div>

      {/* Desktop: 3 panels */}
      <div className="hidden min-h-0 flex-1 md:flex">
        {/* Sessions list */}
        <aside className="w-[340px] shrink-0 overflow-y-auto border-r border-border bg-[var(--surface)]">
          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Nenhuma sessão encontrada para os filtros atuais.
            </div>
          ) : (
            filtered.map((s) => (
              <SessionItem
                key={s.id}
                session={s}
                active={s.id === selectedId}
                onClick={() => {
                  setSelectedId(s.id);
                  setAnalysisMsgId(null);
                }}
              />
            ))
          )}
        </aside>

        {/* Conversation */}
        <section
          className={cn(
            "min-w-0 flex-1 overflow-y-auto bg-[var(--surface-muted)]",
            analysisMsg && "border-r border-border",
          )}
        >
          <ConversationHeader session={selected} />
          <div className="mx-auto max-w-3xl space-y-4 px-6 py-6">
            {selected.messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onOpenAnalysis={
                  m.analysis ? () => setAnalysisMsgId(m.id) : undefined
                }
                active={m.id === analysisMsgId}
              />
            ))}
          </div>
        </section>

        {/* Analysis drawer (side panel on desktop) */}
        {analysisMsg && (
          <AnalysisDrawer
            message={analysisMsg}
            index={analysisIndex}
            total={analysisMessages.length}
            onClose={() => setAnalysisMsgId(null)}
            onPrev={() =>
              setAnalysisMsgId(analysisMessages[Math.max(0, analysisIndex - 1)].id)
            }
            onNext={() =>
              setAnalysisMsgId(
                analysisMessages[Math.min(analysisMessages.length - 1, analysisIndex + 1)].id,
              )
            }
          />
        )}
      </div>

      {/* Mobile: horizontal pager (swipe = change session, vertical scroll = conversation) */}
      <MobileChatPager
        sessions={filtered.length > 0 ? filtered : []}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setAnalysisMsgId(null);
        }}
        onOpenAnalysis={(id) => setAnalysisMsgId(id)}
        analysisMsgId={analysisMsgId}
      />

      {/* Mobile: fullscreen analysis overlay */}
      {analysisMsg && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--surface)] md:hidden">
          <AnalysisDrawer
            message={analysisMsg}
            index={analysisIndex}
            total={analysisMessages.length}
            onClose={() => setAnalysisMsgId(null)}
            onPrev={() =>
              setAnalysisMsgId(analysisMessages[Math.max(0, analysisIndex - 1)].id)
            }
            onNext={() =>
              setAnalysisMsgId(
                analysisMessages[Math.min(analysisMessages.length - 1, analysisIndex + 1)].id,
              )
            }
            overlay
          />
        </div>
      )}
    </div>
  );
}

function MobileChatPager({
  sessions,
  selectedId,
  onSelect,
  onOpenAnalysis,
  analysisMsgId,
}: {
  sessions: ChatSession[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenAnalysis: (id: string) => void;
  analysisMsgId: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const selectedIndex = Math.max(
    0,
    sessions.findIndex((s) => s.id === selectedId),
  );

  // Sync selected -> scroll position (when list changes or user picks elsewhere)
  useEffect(() => {
    const el = slideRefs.current.get(selectedId);
    if (el && containerRef.current) {
      const desiredLeft = el.offsetLeft;
      if (Math.abs(containerRef.current.scrollLeft - desiredLeft) > 4) {
        containerRef.current.scrollTo({ left: desiredLeft, behavior: "auto" });
      }
    }
  }, [selectedId, sessions.length]);

  // Track horizontal snap position -> update selected session
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = container.scrollLeft + container.clientWidth / 2;
        let bestId = sessions[0]?.id;
        let bestDist = Infinity;
        sessions.forEach((s) => {
          const el = slideRefs.current.get(s.id);
          if (!el) return;
          const elCenter = el.offsetLeft + el.clientWidth / 2;
          const d = Math.abs(elCenter - center);
          if (d < bestDist) {
            bestDist = d;
            bestId = s.id;
          }
        });
        if (bestId && bestId !== selectedId) onSelect(bestId);
      });
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => {
      container.removeEventListener("scroll", handler);
      cancelAnimationFrame(raf);
    };
  }, [sessions, selectedId, onSelect]);

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-muted-foreground md:hidden">
        Nenhuma sessão encontrada para os filtros atuais.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col md:hidden">
      {/* Pager position indicator */}
      <div className="flex items-center justify-center gap-1.5 border-b border-border bg-[var(--surface)] px-4 py-2">
        <span className="text-[11px] text-muted-foreground">
          Sessão {selectedIndex + 1} de {sessions.length} · arraste para trocar
        </span>
      </div>
      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {sessions.map((s) => (
          <div
            key={s.id}
            ref={(el) => {
              if (el) slideRefs.current.set(s.id, el);
              else slideRefs.current.delete(s.id);
            }}
            className="flex w-full shrink-0 snap-center snap-always flex-col overflow-hidden"
            style={{ width: "100%" }}
          >
            {/* Session header (top) */}
            <div className="border-b border-border bg-[var(--surface)] px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Sessão #{s.number}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(s.startedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h2 className="mt-0.5 truncate text-sm font-semibold">{s.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                <Badge variant="outline" className="h-5 px-1.5">
                  {s.primarySubject}
                </Badge>
                <Badge variant="outline" className="h-5 px-1.5 text-muted-foreground">
                  {s.messageCount} msgs
                </Badge>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <ThumbsUp className="h-3 w-3" /> {s.feedbackSummary.positive}
                </span>
                <span className="inline-flex items-center gap-1 text-red-700">
                  <ThumbsDown className="h-3 w-3" /> {s.feedbackSummary.negative}
                </span>
              </div>
            </div>

            {/* Conversation (scrolls vertically) */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain bg-[var(--surface-muted)] px-4 py-4">
              {s.messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onOpenAnalysis={m.analysis ? () => onOpenAnalysis(m.id) : undefined}
                  active={m.id === analysisMsgId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionItem({
  session,
  active,
  onClick,
}: {
  session: ChatSession;
  active: boolean;
  onClick: () => void;
}) {
  const total =
    session.feedbackSummary.positive +
    session.feedbackSummary.negative +
    session.feedbackSummary.none;
  const pct = (n: number) => (total ? Math.round((n * 100) / total) : 0);
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/60",
        active && "bg-primary/5 border-l-2 border-l-primary",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{session.title}</span>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          #{session.number}
        </span>
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
        {session.automaticSummary}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
        <Badge variant="outline" className="h-5 px-1.5">
          {session.primarySubject}
        </Badge>
        <Badge variant="outline" className="h-5 px-1.5 text-muted-foreground">
          {session.messageCount} msgs
        </Badge>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] tabular-nums">
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <ThumbsUp className="h-3 w-3" /> {session.feedbackSummary.positive} ·{" "}
          {pct(session.feedbackSummary.positive)}%
        </span>
        <span className="inline-flex items-center gap-1 text-red-700">
          <ThumbsDown className="h-3 w-3" /> {session.feedbackSummary.negative} ·{" "}
          {pct(session.feedbackSummary.negative)}%
        </span>
        <span className="text-muted-foreground">
          Sem aval. {session.feedbackSummary.none} · {pct(session.feedbackSummary.none)}%
        </span>
      </div>
      {session.unresolvedNegativeCount > 0 && (
        <div className="mt-1.5 text-[11px] text-red-700">
          {session.unresolvedNegativeCount} negativa(s) não revisada(s)
        </div>
      )}
    </button>
  );
}

function ConversationHeader({ session }: { session: ChatSession }) {
  const total =
    session.feedbackSummary.positive +
    session.feedbackSummary.negative +
    session.feedbackSummary.none;
  const pct = (n: number) => (total ? Math.round((n * 100) / total) : 0);
  return (
    <div className="border-b border-border bg-[var(--surface)] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{session.title}</h2>
          <p className="text-xs text-muted-foreground">
            #{session.number} ·{" "}
            {new Date(session.startedAt).toLocaleDateString("pt-BR")} ·{" "}
            {session.messageCount} mensagens · {session.primaryIntent}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {session.feedbackSummary.positive} · {pct(session.feedbackSummary.positive)}%
          </Badge>
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {session.feedbackSummary.negative} · {pct(session.feedbackSummary.negative)}%
          </Badge>
          <Badge variant="secondary">
            {session.feedbackSummary.none} · {pct(session.feedbackSummary.none)}%
          </Badge>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onOpenAnalysis,
  active,
}: {
  message: ChatMessage;
  onOpenAnalysis?: () => void;
  active: boolean;
}) {
  const isUser = message.role === "user";
  const fb = message.feedback;
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground border-primary/20"
            : "bg-[var(--surface)] border-border",
          active && !isUser && "ring-2 ring-primary/40",
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {!isUser && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-2">
            {fb?.value === "positive" && (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
                <ThumbsUp className="mr-1 h-3 w-3" /> Positiva
              </Badge>
            )}
            {fb?.value === "negative" && (
              <>
                <Badge className="border-red-200 bg-red-50 text-red-800 hover:bg-red-50">
                  <ThumbsDown className="mr-1 h-3 w-3" /> Negativa
                </Badge>
                {fb.negativeReason && (
                  <span className="text-xs text-muted-foreground">
                    Motivo: {fb.negativeReason}
                  </span>
                )}
              </>
            )}
            {!fb && (
              <Badge className="border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-50">
                Sem avaliação
              </Badge>
            )}
            {fb && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  fb.reviewStatus === "reviewed" && "text-emerald-700",
                  fb.reviewStatus === "not_reviewed" && "text-red-700",
                )}
              >
                {fb.reviewStatus === "reviewed"
                  ? "Revisada"
                  : fb.reviewStatus === "in_review"
                    ? "Em revisão"
                    : "Não revisada"}
              </Badge>
            )}
            {fb?.comment && (
              <p className="w-full text-xs italic text-muted-foreground">
                “{fb.comment}”
              </p>
            )}
            {onOpenAnalysis && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-7 text-xs"
                onClick={onOpenAnalysis}
              >
                Análise da resposta
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisDrawer({
  message,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  message: ChatMessage;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const a = message.analysis!;
  return (
    <aside className="flex w-[440px] shrink-0 flex-col overflow-hidden border-l border-border bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Análise da resposta</p>
          <p className="text-[11px] text-muted-foreground">
            Resposta {index + 1} de {total}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrev} disabled={index <= 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onNext}
            disabled={index >= total - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <Accordion type="multiple" defaultValue={["q", "r", "e"]} className="space-y-1">
          <AccordionItem value="q" className="rounded-md border border-border px-3">
            <AccordionTrigger className="text-sm">Entendimento da pergunta</AccordionTrigger>
            <AccordionContent className="space-y-2 text-xs">
              <KV label="Pergunta interpretada" v={a.interpretedQuestion} />
              <KV label="Intenção" v={a.detectedIntent} />
              <KV label="Assunto" v={a.chatSubject} />
              <KV
                label="Entidades"
                v={a.entities.map((e) => `${e.label}: ${e.value}`).join(" · ")}
              />
              <KV label="Informações presentes" v={a.presentInformation.join(", ")} />
              <KV label="Informações ausentes" v={a.missingInformation.join(", ")} />
              <KV label="Contexto usado" v={a.usedConversationContext.join(", ")} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="r" className="rounded-md border border-border px-3">
            <AccordionTrigger className="text-sm">Busca no FAQ</AccordionTrigger>
            <AccordionContent className="space-y-2 text-xs">
              <KV label="Consulta enviada" v={a.retrieval.query} />
              <KV label="Alternativas" v={a.retrieval.alternativeQueries.join(" · ")} />
              <div className="grid grid-cols-4 gap-2 text-center">
                <Metric label="Recuperados" v={a.retrieval.retrievedCount} />
                <Metric label="Selecionados" v={a.retrieval.selectedCount} />
                <Metric label="Utilizados" v={a.retrieval.usedCount} />
                <Metric label="Melhor score" v={a.retrieval.bestScore.toFixed(2)} />
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Artigo</TableHead>
                      <TableHead className="text-[10px]">Rel.</TableHead>
                      <TableHead className="text-[10px]">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {a.retrieval.items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell className="py-1 text-[11px]">
                          <div className="font-medium">{it.documentTitle}</div>
                          <div className="line-clamp-1 text-muted-foreground">
                            {it.excerpt}
                          </div>
                          <div className="mt-0.5 flex gap-1">
                            <Link
                              to="/faq"
                              className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                            >
                              Abrir <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                            <button
                              className="text-[10px] text-muted-foreground hover:text-foreground"
                              onClick={() => toast("Marcado (mock).")}
                            >
                              Marcar
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="py-1 text-[11px]">
                          <Badge variant="outline" className="h-5 px-1.5">
                            {RELATION_LABEL[it.relation]}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1 text-[11px] tabular-nums">
                          {it.similarityScore.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="e" className="rounded-md border border-border px-3">
            <AccordionTrigger className="text-sm">Avaliação das evidências</AccordionTrigger>
            <AccordionContent className="space-y-2 text-xs">
              <div>
                Cobertura:{" "}
                <Badge
                  className="border-transparent text-white"
                  style={{
                    backgroundColor:
                      COVERAGE_COLOR[a.evidence.coverage as FaqCoverage] ?? "#94a3b8",
                  }}
                >
                  {COVERAGE_LABEL[a.evidence.coverage as FaqCoverage]}
                </Badge>
              </div>
              <KV label="Contradições" v={a.evidence.contradictions} />
              <KV label="Atualizado" v={a.evidence.upToDate} />
              <KV label="Faltante" v={a.evidence.missing} />
              <KV label="Segurança" v={a.evidence.safety} />
              <KV label="Exceções" v={a.evidence.exceptions} />
              <KV label="Risco de erro" v={a.evidence.riskOfWrong} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="d" className="rounded-md border border-border px-3">
            <AccordionTrigger className="text-sm">Decisão da IA</AccordionTrigger>
            <AccordionContent className="space-y-2 text-xs">
              <KV label="Ação" v={a.decision.action} />
              <KV label="Motivo" v={a.decision.reason} />
              <KV label="Incluído" v={a.decision.included.join(", ")} />
              <KV label="Evitado" v={a.decision.avoided.join(", ")} />
              <KV label="Próximo passo" v={a.decision.nextStep} />
              <KV
                label="Encaminhamento"
                v={a.decision.needsEscalation ? "Necessário" : "Não necessário"}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="v" className="rounded-md border border-border px-3">
            <AccordionTrigger className="text-sm">Validação da resposta</AccordionTrigger>
            <AccordionContent className="space-y-1 text-xs">
              <Check label="Respondeu à pergunta" ok={a.validation.answeredQuestion} />
              <Check label="Afirmações sustentadas" ok={a.validation.allClaimsSupported} />
              <Check label="Exceções preservadas" ok={a.validation.preservedExceptions} />
              <Check label="Uso correto do contexto" ok={a.validation.usedContextCorrectly} />
              <Check
                label="Possível alucinação"
                ok={!a.validation.possibleHallucination}
                invert
              />
              <div className="mt-2 rounded-md bg-muted/60 px-2 py-1.5 text-xs">
                {a.validation.finalResult}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}

function KV({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs">{v || "—"}</div>
    </div>
  );
}

function Metric({ label, v }: { label: string; v: number | string }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-2">
      <div className="text-sm font-semibold tabular-nums">{v}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Check({ label, ok, invert = false }: { label: string; ok: boolean; invert?: boolean }) {
  const good = invert ? !ok : ok;
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs">{label}</span>
      <Badge
        variant="outline"
        className={cn(
          "h-5 px-1.5 text-[10px]",
          good ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700",
        )}
      >
        {good ? "Sim" : "Não"}
      </Badge>
    </div>
  );
}

// Placeholder for possibly-unused import to keep the icon import from being flagged
export const __ICON = MessageSquare;
