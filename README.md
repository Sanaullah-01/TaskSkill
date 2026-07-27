# TaskSkill

TaskSkill is a production-grade, highly scalable SaaS task management platform inspired by industry leaders like Linear, Todoist, and Notion. It features real-time collaboration, a beautiful UI, and a powerful Chrome Extension.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Database & Auth:** Supabase (PostgreSQL)
- **Forms & Validation:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Language:** TypeScript (Strict)
- **Extension:** Vite + Manifest V3

---

## ✨ Features

- **Robust Authentication:** Email/Password, Google OAuth, and Two-Factor Authentication (MFA).
- **Task Management:** Full CRUD with labels, categories, and priority tracking.
- **Real-Time Collaboration:** Commenting and Activity Timelines on every task.
- **Secure File Attachments:** Drag-and-drop uploads using Supabase Storage with expiring Signed URLs.
- **Global Search:** `Cmd+K` command palette for instant navigation and searching across the workspace.
- **Chrome Extension:** Native browser extension for quick task capture, context menu integration, and due date alarms.
- **Security First:** Google reCAPTCHA v3 integrated on all auth endpoints, strict Row Level Security (RLS) policies.

---

## 🏗 Architecture & Database Schema

The application is built on top of Supabase (PostgreSQL). We utilize strict **Row Level Security (RLS)** to guarantee that data is securely isolated between users at the database level.

### Core Tables:
1. `profiles`: Extended user data (Name, Bio, Timezone, Avatar).
2. `tasks`: The core entity, linking to user IDs.
3. `categories` & `labels`: Normalised taxonomy for organizing tasks.
4. `task_labels`: Many-to-many join table.
5. `comments`: Associated with `task_id`.
6. `attachments`: Files stored in Supabase buckets, securely referenced here.
7. `activity_logs`: An immutable audit trail of every action taken in the app.
8. `login_history` & `recovery_codes`: Advanced security logs and 2FA fallbacks.

---

## 🛠 Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_recaptcha_site_key
   TURNSTILE_SECRET_KEY=your_recaptcha_secret_key
   ```

3. **Run Database Migrations:**
   Execute all SQL files found in `supabase/migrations/` in your Supabase SQL Editor in order (`001` -> `004`).

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

---

## 🧩 Chrome Extension Setup

TaskSkill includes a powerful companion Chrome Extension located in the `extension/` folder.

1. Navigate to the extension folder:
   ```bash
   cd extension
   npm install
   ```
2. Build the extension:
   ```bash
   npm run build
   ```
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** and click **Load unpacked**.
5. Select the `extension/dist` folder.

---

## 🌍 Deployment (Vercel)

TaskSkill is heavily optimized for Vercel deployment.

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Link the project:
   ```bash
   vercel link
   ```
3. Set your environment variables in Vercel:
   ```bash
   vercel env pull
   ```
4. Deploy to Production!
   ```bash
   vercel --prod
   ```

## 🔒 Security Notes
Ensure that you rotate your Supabase anon keys periodically and enforce MFA for high-privilege users. Do not bypass RLS policies.
