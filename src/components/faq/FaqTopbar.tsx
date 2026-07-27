import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Search,
  KanbanSquare,
  Menu,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useFaq } from "@/lib/faq-store";
import { cn } from "@/lib/utils";
import { FaqSidebarBody } from "./FaqSidebar";

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
  const showsSidebar = isDoc;

  const [mobileOpen, setMobileOpen] = useState(false);

  const next = () => {
    if (searchTotal === 0) return;
    setSearchIndex((searchIndex + 1) % searchTotal);
  };
  const prev = () => {
    if (searchTotal === 0) return;
    setSearchIndex((searchIndex - 1 + searchTotal) % searchTotal);
  };

  const dateSelect = (
    <Select value={dateFiltro} onValueChange={(v) => setDateFiltro(v as never)}>
      <SelectTrigger className="h-9 w-full rounded-lg text-sm sm:w-52">
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
  );

  const navLinks = (
    <Link
      to="/faq/admin/improvements"
      onClick={() => setMobileOpen(false)}
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
  );

  const tabsGroup = null;

  const searchBox = (
    <div className="relative w-full sm:w-72">
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
        className="h-9 w-full rounded-lg pl-9 pr-24 text-sm"
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
  );

  const searchNav = search && (
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
  );

  return (
    <header className="border-b border-border bg-[var(--surface)] px-3 py-3 sm:px-6">
      {/* Desktop */}
      <div className="hidden items-center justify-between gap-4 lg:flex">
        <div className="flex flex-wrap items-center gap-2">
          {searchBox}
          {searchNav}
          {dateSelect}
          <Button size="sm" className="h-9 rounded-lg px-3 text-xs font-medium">
            Filtrar
          </Button>
          {navLinks}
        </div>
        {tabsGroup}
      </div>

      {/* Mobile / tablet */}
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0 rounded-lg"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border px-4 py-3">
              <SheetTitle className="text-sm">Menu</SheetTitle>
            </SheetHeader>

            {showsSidebar && (
              <div className="h-[55vh] border-b border-border">
                <FaqSidebarBody />
              </div>
            )}

            <div className="space-y-3 p-4">
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Navegação
                </p>
                {tabsGroup}
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Administração
                </p>
                <div className="flex flex-wrap gap-2">{navLinks}</div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Filtro por data
                </p>
                {dateSelect}
                <Button size="sm" className="mt-2 h-9 w-full rounded-lg text-xs font-medium">
                  Filtrar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">{searchBox}</div>
        {searchNav}
      </div>
    </header>
  );
}
