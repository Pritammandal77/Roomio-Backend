# 🏠 Roomio — Backend

The backend REST API for **Roomio**, a roommate & room finder web app. Handles authentication, listings, real-time chat, AI-powered features, and media uploads.

> ⚠️ This is a personal project. It is **not open for contributions.**

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup/login with access & refresh tokens
- 🌐 **Google OAuth 2.0** — Sign in with Google via Passport.js
- 👤 **User Profiles** — Create and manage profiles with avatar uploads
- 🏘️ **Room Listings** — Post, update, delete, and search room listings with images
- 🤖 **AI Integration** — Google Gemini AI powered features via `@google/generative-ai`
- 💬 **Real-time Chat** — Instant messaging between users using Socket.io
- 📧 **Email Service** — Transactional emails via Resend
- ☁️ **Media Uploads** — Image upload and management via Cloudinary + Multer
- 🔒 **Password Security** — Hashing with bcrypt

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js v5 |
| Database | MongoDB + Mongoose |
| Auth | JWT + Passport.js (Google OAuth 2.0) |
| Real-time | Socket.io v4 |
| AI | Google Gemini (`@google/generative-ai`) |
| Media | Cloudinary + Multer |
| Email | Resend |
| Password Hashing | bcrypt / bcryptjs |

---

## 📁 Project Structure

```
Roomio-Backend/
├── src/
│   ├── controllers/        # Route handler logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middlewares/        # Auth, error handling, multer
│   ├── utils/              # Cloudinary, token helpers, ApiResponse
│   ├── socket/             # Socket.io event handlers
│   ├── db/                 # MongoDB connection
│   ├── app.js              # Express app setup & middleware
│   └── index.js            # Server entry point
├── .gitignore
├── package.json
└── package-lock.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- MongoDB (local or Atlas)
- Cloudinary account
- Google Cloud Console project (for OAuth)
- Resend account (for emails)
- Google Gemini API key

### Installation

```bash
# Clone the repo
git clone https://github.com/Pritammandal77/Roomio-Backend.git
cd Roomio-Backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in the values in .env

# Start the dev server
npm run dev
```

### Scripts

```bash
npm run dev    # Start with nodemon (development)
npm start      # Start with node (production)
```

---

## 🔑 Environment Variables

Create a `.env` file in the root with the following:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/roomio

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 📜 License

This project is for personal use only. All rights reserved © [Pritam Mandal](https://github.com/Pritammandal77).
