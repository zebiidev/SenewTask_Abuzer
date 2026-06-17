/**
 * Product Controller
 * Handles product-related HTTP requests
 * All business logic is delegated to ProductService
 */

import ProductService from "../services/ProductService.js";
import StockService from "../services/StockService.js";
import { successResponse } from "../utils/response.js";
import { CONSTANTS } from "../utils/constants.js";

/**
 * POST /products
 * Create a new product
 */
export const createProduct = async (req, res, next) => {
    try {
        const product = await ProductService.createProduct(req.body);
        res.status(201).json(
            successResponse(product, CONSTANTS.MESSAGES.PRODUCT_CREATED, 201)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /products/:productId
 * Fetch a single product by ID
 */
export const getProduct = async (req, res, next) => {
    try {
        const product = await ProductService.getProductById(req.params.productId);
        res.status(200).json(
            successResponse(product, CONSTANTS.MESSAGES.PRODUCT_FETCHED)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /products
 * Fetch all products
 */
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await ProductService.getAllProducts();
        res.status(200).json(
            successResponse(products, CONSTANTS.MESSAGES.PRODUCTS_FETCHED)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /products/:productId/status
 * Get product stock status
 */
export const getProductStatus = async (req, res, next) => {
    try {
        const status = await StockService.getProductStatus(req.params.productId);
        res.status(200).json(
            successResponse(status, "Product status fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};
