import type { ReactNode } from "react";
import { FaqProvider } from "@/lib/faq-store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalHeader } from "./GlobalHeader";

/**
 * Shell shared by top-level pages outside `/faq` (Chat Suporte, Lista de Chats,
 * Estatísticas, Usuários). Provides the global header and the FAQ context so
 * reused views (ChatView, ChatsView, StatsView, UsersView) continue to work.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <FaqProvider>
      <TooltipProvider delayDuration={200}>
        <div className="flex min-h-screen w-full flex-col bg-[var(--surface)] text-foreground">
          <GlobalHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </TooltipProvider>
    </FaqProvider>
  );
}
