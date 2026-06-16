import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar as CalendarIcon, MessageSquare, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFaq } from "@/lib/faq-store";
import { cn } from "@/lib/utils";

export function FaqTopbar() {
  const {
    search,
    setSearch,
    categoriaFiltro,
    setCategoriaFiltro,
    dateFiltro,
    setDateFiltro,
    categorias,
  } = useFaq();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChat = pathname.endsWith("/chat");

  return (
    <header className="border-b border-border bg-[var(--surface)] px-6 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no FAQ"
            className="h-9 pl-9"
          />
        </div>

        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFiltro} onValueChange={(v) => setDateFiltro(v as never)}>
          <SelectTrigger className="h-9 w-[180px]">
            <CalendarIcon className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Data de update" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Qualquer data</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto inline-flex rounded-lg border border-border bg-muted/50 p-1">
          <Link
            to="/faq/chat"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isChat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Chat FAQ
          </Link>
          <Link
            to="/faq"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              !isChat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileText className="h-4 w-4" />
            Documento FAQ
          </Link>
        </div>
      </div>
    </header>
  );
}
