import { CrudEditor } from "./CrudEditor";
import type { CertificationRow } from "@/integrations/supabase/client";

export function CertificationsEditor() {
  return (
    <CrudEditor<CertificationRow>
      title="Sertifikasi"
      table="certifications"
      defaults={{
        icon: "Award", title: "", issuer: "", year: "",
        description: "", verify_url: null, sort_order: 0,
      }}
      columns={[
        { key: "icon", label: "Icon (Award, Lock, Shield, dll.)", type: "text" },
        { key: "title", label: "Judul Sertifikasi", type: "text" },
        { key: "issuer", label: "Issuer / Penerbit", type: "text" },
        { key: "year", label: "Tahun / Bulan-Tahun", type: "text" },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "verify_url", label: "Verify URL", type: "text" },
      ]}
    />
  );
}
