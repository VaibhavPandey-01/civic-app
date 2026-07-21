# Ocean Preventions Platform Deployment Checklist

Follow this guide to configure and launch the Ocean Preventions civic reporting service locally and build production assets.

---

## 1. Environment Configurations

Ensure the following secrets are configured in their respective configuration locations before starting:

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend/` directory:

| Environment Variable | Description | Example / Recommended Value |
|---|---|---|
| `PORT` | Local service port | `3000` |
| `NODE_ENV` | Running node environment | `development` / `production` |
| `MONGO_URI` | Database URL | `mongodb://localhost:27017/ocean-preventions` |
| `JWT_SECRET` | Custom backend secret key | `super_secret_jwt_key_string` |
| `JWT_EXPIRES_IN` | Session token validity duration | `7d` |
| `ADMIN_INVITE_CODE` | Code required to signup as admin | `AUTHORITY_2026_SECURE` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage namespace | *Your Cloudinary cloud name* |
| `CLOUDINARY_API_KEY` | Cloudinary developer key | *Your Cloudinary developer key* |
| `CLOUDINARY_API_SECRET` | Cloudinary developer secret | *Your Cloudinary developer secret* |
| `FIREBASE_PROJECT_ID` | Firebase developer project ID | *Your Firebase project ID* |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | *Your Firebase client email* |
| `FIREBASE_PRIVATE_KEY` | Firebase credentials private key | `-----BEGIN PRIVATE KEY-----\nMIIEvg...` |

---

### Mobile App Firebase Configuration (`app/src/config/firebaseConfig.ts`)
Set up credentials from **Firebase Console > Project Settings > Web App**:

```typescript
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 2. Command Reference

### A) Start Backend Locally
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run the TypeScript development server
npm run dev
```
Verify the backend is live by calling the health endpoint at: http://localhost:3000/api/health.

### B) Run Mobile Client in Expo Go
```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Start the Expo developer bundler server
npx expo start
```
Scan the QR code displayed in the terminal using the Expo Go application (Android) or default Camera app (iOS) to test the app on a physical device.

### C) Build a Signed Android APK
To build a standalone preview APK for direct installation, compile it using Expo Application Services (EAS):

1. **Install EAS CLI globally** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```
2. **Log into your free Expo Developer Account**:
   ```bash
   eas login
   ```
3. **Initialize EAS Project configuration** (only required once per repository):
   ```bash
   cd app
   eas project:init
   ```
4. **Trigger APK compilation build**:
   ```bash
   eas build --platform android --profile preview
   ```
The EAS bundler will build the project remotely and output a download link containing the compiled `.apk` file ready to load on your test devices.
