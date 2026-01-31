# 🩺 SehatLink

**Healthcare when it matters most** — A full-stack telemedicine platform for booking doctor appointments, video consultations, and AI-assisted symptom checking.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF)](https://clerk.com/)
[![Vonage](https://img.shields.io/badge/Vonage-Video-ED1C24?logo=vonage)](https://www.vonage.com/)

---

## 📖 Overview

SehatLink is a modern **doctor appointment and telemedicine platform** built for patients, doctors, and admins. It supports appointment booking, **HD video calls via Vonage** for telemedicine, AI-powered symptom guidance, nearby and curated care, and a credit-based pricing model.

---

## ✨ Features

| Category | Description |
|----------|-------------|
| **🔐 Authentication** | Sign-in/sign-up with **Clerk** — email, social logins, and protected routes |
| **📅 Appointments** | Book, view, and manage consultations by specialty, doctor profile, and time slots |
| **📞 Video Calls** | **Vonage Video API** (Opentok) for real-time, secure telemedicine consultations from the browser |
| **📍 Nearby & Curated Care** | Find doctors by location and get AI-curated recommendations |
| **🤖 Symptom Checker** | **Gemini AI**–driven symptom guidance to help users decide when to see a doctor |
| **💳 Credits & Pricing** | Credit-based consultation packages and transparent pricing |
| **👨‍⚕️ Doctor Dashboard** | Availability, earnings, appointments, and verification workflows |
| **🛡️ Admin** | Verify doctors, manage payouts, and oversee the platform |
| **🎨 UI** | Responsive, accessible interface with **Tailwind CSS** and **shadcn/ui** |
| **🗄️ Data** | **Neon PostgreSQL** + **Prisma** for secure, scalable storage |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Framework** | Next.js 15 (App Router, React Server Components) |
| **Styling** | Tailwind CSS 4, shadcn/ui, Framer Motion |
| **Database** | Neon PostgreSQL, Prisma ORM |
| **Auth** | Clerk |
| **Video** | Vonage Video API (Opentok) — `@vonage/server-sdk`, `@vonage/video`, `opentok` |
| **AI** | Google Gemini API (symptom checker) |
| **Deploy** | Vercel |

---

## 📁 Project Structure

```
SehatLink/
├── app/
│   ├── (auth)/          # Sign-in, sign-up
│   ├── (main)/          # Main app routes
│   │   ├── admin/       # Admin dashboard
│   │   ├── appointments/
│   │   ├── curated-care/
│   │   ├── doctor/      # Doctor dashboard & verification
│   │   ├── doctors/     # Browse & book by specialty
│   │   ├── nearby-care/
│   │   ├── onboarding/
│   │   ├── pricing/
│   │   ├── symptom-checker/
│   │   └── video-call/  # Vonage video call UI
│   ├── api/             # API routes (search, symptom-checker, etc.)
│   └── layout.js, globals.css
├── actions/             # Server actions (appointments, credits, doctor, etc.)
├── components/          # Shared UI (header, pricing, symptom-checker, etc.)
├── lib/                 # Prisma client, utils, schemas, prompts
├── prisma/              # Schema, migrations, seed
└── public/
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** / **npm** / **yarn**
- Accounts (free tiers work): [Clerk](https://clerk.com), [Vonage](https://www.vonage.com), [Neon](https://neon.tech), [Gemini](https://ai.google.dev)

### 1. Clone and install

```bash
git clone https://github.com/your-username/sehatlink.git
cd sehatlink
npm install
```

### 2. Environment variables

Create a `.env` file in the project root and add:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Vonage Video (for telemedicine)
NEXT_PUBLIC_VONAGE_APPLICATION_ID=
VONAGE_PRIVATE_KEY=lib/private.key   # path to your Vonage private key file

# Database (Neon)
DATABASE_URL="postgresql://..."

# Gemini (symptom checker)
GEMINI_API_KEY=
```

Get **Vonage** credentials and a **private key** from the [Vonage Video API dashboard](https://tokbox.com/account/); place the key file at `lib/private.key` or update `VONAGE_PRIVATE_KEY` accordingly.

### 3. Database setup

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database |

---

## 👩‍💻 Team

| Name   | Role                |
|--------|---------------------|
| Ajeet  | Full Stack Developer |
| Alok   | Backend Engineer    |

---

## 📄 License

This project is private. All rights reserved.

---

*Built with Next.js, Prisma, Neon, Clerk, and Vonage — for healthcare that’s simple and reliable.*
