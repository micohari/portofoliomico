import { createClient } from "@supabase/supabase-js";

// Publishable / anon key — safe to expose; protected by Row Level Security.
const SUPABASE_URL = "https://ztfgybgbdicixanzklky.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Zmd5YmdiZGljaXhhbnprbGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTAwMjUsImV4cCI6MjA5NzM4NjAyNX0.pkkp8vmrGYY0vV8I4QMbY__HlMuxLvcHIei2FMZx98Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window === "undefined" ? undefined : window.localStorage,
  },
});

export type ProfileRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  location: string;
  linkedin: string;
  github: string;
  cv_url: string;
  summary: string;
  statement: string;
  avatar_url?: string | null;
  updated_at?: string;
};

export type CoreStrengthRow = {
  id: string;
  icon: string;
  title: string;
  description: string;
  bullets: string[];
  sort_order: number;
};

export type WorkExperienceRow = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  work_type: string | null;
  bullets: string[] | null;
  sub_roles:
    | { title: string; bullets: string[] }[]
    | null;
  sort_order: number;
};

export type ProjectRow = {
  id: string;
  category: string;
  tag: string;
  title: string;
  description: string;
  highlights: string[];
  stack: string[];
  preview_image: string | null;
  embed_url: string | null;
  external_url: string | null;
  gallery: { src: string; caption?: string; alt?: string }[] | null;
  sort_order: number;
};

export type CertificationRow = {
  id: string;
  icon: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
  verify_url: string | null;
  sort_order: number;
};

export type Model3DRow = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_path: string | null;
  file_name: string;
  format: "fbx" | "obj" | "stl" | string;
  preview_image: string | null;
  tags: string[];
  sort_order: number;
  created_at?: string;
};

export type AwarenessVideoRow = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string | null;
  sort_order: number;
  created_at?: string;
};
