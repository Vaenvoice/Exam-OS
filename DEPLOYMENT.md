# 🚀 Deployment Guide — Exam-OS

This guide walks you through deploying the **Online Examination System** for free using:
- **[Neon.tech](https://neon.tech/)** — Free PostgreSQL database (0.5 GB, **never expires**)
- **[Render](https://render.com/)** — Free backend hosting (Node.js)
- **[Vercel](https://vercel.com/)** — Free frontend hosting (React/Vite)

The backend includes a **self-ping every 14 minutes** to prevent Render's free tier from sleeping.

> 💡 **Why Neon instead of Render PostgreSQL?** Render only allows **one free PostgreSQL database per account**. Neon gives you a free database that **never expires**, making it the better choice for long-term free hosting.

---

## Step 1: Set Up the Database (Neon.tech)

1. Go to [neon.tech](https://neon.tech/) and **sign up** (free — GitHub login works great).
2. Click **"New Project"**, give it a name (e.g., `exam-os`), choose a region closest to you.
3. Once created, go to **"Connection Details"** and select **"Connection string"** from the dropdown.
4. Copy the full connection string — it looks like:
   ```
   postgresql://neondb_owner:xxxx@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Keep this safe — you'll use it as `DATABASE_URL` in the next step.

---

## Step 2: Deploy the Backend (Render Web Service)

1. Go to [render.com](https://render.com/) and **sign up / log in** (free).
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
   | `DATABASE_URL` | *(paste your Neon connection string from Step 1)* |
   | `JWT_SECRET` | *(a strong random string — generate one [here](https://generate-secret.vercel.app/32))* |
   | `JWT_EXPIRE` | `24h` |
   | `COOKIE_EXPIRE` | `30` |

   > `RENDER_EXTERNAL_URL` is **automatically set by Render** — this activates the self-ping to keep the service warm.

6. Click **"Create Web Service"**. Wait for the first build to complete.
7. Copy your backend URL — it looks like: `https://exam-os-backend.onrender.com`

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
   | **Install Command** | `npm install` (Default) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://exam-os-backend.onrender.com/api` |

6. Click **"Deploy"**. Wait for it to finish.
7. Your frontend will be live at: `https://exam-os.vercel.app` (or similar).

---

## Step 4: Keep-Alive — External Monitor (Recommended)

The backend self-pings itself every 14 min, but adding an **external monitor** gives extra protection and alerts you if the service goes down.

### [UptimeRobot](https://uptimerobot.com/) — Free & Recommended
1. Sign up at [uptimerobot.com](https://uptimerobot.com/) (free, 50 monitors).
2. Click **"Add New Monitor"**:
   - **Monitor Type**: `HTTP(S)`
   - **Friendly Name**: `Exam-OS Backend`
   - **URL**: `https://exam-os-backend.onrender.com/api/health`
   - **Monitoring Interval**: `5 minutes`
3. Done! UptimeRobot will ping your service every 5 minutes.

### Alternative: [Cron-job.org](https://cron-job.org/)
1. Sign up at [cron-job.org](https://cron-job.org/) (free).
2. Create a new cron job:
   - **URL**: `https://exam-os-backend.onrender.com/api/health`
   - **Schedule**: Every 10 minutes

---

## 📋 Summary

| Component | Platform | Storage / Notes |
|---|---|---|
| Database | Neon.tech | **0.5 GB free, never expires** |
| Backend API | Render Web Service | Free, stays warm via self-ping |
| Frontend | Vercel | Free, always on |
| Health Check | — | `GET /api/health` |

---

## ⚠️ Important Notes

- **Render free Web Service**: The first request after a long idle period may take ~15–30s to wake up. The self-ping + UptimeRobot prevents this for regular traffic.
- **Neon.tech free tier**: 0.5 GB storage. Compute auto-pauses on inactivity but **data is always preserved**. Wakes up instantly on first query.
- **Secrets**: Never commit real `.env` files. Always use the environment variable dashboards on Render and Vercel.
- **Render free PostgreSQL limit**: Render only allows **one free database per account** — Neon sidesteps this restriction entirely.
