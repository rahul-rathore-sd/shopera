import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Create Product (Admin)
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    brand,
    category,
    images,
    basePrice,
    baseDiscountPrice,
    stock,
    hasVariants,
    variants,
    tags,
    isPublished,
    featured,
  } = req.body;

  if (!title || !description || basePrice === undefined || !category) {
    throw new ApiError(400, "Title, description, category, and basePrice are required");
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, "Category does not exist");
  }

  if (hasVariants && (!variants || variants.length === 0)) {
    throw new ApiError(400, "Variants array cannot be empty when hasVariants is true");
  }

  const product = await Product.create({
    title: title.trim(),
    description,
    brand: brand?.trim() || "Generic",
    category,
    images: images || [],
    basePrice,
    baseDiscountPrice,
    stock: hasVariants ? 0 : Number(stock) || 0,
    hasVariants: Boolean(hasVariants),
    variants: hasVariants ? variants : [],
    tags: Array.isArray(tags) ? tags : [],
    isPublished: Boolean(isPublished),
    featured: Boolean(featured),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// 2. Get All Products with Search, Multi-faceted Filtering, Sorting & Pagination (Public)
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    tags,
    featured,
    sortBy = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isPublished: true };

  // 1. Text & Fuzzy Search
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: { $regex: searchRegex } },
      { brand: { $regex: searchRegex } },
      { tags: { $in: [searchRegex] } },
      { description: { $regex: searchRegex } },
    ];
  }

  // 2. Category Filter (by ObjectId or Category Slug)
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = new mongoose.Types.ObjectId(category);
    } else {
      const foundCategory = await Category.findOne({ slug: category });
      if (foundCategory) {
        query.category = foundCategory._id;
      }
    }
  }

  // 3. Brand Filter (Supports comma-separated: ?brand=Nike,Adidas)
  if (brand) {
    const brands = brand.split(",").map((b) => new RegExp(`^${b.trim()}$`, "i"));
    query.brand = { $in: brands };
  }

  // 4. Price Range Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.basePrice = {};
    if (minPrice !== undefined) query.basePrice.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.basePrice.$lte = Number(maxPrice);
  }

  // 5. Ratings Filter
  if (rating) {
    query.ratingsAverage = { $gte: Number(rating) };
  }

  // 6. In-Stock Filter
  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }

  // 7. Tags Filter (Supports comma-separated: ?tags=summer,sale)
  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());
    query.tags = { $in: tagArray };
  }

  // 8. Featured Filter
  if (featured === "true") {
    query.featured = true;
  }

  // 9. Sorting Strategy
  const sortOptions = {};
  switch (sortBy) {
    case "price_asc":
      sortOptions.basePrice = 1;
      break;
    case "price_desc":
      sortOptions.basePrice = -1;
      break;
    case "rating":
      sortOptions.ratingsAverage = -1;
      break;
    case "popular":
      sortOptions.ratingsQuantity = -1;
      break;
    case "oldest":
      sortOptions.createdAt = 1;
      break;
    case "newest":
    default:
      sortOptions.createdAt = -1;
      break;
  }

  // 10. Pagination Calculations
  const currentPage = Math.max(1, parseInt(page, 10));
  const itemsPerPage = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (currentPage - 1) * itemsPerPage;

  const [products, totalProducts] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sortOptions)
      .skip(skip)
      .limit(itemsPerPage)
      .lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          totalProducts,
          totalPages,
          currentPage,
          limit: itemsPerPage,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      },
      "Products fetched successfully"
    )
  );
});

// 3. Get Product by Slug (Public)
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isPublished: true }).populate(
    "category",
    "name slug"
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// 4. Get Single Product by ID (Admin / Dashboard)
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate("category", "name slug");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// 5. Update Product (Admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (updates.category) {
    const categoryExists = await Category.findById(updates.category);
    if (!categoryExists) {
      throw new ApiError(404, "Target category does not exist");
    }
  }

  // Update allowed fields and let pre-save hooks execute
  Object.keys(updates).forEach((key) => {
    product[key] = updates[key];
  });

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// 6. Delete Product (Admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});