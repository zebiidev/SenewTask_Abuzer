/**
 * Order Routes
 * Endpoints for order management and checkout
 */

import express from "express";
import {
    checkout,
    getOrder,
    getUserOrders,
    getOrderStats,
} from "../controllers/OrderController.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";
import { checkoutSchema } from "../validations/schemas.js";

const router = express.Router();

/**
 * POST /api/orders/checkout
 * Checkout a reservation and create an order
 * Body: { userId, productId, quantity }
 */
router.post("/checkout", validateRequest(checkoutSchema), checkout);

/**
 * GET /api/orders/stats
 * Get order statistics
 */
router.get("/stats", getOrderStats);

/**
 * GET /api/orders/:orderId
 * Get order details
 */
router.get("/:orderId", getOrder);

/**
 * GET /api/orders/user/:userId
 * Get all orders for a user
 */
router.get("/user/:userId", getUserOrders);

export default router;
