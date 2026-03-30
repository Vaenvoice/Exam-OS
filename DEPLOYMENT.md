# 🚀 Deployment Guide — Exam-OS

This guide walks you through deploying the **Online Examination System** for free using:
- **[Render](https://render.com/)** — Free PostgreSQL database (**1 GB**) + backend hosting (Node.js)
- **[Vercel](https://vercel.com/)** — Free frontend hosting (React/Vite)

The backend includes a **self-ping every 14 minutes** to prevent Render's free tier from sleeping.

> ⚠️ **Note:** Render's free PostgreSQL database **expires after 90 days**. You'll need to recreate it, or upgrade to a paid plan for persistence beyond that.

---

## Step 1: Create the Database on Render

1. Go to [render.com](https://render.com/) and **sign up / log in** (free).
2. Click **"New +" → "PostgreSQL"**.
3. Configure:
   | Setting | Value |
   |---|---|
   | **Name** | `exam-os-db` |
   | **Region** | Singapore (or closest to you) |
   | **Plan** | `Free` |
4. Click **"Create Database"** and wait for it to be ready.
5. On the database info page, copy the **"Internal Database URL"** — it looks like:
   ```
   postgresql://exam_os_db_user:xxxx@dpg-xxxxx-a/exam_os_db
   ```
   > Use **Internal URL** since the backend will be on the same Render network.

---

## Step 2: Deploy the Backend (Render Web Service)

1. Click **"New +" → "Web Service"**.
2. Connect your GitHub account and select the **`Vaenvoice/Exam-OS`** repository.
3. Configure:
   | Setting | Value |
   |---|---|
   | **Name** | `exam-os-backend` |
   | **Region** | **Same as your database** ✅ |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | `Free` |

4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | *(paste your Render Internal Database URL from Step 1)* |
   | `JWT_SECRET` | *(a strong random string — generate one [here](https://generate-secret.vercel.app/32))* |
   | `JWT_EXPIRE` | `24h` |
   | `COOKIE_EXPIRE` | `30` |

   > `RENDER_EXTERNAL_URL` is **automatically set by Render** — this activates the self-ping to keep the service warm.

5. Click **"Create Web Service"**. Wait for the first build to complete.
6. Copy your backend URL — it looks like: `https://exam-os-backend.onrender.com`

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
7. Your frontend will be live at: `https://exam-os.vercel.app` (or similar)

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
| Database | Render PostgreSQL | **1 GB free** (expires 90 days) |
| Backend API | Render Web Service | Free, stays warm via self-ping |
| Frontend | Vercel | Free, always on |
| Health Check | — | `GET /api/health` |

---

## ⚠️ Important Notes

- **Render DB expiry**: Free PostgreSQL databases are deleted after 90 days. Export your data before the deadline from the Render dashboard.
- **Same region**: Deploy the backend Web Service in the **same region** as the database to use the Internal URL and reduce latency.
- **Cold start**: The first request after a long period may take ~15–30s to wake up. The self-ping + UptimeRobot prevents this for regular traffic.
- **Secrets**: Never commit real `.env` files. Always use the environment variable dashboards on Render and Vercel.
