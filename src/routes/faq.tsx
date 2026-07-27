import { useEffect } from "react";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { FaqProvider, useFaq } from "@/lib/faq-store";
import { FaqSidebar } from "@/components/faq/FaqSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FaqTopbar } from "@/components/faq/FaqTopbar";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { findNode } from "@/lib/faq-tree";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Editor FAQ — Central de FAQ e Suporte" },
      { name: "description", content: "Sistema de FAQ e documentação interna." },
    ],
  }),
  component: FaqLayout,
});

/**
 * Sincroniza o parâmetro de deep-link `?node=<id>` com o estado selecionado
 * do FaqProvider. Se o id existir na árvore, torna-se a guia ativa.
 */
function DeepLinkSync() {
  const search = useRouterState({ select: (s) => s.location.search });
  const { guias, setSelectedId } = useFaq();
  useEffect(() => {
    const raw = typeof search === "string" ? search : (search as { node?: string })?.node;
    let id: string | undefined;
    if (typeof raw === "string" && raw.startsWith("?")) {
      id = new URLSearchParams(raw).get("node") ?? undefined;
    } else if (typeof raw === "string") {
      id = raw;
    } else if (search && typeof search === "object") {
      id = (search as { node?: string }).node;
    }
    if (id && findNode(guias, id)) setSelectedId(id);
  }, [search, guias, setSelectedId]);
  return null;
}

function FaqLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showSidebar = pathname === "/faq" || pathname === "/faq/";
  return (
    <FaqProvider>
      <ChatSuporteProvider>
        <DeepLinkSync />
        <TooltipProvider delayDuration={200}>
          <div className="flex h-screen w-full flex-col bg-[var(--surface)] text-foreground">
            <GlobalHeader />
            <div className="flex flex-1 overflow-hidden">
              {showSidebar && <FaqSidebar />}
              <div className="flex flex-1 flex-col overflow-hidden">
                <FaqTopbar />
                <div className="flex flex-1 overflow-hidden">
                  <main className="flex-1 overflow-auto">
                    <Outlet />
                  </main>
                  <ChatSuporteSlot />
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </ChatSuporteProvider>
    </FaqProvider>
  );
}

function ChatSuporteSlot() {
  const { open } = useChatSuporte();
  if (!open) return null;
  return <ChatSuportePanel />;
}
