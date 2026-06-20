-- =============================================================
-- Admin schema for portfolio CMS
-- Run this in Supabase SQL Editor of project ztfgybgbdicixanzklky
-- =============================================================

do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
drop policy if exists "user_roles self read" on public.user_roles;
create policy "user_roles self read" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

-- ---------- PROFILE ----------
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  name text not null, role text not null, email text not null, location text not null,
  linkedin text not null default '', github text not null default '',
  cv_url text not null default '#', summary text not null, statement text not null,
  updated_at timestamptz not null default now()
);
grant select on public.profile to anon, authenticated;
grant insert, update, delete on public.profile to authenticated;
grant all on public.profile to service_role;
alter table public.profile enable row level security;
drop policy if exists "profile public read" on public.profile;
create policy "profile public read" on public.profile for select using (true);
drop policy if exists "profile admin write" on public.profile;
create policy "profile admin write" on public.profile for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ---------- CORE STRENGTHS ----------
create table if not exists public.core_strengths (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'Lock', title text not null, description text not null,
  bullets text[] not null default '{}', sort_order int not null default 0
);
grant select on public.core_strengths to anon, authenticated;
grant insert, update, delete on public.core_strengths to authenticated;
grant all on public.core_strengths to service_role;
alter table public.core_strengths enable row level security;
drop policy if exists "strengths public read" on public.core_strengths;
create policy "strengths public read" on public.core_strengths for select using (true);
drop policy if exists "strengths admin write" on public.core_strengths;
create policy "strengths admin write" on public.core_strengths for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ---------- WORK EXPERIENCES ----------
create table if not exists public.work_experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null, role text not null, period text not null, location text not null,
  work_type text, bullets text[], sub_roles jsonb, sort_order int not null default 0
);
grant select on public.work_experiences to anon, authenticated;
grant insert, update, delete on public.work_experiences to authenticated;
grant all on public.work_experiences to service_role;
alter table public.work_experiences enable row level security;
drop policy if exists "experiences public read" on public.work_experiences;
create policy "experiences public read" on public.work_experiences for select using (true);
drop policy if exists "experiences admin write" on public.work_experiences;
create policy "experiences admin write" on public.work_experiences for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ---------- PROJECTS ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category text not null, tag text not null, title text not null, description text not null,
  highlights text[] not null default '{}', stack text[] not null default '{}',
  preview_image text, embed_url text, external_url text, gallery jsonb,
  sort_order int not null default 0
);
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects for select using (true);
drop policy if exists "projects admin write" on public.projects;
create policy "projects admin write" on public.projects for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ---------- CERTIFICATIONS ----------
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'Award', title text not null, issuer text not null, year text not null,
  description text not null, verify_url text, sort_order int not null default 0
);
grant select on public.certifications to anon, authenticated;
grant insert, update, delete on public.certifications to authenticated;
grant all on public.certifications to service_role;
alter table public.certifications enable row level security;
drop policy if exists "certs public read" on public.certifications;
create policy "certs public read" on public.certifications for select using (true);
drop policy if exists "certs admin write" on public.certifications;
create policy "certs admin write" on public.certifications for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- SEED DATA
-- =============================================================
delete from public.profile;
insert into public.profile (name, role, email, location, linkedin, github, cv_url, summary, statement) values (
  'Mico Hari Syahgita',
  'Data Protection Officer & Information Security Professional',
  'micohari0@gmail.com', 'Surabaya, Indonesia',
  'https://www.linkedin.com/in/micoharisyahgita', '#', '#',
  'Profesional keamanan informasi dengan perjalanan karir dari IT Support menuju Security Operations Center (SOC) dan Data Protection Officer (DPO) di industri perbankan. Saat ini bertugas di Bank Jatim (Okt 2024 — Sekarang) menangani pemantauan keamanan berbasis SIEM (IBM QRadar) dengan integrasi log dari berbagai platform keamanan, serta menyusun program training & awareness PDP.',
  'Saya percaya bahwa keamanan informasi bukan hanya tentang mengurangi risiko, tetapi memastikan organisasi tetap dapat bergerak dengan aman dan berkelanjutan.'
);

delete from public.core_strengths;
insert into public.core_strengths (icon, title, description, bullets, sort_order) values
('Lock','Data Protection & Awareness','Training dan edukasi PDP untuk meningkatkan kesadaran karyawan.',
 array['Materi training & awareness PDP untuk berbagai level','Program edukasi berkala','Sosialisasi kebijakan perlindungan data','Dokumentasi untuk compliance & audit'],1),
