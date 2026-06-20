import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

export type PortfolioData = {
  profile: ProfileRow | null;
  strengths: CoreStrengthRow[];
  experiences: WorkExperienceRow[];
  projects: ProjectRow[];
  certifications: CertificationRow[];
  models: Model3DRow[];
  videos: AwarenessVideoRow[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const PortfolioContext = createContext<PortfolioData>({
  profile: null,
  strengths: [],
  experiences: [],
  projects: [],
  certifications: [],
  models: [],
  videos: [],
  loaded: false,
  loading: true,
  error: null,
  reload: async () => {},
});

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Omit<PortfolioData, "reload">>({
    profile: null,
    strengths: [],
    experiences: [],
    projects: [],
    certifications: [],
    models: [],
    videos: [],
    loaded: false,
    loading: true,
    error: null,
  });

  async function reload() {
    setData((d) => ({ ...d, loading: true, error: null }));
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
      const firstErr = [pr, cs, we, pj, ct].find((r) => r.error)?.error;
      if (firstErr) throw firstErr;
      setData({
        profile: (pr.data as ProfileRow | null) ?? null,
        strengths: (cs.data as CoreStrengthRow[] | null) ?? [],
        experiences: (we.data as WorkExperienceRow[] | null) ?? [],
        projects: (pj.data as ProjectRow[] | null) ?? [],
        certifications: (ct.data as CertificationRow[] | null) ?? [],
        models: md.error ? [] : ((md.data as Model3DRow[] | null) ?? []),
        videos: vd.error ? [] : ((vd.data as AwarenessVideoRow[] | null) ?? []),
        loaded: true,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      setData((d) => ({
        ...d,
        loading: false,
        error:
          e?.message ??
          "Gagal memuat data dari Supabase. Periksa koneksi atau coba muat ulang.",
      }));
    }
  }

  useEffect(() => {
    reload();
    const channel = supabase
      .channel("portfolio-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profile" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "core_strengths" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "work_experiences" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "certifications" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "models_3d" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "awareness_videos" }, reload)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <PortfolioContext.Provider value={{ ...data, reload }}>{children}</PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}

import {
  Lock,
  Eye,
  Server,
  TrendingUp,
  Award,
  Shield,
  Target,
  Briefcase,
  CheckCircle2,
  Globe,
  Video,
  Box,
  Mail,
  Github,
  Linkedin,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Lock, Eye, Server, TrendingUp, Award, Shield, Target, Briefcase,
  CheckCircle2, Globe, Video, Box, Mail, Github, Linkedin,
};

export function iconFor(name: string | undefined | null, fallback: LucideIcon = Award): LucideIcon {
  if (!name) return fallback;
  return ICONS[name] ?? fallback;
}
