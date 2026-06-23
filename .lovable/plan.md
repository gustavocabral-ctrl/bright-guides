## Ajuste no bloco de edição de imagem

Reorganizar o layout do `BlocoImagem` (modo edição) para dar mais destaque à imagem e mover a legenda para baixo.

### Mudanças

1. **Layout vertical em vez de grid lateral**
   - Remover o `grid lg:grid-cols-[1fr_280px]` que coloca a legenda à direita.
   - A imagem ocupa toda a largura disponível do bloco (full width).
   - A legenda "LEGENDA — ARRASTE PARA A IMAGEM" passa para baixo da imagem.

2. **Imagem maior**
   - Aumentar a altura máxima do preview de `max-h-[520px]` para algo como `max-h-[720px]`, mantendo `object-contain`.
   - O wrapper da imagem usa `w-full` (já é, mas agora sem competir com a coluna lateral de 280px).

3. **Legenda em formato horizontal abaixo**
   - Card único `rounded-lg border bg-card p-4` abaixo da imagem.
   - Título "Legenda — arraste para a imagem" no topo.
   - Itens dispostos em grid responsivo (`grid sm:grid-cols-2 lg:grid-cols-4 gap-3`) em vez de lista vertical, para aproveitar a largura.
   - Cada item mantém o preview da forma + label + descrição, ainda `draggable`.

4. **Sem mudança funcional**
   - Drag-and-drop, marcadores, instruções, metadados e botões permanecem iguais.
   - Apenas reposicionamento visual dentro do `BlocoImagem.tsx`.

### Arquivo afetado
- `src/components/faq/blocos/BlocoImagem.tsx`
