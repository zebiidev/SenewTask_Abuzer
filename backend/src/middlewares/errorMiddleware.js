/**
 * Global Error Handling Middleware
 * Catches and formats all errors in a consistent way
 */

import { errorResponse } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

/**
 * Global error handler
 * Catches all errors thrown in the application
 */
export const errorHandler = (error, req, res, next) => {
    let appError = error;

    // Convert non-AppError exceptions to AppError
    if (!(error instanceof AppError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal server error";

        appError = new AppError(message, statusCode);
    }

    const { statusCode, message } = appError;

    // Log error
    if (statusCode === 500) {
        logger.error("Unhandled error", {
            error: error.message,
            stack: error.stack,
            method: req.method,
            path: req.path,
        });
    } else {
        logger.warn("Client error", {
            error: message,
            statusCode,
            method: req.method,
            path: req.path,
        });
    }

    // Send response
    res.status(statusCode).json(
        errorResponse(message, statusCode)
    );
};

/**
 * 404 Not Found middleware
 * Handles routes that don't exist
 */
export const notFoundHandler = (req, res) => {
    logger.warn("Route not found", {
        method: req.method,
        path: req.path,
    });

    res.status(404).json(
        errorResponse("Route not found", 404)
    );
};
