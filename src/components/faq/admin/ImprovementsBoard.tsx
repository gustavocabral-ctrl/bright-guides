import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  IMPROVEMENTS,
  KANBAN_COLUMN_LABEL,
  PRIORITY_COLOR,
  COVERAGE_LABEL,
  type ImprovementItem,
  type KanbanColumn,
  type Priority,
} from "@/lib/admin-mock";

const COLUMNS: KanbanColumn[] = [
  "not_reviewed",
  "in_analysis",
  "needs_fix",
  "in_improvement",
  "resolved",
  "not_applicable",
];

export function ImprovementsBoard() {
  const [items, setItems] = useState<ImprovementItem[]>(IMPROVEMENTS);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((i) => i.id === openId);

  const updateItem = (id: string, patch: Partial<ImprovementItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-[var(--surface)] px-6 py-4">
        <h1 className="text-lg font-semibold">Melhorias</h1>
        <p className="text-xs text-muted-foreground">
          Kanban de respostas negativas conectado ao fluxo de melhoria contínua.
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid min-w-max grid-cols-6 gap-3">
          {COLUMNS.map((col) => {
            const colItems = items.filter((i) => i.status === col);
            return (
              <div
                key={col}
                className="flex min-w-[260px] flex-col rounded-lg border border-border bg-[var(--surface)]"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="text-xs font-semibold">
                    {KANBAN_COLUMN_LABEL[col]}
                  </span>
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {colItems.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {colItems.length === 0 && (
                    <div className="rounded border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
                      Vazio
                    </div>
                  )}
                  {colItems.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => setOpenId(it.id)}
                      className="rounded-md border border-border bg-white p-2 text-left shadow-sm transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium">
                          #{it.sessionNumber} · {it.subject}
                        </span>
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: PRIORITY_COLOR[it.priority] }}
                          title={`Prioridade ${it.priority}`}
                        />
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                        {it.questionSnippet}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                        <Badge variant="outline" className="h-4 px-1">
                          {it.negativeReason}
                        </Badge>
                        <Badge variant="outline" className="h-4 px-1">
                          {COVERAGE_LABEL[it.coverage]}
                        </Badge>
                      </div>
                      <div className="mt-1.5 text-[10px] text-muted-foreground">
                        {it.responsible} · {new Date(it.deadline).toLocaleDateString("pt-BR")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent className="w-[520px] sm:max-w-none">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>Melhoria #{open.sessionNumber} — {open.subject}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-xs">
                <Field label="Pergunta do usuário" v={open.questionSnippet} />
                <Field label="Resposta da IA" v={open.answerSnippet} />
                <Field label="Motivo do feedback" v={open.negativeReason} />
                <Field label="Cobertura" v={COVERAGE_LABEL[open.coverage]} />
                <Field label="Artigo relacionado" v={open.relatedArticle} />
                <Field label="Causa" v={open.cause ?? "—"} />
                <Field label="Ação recomendada" v={open.recommendedAction} />

                <div className="grid grid-cols-2 gap-2">
                  <SelectField
                    label="Status"
                    value={open.status}
                    onChange={(v) => updateItem(open.id, { status: v as KanbanColumn })}
                    options={COLUMNS.map((c) => ({ v: c, l: KANBAN_COLUMN_LABEL[c] }))}
                  />
                  <SelectField
                    label="Prioridade"
                    value={open.priority}
                    onChange={(v) => updateItem(open.id, { priority: v as Priority })}
                    options={(["baixa", "média", "alta", "crítica"] as Priority[]).map((p) => ({
                      v: p,
                      l: p,
                    }))}
                  />
                </div>

                <SelectField
                  label="Responsável"
                  value={open.responsible}
                  onChange={(v) => updateItem(open.id, { responsible: v })}
                  options={["—", "Ana Souza", "Bruno Lima", "Carla Dias", "Diego Alves", "Eduarda Ramos"].map(
                    (r) => ({ v: r, l: r }),
                  )}
                />

                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Histórico
                  </div>
                  <ol className="space-y-1 rounded-md border border-border bg-muted/40 p-3 text-[11px]">
                    <li>· Feedback negativo recebido</li>
                    <li>· Item criado no Kanban</li>
                    <li>· Classificado como {open.cause}</li>
                    <li>· Responsável: {open.responsible}</li>
                  </ol>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => toast("Melhoria salva (mock).")}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast("Abrindo sessão (mock).")}
                  >
                    Abrir sessão
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast("Abrindo artigo (mock).")}
                  >
                    Abrir artigo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateItem(open.id, { status: "resolved" });
                      toast.success("Marcada como resolvida.");
                    }}
                  >
                    Marcar resolvida
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xs">{v}</div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.v} value={o.v} className="text-xs">
              {o.l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
