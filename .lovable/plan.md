# Ajustes incrementais — Documento FAQ

## 1) Hierarquia do menu lateral (TEMA → GUIA → ASSUNTO)

**`src/components/faq/FaqSidebar.tsx`**
- Renomear semanticamente os 3 níveis pela profundidade:
  - depth 0 → **TEMA** (ícone `BookOpen`)
  - depth 1 → **GUIA** (ícone `Folder`)
  - depth 2 → **ASSUNTO** (ícone `FileText`)
- Substituir a lógica atual (`Folder` se tem filhos, senão `FileText`) por escolha de ícone baseada em `depth`.
- Botão `+` inline visível ao hover ao lado de cada item (além do menu de 3 pontos), apenas quando `depth < MAX_DEPTH`:
  - no TEMA → cria GUIA
  - na GUIA → cria ASSUNTO
- Botão `+` do topo continua criando TEMA. Tooltip atualizado: "Novo tema".
- Labels do prompt e do menu de 3 pontos atualizados:
  - depth 0 → "Nova guia"
  - depth 1 → "Novo assunto"
  - depth 2 → sem opção de criar filho
- Cabeçalho lateral: manter "Guias do documento" / "FAQ Jump Tecnologia" (não alterar visual geral). Apenas o tooltip do botão `+` muda para "Novo tema".
- Manter: expandir/recolher, recuo progressivo, destaque do selecionado, busca, renomear, excluir, vincular categoria.

**`src/lib/faq-types.ts`** — nenhuma mudança de tipo (a hierarquia já é genérica via `filhos` + `MAX_DEPTH = 2`). Apenas a UI ganha rótulos TEMA/GUIA/ASSUNTO.

## 2) Numeração ordenada nas instruções da imagem

**`src/components/faq/blocos/BlocoImagem.tsx`**
- A numeração já é derivada do índice (`instrucoesItens.map((_, i) => ...)`), garantindo reordenação automática ao remover.
- Ajustar o badge para o formato visual pedido — `1°`, `2°`, `3°`... — em destaque ao lado do campo da instrução (chip arredondado alinhado verticalmente ao topo do textarea).
- Manter botões "Gerar instruções com IA", "Adicionar instrução" e a vinculação 1:1 com os marcadores da imagem.

## 3) Layout dos blocos Contexto e Observação

**`src/components/faq/blocos/BlocoContexto.tsx` e `BlocoObservacao.tsx`**
- O texto fixo (`CONTEXTO_HEADER` / `OBSERVACAO_HEADER`) passa a aparecer **sozinho na linha de cima**, em **itálico**, **sem negrito** (`italic font-normal`), como um parágrafo cabeçalho.
- O campo editável fica claramente **abaixo**, como parágrafo independente (Textarea separado, com leve espaçamento `mt-2`).
- Manter a faixa colorida lateral e o ícone do bloco (visual Material UI atual), apenas reorganizando o conteúdo interno em duas linhas (cabeçalho em cima, conteúdo embaixo).
- Remover qualquer aparência de "título inline + conteúdo na mesma linha".

**`src/components/faq/DocumentoSalvo.tsx`**
- Garantir que, no documento salvo (texto contínuo), o cabeçalho fixo apareça em itálico, em uma linha, e o conteúdo do usuário em parágrafo separado abaixo — sem alterar o restante do fluxo já existente.

## 4) Preservação

Sem alterações em: topbar/busca/filtros, Chat FAQ / Documento FAQ, dropdown Adicionar bloco, demais blocos (Texto, Vídeo, Instrução), botões Editar/Publicar/Salvar, modal de categorias, store, seed, rotas.

## Arquivos

- Editar: `FaqSidebar.tsx`, `BlocoImagem.tsx`, `BlocoContexto.tsx`, `BlocoObservacao.tsx`, `DocumentoSalvo.tsx`.
- Sem novos arquivos. Sem mudanças em tipos ou store.
