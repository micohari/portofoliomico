import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Box,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { supabase, type Model3DRow } from "@/integrations/supabase/client";

export const Route = createFileRoute("/showcase-3d")({
  head: () => ({
    meta: [
      { title: "3D Architectural Material Showcase — Portfolio" },
      {
        name: "description",
        content:
          "Galeri interaktif pemodelan 3D material arsitektural: aluminium komposit, galvalum, kayu, dan proyek integrasi desain.",
      },
      { property: "og:title", content: "3D Architectural Material Showcase" },
      {
        property: "og:description",
        content:
          "Visualisasi 3D presisi tinggi untuk material aluminium, galvalum, kayu, dan kompilasi desain arsitektur interaktif.",
      },
    ],
  }),
  component: Showcase3DPage,
});

/* ============================================================
   Tipe untuk custom element <model-viewer>
   ============================================================ */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "touch-action"?: string;
          "shadow-intensity"?: string | number;
          exposure?: string | number;
          "environment-image"?: string;
          poster?: string;
          ar?: boolean | string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "interaction" | "manual";
        },
        HTMLElement
      >;
    }
  }
}

const MODEL_VIEWER_SRC =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";

function useModelViewerScript() {
  const [ready, setReady] = useState<boolean>(
    typeof window !== "undefined" &&
      typeof customElements !== "undefined" &&
      !!customElements.get("model-viewer"),
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (ready) return;
    let mounted = true;
    const check = () => {
      if (
        typeof customElements !== "undefined" &&
        customElements.get("model-viewer")
      ) {
        if (mounted) setReady(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    let s = document.querySelector<HTMLScriptElement>(
      `script[src="${MODEL_VIEWER_SRC}"]`,
    );
    if (!s) {
      s = document.createElement("script");
      s.type = "module";
      s.src = MODEL_VIEWER_SRC;
      document.head.appendChild(s);
    }
    const t = window.setInterval(() => {
      if (check()) window.clearInterval(t);
    }, 150);
    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, [ready]);
  return ready;
}

function isGlb(url: string) {
  return /\.(glb|gltf)(\?|$)/i.test(url);
}

function getExtension(url: string): string {
  const m = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return m ? m[1].toUpperCase() : "—";
}

/* ============================================================
   Card — pemutar 3D individual dengan spinner & fallback
   ============================================================ */
function ModelCard({
  model,
  scriptReady,
}: {
  model: Model3DRow;
  scriptReady: boolean;
}) {
  const supported = isGlb(model.file_url);
  const ext = getExtension(model.file_url);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset state kalau URL ganti (mis. admin update)
  useEffect(() => {
    setLoaded(false);
    setErr(null);
  }, [model.file_url]);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "450px", borderRadius: "16px", background: "#f3f4f6" }}
      >
        {supported ? (
          <>
            {scriptReady && !err ? (
              <model-viewer
                src={model.file_url}
                alt={model.title}
                camera-controls
                auto-rotate
                touch-action="pan-y"
                shadow-intensity="1"
                exposure="1"
                loading="lazy"
                reveal="auto"
                poster={model.preview_image ?? undefined}
                onLoad={() => setLoaded(true)}
                onError={() =>
                  setErr("Gagal memuat model. Periksa URL atau jaringan.")
                }
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f3f4f6",
                }}
              />
            ) : null}

            {/* Spinner overlay saat script / model belum siap */}
            {(!scriptReady || !loaded) && !err && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f4f6]/80 backdrop-blur-sm">
                <Loader2 className="h-7 w-7 animate-spin text-[var(--navy)]" />
                <p className="text-xs font-medium text-muted-foreground">
                  {scriptReady ? "Memuat model 3D..." : "Menyiapkan viewer..."}
                </p>
              </div>
            )}

            {/* Error overlay */}
            {err && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#f3f4f6] px-6 text-center">
                <AlertTriangle className="h-7 w-7 text-red-500" />
                <p className="text-xs font-semibold text-foreground">{err}</p>
              </div>
            )}

            {/* Badge status sukses (kecil, kiri-bawah) */}
            {loaded && !err && (
              <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                Interactive ready
              </div>
            )}
          </>
        ) : (
          <FbxConversionFallback url={model.file_url} ext={ext} />
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {ext}
          </span>
          {supported ? (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Interactive
            </span>
          ) : (
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Needs conversion
            </span>
          )}
        </div>
        <h2 className="mt-3 text-lg font-bold leading-snug text-foreground">
          {model.title}
        </h2>
        {model.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {model.description}
          </p>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   Fallback: panduan konversi .fbx → .glb
   ============================================================ */
function FbxConversionFallback({ url, ext }: { url: string; ext: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100">
        <AlertTriangle className="h-6 w-6 text-amber-600" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        File <code className="rounded bg-white px-1.5 py-0.5">{ext}</code>{" "}
        belum kompatibel
      </p>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        <code>&lt;model-viewer&gt;</code> hanya menampilkan{" "}
        <strong>.glb / .gltf</strong>. Konversi file <code>{ext}</code> dulu,
        lalu update URL pada halaman admin.
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <a
          href="https://products.aspose.app/3d/conversion/fbx-to-glb"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--navy)] px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90"
        >
          Konversi Online
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary"
        >
          Download file asli
        </a>
      </div>
      <p className="mt-1 max-w-xs text-[10px] leading-relaxed text-muted-foreground">
        Tip: di Blender → <em>File &gt; Export &gt; glTF 2.0 (.glb)</em>.
      </p>
    </div>
  );
}

