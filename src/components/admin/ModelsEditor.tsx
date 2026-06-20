import { useEffect, useState } from "react";
import { supabase, type Model3DRow } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Save,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Settings2,
} from "lucide-react";

const R2_BASE_KEY = "admin:r2BaseUrl";
const R2_BASE_DEFAULT = "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/3d/";

/** Deteksi format dari URL — hanya .glb/.gltf yang interaktif. */
function detectFormat(url: string): string {
  const m = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return m ? m[1].toLowerCase() : "";
}
function isGlb(url: string) {
  return /^(glb|gltf)$/.test(detectFormat(url));
}
function fileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split("/").pop() ?? "model.glb");
  } catch {
    return url.split("/").pop() ?? "model.glb";
  }
}

/** Gabungkan base + relative. Kalau input sudah absolute (http/https) → kembalikan apa adanya. */
function resolveUrl(input: string, base: string): string {
  const v = input.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const b = base.trim();
  if (!b) return v;
  const baseSlash = b.endsWith("/") ? b : b + "/";
  const rel = v.replace(/^\/+/, "");
  return baseSlash + rel;
}

export function ModelsEditor() {
  const [rows, setRows] = useState<Model3DRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Base URL Cloudflare R2 — disimpan di localStorage agar bisa diatur dari admin
  const [r2Base, setR2Base] = useState<string>(R2_BASE_DEFAULT);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(R2_BASE_KEY);
    if (saved !== null) setR2Base(saved);
  }, []);
  function saveR2Base(v: string) {
    setR2Base(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(R2_BASE_KEY, v);
    }
    toast.success("Base URL R2 disimpan");
  }

  // Form state untuk model baru — cukup judul / deskripsi / URL .glb (boleh relatif)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("models_3d")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Model3DRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setFileUrl("");
    setPreviewImage("");
  }

  async function handleAdd() {
    const t = title.trim();
    const raw = fileUrl.trim();
    if (!t) return toast.error("Judul wajib diisi");
    if (!raw) return toast.error("URL / path .glb wajib diisi");
    const url = resolveUrl(raw, r2Base);
    try {
      new URL(url);
    } catch {
      return toast.error(
        "URL tidak valid. Isi base URL R2 di pengaturan, atau gunakan URL absolut.",
      );
    }
    if (!isGlb(url)) {
      const ok = confirm(
        "URL bukan .glb / .gltf — model tidak akan tampil interaktif di showcase. Tetap simpan?",
      );
      if (!ok) return;
    }

    setSaving(true);
    try {
      const nextOrder = (rows[rows.length - 1]?.sort_order ?? 0) + 1;
      const fmt = detectFormat(url) || "glb";
      const previewResolved = previewImage.trim()
        ? resolveUrl(previewImage.trim(), r2Base)
        : null;
      const payload = {
        title: t,
        description: description.trim(),
        file_url: url,
        file_path: null,
        file_name: fileNameFromUrl(url),
        format: fmt,
        preview_image: previewResolved,
        tags: [],
        sort_order: nextOrder,
      };
      const { data, error } = await (supabase.from("models_3d") as any)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      setRows((rs) => [...rs, data as Model3DRow]);
      toast.success("Model 3D ditambahkan");
      resetForm();
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal menyimpan model");
    } finally {
      setSaving(false);
    }
  }

  function update(id: string, patch: Partial<Model3DRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: Model3DRow) {
    const fmt = detectFormat(row.file_url) || row.format || "glb";
    const payload = {
      title: row.title,
      description: row.description,
      file_url: row.file_url,
      file_name: row.file_name || fileNameFromUrl(row.file_url),
      format: fmt,
      preview_image: row.preview_image,
      sort_order: row.sort_order,
    };
    const { error } = await (supabase.from("models_3d") as any)
      .update(payload)
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
  }

  async function remove(row: Model3DRow) {
    if (!confirm(`Hapus "${row.title}"?`)) return;
    const { error } = await supabase.from("models_3d").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    toast.success("Dihapus");
  }

  async function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[idx];
    const b = rows[target];
    const next = [...rows];
    next[idx] = { ...b, sort_order: a.sort_order };
    next[target] = { ...a, sort_order: b.sort_order };
    setRows(next);
    await Promise.all([
      supabase.from("models_3d").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("models_3d").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
  }

  return (
    <div className="space-y-6">
      {/* Pengaturan base URL R2 */}
      <R2BaseSettings value={r2Base} onSave={saveR2Base} />

      {/* Panduan upload Cloudflare */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="h-4 w-4 text-[var(--navy)]" /> Cara menambahkan model 3D
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Konversi <code>.fbx</code> Anda ke <strong>.glb (glTF 2.0)</strong> — di Blender pilih{" "}
              <em>File &gt; Export &gt; glTF 2.0</em>.
            </li>
            <li>
              Upload file <code>.glb</code> ke bucket <strong>Cloudflare R2</strong> dan aktifkan akses publik.
            </li>
            <li>
              Atur <strong>Base URL R2</strong> di kartu di atas (sekali saja), lalu cukup tulis path relatifnya —
              mis. <code>alumunium.glb</code> — pada form di bawah.
            </li>
            <li>
              Galeri di <code>/showcase-3d</code> akan ter-update otomatis.
            </li>
          </ol>
        </CardContent>
      </Card>


      {/* Form tambah */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Tambah Model 3D Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Judul *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mis. Pemodelan Aluminium Komposit"
              />
            </div>
            <div className="space-y-1.5">
              <Label>URL Preview Image (opsional)</Label>
              <Input
                value={previewImage}
                onChange={(e) => setPreviewImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang model ini."
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Path / URL file .glb *</Label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="alumunium.glb  —  atau URL absolut https://..."
              />
              {fileUrl && <UrlStatus url={resolveUrl(fileUrl, r2Base)} resolved={resolveUrl(fileUrl, r2Base)} raw={fileUrl} />}
            </div>
          </div>


          <Button onClick={handleAdd} disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Menyimpan…</>
            ) : (
              <><Plus className="h-4 w-4 mr-1" /> Tambahkan ke Showcase</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Daftar model */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Model 3D ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {!loading && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada model 3D. Tambahkan model pertama via form di atas.
            </p>
          )}

          {rows.map((row, idx) => (
            <div key={row.id} className="rounded-lg border border-border p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground truncate">
                  #{row.sort_order} · {(row.format ?? "—").toUpperCase()}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={row.file_url} target="_blank" rel="noreferrer noopener" title="Buka URL file">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => move(idx, 1)} disabled={idx === rows.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(row)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Judul</Label>
                  <Input value={row.title} onChange={(e) => update(row.id, { title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>URL Preview Image</Label>
                  <Input
                    value={row.preview_image ?? ""}
                    onChange={(e) => update(row.id, { preview_image: e.target.value || null })}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    rows={3}
                    value={row.description}
                    onChange={(e) => update(row.id, { description: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Path / URL file .glb</Label>
                  <Input
                    value={row.file_url}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const resolved = resolveUrl(raw, r2Base);
                      update(row.id, {
                        file_url: resolved,
                        format: detectFormat(resolved) || row.format,
                        file_name: fileNameFromUrl(resolved),
                      });
                    }}
                    placeholder="alumunium.glb — atau URL absolut"
                  />
                  <UrlStatus url={row.file_url} />
                </div>
              </div>
              <Button size="sm" onClick={() => save(row)}>
                <Save className="h-4 w-4 mr-1" /> Simpan
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function R2BaseSettings({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const changed = draft.trim() !== value.trim();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4 text-[var(--navy)]" /> Base URL Cloudflare R2
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Base URL (public bucket / domain)</Label>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://pub-xxxxx.r2.dev/3d/"
            />
            <Button onClick={() => onSave(draft.trim())} disabled={!changed}>
              <Save className="h-4 w-4 mr-1" /> Simpan
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Disimpan di browser ini (localStorage). Saat menambah model Anda cukup tulis path relatifnya,
            mis. <code>alumunium.glb</code> → otomatis menjadi{" "}
            <code>{(draft.endsWith("/") ? draft : draft + "/") + "alumunium.glb"}</code>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function UrlStatus({
  url,
  resolved,
  raw,
}: {
  url: string;
  resolved?: string;
  raw?: string;
}) {
  if (!url) return null;
  const ok = isGlb(url);
  const showResolved = resolved && raw && resolved !== raw;
  return (
    <div className="space-y-1">
      {ok ? (
        <p className="text-[11px] flex items-center gap-1 text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Format .{detectFormat(url)} — kompatibel dengan viewer interaktif.
        </p>
      ) : (
        <p className="text-[11px] flex items-center gap-1 text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Bukan .glb/.gltf — model tidak akan tampil interaktif. Konversi dulu di Blender.
        </p>
      )}
      {showResolved && (
        <p className="text-[11px] text-muted-foreground truncate">
          → <code>{resolved}</code>
        </p>
      )}
    </div>
  );
}
