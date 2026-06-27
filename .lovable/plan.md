# Corrigir numeração visual nas Instruções da imagem

Alterar exclusivamente o item da lista de instruções em `src/components/faq/blocos/BlocoImagem.tsx` (linhas ~614–645).

## Mudança

Substituir o badge circular colorido (com `backgroundColor` do marker) por um número simples em texto à esquerda do input, derivado do índice do `map`.

- Renderizar `{idx + 1}°` como `<span>` de texto simples (sem fundo, sem ring, sem cor de marcador).
- Largura fixa e alinhamento à direita para manter as linhas alinhadas (`w-8 text-right tabular-nums text-sm font-medium text-muted-foreground`).
- Aplicado a **todas** as instruções, vindas de marcação da imagem ou adicionadas manualmente.
- Manter intactos: input editável, botão `×` (`removeMarker`), botão "Adicionar instrução", botão "Gerar instruções com IA", placeholder e a lógica de marcações da imagem.

## Não alterar

- Badges numerados sobre a imagem (continuam coloridos).
- Demais blocos, store, tipos, sidebar, DocumentoSalvo.
