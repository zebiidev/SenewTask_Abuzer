/**
 * Reservation Routes
 * Endpoints for product reservations
 */

import express from "express";
import {
    createReservation,
    getReservation,
    cancelReservation,
} from "../controllers/ReservationController.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";
import {
    createReservationSchema,
    cancelReservationSchema,
} from "../validations/schemas.js";

const router = express.Router();

/**
 * POST /api/reservations
 * Create a reservation
 * Body: { userId, productId, quantity }
 */
router.post("/", validateRequest(createReservationSchema), createReservation);

/**
 * GET /api/reservations/:userId/:productId
 * Get active reservation
 */
router.get("/:userId/:productId", getReservation);

/**
 * DELETE /api/reservations/:userId/:productId
 * Cancel a reservation
 */
router.delete("/:userId/:productId", cancelReservation);

export default router;
