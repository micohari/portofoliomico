import { AlertTriangle, Loader2 } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolioData";

export function PortfolioStatusBanner() {
  const { loading, loaded, error, reload } = usePortfolio();

  if (error) {
    return (
      <div className="fixed inset-x-0 top-0 z-[60] border-b border-red-200 bg-red-50 text-red-900">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-6 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">Gagal memuat data portofolio</div>
            <div className="opacity-80">{error}</div>
          </div>
          <button
            onClick={() => reload()}
            className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-red-100"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading && !loaded) {
    return (
      <div className="fixed inset-x-0 top-0 z-[60] border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Memuat data dari Supabase…
        </div>
      </div>
    );
  }

  return null;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
      aria-hidden="true"
    />
  );
}
