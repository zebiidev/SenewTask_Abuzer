/**
 * Rate Limiting Middleware
 * Uses express-rate-limit for DDoS protection and API throttling
 */

import rateLimit from "express-rate-limit";
import { errorResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";

/**
 * General API rate limiter
 * 15 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === "/health";
    },
    handler: (req, res) => {
        logger.warn("Rate limit exceeded", {
            ip: req.ip,
            path: req.path,
            method: req.method,
        });

        res.status(429).json(
            errorResponse("Too many requests, please try again later", 429)
        );
    },
});

/**
 * Strict rate limiter for checkout operations
 * 10 requests per 5 minutes per IP
 * Prevents reservation spam and checkout abuse
 */
export const checkoutLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn("Checkout rate limit exceeded", {
            ip: req.ip,
            userId: req.body?.userId,
        });

        res.status(429).json(
            errorResponse(
                "Too many checkout attempts, please try again later",
                429
            )
        );
    },
});

/**
 * Moderate rate limiter for reservation operations
 * 20 requests per 5 minutes per IP
 */
export const reservationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn("Reservation rate limit exceeded", {
            ip: req.ip,
            userId: req.body?.userId,
        });

        res.status(429).json(
            errorResponse(
                "Too many reservation attempts, please try again later",
                429
            )
        );
    },
});
