# 🔐 Vercel Environment Variables

## Frontend Environment Variables

Add these in **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

---

## ✅ Required Environment Variable

### 1. `VITE_BACKEND_URL`

**Key:** `VITE_BACKEND_URL`

**Value:** `https://minihaai-backend-production.up.railway.app/api`

**Description:** Backend API URL for authentication, payments, and AI features

**Apply to:** 
- ✅ Production
- ✅ Preview  
- ✅ Development

---

## 📋 Complete Setup

### In Vercel Dashboard:

1. Go to your project
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar
4. Click **"Add New"**

### Add this variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_BACKEND_URL` | `https://minihaai-backend-production.up.railway.app/api` | Production, Preview, Development |

---

## 🔍 How to Add

1. **Key:** Type `VITE_BACKEND_URL`
2. **Value:** Type `https://minihaai-backend-production.up.railway.app/api`
3. **Environment:** Select all three:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
4. Click **"Save"**

---

## ⚠️ Important Notes

1. **Must start with `VITE_`** - Vite only exposes variables starting with `VITE_`
2. **No trailing slash** - Don't add `/` at the end
3. **Use `https://`** - Always use HTTPS for production
4. **Redeploy after adding** - Vercel will auto-redeploy when you add variables

---

## 🧪 Testing

After adding the variable:

1. Vercel will automatically trigger a new deployment
2. Wait for build to complete
3. Test your app - it should connect to the backend
4. Check browser console for any errors

---

## 📝 Example

```
Key: VITE_BACKEND_URL
Value: https://minihaai-backend-production.up.railway.app/api
```

---

## ✅ That's It!

You only need **ONE** environment variable for the frontend:
- `VITE_BACKEND_URL` - Points to your Railway backend

All other configuration (API keys, database, etc.) is on the backend (Railway).

---

## 🔄 If Your Backend URL Changes

If you get a new Railway URL, just update the `VITE_BACKEND_URL` value in Vercel and redeploy.

