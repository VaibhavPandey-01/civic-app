# Ocean Preventions Backend API

Production-ready backend API service for the Ocean Preventions civic reporting platform, built with Node.js, Express, TypeScript, and MongoDB (Mongoose).

---

## Technical Stack
- **Runtime**: Node.js
- **Framework**: Express (TypeScript strict mode)
- **Database**: MongoDB (Mongoose schemas with indexing)
- **Auth**: Firebase Admin SDK (Phone OTP verification helper) + custom JWT session
- **Image Storage**: Cloudinary v2
- **Push Notifications**: Firebase Cloud Messaging (FCM)

---

## Required Environment Variables (`.env`)

Create a `.env` file in the `backend/` directory referencing the following keys:

```ini
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ocean-preventions

# Custom JWT settings
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Admin signup code
ADMIN_INVITE_CODE=AUTHORITY_2026_SECURE

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
# Private key should replace escaped newlines with actual line breaks
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ..."
```

---

## Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Startup Database
Ensure MongoDB is running locally on port `27017` or update the `MONGO_URI` in `.env` to point to a MongoDB Atlas cluster.

### 3. Run Development Server
```bash
npm run dev
```
The server will start listening on http://localhost:3000. Test the health status at http://localhost:3000/api/health.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## How to Seed / Create the Initial Admin User

Since there is **no self-service admin signup** on the platform, admins register through the mobile client by submitting an `ADMIN_INVITE_CODE` matching the backend environment variable:

1. Launch the mobile app in your simulator or physical device.
2. Navigate to the **Create Account** screen.
3. Toggle the role selector to **"I'm an Authority"**.
4. Fill in your details (Name, Indian Phone number).
5. Enter the `ADMIN_INVITE_CODE` matching your `.env` config (e.g. `AUTHORITY_2026_SECURE`).
6. Enter the OTP code sent to your phone (in local development with Firebase Emulator, use your configured test numbers and test codes).
7. On successful validation, the backend creates your User document with `role: "admin"`. The app will redirect you to the Admin dashboard.

---

## Production Deployment Guide

### Database (MongoDB Atlas)
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. Whitelist access from all IP addresses (`0.0.0.0/0`) or configure VPC peering.
4. Copy the connection string (replacing username and password) and set it as `MONGO_URI`.

### Web Service Hosting (Render / Railway / Fly.io)
This app is fully compatible with PaaS hosting platforms:

#### Option A: Render
1. Create a new **Web Service** linked to your Github repository.
2. Specify environment: `Node`.
3. Set Build Command: `npm install && npm run build`.
4. Set Start Command: `npm start`.
5. Add all required env variables under the **Environment** tab.

#### Option B: Railway
1. Create a new project linked to your Github repo.
2. Railway automatically detects `package.json` and runs `npm run build` followed by `npm start`.
3. Set your environment variables in the variables dashboard.
