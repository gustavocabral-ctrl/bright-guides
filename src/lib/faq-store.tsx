import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Bloco, Categoria, Guia } from "./faq-types";
import { CATEGORIAS, SEED_GUIAS } from "./faq-seed";

type DateFilter = "todos" | "hoje" | "7d" | "30d" | "90d" | "custom";

type FaqContextValue = {
  guias: Guia[];
  categorias: Categoria[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  selected: Guia | null;
  search: string;
  setSearch: (v: string) => void;
  categoriaFiltro: string;
  setCategoriaFiltro: (v: string) => void;
  dateFiltro: DateFilter;
  setDateFiltro: (v: DateFilter) => void;
  addGuia: (parentId: string | null, nome: string) => void;
  renameGuia: (id: string, nome: string) => void;
  deleteGuia: (id: string) => void;
  depthOf: (id: string) => number;
  updateBlocos: (guiaId: string, blocos: Bloco[]) => void;
  moveBloco: (guiaId: string, fromIndex: number, toIndex: number) => void;
  addCategoria: (nome: string) => Categoria;
  setGuiaCategorias: (guiaId: string, categorias: Categoria[]) => void;
};

const FaqCtx = createContext<FaqContextValue | null>(null);

const findFlat = (guias: Guia[], id: string): Guia | null => {
  for (const g of guias) {
    if (g.id === id) return g;
    const f = findFlat(g.filhos, id);
    if (f) return f;
  }
  return null;
};

const depthIn = (guias: Guia[], id: string, depth: number): number => {
  for (const g of guias) {
    if (g.id === id) return depth;
    const d = depthIn(g.filhos, id, depth + 1);
    if (d >= 0) return d;
  }
  return -1;
};

const mapTree = (guias: Guia[], fn: (g: Guia) => Guia): Guia[] =>
  guias.map((g) => fn({ ...g, filhos: mapTree(g.filhos, fn) }));

const removeFromTree = (guias: Guia[], id: string): Guia[] =>
  guias
    .filter((g) => g.id !== id)
    .map((g) => ({ ...g, filhos: removeFromTree(g.filhos, id) }));

const addToTree = (guias: Guia[], parentId: string | null, novo: Guia): Guia[] => {
  if (parentId === null) return [...guias, novo];
  return guias.map((g) =>
    g.id === parentId
      ? { ...g, filhos: [...g.filhos, novo] }
      : { ...g, filhos: addToTree(g.filhos, parentId, novo) },
  );
};

export function FaqProvider({ children }: { children: ReactNode }) {
  const [guias, setGuias] = useState<Guia[]>(SEED_GUIAS);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS);
  const [selectedId, setSelectedId] = useState<string>("g1-1");
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [dateFiltro, setDateFiltro] = useState<DateFilter>("todos");

  const selected = useMemo(() => findFlat(guias, selectedId), [guias, selectedId]);

  const value: FaqContextValue = {
    guias,
    categorias,
    selectedId,
    setSelectedId,
    selected,
    search,
    setSearch,
    categoriaFiltro,
    setCategoriaFiltro,
    dateFiltro,
    setDateFiltro,
    addGuia: (parentId, nome) => {
      const novo: Guia = {
        id: `g-${Date.now()}`,
        nome,
        categorias: [],
        filhos: [],
        blocos: [],
        updatedAt: new Date().toISOString(),
        updatedBy: "Você",
      };
      setGuias((prev) => addToTree(prev, parentId, novo));
      setSelectedId(novo.id);
    },
    renameGuia: (id, nome) =>
      setGuias((prev) => mapTree(prev, (g) => (g.id === id ? { ...g, nome } : g))),
    deleteGuia: (id) => setGuias((prev) => removeFromTree(prev, id)),
    depthOf: (id) => depthIn(guias, id, 0),
    updateBlocos: (guiaId, blocos) =>
      setGuias((prev) =>
        mapTree(prev, (g) =>
          g.id === guiaId
            ? { ...g, blocos, updatedAt: new Date().toISOString(), updatedBy: "Você" }
            : g,
        ),
      ),
    moveBloco: (guiaId, fromIndex, toIndex) =>
      setGuias((prev) =>
        mapTree(prev, (g) => {
          if (g.id !== guiaId) return g;
          const arr = [...g.blocos];
          if (
            fromIndex < 0 ||
            fromIndex >= arr.length ||
            toIndex < 0 ||
            toIndex >= arr.length
          )
            return g;
          const [item] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, item);
          return {
            ...g,
            blocos: arr,
            updatedAt: new Date().toISOString(),
            updatedBy: "Você",
          };
        }),
      ),
    addCategoria: (nome) => {
      const nova: Categoria = { id: `c-${Date.now()}`, nome };
      setCategorias((prev) => [...prev, nova]);
      return nova;
    },
    setGuiaCategorias: (guiaId, cats) =>
      setGuias((prev) =>
        mapTree(prev, (g) => (g.id === guiaId ? { ...g, categorias: cats } : g)),
      ),
  };

  return <FaqCtx.Provider value={value}>{children}</FaqCtx.Provider>;
}

export function useFaq() {
  const ctx = useContext(FaqCtx);
  if (!ctx) throw new Error("useFaq must be used inside FaqProvider");
  return ctx;
}

/** Concatenate all searchable text of a guia (used by global text search). */
export function guiaSearchableText(g: Guia): string {
  const parts: string[] = [g.nome];
  for (const b of g.blocos) {
    if (b.tipo === "texto" || b.tipo === "contexto" || b.tipo === "observacao") {
      parts.push(b.conteudo);
    } else if (b.tipo === "instrucao") {
      if (b.itens) parts.push(...b.itens.map((i) => i.texto));
      if (b.conteudo) parts.push(b.conteudo);
    } else if (b.tipo === "imagem") {
      parts.push(b.nome, b.interfaceTipo, b.instrucoes);
      if (b.instrucoesItens) parts.push(...b.instrucoesItens.map((i) => i.texto));
    } else if (b.tipo === "video") {
      parts.push(b.titulo, b.descricao, b.url);
    }
  }
  return parts.join(" ").toLowerCase();
}
