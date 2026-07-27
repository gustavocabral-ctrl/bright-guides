import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ImprovementsBoard } from "@/components/faq/admin/ImprovementsBoard";

export const Route = createFileRoute("/melhorias")({
  head: () => ({
    meta: [
      { title: "Melhorias — Central de FAQ e Suporte" },
      {
        name: "description",
        content: "Gestão de melhorias contínuas do FAQ com status, prioridade e responsáveis.",
      },
      { property: "og:title", content: "Melhorias — Central de FAQ e Suporte" },
      {
        property: "og:description",
        content: "Acompanhe e priorize as melhorias identificadas nas respostas do FAQ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MelhoriasPage,
});

function MelhoriasPage() {
  return (
    <AppShell>
      <ImprovementsBoard />
    </AppShell>
  );
}
