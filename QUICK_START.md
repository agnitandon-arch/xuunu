# Quick Start Guide - Deploy Xuunu

## 🚀 Quick Deployment Checklist

### 1. Firebase Setup (5 minutes)
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable Authentication (Email/Password + Google)
- [ ] Enable Firestore Database
- [ ] Get client config: Project Settings > General > Your apps
- [ ] Get service account: Project Settings > Service Accounts > Generate key

### 2. AirNow API (2 minutes)
- [ ] Sign up at https://www.airnowapi.org/account/request/
- [ ] Copy your API key

### 3. Environment Variables

#### For Vercel (Production)
Add in Vercel Dashboard > Project Settings > Environment Variables:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
AIRNOW_API_KEY=your_airnow_key
```

#### For Test (Local/Cursor/Replit)
Create `.env` file in project root:

```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
AIRNOW_API_KEY=your_airnow_key
PORT=5000
NODE_ENV=development
```

**Important**: `FIREBASE_SERVICE_ACCOUNT_KEY` must be a single-line JSON string.

### 4. Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/dashboard
3. Click "Add New Project"
4. Import your repository
5. Add environment variables (step 3)
6. Deploy!

### 5. Test Deployment

- [ ] Firebase authentication works
- [ ] Location pickup works
- [ ] AQI data loads (US locations only)
- [ ] Firestore saves data
- [ ] Terra API placeholder accessible

## ✅ Features Ready

- ✅ Firebase Authentication (Email/Password, Google)
- ✅ Firestore Database
- ✅ AQI API Integration (AirNow)
- ✅ Location Services (GPS + Reverse Geocoding)
- ✅ Terra API Placeholder (users add credentials)

## 📝 Notes

- **AirNow API**: US locations only. International locations will return "No data available"
- **Terra API**: Users add their own credentials in Device Connection screen
- **Location**: Requires HTTPS for geolocation API (automatic on Vercel)

## 🐛 Troubleshooting

**Auth not working?**
- Check Firebase console > Authentication > Sign-in methods enabled
- Verify environment variables are set correctly

**AQI not loading?**
- Verify `AIRNOW_API_KEY` is set
- Check location is in US (AirNow is US-only)
- Check browser console for errors

**Firestore errors?**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON string
- Check Firestore is enabled in Firebase Console
- Ensure service account has permissions

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
