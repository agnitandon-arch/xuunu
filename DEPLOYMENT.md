# Deployment Guide for Xuunu

This guide covers deploying Xuunu to both **Vercel (Production)** and **Test Environment (Cursor/Replit)**.

## Prerequisites

1. **Firebase Project**: Create a Firebase project at https://console.firebase.google.com
2. **AirNow API Key**: Sign up at https://www.airnowapi.org/account/request/
3. **Vercel Account**: Sign up at https://vercel.com (for production)
4. **GitHub Repository**: Push your code to GitHub

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Follow the setup wizard
4. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (optional)

### 2. Get Firebase Client Configuration

1. Go to Project Settings > General
2. Scroll to "Your apps" section
3. Click the Web icon (`</>`) to add a web app
4. Copy the configuration values:
   - `apiKey`
   - `projectId` (or `project_id`)
   - `appId` (or `app_id`)

### 3. Get Firebase Service Account Key (for Firestore)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **Important**: Convert the JSON to a single-line string for environment variables

## Environment Variables

### For Vercel (Production)

Set these in Vercel Dashboard > Project Settings > Environment Variables:

#### Client-side (Vite) Variables
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

#### Server-side Variables
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase service account JSON (as single-line string)
- `AIRNOW_API_KEY` - AirNow API key for AQI data
- `OPENAI_API_KEY` - (Optional) OpenAI API key for AI insights
- `DATABASE_URL` - PostgreSQL connection string (if using Vercel Postgres, this is auto-set)

### For Test Environment (Cursor/Replit)

Create a `.env` file in the root directory with all variables from `.env.example`.

**Important**: 
- For Replit, use the Secrets tab instead of `.env` file
- For Cursor, create `.env` file in the project root

## Vercel Deployment (Production)

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

### Step 2: Configure Build Settings

Vercel should auto-detect from `vercel.json`:
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables

1. Go to Project Settings > Environment Variables
2. Add all required variables (see Environment Variables section above)
3. **Important**: 
   - `FIREBASE_SERVICE_ACCOUNT_KEY` must be a single-line JSON string
   - Use Vercel's environment variable editor or paste the entire JSON as one line

### Step 4: Deploy

1. Push to your main branch (Vercel auto-deploys)
2. Or manually trigger deployment from Vercel Dashboard
3. Wait for build to complete
4. Your app will be available at `https://your-project.vercel.app`

### Step 5: Verify Deployment

1. Check that Firebase authentication works
2. Test location pickup and AQI API calls
3. Verify Firestore database operations
4. Test Terra API placeholder (users can add credentials later)

## Test Environment Deployment (Cursor/Replit)

### For Cursor

1. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```
2. Fill in all environment variables
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run development server:
   ```bash
   npm run dev
   ```
5. App will be available at `http://localhost:5000`

### For Replit

1. Go to Secrets tab (lock icon in sidebar)
2. Add all environment variables as secrets
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Replit will show the app URL in the output

## API Endpoints

### Environmental Data (AQI)
- **Endpoint**: `/api/environmental?lat={latitude}&lng={longitude}`
- **Method**: GET
- **Requires**: `AIRNOW_API_KEY`
- **Returns**: AQI, PM2.5, PM10, O3 data

### Geocoding (Reverse)
- **Endpoint**: `/api/geocode/reverse?lat={latitude}&lng={longitude}`
- **Method**: GET
- **Requires**: None (uses BigDataCloud free API)
- **Returns**: City, state, country, formatted location string

### Terra API (Placeholder)
- **Endpoint**: `/api/terra/auth`
- **Method**: POST
- **Requires**: User-provided Terra API credentials
- **Purpose**: Connect wearable devices (Apple Watch, etc.)

## Features Status

✅ **Firebase Authentication**: Email/Password and Google Sign-in
✅ **Firestore Database**: All user data stored in Firestore
✅ **AQI API Integration**: AirNow API for real-time air quality
✅ **Location Services**: GPS pickup with reverse geocoding
✅ **Terra API Placeholder**: Ready for user credentials

## Troubleshooting

### Firebase Authentication Not Working
- Verify `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` are set
- Check Firebase Console > Authentication > Sign-in methods are enabled
- Ensure Firebase project has billing enabled (Blaze plan) if using Firestore

### Firestore Not Working
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly (single-line JSON)
- Check Firestore is enabled in Firebase Console
- Verify service account has Firestore permissions

### AQI API Not Working
- Verify `AIRNOW_API_KEY` is set
- Check API key is valid at https://www.airnowapi.org
- AirNow API is US-only; international locations may not return data

### Location Not Working
- Ensure browser has location permissions
- Check HTTPS is enabled (required for geolocation API)
- Verify reverse geocoding endpoint is accessible

### Build Failures on Vercel
- Check build logs in Vercel Dashboard
- Verify all environment variables are set
- Ensure `vercel.json` configuration is correct
- Check Node.js version compatibility

## Next Steps

1. **Set up Firebase Firestore Rules** for production security
2. **Configure CORS** if needed for custom domains
3. **Set up monitoring** (Vercel Analytics, Sentry, etc.)
4. **Configure custom domain** in Vercel settings
5. **Set up CI/CD** for automated deployments

## Support

For issues or questions:
- Check Firebase Console for authentication/database errors
- Review Vercel build logs for deployment issues
- Check browser console for client-side errors
- Verify all environment variables are correctly set
