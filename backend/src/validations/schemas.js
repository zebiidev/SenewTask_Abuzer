/**
 * Zod validation schemas for request validation
 */

import { z } from "zod";

// ==================== Product Validation ====================

export const createProductSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(3, "Product name must be at least 3 characters")
            .max(255, "Product name must not exceed 255 characters"),
        stock: z
            .number()
            .int("Stock must be an integer")
            .min(0, "Stock cannot be negative"),
        price: z
            .number()
            .min(0, "Price cannot be negative"),
        description: z
            .string()
            .max(1000, "Description must not exceed 1000 characters")
            .optional(),
    }),
});

export const getProductSchema = z.object({
    params: z.object({
        productId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
    }),
});

// ==================== Reservation Validation ====================

export const createReservationSchema = z.object({
    body: z.object({
        userId: z
            .string()
            .min(1, "User ID is required"),
        items: z.array(z.object({
            productId: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
            quantity: z
                .number()
                .int("Quantity must be an integer")
                .min(1, "Quantity must be at least 1"),
        })).min(1, "At least one item is required"),
    }),
});

export const cancelReservationSchema = z.object({
    params: z.object({
        userId: z.string().min(1, "User ID is required"),
        productId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
    }),
});

// ==================== Checkout Validation ====================

export const checkoutSchema = z.object({
    body: z.object({
        userId: z
            .string()
            .min(1, "User ID is required"),
        items: z.array(z.object({
            productId: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
            quantity: z
                .number()
                .int("Quantity must be an integer")
                .min(1, "Quantity must be at least 1"),
        })).min(1, "At least one item is required"),
    }),
});

// ==================== Product Status Validation ====================

export const getProductStatusSchema = z.object({
    params: z.object({
        productId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format"),
    }),
});
