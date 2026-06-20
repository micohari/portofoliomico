import { createFileRoute, Link } from "@tanstack/react-router";
import { PortfolioStatusBanner } from "@/components/PortfolioStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { PortfolioProvider, usePortfolio, iconFor } from "@/hooks/usePortfolioData";

const ModelViewer = lazy(() => import("@/components/ModelViewer"));
import projectAdImplementation from "@/assets/project-ad-implementation.jpg";
import projectEkarcis from "@/assets/project-ekarcis.png";
import projectLaporku from "@/assets/project-laporku.png";
import projectBeritaPolda from "@/assets/project-beritapoldaterkini.png";
import projectJournalsTerkini from "@/assets/project-journalsterkini.png";
import projectJejakBeritaku from "@/assets/project-jejakberitaku.png";
import projectLiputanPeteng from "@/assets/project-liputanpeteng.png";
import projectPoldapedia from "@/assets/project-poldapedia.png";
import projectSdnJanti1 from "@/assets/project-sdn-janti1.jpg";
import projectAbsensiJanti1 from "@/assets/project-absensi-janti1.jpg";
import dpoAwareness1 from "@/assets/dpo-awareness-1.jpg.asset.json";
import dpoAwareness2 from "@/assets/dpo-awareness-2.jpg.asset.json";
import type { Model3DRow, AwarenessVideoRow } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  
  ArrowRight,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  CheckCircle2,
  Briefcase,
  MapPin,
  Eye,
  Server,
  TrendingUp,
  Award,
  
  Target,
  Lock,
  X,
  Maximize2,
  Globe,
  Video,
  Box,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mico Hari Syahgita — Data Protection Officer & Information Security" },
      {
        name: "description",
        content:
          "CV digital profesional: Data Protection Officer, Security Operations Center (SOC), IBM QRadar SIEM, dan tata kelola keamanan informasi untuk industri perbankan.",
      },
    ],
  }),
  component: Index,
});

/* ============================================================
   DATA PROFIL — ubah bagian ini untuk mengisi CV Anda
   ============================================================ */
const PROFILE = {
  name: "Mico Hari Syahgita",
  role: "Data Protection Officer & Information Security Professional",
  email: "micohari0@gmail.com",
  location: "Surabaya, Indonesia",
  linkedin: "https://www.linkedin.com/in/micoharisyahgita",
  github: "#",
  cvUrl: "#", // Ganti dengan link download CV Anda (Google Drive, Dropbox, dll.)
  summary:
    "Profesional keamanan informasi dengan perjalanan karir dari IT Support menuju Security Operations Center (SOC) dan Data Protection Officer (DPO) di industri perbankan. Saat ini bertugas di Bank Jatim (Okt 2024 — Sekarang) menangani pemantauan keamanan berbasis SIEM (IBM QRadar) dengan integrasi log dari berbagai platform keamanan, serta menyusun program training & awareness PDP untuk meningkatkan kesadaran karyawan terhadap perlindungan data pribadi. Sebelumnya menjalankan peran IT Support di Grand Inn Tunjungan Hotel (Jul — Sep 2023) untuk maintenance infrastruktur IT dan troubleshooting operasional. Dikenal sebagai individu yang ulet, cepat belajar, dan terus mencari peningkatan dalam proses maupun kompetensi.",
  statement:
    "Saya percaya bahwa keamanan informasi bukan hanya tentang mengurangi risiko, tetapi memastikan organisasi tetap dapat bergerak dengan aman dan berkelanjutan. Saya berusaha untuk terus belajar, beradaptasi, dan selalu mengusahakan hasil yang lebih baik dari sebelumnya.",
};

/* ============================================================
   CORE STRENGTH — keahlian utama
   ============================================================ */
const COMPETENCIES = [
  {
    icon: Lock,
    title: "Data Protection & Awareness",
    desc: "Training dan edukasi perlindungan data pribadi (PDP) untuk meningkatkan kesadaran karyawan dan meminimalkan risiko human error.",
    bullets: [
      "Materi training & awareness PDP yang disusun untuk berbagai level karyawan (operasional hingga manajemen)",
      "Program edukasi berkala untuk meminimalkan risiko insiden akibat kesalahan manusia (human error)",
      "Koordinasi dengan tim terkait untuk sosialisasi kebijakan perlindungan data secara internal",
      "Dukungan dokumentasi dan materi pelatihan untuk kebutuhan compliance & audit internal",
    ],
  },
  {
    icon: Eye,
    title: "Security Operations & SIEM",
    desc: "Pemantauan keamanan real-time, korelasi log, dan penyusunan laporan harian berbasis IBM QRadar.",
    bullets: [
      "SIEM monitoring IBM QRadar dengan integrasi multi-platform (Fortinet, F5, Wazuh, Cybereason, Kaspersky, CrowdStrike, Sangfor, Imperva, Countercraft, Kaseya)",
      "Monitoring 24/7 terhadap log, event, dan trafik jaringan untuk deteksi proaktif",
      "Penyusunan laporan harian SOC berbasis threat hunting, endpoint AV/EDR, anomaly traffic, dan incident response",
      "Dukungan investigasi insiden dasar dan koordinasi eskalasi sesuai playbook SOC",
    ],
  },
  {
    icon: Server,
    title: "IT Infrastructure & Support",
    desc: "Implementasi infrastruktur identitas, endpoint security, dan dukungan teknis operasional.",
    bullets: [
      "Implementasi Active Directory: struktur domain, OU, dan Group Policy untuk kontrol akses terpusat",
      "Deployment endpoint security dan integrasi multi-source ke dalam sistem monitoring",
      "Troubleshooting hardware, software, dan jaringan untuk operasional hotel (3 bulan, target SLA tercapai)",
      "Maintenance & repair perangkat komputer, printer, dan sistem penunjang operasional",
    ],
  },
  {
    icon: TrendingUp,
    title: "Process & Performance Improvement",
    desc: "Kemampuan pendukung untuk efisiensi proses, koordinasi proyek, dan adaptabilitas operasional.",
    bullets: [
      "Continuous improvement: dokumentasi proses dan identifikasi bottleneck operasional",
      "Project coordination untuk inisiatif kepatuhan dan security awareness di tingkat organisasi",
      "Problem solving dengan pendekatan root-cause analysis untuk insiden berulang",
      "Adaptabilitas tinggi pada lingkungan kerja shift (SOC 24/7) dan deadline regulasi",
    ],
  },
];

