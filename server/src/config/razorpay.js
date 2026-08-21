import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_TRaZQH4amLulqr";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "7owc7ZLrFmtGyB9XF2kOMP30";
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret_key";

export const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});