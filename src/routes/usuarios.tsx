import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { UsersView } from "@/components/faq/admin/UsersView";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — Central de FAQ e Suporte" },
      {
        name: "description",
        content: "Gerencie usuários, perfis de acesso e permissões da Central de FAQ.",
      },
      { property: "og:title", content: "Usuários — Central de FAQ e Suporte" },
      {
        property: "og:description",
        content: "CRUD visual de usuários e responsabilidades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsuariosPage,
});

function UsuariosPage() {
  return (
    <AppShell>
      <UsersView />
    </AppShell>
  );
}
