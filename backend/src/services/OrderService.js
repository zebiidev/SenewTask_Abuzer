/**
 * Order Service
 * Handles order creation and checkout logic
 */

import Order from "../models/Order.js";
import ProductService from "./ProductService.js";
import ReservationService from "./ReservationService.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

export class OrderService {
    /**
     * Create order from reservations
     * Performs checkout: verify reservations, deduct stock, create order, remove reservations
     * Uses database transaction with rollback capability
     * @param {string} userId - User ID
     * @param {Array} items - Array of items { productId, quantity }
     * @returns {Promise<Object>} Created order
     */
    async createOrderFromReservation(userId, items) {
        // Step 1: Verify reservations exist and are valid
        await ReservationService.verifyReservations(userId, items);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let totalPrice = 0;
            const orderItems = [];

            // Step 2 & 3: Get products to verify stock, calculate price, and deduct stock
            for (const item of items) {
                const product = await ProductService.getProductById(item.productId);
                
                // Final check: ensure enough stock
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock available for product ${item.productId} (concurrent request)`);
                }

                // Deduct stock from MongoDB (in transaction)
                await ProductService.deductStock(item.productId, item.quantity, session);
                
                const itemPrice = product.price * item.quantity;
                totalPrice += itemPrice;
                
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price
                });
            }

            // Step 4: Create order record
            const order = await Order.create([{
                userId,
                items: orderItems,
                totalPrice,
                status: "completed",
            }], { session });

            await session.commitTransaction();

            // Step 5: Remove reservations from Redis
            // Do this after order creation to prevent data loss
            for (const item of items) {
                await ReservationService.cancelReservation(userId, item.productId);
            }

            logger.info("Order created successfully", {
                orderId: order[0]._id,
                userId,
                items,
                totalPrice,
            });

            return order[0];
        } catch (error) {
            await session.abortTransaction();
            logger.error("Error creating order (Transaction Rolled Back)", {
                error: error.message,
                userId,
                items,
            });
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Order details
     */
    async getOrderById(orderId) {
        try {
            const order = await Order.findById(orderId).populate("items.productId");
            if (!order) {
                throw new Error("Order not found");
            }
            return order;
        } catch (error) {
            logger.error("Error fetching order", { error: error.message, orderId });
            throw error;
        }
    }

    /**
     * Get all orders for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} User's orders
     */
    async getUserOrders(userId) {
        try {
            const orders = await Order.find({ userId })
                .populate("items.productId")
                .sort({ createdAt: -1 });
            return orders;
        } catch (error) {
            logger.error("Error fetching user orders", { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Get order statistics
     * @returns {Promise<Object>} Order statistics
     */
    async getOrderStats() {
        try {
            const stats = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$totalPrice" },
                        averageOrderValue: { $avg: "$totalPrice" },
                    },
                },
            ]);

            return stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
        } catch (error) {
            logger.error("Error fetching order stats", { error: error.message });
            throw error;
        }
    }
}

export default new OrderService();
