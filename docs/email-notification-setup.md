# Setup Notifikasi Email Pesan Kontak

## 1. Jalankan SQL terbaru
Buka **Supabase Dashboard → SQL Editor → New query**, paste seluruh `docs/schema.sql`, lalu Run.
Tabel `public.contact_messages` akan dibuat (siapa pun boleh INSERT terbatas; hanya admin yang bisa SELECT).

## 2. Dapatkan Resend API key
1. Daftar gratis di https://resend.com
2. **API Keys → Create API Key** → salin (format `re_xxx`)
3. (Opsional) verifikasi domain Anda di **Domains**; bila belum, gunakan `onboarding@resend.dev`

## 3. Tambahkan Secrets di Supabase
Project Settings → **Edge Functions → Secrets**:
- `RESEND_API_KEY` = `re_xxx`
- `NOTIFY_TO` = email tujuan (mis. `micohari0@gmail.com`)
- `NOTIFY_FROM` = `Portfolio <onboarding@resend.dev>` (atau alamat dari domain terverifikasi)

## 4. Deploy edge function
```bash
npx supabase login
npx supabase link --project-ref ztfgybgbdicixanzklky
npx supabase functions deploy notify-contact --no-verify-jwt
```

## 5. Tes
Kirim pesan dari section **Contact** di halaman utama. Pesan tersimpan di tabel `contact_messages`
dan email notifikasi terkirim ke `NOTIFY_TO`. Bila edge function belum dideploy/dikonfigurasi,
penyimpanan tetap berjalan dan kegagalan email diabaikan secara diam-diam.
