import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ChatView } from "@/components/faq/ChatView";

export const Route = createFileRoute("/chat-suporte")({
  head: () => ({
    meta: [
      { title: "Chat Suporte — Central de FAQ e Suporte" },
      {
        name: "description",
        content:
          "Converse com o assistente de suporte que usa o conteúdo cadastrado no FAQ para responder.",
      },
      { property: "og:title", content: "Chat Suporte — Central de FAQ e Suporte" },
      {
        property: "og:description",
        content: "Teste as respostas do chatbot baseadas no FAQ interno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatSuportePage,
});

function ChatSuportePage() {
  return (
    <AppShell>
      <ChatView />
    </AppShell>
  );
}
