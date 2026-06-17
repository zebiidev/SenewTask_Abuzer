/**
 * Consistent API response formatter
 */

export const successResponse = (data, message = "Success", statusCode = 200) => {
    return {
        success: true,
        statusCode,
        message,
        data,
    };
};

export const errorResponse = (message, statusCode = 500, errors = null) => {
    return {
        success: false,
        statusCode,
        message,
        ...(errors && { errors }),
    };
};
