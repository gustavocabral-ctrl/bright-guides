import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  X,
  Sparkles,
  Plus,
  History,
  Check,
  CheckCheck,
  MinusSquare,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFaq } from "@/lib/faq-store";
import { useChatSuporte } from "./ChatSuporteContext";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Proposta = {
  id: string;
  titulo: string;
  documento: string;
  antes: string;
  depois: string;
  tipo: string;
  status: "pendente" | "aplicada" | "recusada";
};

const nid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function ChatSuportePanel() {
  const { selected, resolveCategorias } = useFaq();
  const { setOpen, width, setWidth } = useChatSuporte();

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: nid(),
      role: "assistant",
      text: "Olá! Sou o assistente do FAQ. Descreva a alteração desejada e eu proporei mudanças no documento selecionado antes de aplicar.",
    },
  ]);
  const [input, setInput] = useState("");
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [contextChanged, setContextChanged] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const prevSelectedId = useRef<string | null>(selected?.id ?? null);

  // Detect context change (selected node) — inform user visually.
  useEffect(() => {
    if (selected?.id && prevSelectedId.current && selected.id !== prevSelectedId.current) {
      setContextChanged(true);
      const t = setTimeout(() => setContextChanged(false), 3500);
      prevSelectedId.current = selected.id;
      return () => clearTimeout(t);
    }
    prevSelectedId.current = selected?.id ?? null;
  }, [selected?.id]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages.length, propostas.length]);

  const categorias = selected ? resolveCategorias(selected) : [];

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const userMsg: Msg = { id: nid(), role: "user", text: q };
    const assistantMsg: Msg = {
      id: nid(),
      role: "assistant",
      text: selected
        ? `Analisei "${selected.nome}" e preparei uma proposta de alteração. Revise abaixo antes de aplicar.`
        : "Selecione um documento na árvore para propor alterações.",
    };
    const nextMessages = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);

    if (selected) {
      const nova: Proposta = {
        id: nid(),
        titulo: `Alteração sugerida em "${selected.nome}"`,
        documento: selected.nome,
        tipo: "Editar conteúdo existente",
        antes: "Conteúdo atual do documento.",
        depois: q,
        status: "pendente",
      };
      setPropostas((p) => [...p, nova]);
    }
    setInput("");
  };

  const aplicar = (id: string) => {
    setPropostas((p) => p.map((x) => (x.id === id ? { ...x, status: "aplicada" } : x)));
  };
  const recusar = (id: string) => {
    setPropostas((p) => p.map((x) => (x.id === id ? { ...x, status: "recusada" } : x)));
  };
  const aplicarTodas = () => {
    setPropostas((p) =>
      p.map((x) => (x.status === "pendente" ? { ...x, status: "aplicada" } : x)),
    );
  };
  const novaConversa = () => {
    setMessages([
      {
        id: nid(),
        role: "assistant",
        text: "Nova conversa iniciada. Como posso ajudar com o FAQ?",
      },
    ]);
    setPropostas([]);
  };

  // Resizing
  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;
      const onMove = (ev: MouseEvent) => {
        const delta = startX - ev.clientX;
        const next = Math.min(720, Math.max(320, startWidth + delta));
        setWidth(next);
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [width, setWidth],
  );

  const pendentes = propostas.filter((p) => p.status === "pendente").length;

  return (
    <aside
      className="relative flex shrink-0 flex-col border-l border-border bg-card"
      style={{ width }}
      aria-label="Chat Suporte"
    >
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar painel do chat"
        className="absolute -left-1 top-0 z-10 hidden h-full w-2 cursor-col-resize items-center justify-center lg:flex"
      >
        <div className="h-10 w-0.5 rounded-full bg-border" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Chat Suporte</p>
          <p className="truncate text-xs text-muted-foreground">
            Assunto atual: {selected?.nome ?? "Nenhum documento selecionado"}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={novaConversa} title="Nova conversa">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Conversas anteriores">
          <History className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)} title="Fechar chat">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Context info */}
      {selected && (
        <div className="border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-1.5">
            <MessageSquare className="h-3 w-3" />
            <span>Contexto:</span>
            <Badge variant="secondary">{selected.nome}</Badge>
            {categorias.map((c) => (
              <Badge
                key={c.id}
                variant="outline"
                style={{ color: c.cor, borderColor: `${c.cor}55` }}
              >
                {c.nome}
              </Badge>
            ))}
          </div>
          {contextChanged && (
            <p className="mt-1.5 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
              Contexto atualizado para "{selected.nome}".
            </p>
          )}
        </div>
      )}

      {/* Body */}
      <div ref={historyRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-tl-sm border border-border bg-[var(--surface)] text-foreground",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}

        {propostas.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Alterações propostas
              </p>
              {pendentes > 0 && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={aplicarTodas}>
                  <CheckCheck className="mr-1 h-3.5 w-3.5" /> Aplicar todas
                </Button>
              )}
            </div>
            {propostas.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "rounded-lg border p-3 text-xs",
                  p.status === "aplicada"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : p.status === "recusada"
                      ? "border-border bg-muted/40 opacity-70"
                      : "border-border bg-[var(--surface)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{p.titulo}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      p.status === "aplicada" && "border-emerald-500/40 text-emerald-600",
                      p.status === "recusada" && "text-muted-foreground",
                    )}
                  >
                    {p.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-muted-foreground">
                  {p.tipo} · {p.documento}
                </p>
                <div className="mt-2 grid gap-1.5">
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5">
                    <p className="text-[10px] font-semibold uppercase text-destructive/80">Antes</p>
                    <p className="text-foreground/90">{p.antes}</p>
                  </div>
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2 py-1.5">
                    <p className="text-[10px] font-semibold uppercase text-emerald-700">Depois</p>
                    <p className="text-foreground/90">{p.depois}</p>
                  </div>
                </div>
                {p.status === "pendente" && (
                  <div className="mt-2 flex gap-1.5">
                    <Button size="sm" className="h-7 text-xs" onClick={() => aplicar(p.id)}>
                      <Check className="mr-1 h-3.5 w-3.5" /> Aplicar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => recusar(p.id)}
                    >
                      <MinusSquare className="mr-1 h-3.5 w-3.5" /> Recusar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Descreva a alteração desejada..."
            className="h-9"
          />
          <Button onClick={send} size="icon" className="h-9 w-9 shrink-0" aria-label="Enviar mensagem">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
