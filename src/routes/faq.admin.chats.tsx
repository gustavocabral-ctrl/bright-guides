import { createFileRoute } from "@tanstack/react-router";
import { ChatsView } from "@/components/faq/admin/ChatsView";

export const Route = createFileRoute("/faq/admin/chats")({
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string | undefined>,
  head: () => ({
    meta: [
      { title: "Chats — Administração FAQ Jump" },
      {
        name: "description",
        content: "Lista de sessões, conversa e análise da resposta em uma única tela.",
      },
      { property: "og:title", content: "Chats — Administração FAQ Jump" },
      {
        property: "og:description",
        content: "Analise sessões, feedback e a trilha estruturada da IA.",
      },
    ],
  }),
  component: ChatsView,
});
