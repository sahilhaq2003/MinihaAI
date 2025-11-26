# 📧 Email Setup Guide - Railway Environment Variables

## Step-by-Step Instructions

---

## ✅ Step 1: Setup Gmail App Password

### 1.1 Enable 2-Factor Authentication
1. Go to **[myaccount.google.com/security](https://myaccount.google.com/security)**
2. Scroll to **"2-Step Verification"**
3. Click **"Get Started"** and follow the steps
4. Complete the setup (you'll need your phone)

### 1.2 Generate App Password
1. Go to **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
2. Select **"Mail"** as the app
3. Select **"Other (Custom name)"** as device
4. Type: **"MinihaAI"** and click **"Generate"**
5. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - **Remove spaces** when copying (should be: `abcdefghijklmnop`)

---

## ✅ Step 2: Add to Railway

Go to **Railway Dashboard** → Your `minihaai-backend` service → **Variables** tab

Add these **4 variables**:

### Variable 1: `EMAIL_SERVICE`
```
gmail
```

### Variable 2: `EMAIL_USER`
```
your-email@gmail.com
```
**Replace `your-email@gmail.com` with your actual Gmail address**

### Variable 3: `EMAIL_PASSWORD`
```
abcdefghijklmnop
```
**Replace with your 16-character App Password (no spaces)**

### Variable 4: `FRONTEND_URL`
```
https://minihaai.vercel.app
```

---

## 📋 Complete Example

Here's what your Railway Variables should look like:

| Variable Name | Example Value | Your Value |
|--------------|---------------|------------|
| `EMAIL_SERVICE` | `gmail` | `gmail` |
| `EMAIL_USER` | `sahilhaq2003@gmail.com` | **Your Gmail** |
| `EMAIL_PASSWORD` | `abcdefghijklmnop` | **Your App Password** |
| `FRONTEND_URL` | `https://minihaai.vercel.app` | `https://minihaai.vercel.app` |

---

## ⚠️ Important Notes

1. **Use App Password, NOT your regular Gmail password**
   - Regular password won't work
   - Must be the 16-character App Password

2. **No spaces in App Password**
   - If you see: `abcd efgh ijkl mnop`
   - Use: `abcdefghijklmnop`

3. **2FA must be enabled**
   - App Passwords only work if 2FA is enabled
   - If you can't generate App Password, enable 2FA first

4. **Gmail address must be correct**
   - Use the exact email you want to send from
   - Example: `sahilhaq2003@gmail.com`

---

## 🧪 Testing

After adding variables:

1. **Railway will auto-redeploy** (watch the Deployments tab)
2. **Check Railway logs** for email configuration:
   - Should see: `✅ Email service configured`
   - Should NOT see: `⚠️ Email not configured`

3. **Test email verification:**
   - Sign up with a new account
   - Check your email inbox for verification link
   - Click the link to verify

---

## 🔧 Troubleshooting

### "Email not configured" warning?
- ✅ Check all 4 variables are set in Railway
- ✅ Check `EMAIL_USER` is your full Gmail address
- ✅ Check `EMAIL_PASSWORD` is the 16-character App Password (no spaces)
- ✅ Check `EMAIL_SERVICE` is exactly `gmail` (lowercase)

### Emails not sending?
- ✅ Check Railway logs for email errors
- ✅ Verify App Password is correct (regenerate if needed)
- ✅ Make sure 2FA is enabled on Gmail
- ✅ Check spam folder

### "Invalid login" error?
- ✅ App Password might be wrong - regenerate it
- ✅ Make sure no spaces in App Password
- ✅ Verify `EMAIL_USER` is correct Gmail address

---

## ✅ Quick Checklist

- [ ] 2FA enabled on Gmail
- [ ] App Password generated
- [ ] `EMAIL_SERVICE` = `gmail` (added to Railway)
- [ ] `EMAIL_USER` = your Gmail address (added to Railway)
- [ ] `EMAIL_PASSWORD` = 16-char App Password (added to Railway)
- [ ] `FRONTEND_URL` = `https://minihaai.vercel.app` (added to Railway)
- [ ] Railway redeployed successfully
- [ ] Tested email verification

---

## 🎉 You're Done!

Once all variables are set, your app will:
- ✅ Send email verification links
- ✅ Send password reset emails
- ✅ All email features will work!

Need help? Check Railway logs for specific error messages.

