import { createFileRoute } from "@tanstack/react-router";
import { ChatView } from "@/components/faq/ChatView";

export const Route = createFileRoute("/faq/chat")({
  component: ChatView,
});
