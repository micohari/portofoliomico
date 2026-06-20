import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2, ChevronUp, ChevronDown } from "lucide-react";

export type CrudColumnType = "text" | "textarea" | "number" | "lines" | "stack" | "json";

export type CrudColumn<T> = {
  key: keyof T;
  label: string;
  type?: CrudColumnType;
  placeholder?: string;
  helper?: string;
};

type Props<T extends { id: string; sort_order: number }> = {
  title: string;
  table: string;
  columns: CrudColumn<T>[];
  defaults: Omit<T, "id">;
  renderExtra?: (row: T, set: (k: keyof T, v: unknown) => void) => ReactNode;
};

export function CrudEditor<T extends { id: string; sort_order: number }>({
  title, table, columns, defaults, renderExtra,
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as T[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const update = (id: string, patch: Partial<T>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addNew = async () => {
    const nextOrder = (rows[rows.length - 1]?.sort_order ?? 0) + 1;
    const payload: Record<string, unknown> = { ...(defaults as Record<string, unknown>), sort_order: nextOrder };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from(table) as any).insert(payload).select().single();
    if (error) return toast.error(error.message);
    setRows((rs) => [...rs, data as T]);
    toast.success("Item baru ditambahkan");
  };

  const save = async (row: T) => {
    const { id, ...rest } = row as T & { id: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from(table) as any).update(rest).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus item ini?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((r) => r.id !== id));
    toast.success("Dihapus");
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[idx]; const b = rows[target];
    const newRows = [...rows];
    newRows[idx] = { ...b, sort_order: a.sort_order };
    newRows[target] = { ...a, sort_order: b.sort_order };
    setRows(newRows);
    await Promise.all([
      supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button size="sm" onClick={addNew}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada data. Klik "Tambah".</p>
        )}
        {rows.map((row, idx) => (
          <div key={row.id} className="rounded-lg border border-border p-4 space-y-3 bg-card/50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">#{row.sort_order}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => move(idx, 1)} disabled={idx === rows.length - 1}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(row.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {columns.map((c) => (
                <CellInput
                  key={String(c.key)}
                  column={c}
                  value={(row as Record<string, unknown>)[c.key as string]}
                  onChange={(v) => update(row.id, { [c.key]: v } as Partial<T>)}
                />
              ))}
            </div>
            {renderExtra?.(row, (k, v) => update(row.id, { [k]: v } as Partial<T>))}
            <Button size="sm" onClick={() => save(row)}>
              <Save className="h-4 w-4 mr-1" /> Simpan
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CellInput<T>({ column, value, onChange }: {
  column: CrudColumn<T>;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const t = column.type ?? "text";
  const fullCol = t === "textarea" || t === "lines" || t === "json" ? "md:col-span-2" : "";
  return (
    <div className={`space-y-1.5 ${fullCol}`}>
      <Label>{column.label}</Label>
      {t === "text" && (
        <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={column.placeholder} />
      )}
      {t === "number" && (
        <Input type="number" value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />
      )}
      {t === "textarea" && (
        <Textarea rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={column.placeholder} />
      )}
      {t === "lines" && (
        <Textarea
          rows={5}
          value={(Array.isArray(value) ? (value as string[]).join("\n") : "")}
          onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
          placeholder="Satu item per baris"
        />
      )}
      {t === "stack" && (
        <Input
          value={(Array.isArray(value) ? (value as string[]).join(", ") : "")}
          onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          placeholder="Pisahkan dengan koma"
        />
      )}
      {t === "json" && (
        <Textarea
          rows={6}
          value={value == null ? "" : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (!v) return onChange(null);
            try { onChange(JSON.parse(v)); } catch { /* ignore until valid */ }
          }}
          placeholder='[{"title":"...","bullets":["..."]}]'
          className="font-mono text-xs"
        />
      )}
      {column.helper && <p className="text-[10px] text-muted-foreground">{column.helper}</p>}
    </div>
  );
}
