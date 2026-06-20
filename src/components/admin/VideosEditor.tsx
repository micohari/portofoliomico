import { useEffect, useState } from "react";
import { supabase, type AwarenessVideoRow } from "@/integrations/supabase/client";
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
  Video as VideoIcon,
} from "lucide-react";

export function VideosEditor() {
  const [rows, setRows] = useState<AwarenessVideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("awareness_videos")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as AwarenessVideoRow[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setPosterUrl("");
  }

  async function handleAdd() {
    if (!title.trim()) return toast.error("Judul wajib diisi");
    if (!videoUrl.trim()) return toast.error("URL video wajib diisi");
    setSaving(true);
    try {
      const nextOrder = (rows[rows.length - 1]?.sort_order ?? 0) + 1;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl.trim(),
        poster_url: posterUrl.trim() || null,
        sort_order: nextOrder,
      };
      const { data, error } = await (supabase.from("awareness_videos") as any)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      setRows((rs) => [...rs, data as AwarenessVideoRow]);
      toast.success("Video ditambahkan");
      resetForm();
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal menambahkan video");
    } finally {
      setSaving(false);
    }
  }

  function update(id: string, patch: Partial<AwarenessVideoRow>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: AwarenessVideoRow) {
    const { id, created_at, ...rest } = row as any;
    const { error } = await (supabase.from("awareness_videos") as any).update(rest).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
  }

  async function remove(row: AwarenessVideoRow) {
    if (!confirm(`Hapus "${row.title}"?`)) return;
    const { error } = await supabase.from("awareness_videos").delete().eq("id", row.id);
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
      supabase.from("awareness_videos").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("awareness_videos").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Tambah Video Awareness Baru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Judul *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mis. Edukasi Integrasi Core Tax System & Aspek Keamanan Informasi"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat konten video."
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>URL Video (.mp4) *</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://.../video.mp4"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>URL Poster / Thumbnail (opsional)</Label>
              <Input
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://.../poster.jpg"
              />
              <p className="text-[11px] text-muted-foreground">
                Jika kosong, frame pertama video akan dipakai (preload="metadata").
              </p>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Menyimpan…</>
            ) : (
              <><Plus className="h-4 w-4 mr-1" /> Tambahkan ke Galeri</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5" /> Galeri Video ({rows.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {!loading && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada video. Tambah lewat form di atas.
            </p>
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
                  <Button variant="ghost" size="icon" onClick={() => remove(row)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Judul</Label>
                  <Input value={row.title} onChange={(e) => update(row.id, { title: e.target.value })} />
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
                  <Label>URL Video</Label>
                  <Input value={row.video_url} onChange={(e) => update(row.id, { video_url: e.target.value })} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>URL Poster</Label>
                  <Input
                    value={row.poster_url ?? ""}
                    onChange={(e) => update(row.id, { poster_url: e.target.value || null })}
                  />
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
