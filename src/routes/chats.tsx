import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ChatsView } from "@/components/faq/admin/ChatsView";

export const Route = createFileRoute("/chats")({
  head: () => ({
    meta: [
      { title: "Lista de Chats — Central de FAQ e Suporte" },
      {
        name: "description",
        content: "Consulte todas as conversas do chatbot com filtros por status, avaliação e período.",
      },
      { property: "og:title", content: "Lista de Chats — Central de FAQ e Suporte" },
      {
        property: "og:description",
        content: "Visualize o histórico completo das conversas do FAQ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatsPage,
});

function ChatsPage() {
  return (
    <AppShell>
      <ChatsView />
    </AppShell>
  );
}
