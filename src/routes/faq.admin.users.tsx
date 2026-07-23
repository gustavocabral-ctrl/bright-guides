import { createFileRoute } from "@tanstack/react-router";
import { UsersView } from "@/components/faq/admin/UsersView";

export const Route = createFileRoute("/faq/admin/users")({
  head: () => ({
    meta: [
      { title: "Usuários — Administração FAQ Jump" },
      {
        name: "description",
        content: "CRUD visual de usuários, responsabilidades e permissões.",
      },
      { property: "og:title", content: "Usuários — Administração FAQ Jump" },
      {
        property: "og:description",
        content: "Gerencie acessos e restrições da equipe.",
      },
    ],
  }),
  component: UsersView,
});
