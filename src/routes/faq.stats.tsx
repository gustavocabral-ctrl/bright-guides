import { createFileRoute } from "@tanstack/react-router";
import { StatsView } from "@/components/faq/StatsView";

export const Route = createFileRoute("/faq/stats")({
  head: () => ({
    meta: [
      { title: "Estatísticas do Chat FAQ — Jump Tecnologia" },
      {
        name: "description",
        content:
          "Painel de métricas do Chat FAQ: avaliações, cobertura, resolução e desempenho dos artigos.",
      },
      { property: "og:title", content: "Estatísticas do Chat FAQ — Jump Tecnologia" },
      {
        property: "og:description",
        content:
          "Analise a qualidade das respostas da IA e identifique melhorias no FAQ interno.",
      },
    ],
  }),
  component: StatsView,
});