/* ============================================================
   PENGALAMAN KERJA — isi dengan riwayat perusahaan Anda
   ============================================================ */
type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  type?: string;
  bullets?: string[];
  subRoles?: { title: string; bullets: string[] }[];
};

const EXPERIENCES: Experience[] = [
  {
    company: "Bank Jatim",
    role: "IT Security",
    period: "Oktober 2024 — Sekarang",
    location: "Surabaya, Jawa Timur",
    type: "Full-time (On-site)",
    subRoles: [
      {
        title: "Data Protection Officer (DPO)",
        bullets: [
          "Menyusun dan menyampaikan materi training & awareness PDP kepada karyawan untuk meningkatkan pemahaman terhadap perlindungan data pribadi.",
          "Mendukung sosialisasi kebijakan perlindungan data secara internal dan koordinasi dengan unit terkait.",
          "Menyediakan dokumentasi edukasi dan materi pelatihan untuk kebutuhan compliance & audit internal.",
        ],
      },
      {
        title: "Security Operations Center (SOC)",
        bullets: [
          "Melakukan monitoring real-time terhadap log, event, dan trafik jaringan menggunakan SIEM IBM QRadar.",
          "Mengintegrasikan berbagai sumber log keamanan: Fortinet, F5, Wazuh, Cybereason, Kaspersky, CrowdStrike, Sangfor, Imperva, Countercraft, dan Kaseya.",
          "Menyusun laporan akhir harian SOC yang mencakup threat hunting, endpoint AV/EDR, anomaly traffic, incident response, dan network security monitoring.",
          "Membantu investigasi insiden keamanan dasar, korelasi event, serta eskalasi terdokumentasi sesuai playbook SOC.",
        ],
      },
    ],
  },
  {
    company: "Grand Inn Tunjungan Hotel",
    role: "IT Support",
    period: "Juli 2023 — September 2023",
    location: "Surabaya, Jawa Timur",
    type: "Kontrak, 3 Bulan",
    bullets: [
      "Memberikan dukungan teknis harian untuk perangkat keras, perangkat lunak, dan jaringan internal hotel.",
      "Melakukan maintenance & repair perangkat komputer, printer, serta sistem penunjang operasional.",
      "Membantu tim IT dalam troubleshooting jaringan, konfigurasi perangkat, serta peningkatan kinerja sistem.",
    ],
  },
];

/* ============================================================
   PROYEK SIGNIFIKAN — studi kasus terpilih
   ============================================================ */
type ProjectCategory = "Website" | "Video Awareness" | "3D Model" | "Infrastruktur & Keamanan";

type Project = {
  category: ProjectCategory;
  tag: string;
  title: string;
  description: string;
  highlights: string[];
  stack: string[];
  /** Gambar preview (screenshot / render / foto implementasi) */
  previewImage?: string;
  /** Galeri foto tambahan yang ditampilkan dalam lightbox, dengan caption opsional */
  gallery?: { src: string; caption?: string; alt?: string }[];
  /** URL website live untuk di-embed via iframe. Jika diisi, modal akan menampilkan iframe. */
  embedUrl?: string;
  /** Link eksternal untuk tombol "Kunjungi" */
  externalUrl?: string;
};

