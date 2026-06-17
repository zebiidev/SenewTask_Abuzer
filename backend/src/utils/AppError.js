/**
 * Custom AppError class for consistent error handling
 * Extends Error with status code and message
 */
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        // Capture stack trace, excluding the constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Helper function to create validation errors
 */
export const createValidationError = (message) => {
    return new AppError(message, 400);
};

/**
 * Helper function to create not found errors
 */
export const createNotFoundError = (resource) => {
    return new AppError(`${resource} not found`, 404);
};

/**
 * Helper function to create conflict errors
 */
export const createConflictError = (message) => {
    return new AppError(message, 409);
};
