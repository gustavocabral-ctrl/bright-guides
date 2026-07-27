import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Lightbulb,
  MessageSquare,
  MessagesSquare,
  Users,
  Menu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matches: (path: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: "/faq",
    label: "Editor FAQ",
    icon: BookOpen,
    matches: (p) => p === "/faq" || p === "/faq/",
  },
  {
    to: "/chat-suporte",
    label: "Chat Suporte",
    icon: MessageSquare,
    matches: (p) => p.startsWith("/chat-suporte") || p.startsWith("/faq/chat"),
  },
  {
    to: "/chats",
    label: "Lista de Chats",
    icon: MessagesSquare,
    matches: (p) => p === "/chats" || p.startsWith("/chats/") || p.startsWith("/faq/admin/chats"),
  },
  {
    to: "/estatisticas",
    label: "Estatísticas",
    icon: BarChart3,
    matches: (p) => p.startsWith("/estatisticas") || p.startsWith("/faq/stats"),
  },
  {
    to: "/melhorias",
    label: "Melhorias",
    icon: Lightbulb,
    matches: (p) => p.startsWith("/melhorias") || p.startsWith("/faq/admin/improvements"),
  },
  {
    to: "/usuarios",
    label: "Usuários",
    icon: Users,
    matches: (p) => p.startsWith("/usuarios") || p.startsWith("/faq/admin/users"),
  },
];

export function GlobalHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const renderNavLink = (item: NavItem, onClick?: () => void) => {
    const active = item.matches(pathname);
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onClick}
        title={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/30"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/80">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-6">
        <Link to="/faq" className="flex items-center gap-2 shrink-0" aria-label="Central de FAQ e Suporte">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="hidden text-sm font-semibold text-foreground sm:block">
            Central de FAQ e Suporte
          </span>
          <span className="text-sm font-semibold text-foreground sm:hidden">FAQ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => renderNavLink(item))}
        </nav>

        {/* User area */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-border bg-[var(--surface)] px-2 py-1 text-xs text-foreground hover:bg-muted md:inline-flex"
            aria-label="Perfil do usuário"
            title="Perfil"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-3.5 w-3.5" />
            </span>
            <span className="hidden lg:inline">Minha conta</span>
          </button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 md:hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-xs p-0">
              <SheetHeader className="border-b border-border px-4 py-3">
                <SheetTitle className="text-sm">Navegação</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3" aria-label="Navegação principal">
                {NAV_ITEMS.map((item) => renderNavLink(item, () => setOpen(false)))}
              </nav>
              <div className="border-t border-border p-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg border border-border bg-[var(--surface)] px-2 py-2 text-xs text-foreground hover:bg-muted"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  Minha conta
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
