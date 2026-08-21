import "dotenv/config";
import mongoose from "mongoose";
import app from "../app.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";

let server;
let baseUrl;

async function runCartPaymentVerification() {
  console.log("=== STARTING CART & PAYMENT ('CARD' METHOD) VERIFICATION ===");

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ MongoDB Connected");

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      console.log(`✓ Test server running at ${baseUrl}`);
      resolve();
    });
  });

  const testUserEmail = `paytest_${Date.now()}@shopera.demo`;
  const testPassword = "Payment@12345";

  console.log("\n1. Creating test customer...");
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Checkout Tester",
      email: testUserEmail,
      password: testPassword,
    }),
  });
  const regData = await regRes.json();
  if (regRes.status !== 201) {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }
  const token = regData.data.accessToken;
  const userId = regData.data.user._id;
  console.log("✓ Test customer registered and authenticated.");

  console.log("\n2. Ensuring test category and product...");
  let category = await Category.findOne();
  if (!category) {
    category = await Category.create({
      name: "Electronics Test",
      description: "Test category",
    });
  }

  let product = await Product.findOne({ isPublished: true, stock: { $gt: 5 } });
  if (!product) {
    product = await Product.create({
      title: `Test Smartphone ${Date.now()}`,
      description: "A test product with plenty of stock",
      brand: "TestBrand",
      category: category._id,
      basePrice: 19999,
      baseDiscountPrice: 17999,
      stock: 50,
      isPublished: true,
    });
  }
  console.log(`✓ Using Product: '${product.title}' (ID: ${product._id}, Stock: ${product.stock})`);

  console.log("\n3. Adding product to cart (POST /api/v1/cart)...");
  const addCartRes = await fetch(`${baseUrl}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: product._id,
      quantity: 2,
    }),
  });
  const addCartData = await addCartRes.json();
  if (addCartRes.status !== 200 || !addCartData.data?.items?.length) {
    throw new Error(`Failed to add item to cart: ${JSON.stringify(addCartData)}`);
  }
  console.log(`✓ Added 2 items to cart. Cart now has ${addCartData.data.items.length} item line(s).`);

  console.log("\n4. Placing order with paymentMethod: 'card' (POST /api/v1/orders)...");
  const orderRes = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shippingAddress: {
        fullName: "Checkout Tester",
        phone: "+91 9988776655",
        street: "456 Tech Park",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
      },
      paymentMethod: "card",
    }),
  });

  const orderData = await orderRes.json();
  if (orderRes.status !== 201 || !orderData.data?._id) {
    throw new Error(`Order placement failed: ${JSON.stringify(orderData)}`);
  }
  const orderId = orderData.data._id;
  console.log(`✓ Order placed successfully! Order ID: ${orderId}, Total: ₹${orderData.data.pricing.totalAmount}`);

  console.log("\n5. Generating Razorpay Order (POST /api/v1/payments/create-order)...");
  const rzpRes = await fetch(`${baseUrl}/payments/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  });
  const rzpData = await rzpRes.json();
  if (rzpRes.status !== 200 || !rzpData.data?.id) {
    throw new Error(`Razorpay order creation failed: ${JSON.stringify(rzpData)}`);
  }
  console.log(`✓ Razorpay order created: ${rzpData.data.id} for amount ${rzpData.data.amount} paise`);

  console.log("\n6. Verifying cart was emptied upon order placement...");
  const cartCheckRes = await fetch(`${baseUrl}/cart`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const cartCheckData = await cartCheckRes.json();
  if (cartCheckData.data.items.length !== 0) {
    throw new Error("Cart was not cleared after order placement");
  }
  console.log("✓ User cart is cleanly emptied.");

  // Clean up
  await User.deleteMany({ email: { $regex: /^paytest_/ } });
  await Order.deleteMany({ user: userId });
  await Cart.deleteMany({ user: userId });
  console.log("✓ Cleaned up test database records.");

  console.log("\n===================================================================");
  console.log("🎉 SUCCESS: Cart to Card Payment flow executed without any errors!");
  console.log("===================================================================");
}

runCartPaymentVerification()
  .catch((err) => {
    console.error("❌ VERIFICATION FAILED:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) server.close();
    await mongoose.disconnect();
  });
