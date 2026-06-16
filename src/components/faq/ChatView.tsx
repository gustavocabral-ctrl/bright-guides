import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFaq } from "@/lib/faq-store";

type Msg = { role: "user" | "assistant"; text: string; source?: string };

export function ChatView() {
  const { guias } = useFaq();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Olá! Sou o assistente do FAQ Jump. Faça uma pergunta sobre cadastros, pagamentos, convênios ou tabelas de estacionamento.",
    },
  ]);
  const [input, setInput] = useState("");

  const allNames = guias.flatMap((g) => [g.nome, ...g.filhos.map((f) => f.nome)]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const match = allNames.find((n) => n.toLowerCase().includes(q.toLowerCase().split(" ")[0]));
    const next: Msg[] = [
      ...messages,
      { role: "user", text: q },
      {
        role: "assistant",
        text: match
          ? `Encontrei conteúdo relacionado em "${match}". Abra a guia correspondente no Documento FAQ para ver os detalhes completos.`
          : "Não encontrei conteúdo exato. Tente reformular sua pergunta ou navegue pelas guias.",
        source: match,
      },
    ];
    setMessages(next);
    setInput("");
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4 py-6 sm:px-8">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                : "mr-auto flex max-w-[85%] gap-2"
            }
          >
            {m.role === "assistant" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}
            {m.role === "assistant" ? (
              <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm">
                {m.text}
                {m.source && (
                  <div className="mt-2 text-xs text-muted-foreground">Fonte: {m.source}</div>
                )}
              </div>
            ) : (
              m.text
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-border bg-card pt-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Pergunte ao FAQ..."
        />
        <Button onClick={send}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
