/**
 * Product Service
 * Handles all product-related business logic
 */

import Product from "../models/Product.js";
import { AppError, createNotFoundError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export class ProductService {
    /**
     * Create a new product
     * @param {Object} productData - Product data (name, stock, price, description)
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
        try {
            const product = await Product.create(productData);
            logger.info("Product created", { productId: product._id, name: product.name });
            return product;
        } catch (error) {
            if (error.code === 11000) {
                throw new AppError("Product already exists", 409);
            }
            logger.error("Error creating product", { error: error.message });
            throw error;
        }
    }

    /**
     * Get product by ID
     * @param {string} productId - Product ID
     * @returns {Promise<Object>} Product data
     */
    async getProductById(productId) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw createNotFoundError("Product");
            }
            return product;
        } catch (error) {
            if (error.statusCode === 404) {
                throw error;
            }
            logger.error("Error fetching product", { error: error.message, productId });
            throw error;
        }
    }

    /**
     * Get all products
     * @returns {Promise<Array>} List of all products
     */
    async getAllProducts() {
        try {
            const products = await Product.find().sort({ createdAt: -1 });
            return products;
        } catch (error) {
            logger.error("Error fetching products", { error: error.message });
            throw error;
        }
    }

    /**
     * Update product stock (for checkout)
     * Direct update to MongoDB
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity to deduct
     * @param {Object} session - Mongoose session (optional)
     * @returns {Promise<Object>} Updated product
     */
    async deductStock(productId, quantity, session = null) {
        try {
            const options = { new: true, runValidators: true };
            if (session) {
                options.session = session;
            }

            const product = await Product.findByIdAndUpdate(
                productId,
                { $inc: { stock: -quantity } },
                options
            );

            if (!product) {
                throw createNotFoundError("Product");
            }

            if (product.stock < 0) {
                throw new AppError("Insufficient stock available", 409);
            }

            logger.info("Product stock deducted", { productId, quantity, remainingStock: product.stock });
            return product;
        } catch (error) {
            logger.error("Error deducting stock", { error: error.message, productId, quantity });
            throw error;
        }
    }
}

export default new ProductService();
