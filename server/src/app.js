import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";

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

// Central Error Handler
app.use(errorHandler);

export default app;