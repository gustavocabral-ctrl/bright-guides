import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ASSUNTOS_FREQUENTES,
  AVALIACAO,
  COBERTURA,
  COBERTURA_COR,
  DOCUMENTOS_TOP,
  EVOLUCAO,
  KPIS,
  MOTIVOS_NEGATIVOS,
  RESOLUCAO,
  type PeriodoStats,
} from "@/lib/faq-stats-mock";
import { cn } from "@/lib/utils";

/** Formata "+12,4%" ou "-3,2%" com base no valor de variação. */
function formatVariacao(v: number): string {
  const abs = Math.abs(v).toFixed(1).replace(".", ",");
  return `${v >= 0 ? "+" : "-"}${abs}%`;
}

function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {KPIS.map((k) => {
        const positivo = k.variacao >= 0;
        return (
          <div
            key={k.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {k.titulo}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-semibold tabular-nums">{k.valor}</div>
              <div
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                  positivo
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                {positivo ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {formatVariacao(k.variacao)}
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{k.descricao}</div>
          </div>
        );
      })}
    </div>
  );
}

function AvaliacaoDonutCard() {
  const total = AVALIACAO.positivo + AVALIACAO.negativo + AVALIACAO.semAvaliacao;
  const data = [
    { name: "Positivo", value: AVALIACAO.positivo, cor: "#16a34a" },
    { name: "Negativo", value: AVALIACAO.negativo, cor: "#ef4444" },
    { name: "Sem avaliação", value: AVALIACAO.semAvaliacao, cor: "#3b82f6" },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Avaliação por joinha</h3>
        <span className="text-xs text-muted-foreground">
          Total: {total.toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.cor} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n) => [v.toLocaleString("pt-BR"), n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-semibold tabular-nums">
              {total.toLocaleString("pt-BR")}
            </div>
            <div className="text-[11px] text-muted-foreground">respostas</div>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((d) => {
            const pct = ((d.value / total) * 100).toFixed(1).replace(".", ",");
            return (
              <li key={d.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: d.cor }}
                  />
                  {d.name}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {d.value.toLocaleString("pt-BR")} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MotivosNegativosCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Motivos dos joinhas negativos</h3>
        <span className="text-xs text-muted-foreground">
          Base: {MOTIVOS_NEGATIVOS.reduce((a, m) => a + m.quantidade, 0)}
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={MOTIVOS_NEGATIVOS}
            layout="vertical"
            margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.4} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="motivo"
              width={210}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: number) => [v.toLocaleString("pt-BR"), "Quantidade"]}
            />
            <Bar dataKey="quantidade" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EvolucaoCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Evolução das métricas</h3>
        <span className="text-xs text-muted-foreground">% ao longo do período</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={EVOLUCAO} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="data" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="positivo"
              name="Positivo"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="negativo"
              name="Negativo"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="resolucao"
              name="Resolução"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ResolucaoCard() {
  const total = RESOLUCAO.reduce((a, r) => a + r.valor, 0);
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Resolução do atendimento</h3>
        <span className="text-xs text-muted-foreground">
          Total: {total.toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={RESOLUCAO}
                dataKey="valor"
                nameKey="tipo"
                innerRadius={50}
                outerRadius={82}
                paddingAngle={2}
                stroke="none"
              >
                {RESOLUCAO.map((r) => (
                  <Cell key={r.tipo} fill={r.cor} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n) => [v.toLocaleString("pt-BR"), n]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm">
          {RESOLUCAO.map((r) => {
            const pct = ((r.valor / total) * 100).toFixed(1).replace(".", ",");
            return (
              <li key={r.tipo} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: r.cor }}
                  />
                  {r.tipo}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {r.valor.toLocaleString("pt-BR")} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CoberturaCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Cobertura da resposta pelo FAQ</h3>
        <span className="text-xs text-muted-foreground">
          Classificação automática por resposta
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classificação</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead>Ação recomendada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COBERTURA.map((c) => (
              <TableRow key={c.classificacao}>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: c.cor }}
                    />
                    {c.classificacao}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.quantidade.toLocaleString("pt-BR")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.percentual.toFixed(1).replace(".", ",")}%
                </TableCell>
                <TableCell className="text-muted-foreground">{c.acao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AssuntosFrequentesCard() {
  const labelCobertura: Record<string, string> = {
    completa: "Completa",
    parcial: "Parcial",
    indireta: "Indireta",
    "sem-base": "Sem base",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Assuntos mais frequentes</h3>
        <span className="text-xs text-muted-foreground">
          Ordenado por volume de conversas
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assunto</TableHead>
              <TableHead className="text-right">Conversas</TableHead>
              <TableHead className="text-right">Positivos</TableHead>
              <TableHead className="text-right">Negativos</TableHead>
              <TableHead className="text-right">Resolução</TableHead>
              <TableHead className="text-right">Encaminhamento</TableHead>
              <TableHead>Cobertura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ASSUNTOS_FREQUENTES.map((a) => (
              <TableRow key={a.assunto}>
                <TableCell className="font-medium">{a.assunto}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {a.conversas}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-700">
                  {a.positivos}
                </TableCell>
                <TableCell className="text-right tabular-nums text-red-700">
                  {a.negativos}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {a.resolucao}%
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {a.encaminhamento}%
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="border-0 font-medium"
                    style={{
                      background: `${COBERTURA_COR[a.cobertura]}1a`,
                      color: COBERTURA_COR[a.cobertura],
                    }}
                  >
                    {labelCobertura[a.cobertura]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DocumentosTopCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Artigos do FAQ mais utilizados</h3>
        <span className="text-xs text-muted-foreground">
          Recuperados pelo RAG no período
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Guia / Subguia</TableHead>
              <TableHead className="text-right">Utilizações</TableHead>
              <TableHead className="text-right">Positivos</TableHead>
              <TableHead className="text-right">Negativos</TableHead>
              <TableHead className="text-right">% Neg.</TableHead>
              <TableHead>Atualização</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DOCUMENTOS_TOP.map((d) => (
              <TableRow key={d.titulo}>
                <TableCell className="font-medium">{d.titulo}</TableCell>
                <TableCell className="text-muted-foreground">
                  {d.guia} · {d.subguia}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {d.utilizacoes}
                </TableCell>
                <TableCell className="text-right tabular-nums text-emerald-700">
                  {d.positivos}
                </TableCell>
                <TableCell className="text-right tabular-nums text-red-700">
                  {d.negativos}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {d.taxaNegativa.toFixed(1).replace(".", ",")}%
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.ultimaAtualizacao}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0 font-medium",
                      d.status === "Publicado" && "bg-emerald-50 text-emerald-700",
                      d.status === "Rascunho" && "bg-amber-50 text-amber-700",
                      d.status === "Desatualizado" && "bg-red-50 text-red-700",
                    )}
                  >
                    {d.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function StatsView() {
  const [periodo, setPeriodo] = useState<PeriodoStats>("30d");
  const [atualizadoEm] = useState<string>(() =>
    new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
  );

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Estatísticas do Chat FAQ</h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Analise a qualidade das respostas da IA e identifique melhorias necessárias no FAQ interno.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoStats)}>
            <SelectTrigger className="h-9 w-44 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 rounded-lg">
            <Filter className="mr-1 h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-lg">
            <Download className="mr-1 h-4 w-4" /> Exportar
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" aria-label="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Atualizado às {atualizadoEm}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <KpiCards />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AvaliacaoDonutCard />
          <ResolucaoCard />
        </div>

        <EvolucaoCard />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MotivosNegativosCard />
          <CoberturaCard />
        </div>

        <AssuntosFrequentesCard />
        <DocumentosTopCard />
      </div>
    </div>
  );
}