('Eye','Security Operations & SIEM','Pemantauan keamanan real-time berbasis IBM QRadar.',
 array['SIEM IBM QRadar multi-platform','Monitoring 24/7','Laporan harian SOC','Investigasi insiden & eskalasi'],2),
('Server','IT Infrastructure & Support','Implementasi identitas, endpoint security, dukungan teknis.',
 array['Active Directory: domain, OU, Group Policy','Deployment endpoint security','Troubleshooting hardware/software/jaringan','Maintenance perangkat'],3),
('TrendingUp','Process & Performance Improvement','Efisiensi proses dan koordinasi proyek.',
 array['Continuous improvement','Project coordination','Root-cause analysis','Adaptabilitas shift SOC 24/7'],4);

delete from public.work_experiences;
insert into public.work_experiences (company, role, period, location, work_type, bullets, sub_roles, sort_order) values
('Bank Jatim','IT Security','Oktober 2024 — Sekarang','Surabaya, Jawa Timur','Full-time (On-site)', null,
 '[{"title":"Data Protection Officer (DPO)","bullets":["Menyusun materi training & awareness PDP.","Sosialisasi kebijakan perlindungan data internal.","Dokumentasi untuk compliance & audit."]},{"title":"Security Operations Center (SOC)","bullets":["Monitoring log via IBM QRadar.","Integrasi log: Fortinet, F5, Wazuh, Cybereason, Kaspersky, CrowdStrike, Sangfor, Imperva, Countercraft, Kaseya.","Laporan harian SOC.","Investigasi insiden dasar."]}]'::jsonb, 1),
('Grand Inn Tunjungan Hotel','IT Support','Juli 2023 — September 2023','Surabaya, Jawa Timur','Kontrak, 3 Bulan',
 array['Dukungan teknis harian.','Maintenance komputer & printer.','Troubleshooting jaringan.'], null, 2);

delete from public.certifications;
insert into public.certifications (icon, title, issuer, year, description, verify_url, sort_order) values
('Lock','IAPP CIPP/US Privacy Professional Certification Prep','Wiley Skills Network · Coursera Specialization','Jun 2026',
 'Specialization 3 kursus persiapan ujian CIPP/US.','https://coursera.org/verify/specialization/XPLU63UDP7MJ',1);

delete from public.projects;
insert into public.projects (category, tag, title, description, highlights, stack, embed_url, external_url, sort_order) values
('Website','Web Development','E-Karcis','Platform pemesanan tiket digital.',
 array['Pemesanan tiket efisien','UI modern responsif','Cloudflare Pages'],array['React','Tailwind','Cloudflare'],'https://ekarcis.pages.dev/','https://ekarcis.pages.dev/',1),
('Website','Web Development','Laporku','Platform pelaporan online.',
 array['Formulir mudah','Dashboard real-time','Responsif'],array['React','Tailwind','Cloudflare'],'https://laporku.pages.dev/','https://laporku.pages.dev/',2),
('Website','Web Development','Berita Polda Terkini','Portal berita kepolisian daerah.',
 array['Update harian','Kategori terstruktur','Blogger'],array['Blogger','HTML','CSS','SEO'],'https://beritapoldaterkini.blogspot.com','https://beritapoldaterkini.blogspot.com',3),
('Website','Web Development','Journals Terkini','Blog jurnal & publikasi.',
 array['Kumpulan artikel','Navigasi intuitif','SEO'],array['Blogger','HTML','CSS','SEO'],'https://journalsterkini.blogspot.com','https://journalsterkini.blogspot.com',4),
('Website','Web Development','Jejak Beritaku','Blog dokumentasi berita.',
 array['Arsip terorganisir','Minimalis','Mobile-friendly'],array['Blogger','HTML','CSS'],'https://jejakberitaku.blogspot.com','https://jejakberitaku.blogspot.com',5),
('Website','Web Development','Liputan Peteng','Media blog liputan lokal.',
 array['Perspektif lokal','Distribusi Blogger','Aksesibel'],array['Blogger','HTML','CSS'],'https://liputanpeteng.blogspot.com','https://liputanpeteng.blogspot.com',6),
