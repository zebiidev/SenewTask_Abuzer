/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Import middleware
import { apiLimiter, reservationLimiter, checkoutLimiter } from "./middlewares/rateLimitMiddleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

// Import routes
import productRoutes from "./routes/productRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Import utilities
import { logger } from "./utils/logger.js";

const app = express();

// ==================== Security Middleware ====================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));

// ==================== Logging Middleware ====================

app.use(morgan("combined", {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

// ==================== Body Parsing Middleware ====================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ==================== Rate Limiting ====================

// Apply general rate limiter to all routes
app.use(apiLimiter);

// ==================== Health Check Endpoint ====================

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});

// ==================== API Routes ====================

/**
 * Product Management
 * Handles product creation, retrieval, and status
 */
app.use("/api/products", productRoutes);

/**
 * Reservation Management
 * Handles product reservations
 */
app.use("/api/reservations", reservationLimiter, reservationRoutes);

/**
 * Order Management
 * Handles checkout and order retrieval
 */
app.use("/api/orders", checkoutLimiter, orderRoutes);

// ==================== Error Handling ====================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
