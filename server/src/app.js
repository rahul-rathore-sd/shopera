import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Base Route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Shopera API is live" });
});


// Mount payment routes
app.use("/api/v1/payments", paymentRouter);

// Mount API routes before errorHandler
app.use("/api/v1/auth", authRouter);

// Routes declarations
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);

// Register routes
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);

// Central Error Handler
app.use(errorHandler);

export default app;