('Website','Web Development','Poldapedia','Ensiklopedia digital kepolisian.',
 array['Kumpulan informasi','Navigasi topik','Akses Blogger'],array['Blogger','HTML','CSS'],'https://poldapedia.blogspot.com','https://poldapedia.blogspot.com',7),
('Website','Web Development','SDN Janti 1 — Website Sekolah','Website resmi SDN Janti 1.',
 array['Profil sekolah','Berita & galeri','Responsif'],array['React','Tailwind','Lovable'],'https://sdnjanti1.lovable.app/','https://sdnjanti1.lovable.app/',8),
('Website','Web Development','Absensi SDN Janti 1','Aplikasi absensi digital SDN Janti 1.',
 array['Kehadiran real-time','Rekap otomatis','Pendamping website'],array['React','Tailwind','Lovable'],'https://absensijanti1.lovable.app/','https://absensijanti1.lovable.app/',9),
('Video Awareness','Privacy & Security Awareness','Video Awareness — Koleksi Materi Edukasi','Kumpulan video awareness PDP & keamanan informasi.',
 array['Materi visual PDP','Mendukung training','Ringkas'],array['Video','PDP','Training'],null,'https://drive.google.com/drive/u/2/folders/1Rk5nKwUxp1VGzEr5AOVyTyrN2BpOwHIG',10),
('3D Model','3D Visualization','3D Model — Coming Soon','Visualisasi & modeling 3D pendukung awareness.',
 array['Aset 3D awareness','Visualisasi interaktif','Portofolio bertahap'],array['3D','Blender'],null,null,11),
('Infrastruktur & Keamanan','Infrastructure','Implementasi Active Directory','AD untuk identitas & kontrol akses terpusat.',
 array['Struktur domain & OU','Group Policy','Integrasi autentikasi'],array['AD','Group Policy','Windows Server'],null,null,12),
('Infrastruktur & Keamanan','Data Protection','Data Protection Initiative','Awareness pelindungan data pribadi di Bank Jatim.',
 array['Awareness PDP manajemen','SOP perlindungan data','Kepatuhan regulasi'],array['SOP','Risk Assessment','Compliance'],null,null,13);

-- ---------- CONTACT MESSAGES ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  notified boolean not null default false
);
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
drop policy if exists "contact_messages anon insert" on public.contact_messages;
create policy "contact_messages anon insert" on public.contact_messages
  for insert to anon, authenticated with check (
    length(name) between 1 and 200
    and length(email) between 3 and 320
    and length(message) between 1 and 5000
  );
