# 🛍️ Shopera — Backend API

The RESTful API backend and business logic service for **Shopera**, powered by **Node.js (ESM)**, **Express 5**, **MongoDB**, **Mongoose 8**, **Cloudinary**, and **Razorpay**.

---

## ⚡ Tech Stack & Architecture

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5.x](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 8.x](https://mongoosejs.com/)
- **Authentication**: JWT (Access + HTTP-only Refresh Tokens) with `bcryptjs`
- **File & Media Handling**: [Multer](https://github.com/expressjs/multer) + [Cloudinary SDK](https://cloudinary.com/)
- **Payments**: [Razorpay](https://razorpay.com/) Node SDK with cryptographic webhook & signature verification

---

## 📁 Server Directory Structure

```text
server/
├── src/
│   ├── config/             # DB connection, Cloudinary, Razorpay setups
│   ├── controllers/        # Route controllers (Auth, Products, Cart, Orders, Payments, Categories)
│   ├── middlewares/        # JWT verification, Admin guard, Multer upload, Error handler
│   ├── models/             # Mongoose schemas (User, Product, Category, Cart, Order)
│   ├── routes/             # Express routing definitions
│   ├── scripts/            # Database seeders (seedProducts, seedDemoUsers, verify scripts)
│   ├── utils/              # ApiResponse, ApiError, AsyncHandler utilities
│   └── app.js              # Express app instance, CORS configuration, & route bindings
├── .env.example            # Environment variables blueprint
├── package.json            # Server dependencies & scripts
└── server.js               # Entry point (connects DB, runs auto-seed, starts listener)
```

---

## ⚙️ Environment Variables

Create `.env` in the `server/` folder based on `.env.example`:

```env
PORT=8000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/shopera

JWT_ACCESS_SECRET=your_super_secret_jwt_access_key
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

---

## 🛠️ Scripts

Run these from the workspace root or inside the `server` directory:

```bash
# Start server in development mode (nodemon)
npm run dev --workspace=server

# Start server in production mode
npm start --workspace=server

# Seed 50+ rich demo products
npm run seed:all --workspace=server

# Seed default demo accounts (Admin & Customer)
npm run seed:users --workspace=server
```

---

*For full project documentation, API endpoints breakdown, and deployment guides, please see the [Main Project README](../README.md).*
