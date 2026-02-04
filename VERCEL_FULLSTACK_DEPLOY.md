# 🚀 MinihaAI - Vercel Full-Stack Deployment Guide

This guide explains how to deploy **both frontend AND backend** on Vercel using serverless functions.

---

## 📁 Project Structure

```
MinihaAI/
├── frontend/              → Deploy this folder to Vercel
│   ├── api/
│   │   └── index.js       → Serverless API (replaces backend)
│   ├── src/
│   ├── vercel.json        → Vercel configuration
│   └── package.json
└── backend/               → NOT deployed (API is in frontend/api/)
```

---

## 🟢 Step 1: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your **MinihaAI** repository
5. **Root Directory:** Click "Edit" and set to `frontend`
6. **Framework Preset:** Select `Vite`
7. Click **"Deploy"**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to frontend folder
cd MinihaAI/frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - What's your project name? minihaai
# - Root directory? ./
# - Override settings? No
```

---

## 🔧 Step 2: Configure Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add **ALL** these variables:

### Database (AWS RDS MySQL)
| Variable | Value |
|----------|-------|
| `DB_HOST` | `your-rds-endpoint.region.rds.amazonaws.com` |
| `DB_USER` | `your-db-username` |
| `DB_PASSWORD` | `your-db-password` |
| `DB_NAME` | `your-database-name` |

### Email Configuration
| Variable | Value |
|----------|-------|
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | `your-gmail-app-password` |

### AI API
| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | `your-gemini-api-key` |

### Admin Access
| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | `your-admin-password` |

---

## 📋 Environment Variables Template

```
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
GEMINI_API_KEY=your-gemini-api-key
ADMIN_PASSWORD=your-admin-password
```

---

## 🔄 Step 3: Redeploy After Adding Variables

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing build cache"** = OFF (to rebuild with new env vars)
5. Click **"Redeploy"**

---

## ✅ Step 4: Verify Deployment

After deployment, test these URLs:

1. **Frontend:** `https://your-app.vercel.app`
2. **API Health:** `https://your-app.vercel.app/api/health`
3. **Test login/signup functionality**

---

## 🔍 How It Works

### Before (Separate Services)
```
Frontend (Vercel) → calls → Backend (Railway/Render)
```

### Now (Single Vercel Deployment)
```
Frontend (Vercel)
    ├── Static files (React/Vite) → Served directly
    └── /api/* routes → Handled by Serverless Functions
```

The `vercel.json` configuration routes all `/api/*` requests to the serverless function in `api/index.js`.

---

## 🧪 Local Development

For local development with the serverless API:

1. Create `.env` file in `frontend/` folder (DO NOT commit this file):
```env
VITE_BACKEND_URL=http://localhost:3001/api
DB_HOST=your-rds-endpoint
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
GEMINI_API_KEY=your-gemini-api-key
ADMIN_PASSWORD=your-admin-password
```

2. Run the backend separately:
```bash
cd backend
npm run dev
```

3. Run the frontend:
```bash
cd frontend
npm run dev
```

Or use Vercel CLI for local serverless testing:
```bash
cd frontend
vercel dev
```

---

## ⚠️ Troubleshooting

### 1. API Returns 404
- Make sure `api/index.js` exists in frontend folder
- Check `vercel.json` has correct rewrites
- Redeploy after adding the api folder

### 2. Database Connection Failed
- Verify AWS RDS security group allows connections from anywhere (0.0.0.0/0)
- Check all DB environment variables are set correctly

### 3. "Function Timeout" Errors
- Serverless functions have a 60-second limit
- AI calls might timeout on slow models
- The API uses fast models (gemini-flash) to avoid this

### 4. CORS Errors
- The API handler already sets CORS headers
- If issues persist, check browser console for the exact error

---

## 📱 API Endpoints Available

All endpoints are under `/api`:

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### User
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id` - Update user profile
- `PUT /api/user/:id/photo` - Update profile photo
- `DELETE /api/user/:id` - Delete account
- `GET /api/user/:id/transactions` - Get payment history

### Payment
- `POST /api/payment/request` - Submit payment request
- `GET /api/payment/status/:id` - Check payment status

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/users` - Get all users
- `GET /api/admin/payment-requests` - Get all payment requests
- `POST /api/admin/payment/:id/approve` - Approve payment
- `POST /api/admin/payment/:id/reject` - Reject payment

### AI
- `GET /api/ai/test` - Test Gemini API connection
- `POST /api/ai/humanize` - Humanize AI text
- `POST /api/ai/detect` - Detect AI content

---

## 🎉 Done!

Your MinihaAI application is now fully deployed on Vercel with:
- ✅ Frontend (React/Vite)
- ✅ Backend API (Serverless Functions)
- ✅ Database (AWS RDS MySQL)
- ✅ Email (Gmail)
- ✅ AI (Gemini API)

All in a single Vercel deployment! 🚀