drop policy if exists "contact_messages admin read" on public.contact_messages;
create policy "contact_messages admin read" on public.contact_messages
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "contact_messages admin write" on public.contact_messages;
create policy "contact_messages admin write" on public.contact_messages
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- 3D MODELS GALLERY (tabel + storage bucket)
-- =============================================================
create table if not exists public.models_3d (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  file_url text not null,
  file_path text,                              -- storage object path (untuk delete)
  file_name text not null,                     -- nama file asli, untuk attribute download
  format text not null default 'fbx',          -- fbx | obj | stl
  preview_image text,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.models_3d to anon, authenticated;
grant insert, update, delete on public.models_3d to authenticated;
grant all on public.models_3d to service_role;
alter table public.models_3d enable row level security;
drop policy if exists "models_3d public read" on public.models_3d;
create policy "models_3d public read" on public.models_3d for select using (true);
drop policy if exists "models_3d admin write" on public.models_3d;
create policy "models_3d admin write" on public.models_3d for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ---------- Storage bucket: models-3d ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'models-3d', 'models-3d', true,
  104857600,  -- 100 MB
  array['application/octet-stream','model/fbx','model/obj','model/stl','application/x-tgif','model/gltf-binary','model/gltf+json']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "models-3d public read" on storage.objects;
create policy "models-3d public read" on storage.objects
  for select using (bucket_id = 'models-3d');

drop policy if exists "models-3d admin write" on storage.objects;
create policy "models-3d admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'models-3d' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'models-3d' and public.has_role(auth.uid(), 'admin'));

-- Seed: Meja Tamu (asset CDN bawaan, supaya gallery tidak kosong)
insert into public.models_3d (title, description, file_url, file_name, format, tags, sort_order)
select
  'Meja Tamu — Coffee Table',
  'Model 3D meja tamu interaktif. Demonstrasi kemampuan visualisasi 3D dan integrasi viewer real-time pada portofolio digital.',
  '/__l5e/assets-v1/55f76733-7880-42e1-87c2-adf02baacc9e/Meja_Tamu.fbx',
  'Meja_Tamu.fbx',
  'fbx',
  array['3D Modeling','FBX','Three.js','React Three Fiber'],
  1
where not exists (select 1 from public.models_3d);

-- =============================================================
-- PROFILE AVATAR (kolom + storage bucket)
-- =============================================================
alter table public.profile add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true,
  5242880,  -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars admin write" on storage.objects;
create policy "avatars admin write" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'avatars' and public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- AWARENESS VIDEOS (galeri video kampanye keamanan)
-- =============================================================
create table if not exists public.awareness_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  video_url text not null,
  poster_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.awareness_videos to anon, authenticated;
grant insert, update, delete on public.awareness_videos to authenticated;
grant all on public.awareness_videos to service_role;
alter table public.awareness_videos enable row level security;
drop policy if exists "awareness_videos public read" on public.awareness_videos;
create policy "awareness_videos public read" on public.awareness_videos for select using (true);
drop policy if exists "awareness_videos admin write" on public.awareness_videos;
create policy "awareness_videos admin write" on public.awareness_videos for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Seed 8 video Cyber Security & Data Protection Awareness Campaign
insert into public.awareness_videos (title, description, video_url, sort_order)
select * from (values
  ('Edukasi Integrasi Core Tax System & Aspek Keamanan Informasi',
   'Video awareness mengenai panduan dan langkah-langkah implementasi sistem perpajakan terbaru (Core Tax) yang diselaraskan dengan standar kepatuhan keamanan informasi perbankan.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/Awareness%20Coretax_Bank%20Jatim_Ciso_2.mp4', 1),
  ('Security Awareness: Peluncuran Fitur Keamanan JConnect New',
   'Konten kampanye kreatif yang dirancang khusus untuk mengedukasi pengguna mengenai pembaruan fitur keamanan dan pengamanan otentikasi pada aplikasi mobile banking JConnect New.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/Awareness-Launched%20New%20JConnect-CISO.mp4', 2),
  ('Pengenalan dan Perlindungan Data Pribadi Sensitif (UU PDP)',
   'Video edukasi internal mengenai klasifikasi data, cara penanganan, dan pentingnya menjaga kerahasiaan data pribadi sensitif nasabah sesuai dengan regulasi perlindungan data yang berlaku.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/DATA%20PRIBADI%20SENSITIF_CISO.mp4', 3),
  ('Simulasi & Antisipasi Ancaman Serangan Email Phishing',
   'Panduan praktis bagi pegawai untuk mengenali ciri-ciri email phishing yang mencurigakan, mitigasi risiko taktik rekayasa sosial (social engineering), dan prosedur pelaporan insiden.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/EMAIL%20PHISING_CISO.mp4', 4),
  ('Gerakan Bersama (GEBER) Kesadaran Keamanan Informasi',
   'Video campaign interaktif untuk mendukung program peningkatan budaya sadar risiko siber (cyber security culture) di lingkungan operasional kerja perbankan.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/Konten%20Awareness%20BankJatim_GEBER%20PK.mp4', 5),
  ('Dokumentasi & Teaser Training Perlindungan Data Pribadi — Regional Malang',
   'Video dokumentasi bergaya sinematik yang merangkum jalannya pelatihan peningkatan kapasitas dan kesadaran hukum terkait implementasi kepatuhan UU Perlindungan Data Pribadi.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/MOVIE%20AWARENESS%20TRAINING%20PDP%20MALANG.mp4', 6),
  ('Sinematik Pendek: Penerapan Pengamanan & Perlindungan Data Perbankan',
   'Pendekatan edukasi melalui video naratif/sinematik yang menggambarkan skenario nyata pentingnya menerapkan kontrol keamanan ketat dalam melindungi aset data kritis perusahaan.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/%5BMovie%5D%20Awareness%20Penerapan%20Pengamanan%20Pelindungan%20Data%20Pribadi.mp4', 7),
  ('Tutorial Teknis Penggunaan Aplikasi Perpajakan (Core Tax)',
   'Video panduan tutorial langkah demi langkah (walkthrough) untuk membantu pengguna melakukan navigasi dan pengoperasian modul sistem perpajakan secara aman dan benar.',
   'https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/coretax%20tutor.mp4', 8)
) as v(title, description, video_url, sort_order)
where not exists (select 1 from public.awareness_videos);
