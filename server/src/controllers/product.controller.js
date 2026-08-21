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
    basePrice: Number(basePrice),
    baseDiscountPrice: baseDiscountPrice !== undefined && baseDiscountPrice !== "" ? Number(baseDiscountPrice) : undefined,
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

// 2. Get All Products with Multi-Faceted Filtering, Search, Sorting & Pagination (Public)
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
    dealType,
    hasDiscount,
    featured,
    sortBy = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isPublished: true };
  const andClauses = [];

  // 1. Text & Fuzzy Search
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    andClauses.push({
      $or: [
        { title: { $regex: searchRegex } },
        { brand: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
        { description: { $regex: searchRegex } },
      ],
    });
  }

  // 2. Category Filter (by ObjectId, Slug, or Name)
  if (category && category.trim() !== "") {
    const catTrimmed = category.trim();
    if (mongoose.Types.ObjectId.isValid(catTrimmed)) {
      query.category = new mongoose.Types.ObjectId(catTrimmed);
    } else {
      const foundCategory = await Category.findOne({
        $or: [
          { slug: catTrimmed },
          { slug: new RegExp(`^${catTrimmed}$`, "i") },
          { slug: new RegExp(`^${catTrimmed}`, "i") },
          { name: new RegExp(`^${catTrimmed}`, "i") },
        ],
      });
      if (foundCategory) {
        query.category = foundCategory._id;
      }
    }
  }

  // 3. Brand Filter (Supports comma-separated or single brand)
  if (brand && brand.trim() !== "") {
    const brands = brand
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean)
      .map((b) => new RegExp(`^${b}$`, "i"));
    if (brands.length > 0) {
      query.brand = { $in: brands };
    }
  }

  // 4. Price Range Filter (Accurately evaluates selling price: baseDiscountPrice || basePrice)
  const hasMinPrice =
    minPrice !== undefined &&
    minPrice !== "" &&
    minPrice !== null &&
    !isNaN(Number(minPrice));
  const hasMaxPrice =
    maxPrice !== undefined &&
    maxPrice !== "" &&
    maxPrice !== null &&
    !isNaN(Number(maxPrice));

  if (hasMinPrice || hasMaxPrice) {
    const minVal = hasMinPrice ? Number(minPrice) : null;
    const maxVal = hasMaxPrice ? Number(maxPrice) : null;

    const discountCondition = {};
    const regularCondition = {};
    if (minVal !== null) {
      discountCondition.$gte = minVal;
      regularCondition.$gte = minVal;
    }
    if (maxVal !== null) {
      discountCondition.$lte = maxVal;
      regularCondition.$lte = maxVal;
    }

    andClauses.push({
      $or: [
        {
          $and: [
            { baseDiscountPrice: { $exists: true, $ne: null, $gt: 0 } },
            { baseDiscountPrice: discountCondition },
          ],
        },
        {
          $and: [
            {
              $or: [
                { baseDiscountPrice: null },
                { baseDiscountPrice: { $exists: false } },
                { baseDiscountPrice: 0 },
              ],
            },
            { basePrice: regularCondition },
          ],
        },
      ],
    });
  }

  // 5. Ratings Filter
  if (rating !== undefined && rating !== "" && !isNaN(Number(rating))) {
    query.ratingsAverage = { $gte: Number(rating) };
  }

  // 6. In-Stock Filter
  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }

  // 7. Deals & Badges Filter
  const activeTags = [];
  if (tags && tags.trim() !== "") {
    activeTags.push(
      ...tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    );
  }

  if (dealType && dealType !== "all") {
    if (dealType === "featured") {
      query.featured = true;
    } else if (dealType === "sale" || dealType === "discount") {
      query.baseDiscountPrice = { $exists: true, $ne: null, $gt: 0 };
    } else if (dealType === "deals" || dealType === "hot") {
      andClauses.push({
        $or: [
          { tags: { $in: ["deals", "hot", "sale"] } },
          { baseDiscountPrice: { $exists: true, $ne: null, $gt: 0 } },
        ],
      });
    } else if (dealType === "bestseller") {
      andClauses.push({
        $or: [
          { tags: { $in: ["bestseller"] } },
          { ratingsAverage: { $gte: 4.8 } },
        ],
      });
    } else {
      activeTags.push(dealType.trim().toLowerCase());
    }
  }

  if (activeTags.length > 0) {
    query.tags = { $in: activeTags };
  }

  if (hasDiscount === "true") {
    query.baseDiscountPrice = { $exists: true, $ne: null, $gt: 0 };
  }

  if (featured === "true") {
    query.featured = true;
  }

  // Combine AND clauses if present
  if (andClauses.length > 0) {
    query.$and = andClauses;
  }

  // 8. Sorting Strategy
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

  // 9. Pagination Calculations
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

// 3. Get Single Product by Slug (Public)
export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({
    slug: slug.toLowerCase(),
    isPublished: true,
  }).populate("category", "name slug");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// 4. Get Single Product by ID (Admin / Public)
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID format");
  }

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
      throw new ApiError(404, "Category does not exist");
    }
  }

  if (updates.hasVariants && (!updates.variants || updates.variants.length === 0)) {
    throw new ApiError(400, "Variants array cannot be empty when hasVariants is true");
  }

  // Update fields
  Object.keys(updates).forEach((key) => {
    product[key] = updates[key];
  });

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// 5. Delete Product (Admin)
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