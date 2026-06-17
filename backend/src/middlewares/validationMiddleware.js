/**
 * Request Validation Middleware
 * Validates request using Zod schemas
 */

import { errorResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema for validation
 * @returns {Function} Middleware function
 */
export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const toValidate = {
                body: req.body,
                params: req.params,
                query: req.query,
            };

            const result = schema.safeParse(toValidate);

            if (!result.success) {
                const errors = result.error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                }));

                logger.warn("Validation error", { errors });

                return res.status(400).json(
                    errorResponse("Validation failed", 400, errors)
                );
            }

            // Attach validated data to request
            req.validatedData = result.data;
            next();
        } catch (error) {
            logger.error("Validation middleware error", { error: error.message });
            res.status(500).json(errorResponse("Internal server error", 500));
        }
    };
};
