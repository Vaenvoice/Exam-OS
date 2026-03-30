# 🚀 Deployment Guide — Exam-OS

This guide walks you through deploying the **Online Examination System** for free using:
- **[Neon.tech](https://neon.tech/)** — Free PostgreSQL database (never sleeps)
- **[Render](https://render.com/)** — Free backend hosting (Node.js)
- **[Vercel](https://vercel.com/)** — Free frontend hosting (React/Vite)

The backend includes a **self-ping every 14 minutes** to prevent Render's free tier from sleeping.

---

## Step 1: Set Up the Database (Neon.tech)

1. Go to [neon.tech](https://neon.tech/) and **sign up** (free).
2. Click **"New Project"**, give it a name (e.g., `exam-os`), choose a region.
3. Once created, go to **Connection Details** and copy your **Connection String** — it looks like:
   ```
   postgresql://user:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this safe — you'll need it in the next step.

---

## Step 2: Deploy the Backend (Render)

1. Go to [render.com](https://render.com/) and **sign up** (free).
2. Click **"New +" → "Web Service"**.
3. Connect your GitHub account and select the **`Vaenvoice/Exam-OS`** repository.
4. Configure:
   | Setting | Value |
   |---|---|
   | **Name** | `exam-os-backend` |
   | **Region** | Singapore (or closest to you) |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | `Free` |

5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DB_URL` | *(your Neon connection string)* |
   | `JWT_SECRET` | *(a strong random string, e.g., `openssl rand -hex 32`)* |
   | `JWT_EXPIRE` | `24h` |
   | `COOKIE_EXPIRE` | `30` |

   > **Note:** `RENDER_EXTERNAL_URL` is automatically set by Render — this activates the self-ping.

6. Click **"Create Web Service"**. Wait for the build to finish.
7. Copy your backend URL — it'll look like: `https://exam-os-backend.onrender.com`

---

## Step 3: Deploy the Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com/) and **sign up** (free).
2. Click **"Add New..." → "Project"**.
3. Import the **`Vaenvoice/Exam-OS`** repository from GitHub.
4. Configure:
   | Setting | Value |
   |---|---|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://exam-os-backend.onrender.com/api` |

6. Click **"Deploy"**. Wait for it to finish.
7. Your app will be live at: `https://exam-os.vercel.app` (or similar)

---

## Step 4: Optional — External Monitor (Extra Safety)

Even with self-ping, it's good practice to add an external monitor for free:

### Option A: [UptimeRobot](https://uptimerobot.com/) (Recommended)
1. Sign up at [uptimerobot.com](https://uptimerobot.com/) (free, 50 monitors).
2. Add a new **HTTP(S) monitor**:
   - URL: `https://exam-os-backend.onrender.com/api/health`
   - Check interval: **5 minutes**
3. UptimeRobot will ping your service every 5 minutes — 100% uptime guaranteed!

### Option B: [Cron-job.org](https://cron-job.org/)
1. Sign up at [cron-job.org](https://cron-job.org/) (free).
2. Create a new cron job:
   - URL: `https://exam-os-backend.onrender.com/api/health`
   - Schedule: **Every 10 minutes**

---

## Summary

| Component | Platform | URL |
|---|---|---|
| Database | Neon.tech | Managed by backend |
| Backend API | Render | `https://exam-os-backend.onrender.com` |
| Frontend | Vercel | `https://exam-os.vercel.app` |
| Health Check | — | `GET /api/health` |

---

## ⚠️ Important Notes

- **Render free tier**: Your backend may cold-start the first time (takes ~30s). After that, the self-ping keeps it warm.
- **Neon.tech free tier**: 0.5 GB storage, auto-pauses the *compute* on inactivity but data is preserved.
- **Secret management**: Never commit real `.env` files. Use Render and Vercel's environment variable dashboards.
