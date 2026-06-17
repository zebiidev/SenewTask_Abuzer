/**
 * Reservation Controller
 * Handles reservation-related HTTP requests
 * All business logic is delegated to ReservationService
 */

import ReservationService from "../services/ReservationService.js";
import StockService from "../services/StockService.js";
import { successResponse } from "../utils/response.js";
import { CONSTANTS } from "../utils/constants.js";

/**
 * POST /reservations
 * Create a reservation for multiple products
 */
export const createReservation = async (req, res, next) => {
    try {
        const { userId, items } = req.body;

        // Check if stock is available for all items
        for (const item of items) {
            const hasStock = await StockService.hasAvailableStock(item.productId, item.quantity);
            if (!hasStock) {
                const error = new Error(`Insufficient stock available for product ${item.productId}`);
                error.statusCode = 409;
                throw error;
            }
        }

        const reservations = await ReservationService.reserveProducts(
            userId,
            items
        );

        res.status(201).json(
            successResponse(reservations, CONSTANTS.MESSAGES.RESERVATION_CREATED, 201)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /reservations/:userId/:productId
 * Get active reservation for a user-product combination
 */
export const getReservation = async (req, res, next) => {
    try {
        const { userId, productId } = req.params;
        const reservation = await ReservationService.getReservation(userId, productId);

        if (!reservation) {
            const error = new Error(CONSTANTS.MESSAGES.RESERVATION_NOT_FOUND);
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(
            successResponse(reservation, "Reservation fetched successfully")
        );
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /reservations/:userId/:productId
 * Cancel a reservation
 */
export const cancelReservation = async (req, res, next) => {
    try {
        const { userId, productId } = req.params;
        await ReservationService.cancelReservation(userId, productId);

        res.status(200).json(
            successResponse({ cancelled: true }, CONSTANTS.MESSAGES.RESERVATION_CANCELLED)
        );
    } catch (error) {
        next(error);
    }
};
