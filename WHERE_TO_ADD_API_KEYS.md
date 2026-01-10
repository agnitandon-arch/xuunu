# Where to Add API Keys

## 🎯 Quick Answer

### For Vercel (Production Deployment)
**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

### For Local/Test (Cursor/Replit)
**Location**: Create a `.env` file in the project root directory

---

## 📍 Detailed Instructions

### Option 1: Vercel (Production)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project (or create new one)

2. **Navigate to Environment Variables**
   - Click on your project
   - Go to **Settings** tab (left sidebar)
   - Click **Environment Variables** (under Configuration)

3. **Add Each API Key**
   Click "Add New" and add these one by one:

   ```
   Name: VITE_FIREBASE_API_KEY
   Value: [paste your Firebase API key]
   Environment: Production, Preview, Development (check all)
   ```

   ```
   Name: VITE_FIREBASE_PROJECT_ID
   Value: [paste your Firebase project ID]
   Environment: Production, Preview, Development (check all)
   ```

   ```
   Name: VITE_FIREBASE_APP_ID
   Value: [paste your Firebase app ID]
   Environment: Production, Preview, Development (check all)
   ```

   ```
   Name: FIREBASE_SERVICE_ACCOUNT_KEY
   Value: [paste entire JSON as single line, no line breaks]
   Environment: Production, Preview, Development (check all)
   ```

   ```
   Name: AIRNOW_API_KEY
   Value: [paste your AirNow API key]
   Environment: Production, Preview, Development (check all)
   ```

4. **Redeploy**
   - After adding variables, go to **Deployments** tab
   - Click the "..." menu on latest deployment
   - Click **Redeploy** (this applies new env vars)

---

### Option 2: Local/Test Environment (Cursor)

1. **Create `.env` file in project root**
   ```bash
   # In your terminal, from project root:
   touch .env
   ```

2. **Open `.env` file and add:**
   ```bash
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
   VITE_FIREBASE_APP_ID=your_firebase_app_id_here
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
   AIRNOW_API_KEY=your_airnow_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

3. **Important Notes:**
   - Replace all `your_*_here` with actual values
   - `FIREBASE_SERVICE_ACCOUNT_KEY` must be on ONE line (no line breaks)
   - The `.env` file should be in the same directory as `package.json`

4. **Restart your dev server**
   ```bash
   npm run dev
   ```

---

### Option 3: Replit

1. **Use Secrets Tab**
   - Click the lock icon (🔒) in the left sidebar
   - Click "New Secret"
   - Add each variable:
     - Key: `VITE_FIREBASE_API_KEY`
     - Value: `[your key]`
   - Repeat for all variables

2. **Restart the Repl**
   - Stop and start the Repl to load new secrets

---

## 🔑 Where to Get API Keys

### Firebase Keys
1. Go to https://console.firebase.google.com
2. Select your project
3. **Client Config**: Project Settings → General → Your apps → Web app → Config
4. **Service Account**: Project Settings → Service Accounts → Generate new private key

### AirNow API Key
1. Go to https://www.airnowapi.org/account/request/
2. Fill out the form
3. Check your email for the API key

---

## ✅ Verify API Keys Are Working

### Test Firebase
- Try logging in with email/password or Google
- Check browser console for errors

### Test AirNow API
- Open app and allow location access
- Check if AQI data loads (US locations only)
- Check browser console Network tab for `/api/environmental` requests

### Test Firestore
- Create a health entry or medication
- Check if it saves (should appear in Firebase Console → Firestore)

---

## 🚨 Common Issues

**"API key not configured" error?**
- Check variable names match exactly (case-sensitive)
- For Vercel: Make sure you redeployed after adding variables
- For local: Make sure `.env` file is in project root

**Firebase auth not working?**
- Verify `VITE_FIREBASE_*` variables are set (client-side)
- Check Firebase Console → Authentication → Sign-in methods are enabled

**Firestore not saving?**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON (single line)
- Check Firestore is enabled in Firebase Console
- Ensure service account has Firestore permissions

**AQI not loading?**
- Verify `AIRNOW_API_KEY` is set
- AirNow only works for US locations
- Check browser console for API errors

---

## 📁 File Structure

Your project should look like this:
```
xuunu/
├── .env                    ← Create this file (for local/test)
├── package.json
├── vercel.json
├── client/
├── api/
└── server/
```

The `.env` file goes in the **root** directory (same level as `package.json`).
