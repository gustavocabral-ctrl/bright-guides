import { createFileRoute } from "@tanstack/react-router";
import { DocumentoView } from "@/components/faq/DocumentoView";

export const Route = createFileRoute("/faq/")({
  component: DocumentoView,
});
