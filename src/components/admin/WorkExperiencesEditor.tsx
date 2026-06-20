import { CrudEditor } from "./CrudEditor";
import type { WorkExperienceRow } from "@/integrations/supabase/client";

export function WorkExperiencesEditor() {
  return (
    <CrudEditor<WorkExperienceRow>
      title="Pengalaman Kerja"
      table="work_experiences"
      defaults={{
        company: "", role: "", period: "", location: "",
        work_type: null, bullets: null, sub_roles: null, sort_order: 0,
      }}
      columns={[
        { key: "company", label: "Perusahaan", type: "text" },
        { key: "role", label: "Role / Jabatan", type: "text" },
        { key: "period", label: "Periode (mis. Jan 2024 — Sekarang)", type: "text" },
        { key: "location", label: "Lokasi", type: "text" },
        { key: "work_type", label: "Tipe (Full-time / Kontrak / dst.)", type: "text" },
        { key: "bullets", label: "Bullets utama (satu per baris) — kosongkan jika pakai Sub Roles", type: "lines" },
        {
          key: "sub_roles",
          label: "Sub Roles (JSON)",
          type: "json",
          helper: 'Contoh: [{"title":"DPO","bullets":["...","..."]}, {"title":"SOC","bullets":["..."]}]',
        },
      ]}
    />
  );
}
