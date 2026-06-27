/**
 * Helpers puros para manipular a árvore de FaqNodes.
 * Toda mutação retorna uma nova estrutura — facilita persistência futura
 * (Supabase/API) e mantém o store previsível.
 */
import type { Bloco, Categoria, FaqNode, FaqNodeTipo } from "./faq-types";
import { tipoForDepth } from "./faq-types";

// ---------- leitura ----------

export function findNode(nodes: FaqNode[], id: string): FaqNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const f = findNode(n.filhos, id);
    if (f) return f;
  }
  return null;
}

export function depthOf(nodes: FaqNode[], id: string, depth = 0): number {
  for (const n of nodes) {
    if (n.id === id) return depth;
    const d = depthOf(n.filhos, id, depth + 1);
    if (d >= 0) return d;
  }
  return -1;
}

export function findParent(nodes: FaqNode[], id: string): FaqNode | null {
  for (const n of nodes) {
    if (n.filhos.some((f) => f.id === id)) return n;
    const inner = findParent(n.filhos, id);
    if (inner) return inner;
  }
  return null;
}

// ---------- transformação ----------

export function mapTree(
  nodes: FaqNode[],
  fn: (n: FaqNode) => FaqNode,
): FaqNode[] {
  return nodes.map((n) => fn({ ...n, filhos: mapTree(n.filhos, fn) }));
}

export function removeNode(nodes: FaqNode[], id: string): FaqNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, filhos: removeNode(n.filhos, id) }));
}

export function addNode(
  nodes: FaqNode[],
  parentId: string | null,
  novo: FaqNode,
): FaqNode[] {
  if (parentId === null) return [...nodes, novo];
  return nodes.map((n) =>
    n.id === parentId
      ? { ...n, filhos: [...n.filhos, novo] }
      : { ...n, filhos: addNode(n.filhos, parentId, novo) },
  );
}

export function renameNode(
  nodes: FaqNode[],
  id: string,
  nome: string,
): FaqNode[] {
  return mapTree(nodes, (n) => (n.id === id ? { ...n, nome } : n));
}

export function updateBlocosOf(
  nodes: FaqNode[],
  id: string,
  blocos: Bloco[],
  updatedBy: string,
): FaqNode[] {
  return mapTree(nodes, (n) =>
    n.id === id
      ? { ...n, blocos, updatedAt: new Date().toISOString(), updatedBy }
      : n,
  );
}

export function moveBlocoIn(
  nodes: FaqNode[],
  nodeId: string,
  fromIndex: number,
  toIndex: number,
  updatedBy: string,
): FaqNode[] {
  return mapTree(nodes, (n) => {
    if (n.id !== nodeId) return n;
    const arr = [...n.blocos];
    if (
      fromIndex < 0 ||
      fromIndex >= arr.length ||
      toIndex < 0 ||
      toIndex >= arr.length
    )
      return n;
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    return {
      ...n,
      blocos: arr,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
  });
}

export function setCategoriaIdsOf(
  nodes: FaqNode[],
  id: string,
  categoriaIds: string[],
): FaqNode[] {
  return mapTree(nodes, (n) => (n.id === id ? { ...n, categoriaIds } : n));
}

// ---------- filtros ----------

export function filterTreeByTerm(nodes: FaqNode[], term: string): FaqNode[] {
  if (!term) return nodes;
  const t = term.toLowerCase();
  const walk = (list: FaqNode[]): FaqNode[] => {
    const out: FaqNode[] = [];
    for (const n of list) {
      const filhos = walk(n.filhos);
      if (n.nome.toLowerCase().includes(t) || filhos.length > 0) {
        out.push({ ...n, filhos });
      }
    }
    return out;
  };
  return walk(nodes);
}

export function nodeMatchCategoria(node: FaqNode, ids: string[]): boolean {
  if (ids.length === 0) return true;
  if (node.categoriaIds.some((c) => ids.includes(c))) return true;
  return node.filhos.some((f) => nodeMatchCategoria(f, ids));
}

export function filterTreeByCategorias(
  nodes: FaqNode[],
  ids: string[],
): FaqNode[] {
  if (ids.length === 0) return nodes;
  const walk = (list: FaqNode[]): FaqNode[] => {
    const out: FaqNode[] = [];
    for (const n of list) {
      if (!nodeMatchCategoria(n, ids)) continue;
      out.push({ ...n, filhos: walk(n.filhos) });
    }
    return out;
  };
  return walk(nodes);
}

// ---------- categorias ----------

export function getCategoriasDoNode(
  node: FaqNode,
  todas: Categoria[],
): Categoria[] {
  if (!node.categoriaIds.length) return [];
  const map = new Map(todas.map((c) => [c.id, c]));
  return node.categoriaIds.map((id) => map.get(id)).filter(Boolean) as Categoria[];
}

export function hasCategoria(node: FaqNode, categoriaId: string): boolean {
  return node.categoriaIds.includes(categoriaId);
}

// ---------- construção ----------

export function makeNode(input: {
  id: string;
  nome: string;
  tipo: FaqNodeTipo;
  categoriaIds?: string[];
  filhos?: FaqNode[];
  blocos?: Bloco[];
  updatedAt: string;
  updatedBy?: string;
}): FaqNode {
  return {
    id: input.id,
    tipo: input.tipo,
    nome: input.nome,
    categoriaIds: input.categoriaIds ?? [],
    filhos: input.filhos ?? [],
    blocos: input.blocos ?? [],
    updatedAt: input.updatedAt,
    updatedBy: input.updatedBy ?? "Você",
  };
}

export { tipoForDepth };
