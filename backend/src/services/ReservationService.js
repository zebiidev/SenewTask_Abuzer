/**
 * Reservation Service
 * Handles product reservations using Redis with atomic operations
 * Prevents overselling with Lua script implementation
 */

import { getRedisClient } from "../config/redis.js";
import { CONSTANTS } from "../utils/constants.js";
import { AppError, createNotFoundError, createConflictError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import ProductService from "./ProductService.js";

export class ReservationService {
    /**
     * Create reservations for multiple products
     * Uses Lua script to atomically check and reserve stock
     * Prevents race conditions and overselling
     * @param {string} userId - User ID
     * @param {Array} items - Array of items { productId, quantity }
     * @returns {Promise<Object>} Reservation details
     */
    async reserveProducts(userId, items) {
        const redis = getRedisClient();
        
        try {
            // Get products to verify they exist and check stock
            for (const item of items) {
                const product = await ProductService.getProductById(item.productId);
                if (product.stock < item.quantity) {
                    throw createConflictError(`Insufficient stock available for product ${item.productId}`);
                }
            }

            // Prepare keys and arguments for Lua script
            const keys = items.map(item => CONSTANTS.REDIS_KEYS.RESERVATION(userId, item.productId));
            const args = [CONSTANTS.RESERVATION_TTL.toString()];
            items.forEach(item => args.push(item.quantity.toString()));

            // Lua script for atomic multi-reservation
            // This prevents race conditions during concurrent requests
            const luaScript = `
        local ttl = tonumber(ARGV[1])
        
        -- Get current reservations to check if any exist
        for i=1, #KEYS do
          local currentReservation = redis.call('get', KEYS[i])
          if currentReservation then
            return redis.error_reply("User already has an active reservation for one or more products")
          end
        end
        
        -- Set all reservations with TTL
        for i=1, #KEYS do
          local quantity = tonumber(ARGV[i+1])
          redis.call('setex', KEYS[i], ttl, quantity)
        end
        
        return redis.status_reply("OK")
      `;

            const result = await redis.eval(luaScript, {
                keys: keys,
                arguments: args,
            });

            logger.info("Reservations created", {
                userId,
                items,
                expiresIn: CONSTANTS.RESERVATION_TTL,
            });

            return {
                userId,
                items,
                expiresIn: CONSTANTS.RESERVATION_TTL,
                createdAt: new Date(),
            };
        } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 409) {
                throw error;
            }
            logger.error("Error creating reservations", {
                error: error.message,
                userId,
                items,
            });
            throw error;
        }
    }

    /**
     * Get active reservation for a user-product combination
     * @param {string} userId - User ID
     * @param {string} productId - Product ID
     * @returns {Promise<Object|null>} Reservation details or null
     */
    async getReservation(userId, productId) {
        const redis = getRedisClient();
        const reservationKey = CONSTANTS.REDIS_KEYS.RESERVATION(userId, productId);

        try {
            const quantity = await redis.get(reservationKey);

            if (!quantity) {
                return null;
            }

            return {
                userId,
                productId,
                quantity: parseInt(quantity, 10),
            };
        } catch (error) {
            logger.error("Error fetching reservation", { error: error.message, userId, productId });
            throw error;
        }
    }

    /**
     * Cancel a reservation
     * Immediately frees up reserved stock
     * @param {string} userId - User ID
     * @param {string} productId - Product ID
     * @returns {Promise<boolean>} True if reservation was cancelled, false if not found
     */
    async cancelReservation(userId, productId) {
        const redis = getRedisClient();
        const reservationKey = CONSTANTS.REDIS_KEYS.RESERVATION(userId, productId);

        try {
            const deleted = await redis.del(reservationKey);

            if (deleted === 0) {
                throw createNotFoundError("Reservation");
            }

            logger.info("Reservation cancelled", { userId, productId });
            return true;
        } catch (error) {
            if (error.statusCode === 404) {
                throw error;
            }
            logger.error("Error cancelling reservation", { error: error.message, userId, productId });
            throw error;
        }
    }

    /**
     * Get total reserved quantity for a product
     * Scans Redis for all reservations of this product
     * @param {string} productId - Product ID
     * @returns {Promise<number>} Total reserved quantity
     */
    async getTotalReservedQuantity(productId) {
        const redis = getRedisClient();
        const pattern = `reservation:*:${productId}`;

        try {
            let totalReserved = 0;
            let cursor = "0";

            // Use SCAN to avoid blocking with KEYS
            do {
                const result = await redis.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100,
                });

                cursor = String(result.cursor);
                const keys = result.keys;

                // Get value for each key
                for (const key of keys) {
                    const quantity = await redis.get(key);
                    if (quantity) {
                        totalReserved += parseInt(quantity, 10);
                    }
                }
            } while (cursor !== "0" && cursor !== 0);

            return totalReserved;
        } catch (error) {
            logger.error("Error calculating total reserved quantity", {
                error: error.message,
                productId,
            });
            throw error;
        }
    }

    /**
     * Verify reservations exist and have correct quantities
     * Used before checkout to ensure reservations are still valid
     * @param {string} userId - User ID
     * @param {Array} items - Array of expected items { productId, quantity }
     * @returns {Promise<boolean>} True if all reservations are valid
     */
    async verifyReservations(userId, items) {
        for (const item of items) {
            const reservation = await this.getReservation(userId, item.productId);

            if (!reservation) {
                throw createNotFoundError(`Reservation for product ${item.productId}`);
            }

            if (reservation.quantity !== item.quantity) {
                throw new AppError(
                    `Reservation quantity mismatch for product ${item.productId}. Expected ${reservation.quantity}, got ${item.quantity}`,
                    409
                );
            }
        }

        return true;
    }
}

export default new ReservationService();
