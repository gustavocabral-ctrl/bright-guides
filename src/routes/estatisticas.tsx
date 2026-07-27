import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatsView } from "@/components/faq/StatsView";

export const Route = createFileRoute("/estatisticas")({
  head: () => ({
    meta: [
      { title: "Estatísticas — Central de FAQ e Suporte" },
      {
        name: "description",
        content: "Indicadores de desempenho do chatbot e das respostas do FAQ.",
      },
      { property: "og:title", content: "Estatísticas — Central de FAQ e Suporte" },
      {
        property: "og:description",
        content: "Métricas de avaliação, cobertura e volume de conversas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EstatisticasPage,
});

function EstatisticasPage() {
  return (
    <AppShell>
      <StatsView />
    </AppShell>
  );
}