const PROJECTS: Project[] = [
  {
    category: "Website",
    tag: "Web Development",
    title: "E-Karcis",
    description:
      "Platform digital untuk pemesanan dan informasi tiket yang dibangun dengan teknologi modern, menawarkan pengalaman pengguna yang cepat dan responsif.",
    highlights: [
      "Sistem pemesanan tiket yang efisien",
      "Antarmuka pengguna modern dan responsif",
      "Di-deploy pada Cloudflare Pages untuk performa optimal",
    ],
    stack: ["React", "Tailwind CSS", "Cloudflare Pages", "SPA"],
    previewImage: projectEkarcis,
    externalUrl: "https://ekarcis.pages.dev/",
    embedUrl: "https://ekarcis.pages.dev/",
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "Laporku",
    description:
      "Platform pelaporan online yang memudahkan masyarakat untuk menyampaikan aspirasi dan laporan secara digital dengan antarmuka yang sederhana dan responsif.",
    highlights: [
      "Formulir pelaporan yang mudah digunakan",
      "Dashboard statistik laporan real-time",
      "Desain responsif untuk akses mobile",
    ],
    stack: ["React", "Tailwind CSS", "Cloudflare Pages", "SPA"],
    externalUrl: "https://laporku.pages.dev/",
    embedUrl: "https://laporku.pages.dev/",
    previewImage: projectLaporku,
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "Berita Polda Terkini",
    description:
      "Portal berita yang menyajikan informasi terkini seputar kegiatan dan perkembangan di lingkungan kepolisian daerah dengan tampilan editorial yang bersih.",
    highlights: [
      "Update berita harian seputar Polda",
      "Kategori berita yang terstruktur",
      "Integrasi dengan platform Blogger",
    ],
    stack: ["Blogger", "HTML", "CSS", "SEO"],
    externalUrl: "https://beritapoldaterkini.blogspot.com",
    embedUrl: "https://beritapoldaterkini.blogspot.com",
    previewImage: projectBeritaPolda,
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "Journals Terkini",
    description:
      "Blog jurnal dan publikasi yang mengumpulkan artikel, opini, dan tulisan terkini dalam format yang mudah dibaca dan dinavigasi.",
    highlights: [
      "Kumpulan artikel dan jurnal terkini",
      "Navigasi kategori yang intuitif",
      "Optimasi SEO untuk jangkauan organik",
    ],
    stack: ["Blogger", "HTML", "CSS", "SEO"],
    externalUrl: "https://journalsterkini.blogspot.com",
    embedUrl: "https://journalsterkini.blogspot.com",
    previewImage: projectJournalsTerkini,
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "Jejak Beritaku",
    description:
      "Blog personal yang mendokumentasikan jejak berita dan informasi menarik dengan fokus pada keterbacaan dan kemudahan eksplorasi konten.",
    highlights: [
      "Arsip berita yang terorganisir dengan baik",
      "Tampilan minimalis untuk fokus pada konten",
      "Performa cepat dan mobile-friendly",
    ],
    stack: ["Blogger", "HTML", "CSS", "Responsive Design"],
    externalUrl: "https://jejakberitaku.blogspot.com",
    embedUrl: "https://jejakberitaku.blogspot.com",
    previewImage: projectJejakBeritaku,
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "Liputan Peteng",
    description:
      "Media blog yang menyajikan liputan dan berita dengan perspektif lokal, menggunakan platform Blogger untuk distribusi konten yang cepat dan mudah.",
    highlights: [
      "Liputan berita dengan perspektif lokal",
      "Distribusi konten melalui Blogger",
      "Desain sederhana untuk aksesibilitas tinggi",
    ],
    stack: ["Blogger", "HTML", "CSS", "Content Strategy"],
    externalUrl: "https://liputanpeteng.blogspot.com",
    embedUrl: "https://liputanpeteng.blogspot.com",
    previewImage: projectLiputanPeteng,
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "Poldapedia",
    description:
      "Ensiklopedia digital yang mengumpulkan informasi, data, dan referensi terkait kepolisian daerah dalam format yang mudah diakses dan dipelajari.",
    highlights: [
      "Kumpulan informasi dan referensi Polda",
      "Navigasi topik yang terstruktur",
      "Aksesibilitas tinggi melalui Blogger",
    ],
    stack: ["Blogger", "HTML", "CSS", "Knowledge Base"],
    externalUrl: "https://poldapedia.blogspot.com",
    embedUrl: "https://poldapedia.blogspot.com",
    previewImage: projectPoldapedia,
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "SDN Janti 1 — Website Sekolah",
    description:
      "Website resmi SDN Janti 1 yang menampilkan profil sekolah, berita kegiatan, galeri, dan informasi akademik dengan desain ramah dan mudah diakses oleh orang tua maupun masyarakat.",
    highlights: [
      "Profil sekolah, visi-misi, dan informasi akademik terstruktur",
      "Bagian berita & galeri kegiatan untuk transparansi sekolah",
      "Desain responsif yang mudah diakses dari perangkat mobile",
    ],
    stack: ["React", "Tailwind CSS", "Lovable", "Responsive Design"],
    externalUrl: "https://sdnjanti1.lovable.app/",
    embedUrl: "https://sdnjanti1.lovable.app/",
    previewImage: projectSdnJanti1,
  },
  {
    category: "Website",
    tag: "Web Development",
    title: "Absensi SDN Janti 1",
    description:
      "Aplikasi web absensi digital pendamping website SDN Janti 1, memudahkan pencatatan kehadiran siswa secara real-time dengan rekap yang dapat diakses guru dan wali kelas.",
    highlights: [
      "Pencatatan kehadiran siswa secara digital dan real-time",
      "Rekap absensi otomatis untuk guru dan wali kelas",
      "Terintegrasi sebagai pendamping website resmi SDN Janti 1",
    ],
    stack: ["React", "Tailwind CSS", "Lovable", "Responsive Design"],
    externalUrl: "https://absensijanti1.lovable.app/",
    embedUrl: "https://absensijanti1.lovable.app/",
    previewImage: projectAbsensiJanti1,
  },
  {
    category: "Video Awareness",
    tag: "Privacy & Security Awareness",
    title: "Video Awareness — Koleksi Materi Edukasi",
    description:
      "Kumpulan video awareness untuk edukasi karyawan terkait perlindungan data pribadi (PDP) dan keamanan informasi. Dipakai sebagai materi sosialisasi internal pada program training & awareness.",
    highlights: [
      "Materi visual untuk meningkatkan pemahaman karyawan terhadap PDP",
      "Mendukung program training & awareness berkala",
      "Disusun ringkas agar mudah dikonsumsi oleh berbagai level peserta",
    ],
    stack: ["Video", "Awareness", "PDP", "Internal Training"],
    externalUrl: "https://drive.google.com/drive/u/2/folders/1Rk5nKwUxp1VGzEr5AOVyTyrN2BpOwHIG",
  },
  {
    category: "3D Model",
    tag: "3D Visualization",
    title: "Meja Tamu — Model 3D Interaktif",
    description:
      "Model 3D meja tamu (coffee table) yang dapat diperiksa secara interaktif langsung di browser. Dibangun untuk menunjukkan kemampuan visualisasi 3D dan integrasi viewer real-time dalam portofolio digital.",
    highlights: [
      "Viewer interaktif langsung di browser dengan kontrol orbit, zoom, dan pan",
      "Format FBX dengan pencahayaan studio dan rendering real-time",
      "Siap diunduh untuk inspeksi lebih lanjut",
    ],
    stack: ["3D Modeling", "FBX", "Three.js", "React Three Fiber"],
  },
  {
    category: "Infrastruktur & Keamanan",
    tag: "Infrastructure",
    title: "Implementasi Active Directory",
    description:
      "Implementasi Active Directory untuk mendukung manajemen identitas, kontrol akses, dan operasional TI terpusat.",
    highlights: [
      "Pengaturan struktur domain dan organisasi unit (OU)",
      "Kebijakan grup (Group Policy) untuk kontrol akses & endpoint",
      "Integrasi dengan sistem autentikasi internal",
    ],
    stack: ["Active Directory", "Group Policy", "Windows Server"],
    previewImage: projectAdImplementation,
  },
  {
    category: "Infrastruktur & Keamanan",
    tag: "Data Protection",
    title: "Data Protection Initiative",
    description:
      "Awareness penerapan pengamanan pelindungan data pribadi di Bank Jatim — mendukung penerapan tata kelola perlindungan data melalui sosialisasi, dokumentasi, dan penyusunan proses sesuai standar regulasi.",
    highlights: [
      "Sesi awareness PDP untuk level manajemen Bank Jatim",
      "Penyusunan SOP perlindungan data dan keamanan informasi",
      "Inisiatif kepatuhan regulasi dan continuous improvement",
    ],
    stack: ["SOP Documentation", "Risk Assessment", "Compliance Framework"],
    previewImage: dpoAwareness1.url,
    gallery: [
      {
        src: dpoAwareness1.url,
        alt: "Foto bersama tim Data Protection Officer Bank Jatim di depan layar sesi awareness",
        caption:
          "Sesi Awareness Penerapan Pengamanan Pelindungan Data Pribadi — bersama tim Data Protection Officer (DPO) Bank Jatim sebagai panitia & narasumber kegiatan.",
      },
      {
        src: dpoAwareness2.url,
        alt: "Foto bersama peserta level manajemen Bank Jatim di ruang ballroom acara awareness PDP",
        caption:
          "Dokumentasi peserta Level Manajemen Bank Jatim usai sesi awareness PDP — sosialisasi tata kelola perlindungan data pribadi sesuai UU PDP No. 27/2022.",
      },
    ],
  },
];

