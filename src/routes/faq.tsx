import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FaqProvider } from "@/lib/faq-store";
import { FaqSidebar } from "@/components/faq/FaqSidebar";
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
  return (
    <FaqProvider>
      <div className="flex h-screen w-full bg-[var(--surface-muted)] text-foreground">
        <FaqSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <FaqTopbar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </FaqProvider>
  );
}
