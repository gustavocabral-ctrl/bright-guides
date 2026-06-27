# Categorias coloridas + filtro lateral + busca tipo Ctrl+F

## 1) Categorias com cor

**`src/lib/faq-types.ts`** — adicionar `cor: string` (hex) em `Categoria`. Exportar constante `CATEGORIA_CORES` com 9 cores (Azul `#2563eb`, Verde `#16a34a`, Roxo `#7c3aed`, Amarelo `#eab308`, Laranja `#ea580c`, Vermelho `#dc2626`, Rosa `#db2777`, Cinza `#64748b`, Marrom `#854d0e`). Cor padrão = Cinza.

**`src/lib/faq-seed.ts`** — atribuir uma cor a cada categoria inicial.

**`src/lib/faq-store.tsx`**
- `addCategoria(nome, cor)` aceita cor (default cinza).
- Substituir `categoriaFiltro: string` por `categoriasFiltro: string[]` (múltipla seleção). Manter compat: remover usos antigos.
- Helper `guiaMatchCategorias(guia, ids)`: retorna true se o guia ou qualquer descendente tem alguma das categorias selecionadas.

## 2) Modal "Adicionar categoria" (novo)

**`src/components/faq/AdicionarCategoriaDialog.tsx`** (novo)
- Título: "Adicionar categoria".
- Campos: Nome (input) + Cor (grid de swatches clicáveis com tick na escolhida).
- Botões: Cancelar / Salvar categoria. Chama `addCategoria`.

## 3) `VincularCategoriaDialog` — incrementos

- Mostrar bolinha colorida (cor da categoria) antes do nome em cada linha.
- Bloco "Incluir categoria" passa a ter campo nome + paleta de cores. Usa `addCategoria(nome, cor)` e auto-seleciona.

## 4) Sidebar — botão Categoria, filtro checklist, hover labels

**`src/components/faq/FaqSidebar.tsx`**
- Abaixo da busca, adicionar botão `+ Categoria` que abre `AdicionarCategoriaDialog`.
- Abaixo, seção "Filtrar por categoria" (collapsible):
  - Lista de checkboxes com bolinha colorida + nome.
  - Link "Limpar categorias" quando há seleção.
- A árvore aplica `categoriasFiltro` além do termo de busca: mantém um nó visível se ele ou um descendente atende ao filtro; pais do match continuam visíveis.
- Mensagem "Nenhum item encontrado para os filtros selecionados." quando o filtro zera a árvore.
- Em cada `TreeNode`, envolver o item com `Tooltip` (shadcn) que exibe as labels coloridas do item ao passar o mouse — só renderiza tooltip quando há categorias; caso contrário "Sem categoria" discreto.

## 5) Topbar — remover filtro de categoria, adicionar nav da busca

**`src/components/faq/FaqTopbar.tsx`**
- Remover o `<Select>` de categoria.
- Manter "Buscar no texto do FAQ", filtro de data e "Filtrar".
- Ao lado da busca: contador `n de N` e setas ↑/↓ (próx/ant). Enter = próximo.
- Estado da busca + navegação fica em `faq-store` (`search`, `searchIndex`, `setSearchIndex`, `searchTotal`, `setSearchTotal`) para coordenar topbar ↔ `DocumentoSalvo`.

## 6) Busca tipo Ctrl+F no `DocumentoSalvo`

**`src/components/faq/DocumentoSalvo.tsx`**
- Após render, varrer os nós de texto dentro do `<article>` e:
  - Substituir trechos casados por `<mark>` (normalização: lowercase + remoção de acentos via `String.normalize('NFD').replace(/\p{Diacritic}/gu,'')`).
  - Atribuir `data-hit-index` em ordem.
  - Estilo: hit comum `bg-yellow-200/70`; hit ativo `bg-amber-400 ring-2 ring-amber-600 rounded-sm`.
- Reportar `total` ao store via efeito e ler `searchIndex` para aplicar destaque ativo + `scrollIntoView({ block: 'center' })`.
- Implementação: hook `useSearchHighlight(containerRef, term, activeIndex, onTotal)` que reaplica destaque quando `term`/conteúdo mudam (limpeza idempotente: remover `<mark>` antes de re-aplicar; usar `TreeWalker` para coletar text nodes).
- Wrapper relativo (`relative`) no container do documento para colocar a barra de marcadores.

## 7) Barra de marcadores de rolagem

**`src/components/faq/SearchScrollMarkers.tsx`** (novo)
- Faixa vertical fina (`w-2`) absoluta na borda direita do container rolável da página do documento.
- Para cada `<mark>` encontrado, calcula `top% = (offsetTopRelativoAoContainer / scrollHeight) * 100` e renderiza pontinho. Ativo = cor mais forte; demais = amarelo translúcido. Clique → scroll até o hit correspondente e atualiza `searchIndex`.
- Recalcula em `resize`, mudança de `search`, mudança de blocos.
- Esconde quando `total === 0` ou `search` vazio.

## 8) Onde a busca procura

A busca varre apenas o DOM renderizado dentro do `<article>` do `DocumentoSalvo` (cobre título — vou incluir o `<h1>` do documento no container alvo —, texto, contexto, instrução, observação, nome/interface/instruções da imagem, título/descrição do vídeo). Modo edição não recebe highlight nesta entrega (prioridade é o modo salvo conforme briefing).

## 9) Hierarquia preservada

Sem mudança em TEMA/GUIA/ASSUNTO, ícones, criação. Filtro de categoria atua em qualquer nível.

## Arquivos

Editar: `faq-types.ts`, `faq-seed.ts`, `faq-store.tsx`, `FaqSidebar.tsx`, `FaqTopbar.tsx`, `VincularCategoriaDialog.tsx`, `DocumentoSalvo.tsx`, `DocumentoView.tsx` (envolver com ref para a barra de marcadores e expor `articleRef`).
Criar: `AdicionarCategoriaDialog.tsx`, `SearchScrollMarkers.tsx`, `hooks/useSearchHighlight.ts`.

## Fora de escopo

Edição rica dentro do modo edição (highlight só no modo salvo), persistência server-side, e mudanças em store/blocos não citados.
