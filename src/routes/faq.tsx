import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { FaqProvider } from "@/lib/faq-store";
import { FaqSidebar } from "@/components/faq/FaqSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FaqTopbar } from "@/components/faq/FaqTopbar";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ Interno — Jump Tecnologia" },
      { name: "description", content: "Sistema de FAQ e documentação interna." },
    ],
  }),
  component: FaqLayout,
});

function FaqLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showSidebar = pathname === "/faq" || pathname === "/faq/";
  return (
    <FaqProvider>
      <TooltipProvider delayDuration={200}>
        <div className="flex h-screen w-full bg-[var(--surface-muted)] text-foreground">
          {showSidebar && <FaqSidebar />}
          <div className="flex flex-1 flex-col overflow-hidden">
            <FaqTopbar />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>

          </div>
        </div>
      </TooltipProvider>
    </FaqProvider>
  );
}