/* ============================================================
   Skeleton card saat data DB masih dimuat
   ============================================================ */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "450px", borderRadius: "16px", background: "#f3f4f6" }}
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e5e7eb] via-[#f3f4f6] to-[#e5e7eb]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            Memuat daftar model...
          </p>
        </div>
      </div>
      <div className="space-y-3 p-6">
        <div className="flex gap-2">
          <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
        </div>
        <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-full animate-pulse rounded bg-secondary" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}

/* ============================================================
   Halaman utama
   ============================================================ */
function Showcase3DPage() {
  const scriptReady = useModelViewerScript();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["showcase-3d", "models_3d"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("models_3d")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Model3DRow[];
    },
    staleTime: 30_000,
  });

  // Realtime: kalau admin update tabel, gallery ikut refresh
  useEffect(() => {
    const ch = supabase
      .channel("showcase-3d-models")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "models_3d" },
        () => refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refetch]);

  const models = data ?? [];
  const fbxCount = models.filter((m) => !isGlb(m.file_url)).length;
  const glbCount = models.length - fbxCount;

  return (
    <main className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Box className="h-3.5 w-3.5" />
            3D Showcase
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Dedicated Page
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
            3D Architectural Material Showcase
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Galeri interaktif pemodelan 3D material arsitektural. Putar, geser,
            dan zoom setiap objek langsung dari browser menggunakan{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-[12px]">
              &lt;model-viewer&gt;
            </code>{" "}
            resmi dari Google. Data model dikelola lewat halaman admin.
          </p>

          {/* Status panel konversi */}
          {!isLoading && models.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatusPill
                label="Total Model"
                value={String(models.length)}
                tone="neutral"
              />
              <StatusPill
                label="Siap interaktif (.glb)"
                value={String(glbCount)}
                tone="ok"
              />
              <StatusPill
                label="Perlu konversi (.fbx)"
                value={String(fbxCount)}
                tone={fbxCount > 0 ? "warn" : "ok"}
              />
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-red-300 bg-red-50 p-10 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Gagal memuat data model
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Coba lagi
            </button>
          </div>
        ) : models.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
            <Box className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Belum ada model 3D
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tambahkan model lewat halaman Admin → 3D Model untuk
              menampilkannya di sini.
            </p>
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Menyegarkan data...
              </div>
            )}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {models.map((m) => (
                <ModelCard key={m.id} model={m} scriptReady={scriptReady} />
              ))}
            </div>
          </>
        )}

        {/* Catatan teknis */}
        <div className="mt-12 rounded-xl border border-dashed border-border bg-secondary/40 p-5 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Catatan teknis:</strong>{" "}
          <code>&lt;model-viewer&gt;</code> mendukung format <code>.glb</code> /{" "}
          <code>.gltf</code>. File <code>.fbx</code> / <code>.obj</code> /{" "}
          <code>.stl</code> perlu dikonversi ke <code>.glb</code> (mis. di
          Blender → <em>File &gt; Export &gt; glTF 2.0</em>, atau pakai
          konverter online). Setelah dikonversi, update field{" "}
          <code>file_url</code> model di halaman admin — galeri ini akan
          memperbarui otomatis secara realtime.
        </div>
      </section>
    </main>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "neutral";
}) {
  const toneCls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-border bg-card text-foreground";
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${toneCls}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </span>
      <span className="text-lg font-black tabular-nums">{value}</span>
    </div>
  );
}
