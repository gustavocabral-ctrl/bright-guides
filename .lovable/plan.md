
# Sistema de FAQ / Documentação Interna

Construir uma SPA estática (sem backend nesta primeira versão) com layout de painel administrativo profissional inspirado no índice do Google Docs, usando React + TanStack Start + Tailwind + shadcn/ui. Todo o estado vive em memória (Zustand ou `useState` no root da página) e imagens em base64/object URL — sem persistência. Quando o usuário pedir salvar/publicar de verdade, ativamos Lovable Cloud.

## Layout geral

Grid de 3 áreas:

```text
┌──────────────┬──────────────────────────────────────────┐
│              │  Topbar: busca | filtros | Chat|Doc      │
│  Sidebar     ├──────────────────────────────────────────┤
│  (guias)     │                                          │
│              │   Folha branca (documento) ou Chat       │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

- Fundo geral `bg-muted` (cinza claro), sidebar branca, documento branco com `rounded-2xl shadow-sm`.
- Azul primário para item selecionado, botão ativo e filtros aplicados.

## Rotas

- `/` → redireciona para `/faq`
- `/faq` → tela principal (documento)
- `/faq/chat` → mesma shell, conteúdo central vira chat

Sidebar e topbar ficam num layout `routes/faq.tsx` com `<Outlet />`; `faq.index.tsx` = documento, `faq.chat.tsx` = chat.

## Sidebar (menu lateral esquerdo)

Componente `FaqSidebar`:
- Cabeçalho: título "Guias do documento" + botão `+` (Tooltip "Nova guia").
- Árvore hierárquica recursiva (Guia → Subguia → Categorias) com `Collapsible` do shadcn:
  - Chevron expandir/recolher
  - Ícone do item (FileText / Folder)
  - Nome
  - Menu `…` (DropdownMenu) com: Renomear, Nova subguia, Associar categoria, Excluir
- Item selecionado: fundo `bg-primary/10`, texto `text-primary`, borda esquerda azul.
- Dados-semente coerentes com o exemplo (FAQ Operacional → Cadastro de Estabelecimento, Usuários, Pagamentos; Tabela de Estacionamento → Simples/Pernoite/Especial; Convênio Estacionamento → Criar Convênio, Vincular Cliente).

Modelo de dados em memória:

```ts
type Categoria = { id: string; nome: string };
type Guia = {
  id: string;
  nome: string;
  categorias: Categoria[];
  filhos: Guia[];
  blocos: Bloco[];
  updatedAt: string;
  updatedBy: string;
};
```

## Topbar

`FaqTopbar`:
- Esquerda: Input com ícone de busca ("Buscar no FAQ"), Select de categoria, Select de data de update (Hoje / 7d / 30d / Personalizado → abre Popover com Calendar range).
- Direita: ToggleGroup com dois botões "Chat FAQ" e "Documento FAQ" (Documento ativo por padrão; alterna rota).
- Filtros aplicados aparecem como `Badge` removível abaixo da barra.

## Área do documento

`DocumentoView`:
- Cabeçalho do documento: título da guia selecionada (editável inline ao clicar), e linha de metadados (Categoria badges, "Atualizado em …", "por …").
- Lista de blocos renderizados em ordem; cada bloco editável e removível (handle de arrastar visual, sem DnD funcional nesta versão).
- Estado vazio: card centralizado com mensagem "Nenhum conteúdo adicionado nesta guia ainda. Clique em 'Adicionar bloco' para começar." + botão.

Tipos de bloco:

```ts
type Bloco =
  | { tipo: 'texto'; id: string; conteudo: string }
  | { tipo: 'imagem'; id: string; src?: string; nome: string; interface: 'Aplicativo' | 'Site Administrativo'; instrucoes: string }
  | { tipo: 'instrucao'; id: string; conteudo: string }
  | { tipo: 'observacao'; id: string; conteudo: string };
```

- **Bloco texto**: `Textarea` auto-grow, placeholder "Digite aqui a explicação ou instrução deste FAQ...".
- **Bloco imagem**: dropzone (drag&drop + botão "Selecionar imagem"), preview após upload, e abaixo três campos: Nome da imagem, Select tipo de interface (Aplicativo / Site Administrativo), Textarea de instruções.
- **Bloco instrução**: card com borda azul à esquerda + ícone Info.
- **Bloco observação**: card amarelo suave com ícone AlertCircle.

Botão "Adicionar bloco" abre `DropdownMenu` com os 4 tipos.

Rodapé do documento (sticky no fim): `Cancelar` (ghost) · `Adicionar bloco` (outline) · `Publicar FAQ` (outline) · `Salvar alterações` (primary, default).

## Chat FAQ (`/faq/chat`)

Tela simples nesta versão visual:
- Lista de mensagens (usuário/assistente) baseada em mock local.
- Input inferior "Pergunte ao FAQ…" com botão enviar.
- Sem backend; respostas mock indicam de qual guia viriam.

## Componentes a criar

```
src/routes/faq.tsx                (layout: sidebar + topbar + <Outlet/>)
src/routes/faq.index.tsx          (DocumentoView)
src/routes/faq.chat.tsx           (ChatView)
src/components/faq/FaqSidebar.tsx
src/components/faq/SidebarTree.tsx
src/components/faq/FaqTopbar.tsx
src/components/faq/DocumentoView.tsx
src/components/faq/EmptyDocumento.tsx
src/components/faq/blocos/BlocoTexto.tsx
src/components/faq/blocos/BlocoImagem.tsx
src/components/faq/blocos/BlocoInstrucao.tsx
src/components/faq/blocos/BlocoObservacao.tsx
src/components/faq/ChatView.tsx
src/store/faq-store.ts            (Zustand com guias, seleção, filtros)
src/lib/faq-seed.ts               (dados de exemplo)
```

Index redireciona para `/faq`.

## Detalhes técnicos

- Shadcn já instalado: usar `Button`, `Input`, `Textarea`, `Select`, `DropdownMenu`, `Collapsible`, `Popover`, `Calendar`, `Badge`, `Tooltip`, `Card`, `ToggleGroup`, `ScrollArea`, `Separator`.
- Upload: input `type=file accept="image/*"` + `URL.createObjectURL` para preview (apenas client-side).
- Tokens de cor: usar variáveis semânticas em `src/styles.css` (não hardcodar). Manter `--primary` azul; adicionar `--surface` para o "papel" se necessário.
- Sidebar com largura fixa 280px; responsivo: em telas <md vira `Sheet` com botão de menu na topbar.

## Fora de escopo nesta entrega

- Persistência real (banco), autenticação, IA do chat, edição rica WYSIWYG, drag-and-drop de blocos funcional, e publicação. Tudo isso fica como próximos passos (Lovable Cloud + Lovable AI Gateway) quando solicitado.
