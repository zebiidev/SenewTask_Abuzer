/**
 * Product Routes
 * Endpoints for product management
 */

import express from "express";
import {
    createProduct,
    getProduct,
    getAllProducts,
    getProductStatus,
} from "../controllers/ProductController.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";
import {
    createProductSchema,
    getProductSchema,
    getProductStatusSchema,
} from "../validations/schemas.js";

const router = express.Router();

/**
 * POST /api/products
 * Create a new product
 * Body: { name, stock, price, description? }
 */
router.post("/", validateRequest(createProductSchema), createProduct);

/**
 * GET /api/products
 * Get all products
 */
router.get("/", getAllProducts);

/**
 * GET /api/products/:productId
 * Get product by ID
 */
router.get("/:productId", validateRequest(getProductSchema), getProduct);

/**
 * GET /api/products/:productId/status
 * Get product stock status
 */
router.get("/:productId/status", validateRequest(getProductStatusSchema), getProductStatus);

export default router;