const PROJECT_CATEGORIES: { key: ProjectCategory; label: string; icon: typeof Globe }[] = [
  { key: "Website", label: "Website", icon: Globe },
  { key: "Video Awareness", label: "Video Awareness", icon: Video },
  { key: "3D Model", label: "3D Model", icon: Box },
  { key: "Infrastruktur & Keamanan", label: "Infrastruktur & Keamanan", icon: Shield },
];

/* ============================================================
   SERTIFIKASI
   ============================================================ */
const CERTIFICATIONS = [
  {
    icon: Lock,
    title: "IAPP CIPP/US Privacy Professional Certification Prep",
    issuer: "Wiley Skills Network · Coursera Specialization",
    year: "Jun 2026",
    desc: "Specialization 3 kursus: Mastering Privacy Laws and Legal Frameworks, Data Management and Privacy Practices for Professionals, dan Navigating State and International Privacy Regulations — persiapan ujian CIPP/US dan penerapan prinsip privasi di berbagai sektor.",
    verifyUrl: "https://coursera.org/verify/specialization/XPLU63UDP7MJ",
  },
];

/* ============================================================
   NAVBAR — sticky, clean corporate
   ============================================================ */
function Navbar() {
  const ctx = usePortfolio();
  const profile = ctx.profile
    ? {
        name: ctx.profile.name,
        cvUrl: ctx.profile.cv_url,
      }
    : { name: PROFILE.name, cvUrl: PROFILE.cvUrl };
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#summary", label: "Ringkasan" },
    { href: "#competencies", label: "Keahlian" },
    { href: "#experience", label: "Pengalaman" },
    { href: "#projects", label: "Proyek" },
    { href: "#certifications", label: "Sertifikasi" },
    { href: "#contact", label: "Kontak" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/90 backdrop-blur-xl"
          : "border-b border-transparent bg-background/60 backdrop-blur"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#summary" className="text-sm font-bold tracking-tight text-foreground">
          {profile.name}
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Buka menu"
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground lg:hidden"
          >
            <span className="text-lg leading-none">≡</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm font-medium text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

/* ============================================================
   HERO / RINGKASAN EKSEKUTIF
   ============================================================ */
function Hero() {
  const ctx = usePortfolio();
  const profile = ctx.profile
    ? {
        name: ctx.profile.name,
        role: ctx.profile.role,
        email: ctx.profile.email,
        location: ctx.profile.location,
        linkedin: ctx.profile.linkedin,
        cvUrl: ctx.profile.cv_url,
        summary: ctx.profile.summary,
        avatarUrl: ctx.profile.avatar_url ?? null,
      }
    : { ...PROFILE, avatarUrl: null as string | null };
  return (
    <section id="summary" className="border-b border-border bg-background pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col-reverse items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
              Terbuka untuk peluang baru
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {profile.name}
              <span className="mt-3 block text-xl font-semibold text-[var(--navy)] md:text-2xl">
                {profile.role}
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {profile.summary}
            </p>
          </div>
          {profile.avatarUrl && (
            <div className="shrink-0">
              <div className="relative">
                {/* Decorative accent backdrop */}
                <div
                  aria-hidden
                  className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-[var(--teal)]/25 via-[var(--navy)]/10 to-transparent blur-xl"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-3 -right-3 -z-10 h-24 w-24 rounded-2xl border-2 border-[var(--teal)]/40 md:h-28 md:w-28"
                />
                <div className="relative h-48 w-40 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-[var(--navy)]/10 transition-transform duration-300 hover:-translate-y-1 md:h-64 md:w-56">
                  <img
                    src={profile.avatarUrl}
                    alt={`Foto ${profile.name}`}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-background/85 px-2.5 py-1.5 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--teal)]" />
                    <span className="truncate text-[11px] font-semibold text-foreground">
                      {profile.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Career Timeline Snapshot */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--navy)]" />
            <div>
              <div className="text-xs font-semibold text-foreground">Bank Jatim — IT Security (DPO & SOC)</div>
              <div className="text-xs text-muted-foreground">Okt 2024 — Sekarang · Full-time</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--teal)]" />
            <div>
              <div className="text-xs font-semibold text-foreground">Grand Inn Tunjungan — IT Support</div>
              <div className="text-xs text-muted-foreground">Jul 2023 — Sep 2023 · Kontrak</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#competencies"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-[var(--navy-deep)] hover:shadow-md"
          >
            Lihat Keahlian Utama
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* KPI & Contoh Output per Role */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--navy)]">
              <Lock className="h-3.5 w-3.5" /> DPO · Bank Jatim
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <div className="text-xl font-extrabold text-foreground">100%</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Sesi training & awareness PDP tersampaikan kepada target peserta</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground">3+</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Materi edukasi PDP yang disusun (presentasi, handout, soal evaluasi)</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground">1</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Program privacy awareness berjalan untuk meminimalkan human error</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Output:</span> materi training PDP, dokumentasi sosialisasi internal, daftar hadir & evaluasi peserta, serta laporan pelaksanaan edukasi untuk kebutuhan compliance.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--navy)]">
              <Eye className="h-3.5 w-3.5" /> SOC · Bank Jatim
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <div className="text-xl font-extrabold text-foreground">24/7</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Monitoring SIEM IBM QRadar multi-platform</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground">10+</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Sumber log & platform terintegrasi</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground">Daily</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Laporan SOC: threat hunting, AV/EDR, anomaly, incident</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Output:</span> laporan harian SOC berbasis threat hunting, endpoint AV/EDR, anomaly traffic, dan incident response dengan eskalasi terdokumentasi sesuai playbook.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--navy)]">
              <Server className="h-3.5 w-3.5" /> IT Support · Grand Inn
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <div className="text-xl font-extrabold text-foreground">3 bln</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Kontrak selesai tanpa eskalasi mayor</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground">&lt;1 hr</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Rata-rata response time tiket internal</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground">0</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Downtime kritikal pada sistem front-office</div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Output:</span> dukungan harian PC/printer/jaringan, perbaikan perangkat operasional hotel, serta dokumentasi konfigurasi untuk handover tim IT.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {profile.location}
          </span>
          <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 hover:text-foreground">
            <Mail className="h-4 w-4" /> {profile.email}
          </a>
          <a href={profile.linkedin} className="inline-flex items-center gap-2 hover:text-foreground">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CORE STRENGTH — keahlian utama
   ============================================================ */
