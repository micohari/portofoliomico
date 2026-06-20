import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { PortfolioData } from "@/hooks/usePortfolioData";
import {
  supabase,
  type ProfileRow,
  type CoreStrengthRow,
  type WorkExperienceRow,
  type ProjectRow,
  type CertificationRow,
  type Model3DRow,
  type AwarenessVideoRow,
} from "@/integrations/supabase/client";

let generating = false;
const listeners = new Set<() => void>();

function setGenerating(v: boolean) {
  generating = v;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return generating;
}

export function useIsGeneratingCV() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Always fetches the latest snapshot from Supabase (same queries the
 * homepage uses) so the generated PDF reflects current content — including
 * the 3D showcase and awareness videos — instead of any cached state.
 */
async function fetchFreshPortfolio(fallback: PortfolioData): Promise<PortfolioData> {
  try {
    const [pr, cs, we, pj, ct, md, vd] = await Promise.all([
      supabase.from("profile").select("*").limit(1).maybeSingle(),
      supabase.from("core_strengths").select("*").order("sort_order"),
      supabase.from("work_experiences").select("*").order("sort_order"),
      supabase.from("projects").select("*").order("sort_order"),
      supabase.from("certifications").select("*").order("sort_order"),
      supabase.from("models_3d").select("*").order("sort_order"),
      supabase.from("awareness_videos").select("*").order("sort_order"),
    ]);
    return {
      ...fallback,
      profile: (pr.data as ProfileRow | null) ?? fallback.profile,
      strengths: (cs.data as CoreStrengthRow[] | null) ?? fallback.strengths,
      experiences: (we.data as WorkExperienceRow[] | null) ?? fallback.experiences,
      projects: (pj.data as ProjectRow[] | null) ?? fallback.projects,
      certifications: (ct.data as CertificationRow[] | null) ?? fallback.certifications,
      models: md.error ? fallback.models : ((md.data as Model3DRow[] | null) ?? []),
      videos: vd.error ? fallback.videos : ((vd.data as AwarenessVideoRow[] | null) ?? []),
    };
  } catch (e) {
    console.warn("[downloadCV] fetch fresh data failed, using cached:", e);
    return fallback;
  }
}

export async function downloadCV(ctx: PortfolioData, cvUrl?: string) {
  if (cvUrl && cvUrl.trim() && cvUrl.trim() !== "#") {
    window.open(cvUrl, "_blank", "noopener,noreferrer");
    return;
  }
  if (generating) return;
  setGenerating(true);
  const toastId = toast.loading("Membuat PDF CV…", {
    description: "Mengambil data terbaru dari homepage…",
  });
  try {
    const fresh = await fetchFreshPortfolio(ctx);
    toast.loading("Membuat PDF CV…", {
      id: toastId,
      description: "Menyusun konten resume gaya Harvard.",
    });
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const { generateCV } = await import("@/lib/generateCV");
    generateCV(fresh);
    toast.success("CV berhasil diunduh", {
      id: toastId,
      description: "Periksa folder unduhan Anda.",
    });
  } catch (err) {
    console.error("[downloadCV] gagal:", err);
    const msg = err instanceof Error ? err.message : String(err);
    toast.error("Gagal membuat CV", {
      id: toastId,
      description: msg.slice(0, 180),
    });
  } finally {
    setGenerating(false);
  }
}
