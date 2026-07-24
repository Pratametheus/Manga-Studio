# 🍡 MochiToon

**Rumah produksi komik independen** — dari konsep, naskah, storyboard, hingga panel final. MochiToon adalah platform manajemen produksi manga berbasis web yang dirancang untuk studio komik indie maupun kreator solo.

![MochiToon](Mochi-Mascot.webp)

---

## ✨ Fitur

### 🏠 Public Site (Landing Page)
- **Portfolio Gallery** — Showcase karya manga dengan carousel interaktif
- **Hero Section** — Animasi GSAP + Motion untuk first impression yang kuat
- **FAQ Section** — Accordion interaktif
- **SEO-Ready** — Meta tags dinamis via Vercel Edge Function + Open Graph

### 🔐 Admin Dashboard (Protected)
- **Project Studio** — Manajemen produksi manga end-to-end:
  - 📖 **Naskah Manager** — Bab per bab dengan Tiptap rich text editor
  - 👤 **Character Manager** — Profil karakter dengan field custom
  - 🎬 **Storyboard Manager** — Tracking approval: draf → review → revisi → disetujui
  - 📎 **Reference Manager** — Shiryo (資料) untuk lokasi, arsitektur, pakaian, pose
  - 📋 **Kanban Board** — Visualisasi tahap produksi
- **Landing Settings** — Atur SEO, FAQ, Team, dan konten homepage
- **Gallery Manager** — Upload & kelola artwork portfolio

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | React 19 + Vite 6 |
| **Styling** | Tailwind CSS v4 + Liquid Glass aesthetic |
| **Animation** | GSAP + Motion (Framer Motion) |
| **Routing** | React Router DOM v7 |
| **Database & Auth** | Supabase (Postgres + Auth) |
| **Rich Text** | Tiptap Editor |
| **Forms** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **Deploy** | Vercel |

### Design System
- **Typography:** Archivo (heading) + Space Grotesk (body)
- **Color Palette:** Premium dark + pink accent (`#EC4899`)
- **Style:** Liquid Glass — translucent, fluid, smooth transitions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
Buat file `.env.local` dari template:
```bash
cp .env.example .env.local
```

Isi dengan credentials Supabase & Gemini API key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run development server
```bash
npm run dev
```
App akan berjalan di `http://localhost:3000`

### 4. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

```
mochitoon/
├── api/                 # Vercel Edge Functions (SEO SSR)
├── assets/              # Static assets
├── design-system/       # Design tokens & guidelines
├── public/              # Public static files
├── src/
│   ├── components/
│   │   ├── admin/       # Admin UI components
│   │   ├── auth/        # Auth-related components
│   │   ├── public/      # Public site components
│   │   └── ui/          # Shared UI primitives
│   ├── pages/
│   │   ├── public/      # Home, Manga Detail
│   │   ├── auth/        # Login, Set Password
│   │   └── admin/       # Dashboard, Studio, Settings
│   ├── lib/
│   │   ├── supabase.ts  # Supabase client
│   │   └── utils.ts     # Utility helpers
│   ├── types.ts         # TypeScript domain models
│   ├── data.ts          # Mock data
│   └── App.tsx          # Route definitions
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## 🔑 Auth Flow

MochiToon menggunakan **Supabase Auth** dengan magic link:

1. User masukkan email di halaman `/login`
2. Supabase kirim magic link ke email
3. Link redirect ke `/set-password` untuk setup password pertama kali
4. Protected routes (`/admin/*`) dijaga oleh `<ProtectedRoute>` component

---

## 🎨 Domain Model

| Entity | Deskripsi |
|--------|-----------|
| `ProjectManga` | Proyek manga dengan metadata (judul, logline, tema, target pasar) |
| `Character` | Profil karakter dengan field yang bisa dikustomisasi |
| `NaskahBab` | Konten bab per bab dengan tahap produksi |
| `Storyboard` | Storyboard panel dengan status approval |
| `ReferenceShiryo` | Reference material (lokasi, arsitektur, pakaian, pose) |
| `Artwork` | Karya untuk public gallery |
| `FAQ` | Pertanyaan umum untuk landing page |

---

## 📝 Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview build lokal |
| `npm run lint` | Type check dengan TypeScript (strict mode) |
| `npm run clean` | Hapus build artifacts |

---

## 🌐 SEO Strategy

SEO di-handle oleh **Vercel Edge Function** (`api/seo.ts`):
- Mengambil data dinamis dari Supabase (judul manga, deskripsi, cover)
- Inject meta tags ke HTML statis
- Cache 60 detik (stale-while-revalidate)

---

## 📄 License

Private — All rights reserved by MochiToon Studio.

---

> *"Menciptakan kisah epik dengan standar visual tertinggi."* — MochiToon
