# 🖥️ Team Status Board

A real-time employee status dashboard built with **Next.js 14** + **Supabase**.  
Data persists across refreshes. Updates appear live on all screens instantly.

---

## 🚀 Deploy in 4 Steps

### Step 1 — Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name (e.g. `team-status`)
3. Once created, go to **SQL Editor → New Query**
4. Paste the contents of `supabase-schema.sql` and click **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public key** (long string starting with `eyJ...`)

---

### Step 2 — Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Push this folder to a GitHub repo:
   ```bash
   cd team-status
   git init
   git add .
   git commit -m "initial commit"
   # create a repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/team-status.git
   git push -u origin main
   ```
3. On Vercel: **Add New Project → Import** your GitHub repo
4. Before deploying, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste your Supabase anon key
5. Click **Deploy** — done! 🎉

---

### Step 3 — Share the URL

- **TV Display**: Open the Vercel URL on your office TV browser, go to the **Live Dashboard** tab. It updates in real time — no refresh needed.
- **Team members**: Share the same URL. Everyone goes to **Update My Status**, picks their name, and submits.

---

### Step 4 — Run locally (optional)

```bash
cd team-status
npm install

# Copy the example env file and fill in your Supabase keys
cp .env.local.example .env.local
# Edit .env.local with your actual keys

npm run dev
# Open http://localhost:3000
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 📺 Live Dashboard | Real-time updates via Supabase Realtime — no page refresh needed |
| ✏️ Status Form | Each person picks their name and submits their status |
| 📋 Jira Tracker | Table view of all updates with filtering by status |
| 🎫 Jira Tickets | Optionally attach a Jira ticket ID to each update |
| ⏰ ETA | Set an expected finish time per task |
| 🕐 Live Clock | Real-time clock shown on the dashboard (great for TV) |
| 📊 Stats Bar | Shows total members, in-progress count, blocked count, updated today |
| 🎨 Dark Theme | Designed for office TV displays |

## 👥 Team Members Pre-loaded

Vijayandiran S, Swathi, Ummu Halima, Fahad, Faaiz, Riaz, Ismail, Hashim, Javith, Ajay, Sangeetha, Raj, Gokul

To add/remove members: edit `supabase-schema.sql` (for the database) and `NAMES` array in `components/Dashboard.tsx`.

---

## 🏗️ Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Realtime)
- **TypeScript**
- **Tailwind CSS**
- **Vercel** (hosting)
