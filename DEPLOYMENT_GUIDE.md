# 🚀 MinihaAI Deployment Guide

This guide will help you deploy MinihaAI to **Vercel (Frontend)** and **Railway (Backend)**.

---

## 📁 Project Structure

```
MinihaAI/
├── frontend/          → Deploy to Vercel
└── backend/           → Deploy to Railway
```

---

# 🔵 PART 1: Deploy Backend to Railway

**Railway is recommended for the Express.js backend** (free tier available).

## Step 1: Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub (recommended)

## Step 2: Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not connected
4. Select your **MinihaAI** repository
5. **Important:** Set the root directory to `backend`

## Step 3: Configure Backend Environment Variables

In Railway Dashboard → Your Project → **Variables** tab, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3001` | Server port |
| `DB_HOST` | `your-rds-endpoint` | AWS RDS Host |
| `DB_USER` | `your-db-username` | Database username |
| `DB_PASSWORD` | `your-db-password` | Database password |
| `DB_NAME` | `your-database-name` | Database name |
| `EMAIL_SERVICE` | `gmail` | Email provider |
| `EMAIL_USER` | `your-email@gmail.com` | Email address |
| `EMAIL_PASSWORD` | `your-gmail-app-password` | Gmail App Password |
| `GEMINI_API_KEY` | `your-gemini-api-key` | Gemini API Key |
| `ADMIN_PASSWORD` | `your-admin-password` | Admin dashboard password |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel URL |

## Step 4: Get Your Railway Backend URL
After deployment, Railway will give you a URL like:
```
https://minihaai-backend-production.up.railway.app
```

**Copy this URL** - you'll need it for Vercel!

---

# 🟢 PART 2: Deploy Frontend to Vercel

## Step 1: Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)

## Step 2: Deploy Frontend

### Option A: Using Vercel Dashboard (Recommended)

1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Choose your **MinihaAI** repository
4. **Root Directory:** Set to `frontend`
5. **Framework Preset:** Select `Vite`
6. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow the prompts
# Set root directory to: frontend
```

## Step 3: Configure Frontend Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

### 📋 Required Variable

| Key | Value | Environments |
|-----|-------|--------------|
| `VITE_BACKEND_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api` | ✅ Production, ✅ Preview, ✅ Development |

**Replace** `YOUR-RAILWAY-URL` with your actual Railway backend URL!

### How to Add:
1. Go to **Settings** → **Environment Variables**
2. Click **"Add"**
3. **Key:** `VITE_BACKEND_URL`
4. **Value:** `https://your-railway-url.up.railway.app/api`
5. Select all environments: Production, Preview, Development
6. Click **"Save"**
7. Click **"Redeploy"** to apply changes

---

# 📋 Environment Variables Template

## Backend (Railway)

```env
# Server Configuration
PORT=3001
FRONTEND_URL=https://your-app.vercel.app

# AWS RDS (MySQL) Database Connection
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name

# Email Configuration (Gmail App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key

# Admin Access
ADMIN_PASSWORD=your-admin-password

# Optional: Twilio SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
TWILIO_PHONE_NUMBER=
```

## Frontend (Vercel)

```env
VITE_BACKEND_URL=https://your-railway-url.up.railway.app/api
```

---

# 🔄 Post-Deployment Steps

## 1. Update CORS on Backend

After getting your Vercel URL, update the CORS settings in `backend/server.js`:

```javascript
const allowedOrigins = [
  'https://your-app.vercel.app',      // Your Vercel domain
  'https://your-custom-domain.com',   // If using custom domain
  'http://localhost:5173',            // Local dev
  'http://localhost:3000'             // Local dev
];
```

## 2. Update Railway FRONTEND_URL Variable
Set `FRONTEND_URL` to your actual Vercel URL in Railway.

## 3. Redeploy Both Services
- Railway: Will auto-redeploy on git push
- Vercel: Will auto-redeploy on git push

---

# 🧪 Testing Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Try to sign up with a new email
3. Check if you receive the verification email
4. Try logging in
5. Test the AI features

---

# ⚠️ Common Issues & Fixes

## 1. "Failed to fetch" or CORS Error
- Check that your Vercel URL is in the `allowedOrigins` array in backend
- Verify `VITE_BACKEND_URL` is set correctly in Vercel

## 2. "404 Not Found" on API calls
- Make sure Railway backend is running
- Check Railway logs for errors
- Verify the environment variables are set

## 3. Database Connection Failed
- Check AWS RDS security group allows Railway's IP
- Verify DB credentials are correct

## 4. Emails Not Sending
- Verify Gmail App Password is correct
- Make sure "Less secure app access" or App Passwords are enabled

---

# 📱 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://your-app.vercel.app` | User interface |
| Backend | `https://your-railway-url.up.railway.app` | API server |
| Database | AWS RDS MySQL | Data storage |

---

# 🎉 Done!

Your MinihaAI application should now be live!

- **Frontend:** `https://your-app.vercel.app` (or your custom domain)
- **Backend API:** `https://your-railway-url.up.railway.app`

Happy coding! 🚀
