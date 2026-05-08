# 🖥️ Team Status Board

A full-stack live status dashboard for your team — built with Node.js, Express, MongoDB, and deployed on Vercel.

---

## 🏗️ Project Structure

```
employee-status/
├── backend/
│   ├── models/Status.js       # Mongoose schema
│   ├── server.js              # Express API server
│   ├── package.json
│   └── .env.example
├── frontend/
│   └── public/
│       └── index.html         # Single-page app (Dashboard + Submit + History)
├── vercel.json                # Vercel deployment config
└── package.json
```

---

## ⚙️ Setup: MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas and create a free account
2. Create a **Free M0 cluster**
3. Under **Database Access** → Add a user with password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all, needed for Vercel)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace `<username>` and `<password>` in the string

Your URI will look like:
```
mongodb+srv://myuser:mypass@cluster0.abcde.mongodb.net/employee_status?retryWrites=true&w=majority
```

---

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/employee-status.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com and log in with GitHub
2. Click **Add New Project** → Import your repo
3. Under **Environment Variables**, add:
   - `MONGODB_URI` = your MongoDB connection string
4. Click **Deploy**

### Step 3: Share the URL
Your app will be live at:  
`https://your-project.vercel.app`

Share this URL with your team and put it on the office TV!

---

## 📺 TV Mode Tips
- Open the URL in Chrome on the TV
- Press `F11` for fullscreen
- The dashboard auto-refreshes every 30 seconds
- A live ticker at the top scrolls everyone's status

---

## 🧩 Features
- ✅ **Live Dashboard** — TV-friendly status board with auto-refresh
- ✅ **Submit Form** — Each employee enters their own status
- ✅ **History Log** — Filter by employee, see last 90 days
- ✅ **Summary Cards** — Total counts across all fields
- ✅ **Progress Bar** — See who has/hasn't submitted today
- ✅ **Ticker Bar** — Scrolling live summary at the top
- ✅ **Notes Field** — Employees can add optional remarks
- ✅ **MongoDB upsert** — Resubmitting overwrites, no duplicates
- ✅ **Date Navigation** — View any past or future date

---

## 🔧 Run Locally

```bash
# 1. Install backend deps
cd backend
npm install

# 2. Create .env from example
cp .env.example .env
# Edit .env and add your MONGODB_URI

# 3. Start server (serves both API + frontend)
npm start

# 4. Open browser
open http://localhost:5000
```

---

## 👥 Employees Loaded
Vijayandiran S, Swathi, Ummu Halima, Fahad, Faaiz, Riaz, Ismail, Hashim, Javith, Ajay, Sangeetha, Raj, Gokul

To add/remove employees, edit the `EMPLOYEES` array in:
- `backend/server.js` (line ~17)
- `frontend/public/index.html` (line ~342)

---

## 📊 Status Fields
| Field | Description |
|-------|-------------|
| In Progress | Active work items |
| On Hold | Paused/blocked items |
| Jira In Progress | Jira tracked items |
| ACR | ACR count |
| AIR | AIR count |
| De-escalated | Items moved to Level 1 |
| Open | Open items |
| AFR | AFR count |
| ANP | ANP count |
| RCA Pending | RCA items pending |
