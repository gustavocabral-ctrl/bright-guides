import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MessagesSquare,
  Search,
  FileText,
  Users,
  KanbanSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    searchIndex,
    setSearchIndex,
    searchTotal,
    dateFiltro,
    setDateFiltro,
  } = useFaq();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChat = pathname.endsWith("/chat");
  const isStats = pathname.endsWith("/stats");
  const isAdminChats = pathname.startsWith("/faq/admin/chats");
  const isImprovements = pathname.startsWith("/faq/admin/improvements");
  const isUsers = pathname.startsWith("/faq/admin/users");
  const isDoc = !isChat && !isStats && !isAdminChats && !isImprovements && !isUsers;

  const next = () => {
    if (searchTotal === 0) return;
    setSearchIndex((searchIndex + 1) % searchTotal);
  };
  const prev = () => {
    if (searchTotal === 0) return;
    setSearchIndex((searchIndex - 1 + searchTotal) % searchTotal);
  };

  return (
    <header className="border-b border-border bg-[var(--surface)] px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (e.shiftKey) prev();
                  else next();
                }
              }}
              placeholder="Buscar no texto do FAQ"
              className="h-9 w-72 rounded-lg pl-9 pr-24 text-sm"
            />
            {search && (
              <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[11px] text-muted-foreground">
                <span className="pointer-events-auto tabular-nums">
                  {searchTotal === 0
                    ? "0 resultados"
                    : `${searchIndex + 1} de ${searchTotal}`}
                </span>
              </div>
            )}
          </div>

          {search && (
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-8"
                onClick={prev}
                disabled={searchTotal === 0}
                aria-label="Resultado anterior"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-8"
                onClick={next}
                disabled={searchTotal === 0}
                aria-label="Próximo resultado"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Select value={dateFiltro} onValueChange={(v) => setDateFiltro(v as never)}>
            <SelectTrigger className="h-9 w-52 rounded-lg text-sm">
              <CalendarIcon className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Data de ajuste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Qualquer data</SelectItem>
              <SelectItem value="hoje">Atualizados hoje</SelectItem>
              <SelectItem value="7d">Atualizados nos últimos 7 dias</SelectItem>
              <SelectItem value="30d">Atualizados nos últimos 30 dias</SelectItem>
              <SelectItem value="90d">Atualizados nos últimos 90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" className="h-9 rounded-lg px-3 text-xs font-medium">
            Filtrar
          </Button>

          <Link
            to="/faq/admin/improvements"
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium transition-colors",
              isImprovements
                ? "bg-primary text-primary-foreground"
                : "bg-[var(--surface)] text-foreground hover:bg-muted",
            )}
          >
            <KanbanSquare className="h-3.5 w-3.5" />
            Melhorias
          </Link>
          <Link
            to="/faq/admin/users"
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium transition-colors",
              isUsers
                ? "bg-primary text-primary-foreground"
                : "bg-[var(--surface)] text-foreground hover:bg-muted",
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Usuários
          </Link>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
          <Link
            to="/faq/stats"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              isStats
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Estatísticas
          </Link>
          <Link
            to="/faq/admin/chats"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              isAdminChats
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessagesSquare className="h-3.5 w-3.5" />
            Chats
          </Link>
          <Link
            to="/faq/chat"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              isChat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat FAQ
          </Link>
          <Link
            to="/faq"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              isDoc
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Documento
          </Link>
        </div>
      </div>
    </header>
  );
}
