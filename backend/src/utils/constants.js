/**
 * Application constants
 */

export const CONSTANTS = {
    // Reservation TTL in seconds (10 minutes)
    RESERVATION_TTL: 600,

    // Redis key patterns
    REDIS_KEYS: {
        RESERVATION: (userId, productId) => `reservation:{${userId}}:${productId}`,
        PRODUCT_LOCK: (productId) => `product_lock:{${productId}}`,
    },

    // API messages
    MESSAGES: {
        PRODUCT_CREATED: "Product created successfully",
        PRODUCT_FETCHED: "Product fetched successfully",
        PRODUCTS_FETCHED: "Products fetched successfully",
        PRODUCT_NOT_FOUND: "Product not found",
        INSUFFICIENT_STOCK: "Insufficient stock available",
        RESERVATION_CREATED: "Reservation created successfully",
        RESERVATION_CANCELLED: "Reservation cancelled successfully",
        RESERVATION_NOT_FOUND: "Reservation not found",
        CHECKOUT_SUCCESS: "Order created successfully",
        INVALID_QUANTITY: "Quantity must be a positive number",
        INVALID_PRODUCT_ID: "Invalid product ID",
        INVALID_USER_ID: "Invalid user ID",
    },
};
