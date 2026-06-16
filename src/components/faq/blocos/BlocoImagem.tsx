import { useRef, useState } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlocoImagem as BlocoImagemT } from "@/lib/faq-types";
import { cn } from "@/lib/utils";

export function BlocoImagem({
  bloco,
  onChange,
}: {
  bloco: BlocoImagemT;
  onChange: (patch: Partial<BlocoImagemT>) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ src: url, nome: bloco.nome || file.name.replace(/\.[^.]+$/, "") });
  };

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card px-6 py-8 text-center transition-colors",
          dragOver ? "border-primary bg-[var(--primary-soft)]" : "border-border",
        )}
      >
        {bloco.src ? (
          <div className="w-full">
            <img
              src={bloco.src}
              alt={bloco.nome || "Preview"}
              className="mx-auto max-h-80 rounded-md border border-border object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="mr-1.5 h-4 w-4" /> Trocar imagem
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Arraste uma imagem aqui</p>
            <p className="mb-3 text-xs text-muted-foreground">PNG, JPG ou GIF até 10MB</p>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Selecionar imagem
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Nome da imagem</Label>
          <Input
            value={bloco.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            placeholder="Ex: Tela de cadastro de estabelecimento"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tipo de interface</Label>
          <Select
            value={bloco.interfaceTipo}
            onValueChange={(v) => onChange({ interfaceTipo: v as BlocoImagemT["interfaceTipo"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aplicativo">Aplicativo</SelectItem>
              <SelectItem value="Site Administrativo">Site Administrativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-medium">Instruções da imagem</Label>
          <Textarea
            value={bloco.instrucoes}
            onChange={(e) => onChange({ instrucoes: e.target.value })}
            placeholder="Descreva o que o usuário deve observar ou fazer nesta imagem..."
            className="min-h-[90px]"
          />
        </div>
      </div>
    </div>
  );
}
