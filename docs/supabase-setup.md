# Supabase Setup — Portfolio CMS

Project: `ztfgybgbdicixanzklky`

## 1. Jalankan SQL Schema + Seed

Buka **Supabase Dashboard → SQL Editor → New query**, lalu paste & jalankan isi file [`schema.sql`](./schema.sql).

SQL ini:
- Membuat enum `app_role` dan tabel `user_roles`
- Membuat function `has_role()` security-definer (anti-recursive RLS)
- Membuat tabel: `profile`, `core_strengths`, `work_experiences`, `projects`, `certifications`
- Mengatur RLS: publik bisa SELECT, hanya admin yang bisa INSERT/UPDATE/DELETE
- Seed semua data dari halaman utama

## 2. Buat User Admin

1. **Supabase Dashboard → Authentication → Users → Add user → Create new user**
   - Email & password Anda
   - Auto Confirm User: **ON**
2. Salin **User UID** yang baru dibuat
3. **SQL Editor**, jalankan:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('PASTE_USER_UID_DISINI', 'admin');
   ```

## 3. Login

Buka `/auth` di aplikasi, masuk dengan email/password tadi, lalu Anda akan diarahkan ke `/admin`.
