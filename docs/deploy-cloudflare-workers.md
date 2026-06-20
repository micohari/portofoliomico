# Deploy ke Cloudflare Workers via GitHub Actions

Proyek ini adalah TanStack Start (SSR) yang dibundel oleh Nitro dengan preset
**cloudflare** → output siap-deploy ada di `dist/server/` (worker + `wrangler.json`)
dan asset statis di `dist/client/`. Karena ini SSR, **jangan** pakai Cloudflare
Pages mode statis — pakai **Workers**.

## 1. Buat Cloudflare API Token

1. Buka https://dash.cloudflare.com/profile/api-tokens → **Create Token**
2. Pilih template **Edit Cloudflare Workers** (atau buat custom token dengan
   permission: `Account › Workers Scripts › Edit` dan `Account › Account Settings › Read`).
3. Salin token — ini `CLOUDFLARE_API_TOKEN`.

Account ID bisa dilihat di sidebar kanan dashboard Cloudflare → `CLOUDFLARE_ACCOUNT_ID`.

## 2. Tambahkan GitHub Secrets

Di repo GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Nama | Nilai |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token dari langkah 1 |
| `CLOUDFLARE_ACCOUNT_ID` | account id Cloudflare |
| `VITE_SUPABASE_URL` | URL Supabase project |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable/anon key Supabase |

Tambahkan secret `VITE_*` lain bila perlu (mereka di-inject saat build).

## 3. Push ke `main`

Workflow `.github/workflows/deploy.yml` akan:
1. Install dependency dengan `bun install`
2. `bun run build` → Nitro hasilkan `dist/server/wrangler.json`
3. `wrangler deploy --config dist/server/wrangler.json --name portomico`

URL hasil: `https://portomico.<your-subdomain>.workers.dev`.

## 4. (Opsional) Custom domain

Setelah deploy pertama berhasil, di Cloudflare dashboard:
**Workers & Pages → portomico → Settings → Domains & Routes → Add custom domain**.

## Catatan

- Jangan buat `wrangler.toml` manual di root — Nitro yang menulis konfigurasi.
  Override hanya lewat flag `wrangler deploy` (mis. `--name`, `--var`).
- Untuk runtime secrets (bukan `VITE_*`), tambahkan via
  `wrangler secret put NAMA` lokal sekali, atau tambahkan step di workflow.
- Hapus dulu project **Pages** `portomico` lama agar nama tidak bentrok
  dengan Worker baru.
