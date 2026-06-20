// Supabase Edge Function: notify-contact
// Deploy: supabase functions deploy notify-contact --no-verify-jwt
// Secrets needed in Supabase (Project Settings → Edge Functions → Secrets):
//   RESEND_API_KEY = re_xxx (from https://resend.com)
//   NOTIFY_TO      = your-inbox@example.com
//   NOTIFY_FROM    = "Portfolio <onboarding@resend.dev>"  (or your verified domain)
//
// Trigger: invoked from the website Contact form after the message row is inserted.
// Body: { id: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { id } = await req.json().catch(() => ({}));
    if (!id) return json({ error: "missing id" }, 400);

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: row, error } = await supa
      .from("contact_messages")
      .select("id,name,email,message,created_at,notified")
      .eq("id", id)
      .single();
    if (error || !row) return json({ error: error?.message ?? "not found" }, 404);
    if (row.notified) return json({ ok: true, skipped: true });

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const NOTIFY_TO = Deno.env.get("NOTIFY_TO");
    const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") ?? "Portfolio <onboarding@resend.dev>";
    if (!RESEND_API_KEY || !NOTIFY_TO) {
      return json({ error: "email service not configured" }, 500);
    }

    const html = `
      <h2>Pesan baru dari portofolio</h2>
      <p><strong>Nama:</strong> ${escapeHtml(row.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(row.email)}</p>
      <p><strong>Waktu:</strong> ${escapeHtml(row.created_at)}</p>
      <hr/>
      <p style="white-space:pre-wrap">${escapeHtml(row.message)}</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        reply_to: row.email,
        subject: `Pesan baru dari ${row.name}`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return json({ error: "resend failed", detail: text }, 502);
    }

    await supa.from("contact_messages").update({ notified: true }).eq("id", id);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
