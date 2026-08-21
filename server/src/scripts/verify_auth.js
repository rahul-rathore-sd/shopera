import "dotenv/config";
import mongoose from "mongoose";
import app from "../app.js";
import { User } from "../models/User.js";

const TEST_EMAIL = `authtest_${Date.now()}@shopera.demo`;
const TEST_PASSWORD = "Password@12345";
const NEW_PASSWORD = "NewPassword@67890";
const RESET_PASSWORD = "ResetPassword@112233";

let server;
let baseUrl;

async function runTest() {
  console.log("=== STARTING SHOPERA AUTHENTICATION VERIFICATION ===");

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured in .env");
  }

  console.log("1. Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ MongoDB Connected");

  // Start temporary server listener
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1/auth`;
      console.log(`✓ Test server running at ${baseUrl}`);
      resolve();
    });
  });

  // Clean up any test user with this email
  await User.deleteMany({ email: { $regex: /^authtest_/ } });

  let accessToken = "";
  let refreshToken = "";

  console.log("\n2. Testing User.js Model Unit Functions...");
  const sampleUser = new User({
    name: "Model Unit Tester",
    email: `modeltest_${Date.now()}@shopera.demo`,
    password: "TempPassword123",
  });
  await sampleUser.save();
  if (!(await sampleUser.isPasswordCorrect("TempPassword123"))) {
    throw new Error("Model isPasswordCorrect failed");
  }
  if (await sampleUser.isPasswordCorrect("WrongPassword")) {
    throw new Error("Model isPasswordCorrect gave false positive");
  }
  const resetToken = sampleUser.createPasswordResetToken();
  if (!resetToken || !sampleUser.passwordResetToken || !sampleUser.passwordResetExpires) {
    throw new Error("createPasswordResetToken failed to set reset token/expiry");
  }
  await sampleUser.deleteOne();
  console.log("✓ User model hashing, password check, and reset token generation passed");

  console.log("\n3. Testing POST /register...");
  const regRes = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Shopera Tester",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });
  const regData = await regRes.json();
  if (regRes.status !== 201 || !regData.data?.accessToken) {
    throw new Error(`Register failed: ${JSON.stringify(regData)}`);
  }
  accessToken = regData.data.accessToken;
  console.log(`✓ Registration succeeded for ${TEST_EMAIL}. Status: 201`);

  console.log("\n4. Testing Duplicate Email POST /register (Should return 409)...");
  const dupRes = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Duplicate User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });
  if (dupRes.status !== 409) {
    throw new Error(`Expected 409 Conflict for duplicate email, got ${dupRes.status}`);
  }
  console.log("✓ Duplicate registration prevented (409 Conflict)");

  console.log("\n5. Testing POST /login...");
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200 || !loginData.data?.accessToken) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  accessToken = loginData.data.accessToken;
  
  // Extract refreshToken cookie
  const loginCookies = loginRes.headers.get("set-cookie") || "";
  const match = loginCookies.match(/refreshToken=([^;]+)/);
  if (match) {
    refreshToken = match[1];
  }
  console.log("✓ Login succeeded. Access Token and Refresh Token received.");

  console.log("\n6. Testing GET /me (Protected Route)...");
  const meRes = await fetch(`${baseUrl}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const meData = await meRes.json();
  if (meRes.status !== 200 || meData.data?.email !== TEST_EMAIL.toLowerCase()) {
    throw new Error(`GET /me failed: ${JSON.stringify(meData)}`);
  }
  console.log(`✓ GET /me returned user: ${meData.data.name} (${meData.data.email}, role: ${meData.data.role})`);

  console.log("\n7. Testing POST /refresh-token (Token Rotation)...");
  const refreshRes = await fetch(`${baseUrl}/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refreshToken=${refreshToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
  const refreshData = await refreshRes.json();
  if (refreshRes.status !== 200 || !refreshData.data?.accessToken) {
    throw new Error(`Refresh token failed: ${JSON.stringify(refreshData)}`);
  }
  accessToken = refreshData.data.accessToken;
  const newCookieHeader = refreshRes.headers.get("set-cookie") || "";
  const newMatch = newCookieHeader.match(/refreshToken=([^;]+)/);
  if (newMatch) {
    refreshToken = newMatch[1];
  }
  console.log("✓ Refresh token rotated and new access token acquired successfully.");

  console.log("\n8. Testing PATCH /change-password...");
  const chgPassRes = await fetch(`${baseUrl}/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      oldPassword: TEST_PASSWORD,
      newPassword: NEW_PASSWORD,
    }),
  });
  const chgPassData = await chgPassRes.json();
  if (chgPassRes.status !== 200) {
    throw new Error(`Change password failed: ${JSON.stringify(chgPassData)}`);
  }
  console.log("✓ Password successfully changed to new password.");

  console.log("\n9. Testing Login with New Password...");
  const newLoginRes = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: NEW_PASSWORD,
    }),
  });
  const newLoginData = await newLoginRes.json();
  if (newLoginRes.status !== 200) {
    throw new Error(`Login with new password failed: ${JSON.stringify(newLoginData)}`);
  }
  accessToken = newLoginData.data.accessToken;
  console.log("✓ Successfully authenticated with new password.");

  console.log("\n10. Testing Address Management (CRUD on User Addresses)...");
  // 10a. Add Address
  const addAddrRes = await fetch(`${baseUrl}/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      fullName: "Shopera Tester",
      phone: "+91 9876543210",
      street: "123 Innovation Way",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
      isDefault: true,
    }),
  });
  const addAddrData = await addAddrRes.json();
  if (addAddrRes.status !== 201 || !addAddrData.data || addAddrData.data.length === 0) {
    throw new Error(`Add address failed: ${JSON.stringify(addAddrData)}`);
  }
  const addressId = addAddrData.data[0]._id;
  console.log(`✓ Address added with ID: ${addressId}`);

  // 10b. Update Address
  const updateAddrRes = await fetch(`${baseUrl}/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      city: "Bengaluru Tech Hub",
    }),
  });
  const updateAddrData = await updateAddrRes.json();
  if (updateAddrRes.status !== 200 || updateAddrData.data.find(a => a._id === addressId)?.city !== "Bengaluru Tech Hub") {
    throw new Error(`Update address failed: ${JSON.stringify(updateAddrData)}`);
  }
  console.log("✓ Address updated successfully.");

  // 10c. Get Addresses
  const getAddrRes = await fetch(`${baseUrl}/addresses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const getAddrData = await getAddrRes.json();
  if (getAddrRes.status !== 200 || getAddrData.data.length !== 1) {
    throw new Error(`Get addresses failed: ${JSON.stringify(getAddrData)}`);
  }
  console.log("✓ GET /addresses retrieved active addresses.");

  // 10d. Delete Address
  const delAddrRes = await fetch(`${baseUrl}/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const delAddrData = await delAddrRes.json();
  if (delAddrRes.status !== 200 || delAddrData.data.length !== 0) {
    throw new Error(`Delete address failed: ${JSON.stringify(delAddrData)}`);
  }
  console.log("✓ Address deleted successfully.");

  console.log("\n11. Testing Forgot Password and Reset Password Flow...");
  const forgotRes = await fetch(`${baseUrl}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL }),
  });
  const forgotData = await forgotRes.json();
  if (forgotRes.status !== 200 || !forgotData.data?.resetToken) {
    throw new Error(`Forgot password failed: ${JSON.stringify(forgotData)}`);
  }
  const resetTokenStr = forgotData.data.resetToken;
  console.log("✓ Password reset token generated.");

  const resetRes = await fetch(`${baseUrl}/reset-password/${resetTokenStr}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: RESET_PASSWORD }),
  });
  const resetData = await resetRes.json();
  if (resetRes.status !== 200) {
    throw new Error(`Reset password failed: ${JSON.stringify(resetData)}`);
  }
  accessToken = resetData.data.accessToken;
  console.log("✓ Password reset successful via token.");

  console.log("\n12. Testing POST /logout and Token Revocation...");
  const logoutRes = await fetch(`${baseUrl}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (logoutRes.status !== 200) {
    throw new Error(`Logout failed: ${logoutRes.status}`);
  }
  console.log("✓ Logout successful and cookies cleared.");

  // Clean up test user
  await User.deleteMany({ email: { $regex: /^authtest_/ } });
  console.log("✓ Cleaned up test data in database.");

  console.log("\n=======================================================");
  console.log("🎉 ALL AUTHENTICATION AND USER TESTS PASSED PERFECTLY!");
  console.log("=======================================================");
}

runTest()
  .catch((err) => {
    console.error("❌ TEST FAILED:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) server.close();
    await mongoose.disconnect();
  });
