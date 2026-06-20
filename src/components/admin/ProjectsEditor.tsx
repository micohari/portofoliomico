import { CrudEditor } from "./CrudEditor";
import type { ProjectRow } from "@/integrations/supabase/client";

export function ProjectsEditor() {
  return (
    <CrudEditor<ProjectRow>
      title="Featured Projects"
      table="projects"
      defaults={{
        category: "Website", tag: "Web Development", title: "", description: "",
        highlights: [], stack: [], preview_image: null, embed_url: null,
        external_url: null, gallery: null, sort_order: 0,
      }}
      columns={[
        { key: "category", label: "Kategori (Website / Video Awareness / 3D Model / Infrastruktur & Keamanan)", type: "text" },
        { key: "tag", label: "Tag", type: "text" },
        { key: "title", label: "Judul", type: "text" },
        { key: "description", label: "Deskripsi", type: "textarea" },
        { key: "highlights", label: "Highlights (satu per baris)", type: "lines" },
        { key: "stack", label: "Stack (pisahkan koma)", type: "stack" },
        { key: "preview_image", label: "URL Preview Image (opsional)", type: "text" },
        { key: "embed_url", label: "Embed URL (iframe, opsional)", type: "text" },
        { key: "external_url", label: "External URL (tombol Kunjungi)", type: "text" },
        {
          key: "gallery",
          label: "Gallery (JSON, opsional)",
          type: "json",
          helper: '[{"src":"https://...","alt":"...","caption":"..."}]',
        },
      ]}
    />
  );
}
