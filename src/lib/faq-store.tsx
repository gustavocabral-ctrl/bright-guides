import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Bloco, Categoria, FaqNode, Guia } from "./faq-types";
import { CATEGORIA_COR_PADRAO, tipoForDepth } from "./faq-types";
import { CATEGORIAS, SEED_NODES } from "./faq-seed";
import {
  addNode,
  depthOf as treeDepthOf,
  findNode,
  filterTreeByCategorias,
  filterTreeByTerm,
  getCategoriasDoNode,
  hasCategoria,
  makeNode,
  moveBlocoIn,
  nodeMatchCategoria,
  removeNode,
  renameNode,
  setCategoriaIdsOf,
  updateBlocosOf,
} from "./faq-tree";

type DateFilter = "todos" | "hoje" | "7d" | "30d" | "90d" | "custom";

type FaqContextValue = {
  /** Árvore completa de FaqNodes (Temas → Guias → Assuntos). */
  guias: FaqNode[];
  categorias: Categoria[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  selected: FaqNode | null;

  /** Busca no conteúdo do documento (Ctrl+F). */
  search: string;
  setSearch: (v: string) => void;
  searchIndex: number;
  setSearchIndex: (n: number) => void;
  searchTotal: number;
  setSearchTotal: (n: number) => void;

  /** Filtros aplicados na sidebar. */
  categoriasFiltro: string[];
  toggleCategoriaFiltro: (id: string) => void;
  clearCategoriasFiltro: () => void;
  dateFiltro: DateFilter;
  setDateFiltro: (v: DateFilter) => void;

  /** Mutações na árvore. */
  addGuia: (parentId: string | null, nome: string) => void;
  renameGuia: (id: string, nome: string) => void;
  deleteGuia: (id: string) => void;
  depthOf: (id: string) => number;
  updateBlocos: (nodeId: string, blocos: Bloco[]) => void;
  moveBloco: (nodeId: string, fromIndex: number, toIndex: number) => void;

  /** Categorias. */
  addCategoria: (nome: string, cor?: string) => Categoria;
  /** Substitui as categorias do nó (recebe lista completa de Categoria). */
  setGuiaCategorias: (nodeId: string, categorias: Categoria[]) => void;
  /** Substitui apenas os IDs de categoria de um nó. */
  setNodeCategoriaIds: (nodeId: string, ids: string[]) => void;
  /** Resolve os objetos Categoria a partir dos IDs de um nó. */
  resolveCategorias: (node: FaqNode) => Categoria[];
  /** Helpers de checagem. */
  hasCategoria: (node: FaqNode, categoriaId: string) => boolean;
  nodeMatchCategoria: (node: FaqNode, ids: string[]) => boolean;
};

const FaqCtx = createContext<FaqContextValue | null>(null);

const newId = (prefix = "n") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export function FaqProvider({ children }: { children: ReactNode }) {
  const [guias, setGuias] = useState<FaqNode[]>(SEED_NODES);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS);
  const [selectedId, setSelectedId] = useState<string>("g1-1");
  const [search, setSearchRaw] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const [searchTotal, setSearchTotal] = useState(0);
  const [categoriasFiltro, setCategoriasFiltro] = useState<string[]>([]);
  const [dateFiltro, setDateFiltro] = useState<DateFilter>("todos");

  const selected = useMemo(() => findNode(guias, selectedId), [guias, selectedId]);

  const setSearch = (v: string) => {
    setSearchRaw(v);
    setSearchIndex(0);
  };

  const depthOf = useCallback((id: string) => treeDepthOf(guias, id), [guias]);

  const resolveCategorias = useCallback(
    (node: FaqNode) => getCategoriasDoNode(node, categorias),
    [categorias],
  );

  const value: FaqContextValue = {
    guias,
    categorias,
    selectedId,
    setSelectedId,
    selected,
    search,
    setSearch,
    searchIndex,
    setSearchIndex,
    searchTotal,
    setSearchTotal,
    categoriasFiltro,
    toggleCategoriaFiltro: (id) =>
      setCategoriasFiltro((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    clearCategoriasFiltro: () => setCategoriasFiltro([]),
    dateFiltro,
    setDateFiltro,

    addGuia: (parentId, nome) => {
      const parentDepth = parentId ? treeDepthOf(guias, parentId) : -1;
      const tipo = tipoForDepth(parentDepth + 1);
      const novo = makeNode({
        id: newId("g"),
        nome,
        tipo,
        updatedAt: new Date().toISOString(),
      });
      setGuias((prev) => addNode(prev, parentId, novo));
      setSelectedId(novo.id);
    },
    renameGuia: (id, nome) => setGuias((prev) => renameNode(prev, id, nome)),
    deleteGuia: (id) => setGuias((prev) => removeNode(prev, id)),
    depthOf,
    updateBlocos: (nodeId, blocos) =>
      setGuias((prev) => updateBlocosOf(prev, nodeId, blocos, "Você")),
    moveBloco: (nodeId, fromIndex, toIndex) =>
      setGuias((prev) => moveBlocoIn(prev, nodeId, fromIndex, toIndex, "Você")),

    addCategoria: (nome, cor) => {
      const nova: Categoria = {
        id: `c-${Date.now()}`,
        nome,
        cor: cor || CATEGORIA_COR_PADRAO,
      };
      setCategorias((prev) => [...prev, nova]);
      return nova;
    },
    setGuiaCategorias: (nodeId, cats) =>
      setGuias((prev) => setCategoriaIdsOf(prev, nodeId, cats.map((c) => c.id))),
    setNodeCategoriaIds: (nodeId, ids) =>
      setGuias((prev) => setCategoriaIdsOf(prev, nodeId, ids)),
    resolveCategorias,
    hasCategoria,
    nodeMatchCategoria,
  };

  return <FaqCtx.Provider value={value}>{children}</FaqCtx.Provider>;
}

export function useFaq() {
  const ctx = useContext(FaqCtx);
  if (!ctx) throw new Error("useFaq must be used inside FaqProvider");
  return ctx;
}

/**
 * Backwards-compatible: verdadeiro se o nó ou algum descendente tem ao menos
 * uma das categorias informadas (por ID).
 */
export function guiaMatchAnyCategoria(g: Guia, ids: string[]): boolean {
  return nodeMatchCategoria(g, ids);
}

/** Texto pesquisável agregado de um nó (não inclui descendentes). */
export function guiaSearchableText(g: FaqNode): string {
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

export { filterTreeByCategorias, filterTreeByTerm };