function Competencies() {
  const ctx = usePortfolio();
  const items = ctx.strengths.length
    ? ctx.strengths.map((s) => ({
        icon: iconFor(s.icon, Lock),
        title: s.title,
        desc: s.description,
        bullets: s.bullets ?? [],
      }))
    : COMPETENCIES;
  return (
    <section id="competencies" className="border-b border-border bg-secondary/30 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Core Strength"
          title="Keahlian utama."
          subtitle="Empat area kompetensi yang mendukung peran Data Protection Officer dan profesional keamanan informasi."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {items.map(({ icon: Icon, title, desc, bullets }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--navy)] hover:shadow-[var(--shadow-soft)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-[var(--navy)] transition-colors group-hover:bg-[var(--navy)] group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>

              <ul className="mt-5 space-y-2">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PENGALAMAN KERJA — TIMELINE
   ============================================================ */
function ExperienceSection() {
  const ctx = usePortfolio();
  const items: Experience[] = ctx.experiences.length
    ? ctx.experiences.map((e) => ({
        company: e.company,
        role: e.role,
        period: e.period,
        location: e.location,
        type: e.work_type ?? undefined,
        bullets: e.bullets ?? undefined,
        subRoles: e.sub_roles ?? undefined,
      }))
    : EXPERIENCES;
  return (
    <section id="experience" className="border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Work Experience"
          title="Rekam jejak profesional."
          subtitle="Perjalanan dari IT Support menuju Security Operations Center (SOC) dan Data Protection Officer (DPO) di industri perbankan."
        />

        <ol className="relative mt-14 border-l border-border pl-8 md:pl-10">
          {items.map((exp, i) => (
            <li key={i} className="relative pb-12 last:pb-0">
              {/* dot */}
              <span className="absolute -left-[37px] grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-[var(--navy)] shadow-sm md:-left-[45px]">
                <Briefcase className="h-4 w-4" />
              </span>

              <div className="rounded-xl border border-border bg-card p-6 transition-all hover:border-[var(--navy)] hover:shadow-[var(--shadow-soft)]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold text-foreground">{exp.role}</h3>
                  <span className="text-xs font-medium text-muted-foreground">{exp.period}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="font-semibold text-[var(--navy)]">{exp.company}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {exp.location}
                  </span>
                  {exp.type && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{exp.type}</span>
                    </>
                  )}
                </div>

                {exp.subRoles && exp.subRoles.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {exp.subRoles.map((sr, si) => (
                      <div key={si}>
                        <h4 className="text-sm font-semibold text-foreground">{sr.title}</h4>
                        <ul className="mt-2 space-y-2">
                          {sr.bullets.map((b, j) => (
                            <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                              <span className="leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ============================================================
   AWARENESS VIDEOS GALLERY — dari Supabase + fallback statis
   ============================================================ */
const FALLBACK_VIDEOS: AwarenessVideoRow[] = [
  { id: "f1", sort_order: 1, poster_url: null,
    title: "Edukasi Integrasi Core Tax System & Aspek Keamanan Informasi",
    description: "Video awareness mengenai panduan dan langkah-langkah implementasi sistem perpajakan terbaru (Core Tax) yang diselaraskan dengan standar kepatuhan keamanan informasi perbankan.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/Awareness%20Coretax_Bank%20Jatim_Ciso_2.mp4" },
  { id: "f2", sort_order: 2, poster_url: null,
    title: "Security Awareness: Peluncuran Fitur Keamanan JConnect New",
    description: "Konten kampanye kreatif yang dirancang khusus untuk mengedukasi pengguna mengenai pembaruan fitur keamanan dan pengamanan otentikasi pada aplikasi mobile banking JConnect New.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/Awareness-Launched%20New%20JConnect-CISO.mp4" },
  { id: "f3", sort_order: 3, poster_url: null,
    title: "Pengenalan dan Perlindungan Data Pribadi Sensitif (UU PDP)",
    description: "Video edukasi internal mengenai klasifikasi data, cara penanganan, dan pentingnya menjaga kerahasiaan data pribadi sensitif nasabah sesuai dengan regulasi perlindungan data yang berlaku.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/DATA%20PRIBADI%20SENSITIF_CISO.mp4" },
  { id: "f4", sort_order: 4, poster_url: null,
    title: "Simulasi & Antisipasi Ancaman Serangan Email Phishing",
    description: "Panduan praktis bagi pegawai untuk mengenali ciri-ciri email phishing yang mencurigakan, mitigasi risiko taktik rekayasa sosial (social engineering), dan prosedur pelaporan insiden.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/EMAIL%20PHISING_CISO.mp4" },
  { id: "f5", sort_order: 5, poster_url: null,
    title: "Gerakan Bersama (GEBER) Kesadaran Keamanan Informasi",
    description: "Video campaign interaktif untuk mendukung program peningkatan budaya sadar risiko siber (cyber security culture) di lingkungan operasional kerja perbankan.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/Konten%20Awareness%20BankJatim_GEBER%20PK.mp4" },
  { id: "f6", sort_order: 6, poster_url: null,
    title: "Dokumentasi & Teaser Training Perlindungan Data Pribadi — Regional Malang",
    description: "Video dokumentasi bergaya sinematik yang merangkum jalannya pelatihan peningkatan kapasitas dan kesadaran hukum terkait implementasi kepatuhan UU Perlindungan Data Pribadi.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/MOVIE%20AWARENESS%20TRAINING%20PDP%20MALANG.mp4" },
  { id: "f7", sort_order: 7, poster_url: null,
    title: "Sinematik Pendek: Penerapan Pengamanan & Perlindungan Data Perbankan",
    description: "Pendekatan edukasi melalui video naratif/sinematik yang menggambarkan skenario nyata pentingnya menerapkan kontrol keamanan ketat dalam melindungi aset data kritis perusahaan.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/%5BMovie%5D%20Awareness%20Penerapan%20Pengamanan%20Pelindungan%20Data%20Pribadi.mp4" },
  { id: "f8", sort_order: 8, poster_url: null,
    title: "Tutorial Teknis Penggunaan Aplikasi Perpajakan (Core Tax)",
    description: "Video panduan tutorial langkah demi langkah (walkthrough) untuk membantu pengguna melakukan navigasi dan pengoperasian modul sistem perpajakan secara aman dan benar.",
    video_url: "https://pub-b82080e4c4f149cf9797c58954e10460.r2.dev/awareness/coretax%20tutor.mp4" },
];

function VideosGallery({ videos }: { videos: AwarenessVideoRow[] }) {
  const list = videos.length ? videos : FALLBACK_VIDEOS;
  const [active, setActive] = useState<AwarenessVideoRow | null>(null);

  return (
    <div className="mt-10">
      <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8">
        <span className="inline-flex items-center rounded-full bg-[var(--teal)]/15 px-3 py-1 text-xs font-semibold text-[var(--navy)]">
          Cyber Security & Data Protection Awareness Campaign
        </span>
        <h3 className="mt-4 text-xl font-bold leading-snug text-foreground">
          Galeri Portofolio Video Awareness
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Koleksi video kampanye edukasi keamanan informasi & perlindungan data pribadi
          yang diproduksi untuk mendukung program training, sosialisasi internal, dan
          penguatan budaya sadar risiko siber di lingkungan perbankan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((v) => (
          <article
            key={v.id}
            className="group flex flex-col overflow-hidden rounded-[12px] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--navy)]/15"
          >
            <button
              type="button"
              onClick={() => setActive(v)}
              className="relative block aspect-video w-full overflow-hidden bg-[var(--navy)] text-left"
              aria-label={`Putar video: ${v.title}`}
            >
              {v.poster_url ? (
                <img
                  src={v.poster_url}
                  alt={v.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <video
                  src={v.video_url}
                  preload="metadata"
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-[var(--navy)] shadow-lg ring-1 ring-black/5 transition-transform group-hover:scale-110">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                <Maximize2 className="h-3 w-3" /> Lihat
              </span>
            </button>
            <div className="flex flex-1 flex-col p-5">
              <h4 className="text-base font-semibold leading-snug text-foreground">{v.title}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
                <Video className="h-3.5 w-3.5 text-[var(--teal)]" />
                <span>Awareness Campaign · Bank Jatim</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-5xl border-border bg-card p-0 sm:rounded-xl">
          <VisuallyHidden>
            <DialogTitle>{active?.title ?? "Video"}</DialogTitle>
            <DialogDescription>{active?.description ?? ""}</DialogDescription>
          </VisuallyHidden>
          {active && (
            <div className="flex flex-col">
              <div className="aspect-video w-full overflow-hidden bg-black sm:rounded-t-xl">
                <video
                  key={active.id}
                  src={active.video_url}
                  poster={active.poster_url ?? undefined}
                  controls
                  autoPlay
                  preload="metadata"
                  className="h-full w-full"
                >
                  Browser Anda tidak mendukung pemutaran video HTML5.
                </video>
              </div>
              <div className="border-t border-border p-5 md:p-6">
                <h3 className="text-base font-bold leading-snug text-foreground md:text-lg">
                  {active.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {active.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================
   3D MODELS GALLERY — dari Supabase
   ============================================================ */
function ModelsGallery({ models }: { models: Model3DRow[] }) {
  const [activeId, setActiveId] = useState<string | null>(models[0]?.id ?? null);

  if (!models.length) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
        <Box className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-3 text-base font-semibold text-foreground">Belum ada model 3D</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tambahkan model lewat menu Admin → 3D Model untuk menampilkannya di gallery ini.
        </p>
      </div>
    );
  }

  const active = models.find((m) => m.id === activeId) ?? models[0];

  return (
    <div className="mt-10 space-y-6">
      {/* Grid thumbnail */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => {
          const isActive = m.id === active.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className={`group overflow-hidden rounded-xl border text-left transition-all ${
                isActive
                  ? "border-[var(--teal)] ring-2 ring-[var(--teal)]/30 bg-card"
                  : "border-border bg-card hover:border-[var(--navy)]"
              }`}
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#0b1220] to-[#1a2540]">
                {m.preview_image ? (
                  <img
                    src={m.preview_image}
                    alt={m.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <Box className="h-12 w-12 text-white/30" />
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                  {(m.format ?? "fbx").toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <h4 className="line-clamp-1 text-sm font-semibold text-foreground">{m.title}</h4>
                {m.description && (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
                )}
                {m.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Viewer aktif */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-background p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center rounded-full bg-[var(--teal)]/15 px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                3D Visualization
              </span>
              <h3 className="mt-3 text-lg font-bold leading-snug text-foreground">{active.title}</h3>
              {active.description && (
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{active.description}</p>
              )}
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
              {(active.format ?? "fbx").toUpperCase()}
            </span>
          </div>
          {active.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {active.tags.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="p-5">
          <Suspense
            fallback={
              <div className="grid h-[420px] place-items-center rounded-xl border border-border bg-secondary/30 text-xs text-muted-foreground">
                Memuat viewer 3D...
              </div>
            }
          >
            <ModelViewer
              key={active.id}
              url={active.file_url}
              format={(active.format as "fbx" | "obj" | "stl") ?? "fbx"}
              downloadUrl={active.file_url}
              filename={active.file_name}
              height={460}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   PROYEK SIGNIFIKAN
   ============================================================ */
function Projects() {
  const ctx = usePortfolio();
  const PROJECTS_DATA: Project[] = useMemo(
    () =>
      ctx.projects.length
        ? ctx.projects.map((p) => {
            // Helper to match DB image field or title with static imported assets
            let resolvedImage: string | undefined = p.preview_image ?? undefined;
            
            // Check if we need a fallback for empty or placeholder image
            if (!resolvedImage || resolvedImage === "placeholder.png" || !resolvedImage.startsWith("http")) {
              const imgStr = (p.preview_image || "").toLowerCase();
              const t = p.title.toLowerCase();
              
              if (imgStr.includes("ekarcis") || t.includes("e-karcis") || t.includes("ekarcis")) {
                resolvedImage = projectEkarcis;
              } else if (imgStr.includes("laporku") || t.includes("laporku")) {
                resolvedImage = projectLaporku;
              } else if (imgStr.includes("poldapedia") || t.includes("poldapedia")) {
                resolvedImage = projectPoldapedia;
              } else if (imgStr.includes("beritapoldaterkini") || t.includes("berita polda") || t.includes("polda")) {
                resolvedImage = projectBeritaPolda;
              } else if (imgStr.includes("journal") || t.includes("journal")) {
                resolvedImage = projectJournalsTerkini;
              } else if (imgStr.includes("jejak") || t.includes("jejak")) {
                resolvedImage = projectJejakBeritaku;
              } else if (imgStr.includes("peteng") || imgStr.includes("liputan") || t.includes("liputan") || t.includes("peteng")) {
                resolvedImage = projectLiputanPeteng;
              } else if (imgStr.includes("absensi") || t.includes("absensi")) {
                resolvedImage = projectAbsensiJanti1;
              } else if (imgStr.includes("sdn-janti") || imgStr.includes("sdnjanti") || t.includes("sdn janti") || t.includes("janti 1")) {
                resolvedImage = projectSdnJanti1;
              } else if (imgStr.includes("ad-implementation") || t.includes("active directory") || t.includes("ad implementation")) {
                resolvedImage = projectAdImplementation;
              }
            }

            return {
              category: p.category as ProjectCategory,
              tag: p.tag,
              title: p.title,
              description: p.description,
              highlights: p.highlights ?? [],
              stack: p.stack ?? [],
              previewImage: resolvedImage,
              gallery: p.gallery ?? undefined,
              embedUrl: p.embed_url ?? undefined,
              externalUrl: p.external_url ?? undefined,
            };
          })
        : PROJECTS,
    [ctx.projects],
  );
  // State untuk lightbox / modal preview proyek
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<ProjectCategory>("Website");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const dialogTitleId = useId();

  // Tampilkan hanya kategori yang punya proyek (urut sesuai PROJECT_CATEGORIES).
  // Kategori "3D Model" juga aktif jika ada model di Supabase, walau tidak ada project row.
  const availableCategories = PROJECT_CATEGORIES.filter(
    ({ key }) =>
      PROJECTS_DATA.some((p) => p.category === key) ||
      (key === "3D Model" && ctx.models.length > 0),
  );

  // Kunci scroll, ESC, focus trap, dan restore focus saat modal terbuka
  useEffect(() => {
    if (!activeProject) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    // Pindahkan fokus awal ke tombol close
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 50);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setActiveProject(null);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus?.();
    };
  }, [activeProject]);

  const filteredProjects = PROJECTS_DATA.filter((p) => p.category === filter);

  return (
    <section id="projects" className="border-b border-border bg-secondary/30 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Featured Projects"
          title="Proyek signifikan."
          subtitle="Proyek dikelompokkan berdasarkan kategori: Website, Video Awareness, dan 3D Model — plus inisiatif infrastruktur & keamanan. Gunakan filter di bawah untuk menelusuri."
        />

        {/* Filter kategori */}
        <div className="mt-10 flex flex-wrap gap-2">
          {availableCategories.map(({ key, label, icon: Icon }) => {
            const count = PROJECTS_DATA.filter((p) => p.category === key).length;
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "border-[var(--navy)] bg-[var(--navy)] text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-[var(--navy)] hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel khusus kategori: Video Awareness — galeri HTML5 video dari Supabase */}
        {filter === "Video Awareness" && <VideosGallery videos={ctx.videos} />}


        {/* Panel khusus kategori: 3D Model — CTA ke halaman showcase 3D khusus */}
        {filter === "3D Model" && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-full bg-[var(--teal)]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--navy)]">
                  Dedicated Page
                </span>
                <h3 className="mt-3 text-xl font-bold leading-snug text-foreground md:text-2xl">
                  3D Architectural Material Showcase
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Galeri interaktif material aluminium komposit, galvalum, kayu,
                  dan proyek integrasi arsitektur — diputar langsung di browser
                  dengan <code className="rounded bg-secondary px-1.5 py-0.5 text-[12px]">&lt;model-viewer&gt;</code>.
                </p>
              </div>
              <Link
                to="/showcase-3d"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                <Box className="h-4 w-4" />
                Buka 3D Showcase
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {filteredProjects
            .filter((p) => p.category !== "Video Awareness" && p.category !== "3D Model")
            .map((p, i) => {
            const hasPreview = Boolean(p.previewImage || p.embedUrl);
            return (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-300 hover:border-[var(--navy)] hover:shadow-[var(--shadow-elevated)]"
              >
                {/* Preview thumbnail — klik untuk membuka lightbox */}
                {hasPreview && (
                  <button
                    type="button"
                    onClick={() => setActiveProject(p)}
                    aria-label={`Buka preview ${p.title}`}
                    className="relative block aspect-[16/10] w-full overflow-hidden bg-secondary"
                  >
                    {p.previewImage && (
                      <img
                        src={p.previewImage}
                        alt={`Preview ${p.title}`}
                        loading="lazy"
                        width={1280}
                        height={800}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-semibold text-foreground opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                      <Maximize2 className="h-3.5 w-3.5" />
                      {p.embedUrl ? "Live Preview" : "Lihat Preview"}
                    </div>
                  </button>
                )}

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-[var(--teal)]/15 px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                      {p.tag}
                    </span>
                    {(p.externalUrl || p.embedUrl) && (
                      <a
                        href={p.externalUrl || p.embedUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="Kunjungi tautan eksternal"
                        className="text-muted-foreground transition-colors hover:text-[var(--navy)]"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <h3 className="mt-5 text-lg font-bold leading-snug text-foreground">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>

                  <ul className="mt-5 space-y-2">
                    {p.highlights.map((h, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Target className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                        <span className="leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-5">
                    {p.stack.map((s) => (
                      <motion.span
                        key={s}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.15 }}
                        className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--navy)] hover:text-foreground"
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* ========== LIGHTBOX / MODAL PREVIEW ========== */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border bg-background px-5 py-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                    {activeProject.tag}
                  </div>
                  <h3
                    id={dialogTitleId}
                    className="truncate text-sm font-bold text-foreground"
                  >
                    {activeProject.title}
                  </h3>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setActiveProject(null)}
                  aria-label="Tutup preview (Esc)"
                  className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="relative max-h-[80vh] overflow-y-auto bg-black">
                {activeProject.embedUrl ? (
                  <iframe
                    src={activeProject.embedUrl}
                    title={`Live preview ${activeProject.title}`}
                    loading="lazy"
                    className="aspect-[16/10] w-full"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                ) : activeProject.gallery && activeProject.gallery.length > 0 ? (
                  <ul className="divide-y divide-white/10">
                    {activeProject.gallery.map((item, idx) => (
                      <li key={idx}>
                        <figure className="bg-black">
                          <img
                            src={item.src}
                            alt={item.alt ?? `Foto ${idx + 1} dari ${activeProject.title}`}
                            loading="lazy"
                            className="h-auto w-full object-contain"
                          />
                          {item.caption && (
                            <figcaption className="bg-card px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                              <span className="mr-2 inline-flex items-center rounded-md bg-[var(--teal)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--navy)]">
                                Foto {idx + 1}
                              </span>
                              {item.caption}
                            </figcaption>
                          )}
                        </figure>
                      </li>
                    ))}
                  </ul>
                ) : activeProject.previewImage ? (
                  <img
                    src={activeProject.previewImage}
                    alt={`Preview ${activeProject.title}`}
                    className="h-auto max-h-[80vh] w-full object-contain"
                  />
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ============================================================
   SERTIFIKASI
   ============================================================ */
function Certifications() {
  const ctx = usePortfolio();
  const items = ctx.certifications.length
    ? ctx.certifications.map((c) => ({
        icon: iconFor(c.icon, Lock),
        title: c.title,
        issuer: c.issuer,
        year: c.year,
        desc: c.description,
        verifyUrl: c.verify_url ?? undefined,
      }))
    : CERTIFICATIONS;
  return (
    <section id="certifications" className="border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Certifications"
          title="Sertifikasi & pencapaian."
          subtitle="Sertifikasi yang memvalidasi kompetensi teknis dan operasional di bidang keamanan informasi."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, issuer, year, desc, verifyUrl }) => (
            <div
              key={title}
              className="group flex flex-col rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--navy)] hover:shadow-[var(--shadow-soft)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-[var(--navy)] transition-colors group-hover:bg-[var(--navy)] group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold leading-snug text-foreground">{title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
                <span>{issuer}</span>
                <span>·</span>
                <span>{year}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              {verifyUrl && (
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-5 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[var(--navy)] hover:underline"
                >
                  Verifikasi sertifikat
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}

          {/* Placeholder untuk sertifikasi tambahan */}
          <div className="group rounded-xl border border-dashed border-border bg-card/50 p-7 transition-all hover:border-[var(--navy)]">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:text-[var(--navy)]">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-bold text-foreground">Sertifikasi berikutnya</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sedang dipersiapkan: ujian resmi CIPP/US, serta sertifikasi pendukung lain di area privacy, SOC, dan tata kelola keamanan informasi.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}


/* ============================================================
   KONTAK
   ============================================================ */
function Contact() {
  const ctx = usePortfolio();
  const profile = ctx.profile
    ? {
        email: ctx.profile.email,
        linkedin: ctx.profile.linkedin,
        github: ctx.profile.github,
      }
    : PROFILE;
  return (
    <section id="contact" className="border-b border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
              Contact
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Mari diskusikan peluang berikutnya.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
              Saya merespons setiap pesan dalam 1×24 jam kerja. Untuk percakapan cepat,
              terhubung langsung melalui jejaring profesional di bawah.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-[var(--navy)]"
              >
                <Mail className="h-4 w-4 text-[var(--navy)]" />
                {profile.email}
              </a>
              <div className="flex gap-3">
                <a
                  href={profile.linkedin}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-[var(--navy)] hover:text-[var(--navy)]"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
                <a
                  href={profile.github}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-[var(--navy)] hover:text-[var(--navy)]"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Mohon isi semua kolom.");
      return;
    }
    if (form.message.length > 5000) {
      toast.error("Pesan terlalu panjang (maks 5000 karakter).");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        })
        .select("id")
        .single();
      if (error) throw error;

      // Fire-and-forget email notification (Edge Function)
      supabase.functions
        .invoke("notify-contact", { body: { id: data?.id } })
        .catch(() => {
          /* notifikasi email opsional — abaikan kegagalan */
        });

      toast.success("Pesan terkirim. Terima kasih!");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal mengirim pesan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]"
    >
      <div className="space-y-5">
        <Field
          label="Nama"
          id="name"
          placeholder="Nama lengkap Anda"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        />
        <Field
          label="Email"
          id="email"
          type="email"
          placeholder="anda@perusahaan.com"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        />
        <div>
          <label htmlFor="msg" className="mb-2 block text-sm font-semibold text-foreground">
            Pesan
          </label>
          <textarea
            id="msg"
            rows={5}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Ceritakan singkat tentang peluangnya…"
            className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/15"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-[var(--navy-deep)] disabled:opacity-60"
        >
          {submitting ? "Mengirim…" : "Kirim Pesan"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}


/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  const ctx = usePortfolio();
  const name = ctx.profile?.name ?? PROFILE.name;
  return (
    <footer className="bg-background py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {name}. Seluruh hak dilindungi.
        </p>
        <nav className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
          <a href="#summary" className="transition-colors hover:text-foreground">Ringkasan</a>
          <a href="#competencies" className="transition-colors hover:text-foreground">Keahlian</a>
          <a href="#experience" className="transition-colors hover:text-foreground">Pengalaman</a>
          <a href="#projects" className="transition-colors hover:text-foreground">Proyek</a>
          <a href="#certifications" className="transition-colors hover:text-foreground">Sertifikasi</a>
          <a href="#contact" className="transition-colors hover:text-foreground">Kontak</a>
        </nav>
      </div>
    </footer>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 leading-relaxed text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/15"
      />
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
function Index() {
  return (
    <PortfolioProvider>
      <PortfolioStatusBanner />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <Competencies />
          <ExperienceSection />
          <Projects />
          <Certifications />

          <Contact />
        </main>
        <Footer />
      </div>
    </PortfolioProvider>
  );
}
