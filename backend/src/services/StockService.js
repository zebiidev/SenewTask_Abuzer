/**
 * Stock Service
 * Handles stock availability calculations
 * Combines MongoDB stock with Redis reservations
 */

import ProductService from "./ProductService.js";
import ReservationService from "./ReservationService.js";
import { AppError, createNotFoundError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export class StockService {
    /**
     * Get product status with stock information
     * Calculates total, reserved, and available stock
     * @param {string} productId - Product ID
     * @returns {Promise<Object>} Stock status object
     */
    async getProductStatus(productId) {
        try {
            // Get product from database
            const product = await ProductService.getProductById(productId);

            // Get total reserved quantity from Redis
            const reservedStock = await ReservationService.getTotalReservedQuantity(productId);

            // Calculate available stock
            const availableStock = product.stock - reservedStock;

            const status = {
                productId: product._id,
                name: product.name,
                totalStock: product.stock,
                reservedStock,
                availableStock: Math.max(0, availableStock), // Prevent negative values
                isAvailable: availableStock > 0,
                price: product.price,
            };

            logger.info("Product status retrieved", { productId, ...status });
            return status;
        } catch (error) {
            if (error.statusCode === 404) {
                throw error;
            }
            logger.error("Error getting product status", { error: error.message, productId });
            throw error;
        }
    }

    /**
     * Check if product has available stock for quantity
     * @param {string} productId - Product ID
     * @param {number} quantity - Required quantity
     * @returns {Promise<boolean>} True if enough stock available
     */
    async hasAvailableStock(productId, quantity) {
        try {
            const status = await this.getProductStatus(productId);
            return status.availableStock >= quantity;
        } catch (error) {
            logger.error("Error checking available stock", {
                error: error.message,
                productId,
                quantity,
            });
            throw error;
        }
    }

    /**
     * Get status for all products
     * @returns {Promise<Array>} Array of product statuses
     */
    async getAllProductsStatus() {
        try {
            const products = await ProductService.getAllProducts();
            const statuses = await Promise.all(
                products.map((product) => this.getProductStatus(product._id.toString()))
            );
            return statuses;
        } catch (error) {
            logger.error("Error getting all products status", { error: error.message });
            throw error;
        }
    }
}

export default new StockService();
