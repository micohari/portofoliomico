import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Loader2, LogOut, ExternalLink, Download } from "lucide-react";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { CoreStrengthsEditor } from "@/components/admin/CoreStrengthsEditor";
import { WorkExperiencesEditor } from "@/components/admin/WorkExperiencesEditor";
import { ProjectsEditor } from "@/components/admin/ProjectsEditor";
import { CertificationsEditor } from "@/components/admin/CertificationsEditor";
import { ModelsEditor } from "@/components/admin/ModelsEditor";
import { VideosEditor } from "@/components/admin/VideosEditor";
import { PortfolioProvider, usePortfolio } from "@/hooks/usePortfolioData";
import { downloadCV, useIsGeneratingCV } from "@/hooks/useCVDownload";

function AdminDownloadCVButton() {
  const ctx = usePortfolio();
  const busy = useIsGeneratingCV();
  return (
    <Button
      onClick={() => void downloadCV(ctx, ctx.profile?.cv_url ?? undefined)}
      disabled={busy}
      size="sm"
      variant="default"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-1" />
      )}
      {busy ? "Membuat PDF…" : "Unduh CV (PDF)"}
    </Button>
  );
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ready" | "no-role">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      if (!active) return;
      setEmail(data.session.user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setStatus(roles ? "ready" : "no-role");
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Keluar berhasil");
    navigate({ to: "/auth" });
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "no-role") {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Akses ditolak</h1>
          <p className="text-sm text-muted-foreground">
            Akun <strong>{email}</strong> belum memiliki role <code>admin</code>.
            Jalankan di Supabase SQL Editor:
          </p>
          <pre className="bg-muted rounded p-3 text-left text-xs overflow-x-auto">
{`insert into public.user_roles (user_id, role)
values ('USER_ID_ANDA', 'admin');`}
          </pre>
          <Button onClick={signOut} variant="outline">Keluar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <PortfolioProvider>
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
            <div className="flex items-center gap-2">
              <AdminDownloadCVButton />
              <Button asChild variant="ghost" size="sm">
                <Link to="/"><ExternalLink className="h-4 w-4 mr-1" /> Lihat Situs</Link>
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-1" /> Keluar
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-7">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="strengths">Core Strength</TabsTrigger>
              <TabsTrigger value="experience">Pengalaman</TabsTrigger>
              <TabsTrigger value="projects">Proyek</TabsTrigger>
              <TabsTrigger value="certifications">Sertifikasi</TabsTrigger>
              <TabsTrigger value="models">3D Model</TabsTrigger>
              <TabsTrigger value="videos">Video</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6"><ProfileEditor /></TabsContent>
            <TabsContent value="strengths" className="mt-6"><CoreStrengthsEditor /></TabsContent>
            <TabsContent value="experience" className="mt-6"><WorkExperiencesEditor /></TabsContent>
            <TabsContent value="projects" className="mt-6"><ProjectsEditor /></TabsContent>
            <TabsContent value="certifications" className="mt-6"><CertificationsEditor /></TabsContent>
            <TabsContent value="models" className="mt-6"><ModelsEditor /></TabsContent>
            <TabsContent value="videos" className="mt-6"><VideosEditor /></TabsContent>
          </Tabs>
        </main>
      </PortfolioProvider>
    </div>
  );
}
