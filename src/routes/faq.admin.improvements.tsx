import { createFileRoute } from "@tanstack/react-router";
import { ImprovementsBoard } from "@/components/faq/admin/ImprovementsBoard";

export const Route = createFileRoute("/faq/admin/improvements")({
  head: () => ({
    meta: [
      { title: "Melhorias — Administração FAQ Jump" },
      {
        name: "description",
        content: "Kanban de respostas negativas e fluxo de melhoria contínua.",
      },
      { property: "og:title", content: "Melhorias — Administração FAQ Jump" },
      {
        property: "og:description",
        content: "Organize causas, responsáveis e prazos das melhorias do FAQ.",
      },
    ],
  }),
  component: ImprovementsBoard,
});
