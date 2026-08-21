import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Cookie security configurations
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// Helper to generate access & refresh token pair and persist refresh token
const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// 1. Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields (name, email, password) are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken },
        "User registered successfully"
      )
    );
});

// 2. Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password"
  );

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Logged in successfully"
      )
    );
});

// 3. Refresh Access Token (Token Rotation)
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token: User not found");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or has been revoked");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(
        new ApiResponse(
          200,
          { accessToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// 4. Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { returnDocument: "after" }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// 5. Get Current Logged-in User Profile
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// 6. Change Current Password
export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Both current password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password entered is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// 7. Update Account Details (Name, Email)
export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    throw new ApiError(400, "Please provide name or email to update");
  }

  const updateData = {};
  if (name && name.trim()) {
    updateData.name = name.trim();
  }

  if (email && email.trim()) {
    const formattedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({
      email: formattedEmail,
      _id: { $ne: req.user._id },
    });
    if (existing) {
      throw new ApiError(409, "Email is already in use by another account");
    }
    updateData.email = formattedEmail;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
});

// 8. Update User Avatar
export const updateUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let avatarUrl = req.body?.avatarUrl;
  let publicId = "";

  if (req.file?.buffer) {
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId).catch(() => null);
    }
    const uploaded = await uploadToCloudinary(req.file.buffer, "shopera/avatars");
    avatarUrl = uploaded.url;
    publicId = uploaded.publicId;
  } else if (!avatarUrl) {
    throw new ApiError(400, "Avatar file or avatarUrl is required");
  }

  user.avatar = {
    url: avatarUrl,
    publicId: publicId || user.avatar?.publicId || "",
  };

  await user.save({ validateBeforeSave: false });

  const sanitizedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, sanitizedUser, "Avatar updated successfully"));
});

// 9. Get User Addresses
export const getUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user?.addresses || [],
        "User addresses fetched successfully"
      )
    );
});

// 10. Add Shipping Address
export const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    street,
    city,
    state,
    postalCode,
    country = "India",
    isDefault = false,
  } = req.body;

  if (!fullName || !phone || !street || !city || !state || !postalCode) {
    throw new ApiError(400, "All address fields are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const shouldBeDefault = isDefault || user.addresses.length === 0;

  if (shouldBeDefault && user.addresses.length > 0) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    fullName: fullName.trim(),
    phone: phone.trim(),
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    country: country.trim(),
    isDefault: shouldBeDefault,
  });

  await user.save();

  return res
    .status(201)
    .json(new ApiResponse(201, user.addresses, "Address added successfully"));
});

// 11. Update Shipping Address
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const {
    fullName,
    phone,
    street,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const targetAddress = user.addresses.id(addressId);
  if (!targetAddress) {
    throw new ApiError(404, "Address not found");
  }

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    targetAddress.isDefault = true;
  } else if (isDefault === false && targetAddress.isDefault) {
    targetAddress.isDefault = false;
  }

  if (fullName) targetAddress.fullName = fullName.trim();
  if (phone) targetAddress.phone = phone.trim();
  if (street) targetAddress.street = street.trim();
  if (city) targetAddress.city = city.trim();
  if (state) targetAddress.state = state.trim();
  if (postalCode) targetAddress.postalCode = postalCode.trim();
  if (country) targetAddress.country = country.trim();

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user.addresses, "Address updated successfully"));
});

// 12. Delete Shipping Address
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const wasDefault = address.isDefault;
  user.addresses.pull(addressId);

  // If deleted address was default, set the first remaining address as default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user.addresses, "Address deleted successfully"));
});

// 13. Set Default Address
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const targetAddress = user.addresses.id(addressId);
  if (!targetAddress) {
    throw new ApiError(404, "Address not found");
  }

  user.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId;
  });

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user.addresses, "Default address set successfully"));
});

// 14. Forgot Password - Request Reset Token
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // For security reasons, avoid leaking email existence
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account exists with that email, a password reset instruction has been generated"
        )
      );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // In production, send email with reset link containing resetToken
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resetToken,
        message: "Password reset token generated. Valid for 15 minutes.",
      },
      "Password reset token generated successfully"
    )
  );
});

// 15. Reset Password using Token
export const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params?.token || req.body?.token;
  const { password } = req.body;

  if (!token) {
    throw new ApiError(400, "Password reset token is required");
  }

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password is required and must be at least 8 characters long");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Password reset token is invalid or has expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { user: updatedUser, accessToken },
        "Password has been reset successfully"
      )
    );
});

// 16. Get All Users (Admin)
export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users retrieved successfully"));
});

// 17. Update User Role (Admin)
export const updateUserRoleAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["admin", "customer"].includes(role)) {
    throw new ApiError(400, "Role must be either 'admin' or 'customer'");
  }

  const user = await User.findById(id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, `User role updated to ${role}`));
});