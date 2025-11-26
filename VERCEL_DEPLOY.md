# 🚀 Deploy Frontend to Vercel

## Step-by-Step Guide

---

## ✅ Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended) or email
3. Complete account setup

---

## ✅ Step 2: Connect Your Repository

1. In Vercel Dashboard, click **"Add New Project"**
2. Import your GitHub repository: `sahilhaq2003/MinihaAI`
3. Vercel will auto-detect it's a Vite project

---

## ✅ Step 3: Configure Project Settings

Vercel will auto-detect these settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**You can leave these as default!**

---

## ✅ Step 4: Add Environment Variables

Before deploying, add this environment variable:

1. In Vercel project settings, go to **"Environment Variables"**
2. Click **"Add New"**
3. Add:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://minihaai-backend-production.up.railway.app/api`
   - **Environment**: Production, Preview, Development (select all)
4. Click **"Save"**

---

## ✅ Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will give you a URL like: `minihaai.vercel.app`

---

## ✅ Step 6: Update Backend (If Needed)

If your backend has `FRONTEND_URL` environment variable:
- Update it in Railway to your new Vercel URL
- Example: `https://minihaai.vercel.app`

---

## 🔧 Configuration Files

### `vercel.json` (Already created)
- Handles routing (SPA redirects)
- Configures build settings
- Sets up rewrites for React Router

---

## 🌐 Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS setup instructions
4. Vercel will handle SSL automatically

---

## 🔄 Continuous Deployment

Vercel automatically:
- ✅ Deploys on every push to `main` branch
- ✅ Creates preview deployments for PRs
- ✅ Shows build logs and status

---

## 📊 Monitoring

- **Analytics**: Built-in in Vercel dashboard
- **Logs**: View real-time build and runtime logs
- **Performance**: Automatic performance monitoring

---

## ✅ Quick Checklist

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Environment variable `VITE_BACKEND_URL` added
- [ ] Project deployed successfully
- [ ] Test the app on Vercel URL
- [ ] Update `FRONTEND_URL` in Railway (if using email features)

---

## 🎉 You're Done!

Your frontend is now on Vercel! 

**Benefits:**
- ✅ Faster deployments
- ✅ Better performance
- ✅ Automatic HTTPS
- ✅ Easy to manage

Need help? Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)

