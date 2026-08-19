import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "./ApiError.js";

/**
 * Upload a buffer directly to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer - The memory buffer from req.file or req.files
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = (fileBuffer, folder = "shopera/products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "webp", // Auto-convert images to modern WebP format
        quality: "auto:good", // Auto-compress for optimal web performance
      },
      (error, result) => {
        if (error) {
          return reject(
            new ApiError(500, `Cloudinary upload failed: ${error.message}`)
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Convert Buffer to Readable Stream and pipe to Cloudinary
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete a single image from Cloudinary
 * @param {string} publicId - Cloudinary asset public ID
 * @returns {Promise<object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to delete asset from Cloudinary: ${error.message}`
    );
  }
};

/**
 * Delete multiple images in bulk from Cloudinary
 * @param {string[]} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<object>}
 */
export const deleteMultipleFromCloudinary = async (publicIds = []) => {
  const filteredIds = publicIds.filter(Boolean);
  if (filteredIds.length === 0) return null;

  try {
    const result = await cloudinary.api.delete_resources(filteredIds, {
      resource_type: "image",
    });
    return result;
  } catch (error) {
    throw new ApiError(
      500,
      `Failed to delete multiple assets from Cloudinary: ${error.message}`
    );
  }
};