import { useEffect, useRef, useState } from "react";
import { supabase, type ProfileRow } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, Upload, Trash2, User } from "lucide-react";
import { AvatarCropDialog } from "./AvatarCropDialog";

const AVATAR_SIZE = 512; // px (square)

const AVATAR_BUCKET = "avatars";

export function ProfileEditor() {
  const [row, setRow] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profile").select("*").maybeSingle();
      if (error) toast.error(error.message);
      setRow(data as ProfileRow | null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;

  const r = row ?? ({
    id: "", name: "", role: "", email: "", location: "", linkedin: "",
    github: "", cv_url: "#", summary: "", statement: "", avatar_url: null,
  } as ProfileRow);

  const set = (k: keyof ProfileRow, v: string | null) => setRow({ ...(r as ProfileRow), [k]: v } as ProfileRow);

  async function save() {
    if (!row) return;
    setSaving(true);
    const payload = { ...row, updated_at: new Date().toISOString() };
    const { error } = row.id
      ? await supabase.from("profile").update(payload).eq("id", row.id)
      : await supabase.from("profile").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile tersimpan");
  }

  function onPickFile(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("File harus berupa gambar");
    if (file.size > 8 * 1024 * 1024) return toast.error("Maks 8 MB sebelum di-crop");
    const reader = new FileReader();
    reader.onload = () => setCropSrc(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => toast.error("Gagal membaca file");
    reader.readAsDataURL(file);
  }

  function extractAvatarPath(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      const marker = "/storage/v1/object/public/avatars/";
      const idx = u.pathname.indexOf(marker);
      if (idx === -1) return null;
      return decodeURIComponent(u.pathname.slice(idx + marker.length));
    } catch {
      return null;
    }
  }

  async function handleCroppedUpload(blob: Blob) {
    setUploading(true);
    const previousPath = extractAvatarPath(r.avatar_url);
    try {
      const path = `profile-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { cacheControl: "3600", upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);

      // Hapus file lama (best-effort) supaya bucket tidak menumpuk
      if (previousPath && previousPath !== path) {
        const { error: rmErr } = await supabase.storage.from("avatars").remove([previousPath]);
        if (rmErr) console.warn("[ProfileEditor] gagal hapus avatar lama:", rmErr.message);
      }

      const nextUrl = `${pub.publicUrl}?v=${Date.now()}`;
      set("avatar_url", nextUrl);

      // Auto-persist ke database supaya langsung tampil di halaman utama
      if (row?.id) {
        const { error: dbErr } = await supabase
          .from("profile")
          .update({ avatar_url: nextUrl, updated_at: new Date().toISOString() })
          .eq("id", row.id);
        if (dbErr) {
          toast.warning("Foto terunggah tapi gagal disimpan ke DB. Klik Simpan manual.");
        } else {
          toast.success(`Foto ${AVATAR_SIZE}×${AVATAR_SIZE} tersimpan & tampil di halaman utama.`);
        }
      } else {
        toast.success(`Foto ${AVATAR_SIZE}×${AVATAR_SIZE} diunggah. Klik Simpan untuk menyimpan profil baru.`);
      }
      setCropSrc(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Gagal mengunggah foto");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Profil Utama</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar uploader */}
        <div className="flex items-center gap-5 rounded-lg border border-border bg-card/50 p-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-secondary">
            {r.avatar_url ? (
              <img src={r.avatar_url} alt={r.name || "Foto profile"} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-muted-foreground">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label>Foto Profile</Label>
            <p className="text-xs text-muted-foreground">
              Output {AVATAR_SIZE}×{AVATAR_SIZE}px (kotak, rasio 1:1). Maks 8 MB sebelum di-crop.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickFile(f);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
                {uploading ? "Mengunggah…" : r.avatar_url ? "Ganti Foto" : "Unggah Foto"}
              </Button>
              {r.avatar_url && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const p = extractAvatarPath(r.avatar_url);
                    if (p) await supabase.storage.from("avatars").remove([p]);
                    set("avatar_url", null);
                    if (row?.id) {
                      await supabase
                        .from("profile")
                        .update({ avatar_url: null, updated_at: new Date().toISOString() })
                        .eq("id", row.id);
                    }
                    toast.success("Foto profile dihapus");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1 text-destructive" /> Hapus
                </Button>
              )}
            </div>
            <Input
              value={r.avatar_url ?? ""}
              onChange={(e) => set("avatar_url", e.target.value || null)}
              placeholder="Atau tempel URL foto langsung"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Nama" value={r.name} onChange={(v) => set("name", v)} />
          <Field label="Role / Jabatan" value={r.role} onChange={(v) => set("role", v)} />
          <Field label="Email" type="email" value={r.email} onChange={(v) => set("email", v)} />
          <Field label="Lokasi" value={r.location} onChange={(v) => set("location", v)} />
          <Field label="LinkedIn URL" value={r.linkedin} onChange={(v) => set("linkedin", v)} />
          <Field label="GitHub URL" value={r.github} onChange={(v) => set("github", v)} />
          <Field label="CV URL" value={r.cv_url} onChange={(v) => set("cv_url", v)} />
        </div>
        <TextArea label="Ringkasan (summary)" rows={6} value={r.summary} onChange={(v) => set("summary", v)} />
        <TextArea label="Personal statement" rows={3} value={r.statement} onChange={(v) => set("statement", v)} />
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan
        </Button>
      </CardContent>

      <AvatarCropDialog
        open={cropSrc !== null}
        imageSrc={cropSrc}
        onCancel={() => {
          setCropSrc(null);
          if (fileRef.current) fileRef.current.value = "";
        }}
        onConfirm={handleCroppedUpload}
        outputSize={AVATAR_SIZE}
      />
    </Card>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
