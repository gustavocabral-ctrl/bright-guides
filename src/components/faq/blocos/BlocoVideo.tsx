import { Video as VideoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlocoVideo as BlocoVideoT } from "@/lib/faq-types";

/** Converts common video URLs to an embeddable src. Accepts already-embedded
 *  URLs, raw YouTube/Vimeo links, or pasted `<iframe>` code. */
export function toEmbedSrc(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Pasted <iframe src="...">
  const iframeMatch = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframeMatch) return iframeMatch[1];
  try {
    const url = new URL(trimmed);
    // YouTube
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) return trimmed;
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (url.hostname.includes("vimeo.com") && !url.pathname.startsWith("/video/")) {
      const id = url.pathname.replace(/^\//, "");
      if (/^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

export function BlocoVideo({
  bloco,
  onChange,
}: {
  bloco: BlocoVideoT;
  onChange: (patch: Partial<BlocoVideoT>) => void;
}) {
  const embedSrc = toEmbedSrc(bloco.url);

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">URL do vídeo ou código embed</Label>
          <Input
            value={bloco.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... ou <iframe src=...>"
          />
        </div>

        {embedSrc ? (
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9", maxHeight: 480 }}>
              <iframe
                src={embedSrc}
                title={bloco.titulo || "Vídeo"}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card text-center">
            <VideoIcon className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Informe a URL do vídeo para visualizar o preview.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Título do vídeo</Label>
            <Input
              value={bloco.titulo}
              onChange={(e) => onChange({ titulo: e.target.value })}
              placeholder="Ex: Como cadastrar estabelecimento"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium">Descrição do vídeo</Label>
            <Textarea
              value={bloco.descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
              placeholder="Escreva uma breve descrição do conteúdo do vídeo..."
              className="min-h-[80px] resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
