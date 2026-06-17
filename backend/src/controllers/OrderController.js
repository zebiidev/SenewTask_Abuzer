/**
 * Order Controller
 * Handles order-related HTTP requests
 * All business logic is delegated to OrderService
 */

import OrderService from "../services/OrderService.js";
import { successResponse } from "../utils/response.js";
import { CONSTANTS } from "../utils/constants.js";

/**
 * POST /checkout
 * Create an order from a reservation
 */
export const checkout = async (req, res, next) => {
    try {
        const { userId, items } = req.body;

        const order = await OrderService.createOrderFromReservation(
            userId,
            items
        );

        res.status(201).json(
            successResponse(order, CONSTANTS.MESSAGES.CHECKOUT_SUCCESS, 201)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /orders/:orderId
 * Get order details
 */
export const getOrder = async (req, res, next) => {
    try {
        const order = await OrderService.getOrderById(req.params.orderId);
        res.status(200).json(
            successResponse(order, "Order fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /orders/user/:userId
 * Get all orders for a user
 */
export const getUserOrders = async (req, res, next) => {
    try {
        const orders = await OrderService.getUserOrders(req.params.userId);
        res.status(200).json(
            successResponse(orders, "User orders fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /orders/stats
 * Get order statistics
 */
export const getOrderStats = async (req, res, next) => {
    try {
        const stats = await OrderService.getOrderStats();
        res.status(200).json(
            successResponse(stats, "Order statistics fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};
