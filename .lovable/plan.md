## Plano de ajustes — Documento FAQ

Mantém todo o layout atual (Material UI, topbar, sidebar, documento central, botões e modal de categoria). Os pontos abaixo são apenas adições/refinos incrementais.

### 1. Tipos e store (`src/lib/faq-types.ts`, `src/lib/faq-store.tsx`)

- Adicionar novos blocos:
  - `BlocoContexto { tipo: "contexto", id, conteudo }`
  - `BlocoVideo { tipo: "video", id, url, titulo, descricao }`
  - `BlocoInstrucao` passa a ter `itens: InstrucaoItem[]` (lista numerada). Manter `conteudo` opcional para retrocompatibilidade ao migrar seeds.
- Atualizar união `Bloco` e o seed em `faq-seed.ts` para os novos campos.
- Store ganha:
  - `depthOf(id)` helper (limitar criação ao máximo 3 níveis).
  - `moveBloco(guiaId, fromIndex, toIndex)`.
  - `DateFilter` ganha valor `"90d"`.

### 2. Sidebar — 3 níveis, busca e ações por nível (`FaqSidebar.tsx`)

- Adicionar `Input` "Buscar guia..." no topo (estado local, não usa `search` global).
- Filtrar a árvore mantendo os pais visíveis/expandidos quando um descendente bate o termo.
- `TreeNode` recebe `depth`. Quando `depth >= 2` (3º nível), o menu de ações esconde a opção "Nova subguia".
- Menu de ações por nível: Renomear, Nova subguia (até depth 2), Vincular categoria (abre `VincularCategoriaDialog`), Excluir.
- Indentação progressiva já existe; manter destaque azul (`primary-soft`) e cheveron de expandir.
- Seed (`faq-seed.ts`) ganha um exemplo com 3 níveis para validação manual.

### 3. Topbar — placeholder e filtro de data (`FaqTopbar.tsx`)

- Placeholder da busca: `Buscar no texto do FAQ`.
- Select de data renomeado para "Data de ajuste" com opções: Qualquer data, Atualizados hoje, Atualizados nos últimos 7/30/90 dias, Personalizado.
- Botão Filtrar permanece (já compõe os três filtros).
- A busca global continua agindo sobre conteúdo dos blocos (texto, contexto, instruções, observação, legendas, descrição de vídeo). Implementar matcher novo em `faq-store.tsx` usado pela sidebar/chat de listagem existente.

### 4. Dropdown "Adicionar bloco" (`DocumentoView.tsx`)

Ordem: Texto · Contexto · Imagem · Vídeo · Instrução · Observação. Ícones lucide simples (`FileText`, `Quote`, `Image`, `Video`, `ListOrdered`, `AlertCircle`).

### 5. Reordenar blocos (`DocumentoView.tsx`)

- Botões discretos ▲ ▼ no canto do bloco em modo edição (aparecem no hover, ao lado do botão remover). Chamam `moveBloco` no store.
- Sem dependência nova; nada de drag-and-drop para evitar refator.

### 6. Blocos com cabeçalho fixo

Cada bloco em edição renderiza um título fixo não editável + textarea para o conteúdo do usuário:

- `BlocoContexto.tsx` (novo): "Contexto: Este parágrafo de contexto explica a situação..."
- `BlocoObservacao.tsx` (ajuste): "Observação: Esta observação é uma informação importante..."
- `BlocoInstrucao.tsx` (refeito): "Instrução: Siga as etapas abaixo para orientar corretamente o usuário:" + lista de itens com numeração `1º, 2º, 3º...` à esquerda, textarea por item, botão remover e botão "Adicionar instrução". Renumera automaticamente.

### 7. Bloco de Imagem — numeração visível nas instruções (`BlocoImagem.tsx`)

- Cada campo em "Instruções da imagem" ganha o badge `1º/2º/3º...` ao lado do input.
- Ao adicionar/remover, renumerar (ordem continua amarrada à ordem dos marcadores).
- Mantém "Gerar instruções com IA" e "Adicionar instrução".

### 8. Novo bloco de Vídeo (`blocos/BlocoVideo.tsx`)

- Campos: URL (aceita YouTube/Vimeo/embed), Título (input curto), Descrição (textarea).
- Preview embedado em `<iframe>` ocupando a mesma largura/altura usada para a imagem (`max-h-[480px] w-full rounded-md`). Conversor simples para URLs do YouTube em `https://www.youtube.com/embed/{id}`.
- Após salvar (DocumentoSalvo): iframe + legenda (`<figcaption>` em cinza itálico) com título e descrição, no mesmo padrão da legenda da imagem.

### 9. Documento salvo como texto contínuo copiável (`DocumentoSalvo.tsx`)

Reescrever o componente para emitir um `<article>` contínuo, sem cards/bordas/dividers entre blocos, com selectable text e sem ícones decorativos:

- `texto` → parágrafos simples.
- `contexto` → parágrafo iniciado por "Contexto: ..." (texto fixo) seguido do conteúdo do usuário, tudo no fluxo.
- `instrucao` → "Instrução: Siga as etapas abaixo..." + lista numerada `1º Acesse...`, renderizada como linhas de texto (sem `<ol>` visual de formulário).
- `observacao` → "Observação: ..." + conteúdo em parágrafo único.
- `imagem` → `<img>` seguido por legenda em itálico cinza com Imagem/Interface/instruções numeradas.
- `video` → `<iframe>` seguido por título + descrição em itálico cinza.
- Espaçamento consistente entre blocos via `space-y-4` no `<article>`; nada de borders/shadows.
- O wrapper externo em `DocumentoView` (rounded-2xl border bg-card) continua existindo só como moldura da página — o conteúdo interno do documento salvo é puro texto/imagens/vídeos, permitindo Ctrl+A e cópia em ordem lógica.

### 10. Itens não tocados

- Modal `VincularCategoriaDialog`, Chat FAQ, marcadores SVG/Rect e geração com IA da imagem, botões Editar/Publicar/Salvar — sem mudanças.

### Arquivos afetados

- Editar: `src/lib/faq-types.ts`, `src/lib/faq-store.tsx`, `src/lib/faq-seed.ts`, `src/components/faq/FaqSidebar.tsx`, `src/components/faq/FaqTopbar.tsx`, `src/components/faq/DocumentoView.tsx`, `src/components/faq/DocumentoSalvo.tsx`, `src/components/faq/blocos/BlocoInstrucao.tsx`, `src/components/faq/blocos/BlocoObservacao.tsx`, `src/components/faq/blocos/BlocoImagem.tsx`.
- Criar: `src/components/faq/blocos/BlocoContexto.tsx`, `src/components/faq/blocos/BlocoVideo.tsx`.

### Validação manual coberta

Criar guias até 3 níveis, busca lateral expandindo pais, busca global por texto, filtros combinados, adicionar todos os 6 tipos de bloco, instruções numeradas (bloco e imagem), reorder com ▲▼, salvar e Ctrl+A copiar o texto contínuo.
