import { CrudEditor } from "./CrudEditor";
import type { CoreStrengthRow } from "@/integrations/supabase/client";

export function CoreStrengthsEditor() {
  return (
    <CrudEditor<CoreStrengthRow>
      title="Core Strength"
      table="core_strengths"
      defaults={{ icon: "Lock", title: "", description: "", bullets: [], sort_order: 0 }}
      columns={[
        { key: "icon", label: "Icon (Lock, Eye, Server, TrendingUp, Shield, Target, dll.)", type: "text" },
        { key: "title", label: "Judul", type: "text" },
        { key: "description", label: "Deskripsi singkat", type: "textarea" },
        { key: "bullets", label: "Bullets (satu per baris)", type: "lines" },
      ]}
    />
  );
}
