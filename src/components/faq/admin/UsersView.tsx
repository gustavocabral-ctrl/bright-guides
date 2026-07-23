import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  USERS,
  RESPONSIBILITIES,
  PERMISSIONS,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "@/lib/admin-mock";

const ROLES: UserRole[] = [
  "Administrador",
  "Gestor",
  "Analista de qualidade",
  "Editor do FAQ",
  "Somente leitura",
];

export function UsersView() {
  const [users, setUsers] = useState<AdminUser[]>(USERS);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (roleFilter === "all" || u.role === roleFilter) &&
          (statusFilter === "all" || u.status === statusFilter) &&
          (u.name.toLowerCase().includes(q.toLowerCase()) ||
            u.email.toLowerCase().includes(q.toLowerCase())),
      ),
    [users, q, roleFilter, statusFilter],
  );

  const startNew = () => {
    setIsNew(true);
    setEditing({
      id: `u-${Date.now()}`,
      name: "",
      email: "",
      role: "Analista de qualidade",
      status: "ativo",
      responsibilities: [],
      permissions: [],
      lastAccess: "—",
    });
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.email.trim()) {
      toast.error("Preencha nome e e-mail.");
      return;
    }
    setUsers((prev) =>
      isNew ? [...prev, editing] : prev.map((u) => (u.id === editing.id ? editing : u)),
    );
    toast.success(isNew ? "Usuário criado." : "Usuário atualizado.");
    setEditing(null);
    setIsNew(false);
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: (u.status === "ativo" ? "inativo" : "ativo") as UserStatus }
          : u,
      ),
    );
  };

  const remove = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast("Usuário removido.");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-[var(--surface)] px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Usuários</h1>
          <p className="text-xs text-muted-foreground">
            Gerenciamento de acessos, responsabilidades e permissões.
          </p>
        </div>
        <Button size="sm" onClick={startNew}>
          <Plus className="mr-1 h-4 w-4" /> Novo usuário
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-border bg-[var(--surface)] px-6 py-3">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="h-9 w-64 text-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-9 w-52 text-sm">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-md border border-border bg-[var(--surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsabilidades</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.status === "ativo"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-50"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[260px]">
                    <div className="flex flex-wrap gap-1">
                      {u.responsibilities.slice(0, 2).map((r) => (
                        <Badge key={r} variant="secondary" className="text-[10px]">
                          {r}
                        </Badge>
                      ))}
                      {u.responsibilities.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{u.responsibilities.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.lastAccess}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditing(u);
                        setIsNew(false);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => toggleStatus(u.id)}
                    >
                      {u.status === "ativo" ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => remove(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && (setEditing(null), setIsNew(false))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNew ? "Novo usuário" : "Editar usuário"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">E-mail</Label>
                  <Input
                    type="email"
                    value={editing.email}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Função</Label>
                  <Select
                    value={editing.role}
                    onValueChange={(v) => setEditing({ ...editing, role: v as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={editing.status}
                    onValueChange={(v) => setEditing({ ...editing, status: v as UserStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Responsabilidades</Label>
                <div className="mt-1 grid grid-cols-2 gap-1.5 rounded-md border border-border p-2">
                  {RESPONSIBILITIES.map((r) => {
                    const checked = editing.responsibilities.includes(r);
                    return (
                      <label key={r} className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const set = new Set(editing.responsibilities);
                            v ? set.add(r) : set.delete(r);
                            setEditing({ ...editing, responsibilities: Array.from(set) });
                          }}
                        />
                        {r}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-xs">Matriz de permissões</Label>
                <div className="mt-1 grid grid-cols-2 gap-1.5 rounded-md border border-border p-2">
                  {PERMISSIONS.map((p) => {
                    const checked = editing.permissions.includes(p);
                    return (
                      <label key={p} className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const set = new Set(editing.permissions);
                            v ? set.add(p) : set.delete(p);
                            setEditing({ ...editing, permissions: Array.from(set) });
                          }}
                        />
                        {p}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => (setEditing(null), setIsNew(false))}>
              Cancelar
            </Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
