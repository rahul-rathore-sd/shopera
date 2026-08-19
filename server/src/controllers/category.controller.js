import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Create Category (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parentCategory, image } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "Category name is required");
  }

  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  });

  if (existingCategory) {
    throw new ApiError(409, "A category with this name already exists");
  }

  if (parentCategory) {
    const parentExists = await Category.findById(parentCategory);
    if (!parentExists) {
      throw new ApiError(404, "Parent category not found");
    }
  }

  const category = await Category.create({
    name: name.trim(),
    description,
    parentCategory: parentCategory || null,
    image: image || { url: "", publicId: "" },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

// 2. Get All Categories (Public)
export const getAllCategories = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  const filter = includeInactive === "true" ? {} : { isActive: true };

  const categories = await Category.find(filter)
    .populate("parentCategory", "name slug")
    .sort({ name: 1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

// 3. Get Category by Slug (Public)
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true }).populate(
    "parentCategory",
    "name slug"
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

// 4. Update Category (Admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, parentCategory, isActive, image } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (name && name.trim() !== category.name) {
    const duplicate = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new ApiError(409, "Another category with this name already exists");
    }
    category.name = name.trim();
  }

  if (description !== undefined) category.description = description;
  if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
  if (isActive !== undefined) category.isActive = isActive;
  if (image) category.image = image;

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

// 5. Delete Category (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Guard: Prevent deletion if products exist under this category
  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category: ${productsCount} products are linked to it`
    );
  }

  await Category.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});