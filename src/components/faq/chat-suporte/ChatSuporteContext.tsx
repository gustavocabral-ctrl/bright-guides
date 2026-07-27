import { createContext, useContext, useState, type ReactNode } from "react";

type ChatSuporteContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  width: number;
  setWidth: (n: number) => void;
};

const ChatSuporteContext = createContext<ChatSuporteContextValue | null>(null);

export function ChatSuporteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(400);
  return (
    <ChatSuporteContext.Provider
      value={{ open, setOpen, toggle: () => setOpen(!open), width, setWidth }}
    >
      {children}
    </ChatSuporteContext.Provider>
  );
}

export function useChatSuporte() {
  const ctx = useContext(ChatSuporteContext);
  if (!ctx) throw new Error("useChatSuporte must be used within ChatSuporteProvider");
  return ctx;
}
