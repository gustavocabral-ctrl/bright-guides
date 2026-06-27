# Ajustes incrementais — Documento FAQ

Preserva todo o restante (Material UI, blocos existentes, instruções numeradas, IA, busca topbar, marcadores de scroll, modais de categoria).

## 1) Hierarquia formal TEMA > GUIA > ASSUNTO

**`src/lib/faq-types.ts`**
- Adicionar helper `nivelLabel(depth)` → `"Tema" | "Guia" | "Assunto"`.
- Definir `BLOCOS_POR_NIVEL`:
  - Tema/Guia: `["texto","contexto","observacao"]`
  - Assunto: `["texto","contexto","imagem","video","instrucao","observacao"]`

**`src/lib/faq-store.tsx`**
- Já existe `depthOf(id)`. Expor `nivelDoSelecionado` derivado.

**`FaqSidebar.tsx`** (já parcialmente correto)
- Ícones já corretos: livro/pasta/documento.
- Manter regra: botão `+` topo cria Tema; `+` ao lado de Tema cria Guia; `+` ao lado de Guia cria Assunto; Assunto não exibe `+` (já controlado por `canAddChild = depth < MAX_DEPTH`).
- Trocar tooltip do botão topo para "Novo Tema" (já está) e prompts dinâmicos com `LEVEL_LABEL`.

## 2) Dropdown "Adicionar bloco" restrito por nível

**`DocumentoView.tsx`**
- Calcular `nivel = depthOf(selected.id)`.
- Filtrar itens do `DropdownMenuContent` segundo `BLOCOS_POR_NIVEL[nivel]`.
- Em `addBloco`, validar tipo permitido (defensivo).

## 3) Visualização consolidada (Tema/Guia) e isolada (Assunto)

**Novo componente `DocumentoConsolidado.tsx`** (ou função dentro de `DocumentoSalvo`)
- Recebe `guia: Guia` e `nivel: number`.
- Renderiza recursivamente como **documento contínuo** (sem cards/caixas):
  - Cabeçalho leve por nível: `h1` (Tema), `h2` (Guia), `h3` (Assunto), apenas com tipografia — sem bordas/fundos.
  - Conteúdo do próprio nó via `<DocumentoSalvo blocos={...} />` reaproveitado.
  - Em seguida itera `filhos` recursivamente.
- Ordem segue a árvore. Selecionável com Ctrl+A (sem `user-select-none`).

**`DocumentoView.tsx` modo leitura**
- Se `nivel === 2` (Assunto): renderiza apenas `<DocumentoSalvo blocos={selected.blocos} />` (comportamento atual, sem herança visual).
- Se `nivel < 2`: renderiza `<DocumentoConsolidado guia={selected} nivel={nivel} />`.

**Modo edição**: continua editando apenas os blocos do nó selecionado (Tema/Guia editam só Texto/Contexto/Observação; Assunto edita tudo). Não muda lógica de blocos.

**Estados vazios** (somente em modo leitura):
- Tema sem filhos e sem blocos → "Este tema ainda não possui guias ou assuntos cadastrados."
- Guia sem filhos e sem blocos → "Esta guia ainda não possui assuntos cadastrados."
- Assunto sem blocos → texto já existente do `EmptyDocumento` adaptado.

## 4) Filtro de categoria como dropdown multi-select na sidebar

**`FaqSidebar.tsx`**
- Remover bloco "Filtrar por categoria" sempre-visível.
- Adicionar logo abaixo do input "Buscar guia..." um `Popover` com trigger estilo Material:
  - Fechado: "Filtrar por categoria" | "1 categoria selecionada" | "N categorias selecionadas".
  - Aberto: input de busca de categoria, lista com `Checkbox` + bolinha colorida + nome, e link "Limpar categorias" no rodapé.
- Lógica de filtragem `filterTreeByCategorias` já mantém pais visíveis (recursivo) — manter.

## 5) Pontinhos coloridos ao lado de cada item da árvore

**`FaqSidebar.tsx` / `TreeNode`**
- Após o nome, antes dos botões de ação, renderizar `<CategoriaDots categorias={guia.categorias} />`:
  - até 3 pontos (h-1.5 w-1.5, cor da categoria).
  - se `length > 3`: 3 pontos + texto `+N` em `text-[10px] text-muted-foreground`.
  - se zero: nada.
- Hover nos pontos: `Popover`/`Tooltip` listando nomes com bolinha colorida. Reaproveitar `Tooltip` já envolvente do nó, mas adicionar tooltip dedicado nos dots para o caso de listar nomes com cor (o tooltip do nó já mostra chips — manter).

## 6) Busca topbar respeitando visão atual

Já funciona via `useSearchHighlight` lendo o DOM de `DocumentoSalvo`. Como o `DocumentoConsolidado` reusará `DocumentoSalvo` em cascata, o highlight precisará varrer o container raiz.

**`DocumentoSalvo.tsx` + `useSearchHighlight`**
- Permitir múltiplas instâncias: mover `SearchScrollMarkers` e o hook para o componente pai (`DocumentoView`) operando sobre um único `ref` que envolve toda a área de leitura (consolidada ou isolada).
- Criar `<DocumentoReadRoot>` wrapper em `DocumentoView` que contém o `ref` e renderiza `SearchScrollMarkers` + conteúdo (consolidado/isolado). `DocumentoSalvo` deixa de instanciar o hook/marcadores; vira render puro.

Resultado: busca destaca somente o conteúdo atualmente visível (Tema/Guia consolidado ou Assunto isolado), com contador, navegação e marcadores na barra lateral.

## 7) Preservações explícitas

Não mexer em: BlocoImagem (numeração/IA), BlocoInstrucao, BlocoVideo, BlocoContexto, BlocoObservacao, VincularCategoriaDialog, AdicionarCategoriaDialog, paleta de cores, store de categorias, topbar (apenas leitura), chat.

## Arquivos

- Editar: `src/lib/faq-types.ts`, `src/lib/faq-store.tsx`, `src/components/faq/FaqSidebar.tsx`, `src/components/faq/DocumentoView.tsx`, `src/components/faq/DocumentoSalvo.tsx`, `src/hooks/useSearchHighlight.ts` (apenas garantir aceite de ref externa — já aceita).
- Criar: `src/components/faq/DocumentoConsolidado.tsx`, `src/components/faq/CategoriaDots.tsx`, `src/components/faq/FiltroCategoriaDropdown.tsx`.

## Validação manual (após build)

Criar Tema → Guia → Assunto; editar Texto/Contexto/Observação em cada nível; clicar Tema vê consolidado; clicar Guia vê Guia + Assuntos; clicar Assunto vê isolado; Ctrl+A copia contínuo; dropdown adicionar bloco respeita nível; filtro categoria dropdown multi-select com busca e Limpar; pontinhos com tooltip; busca topbar destaca só o visível com marcadores.
