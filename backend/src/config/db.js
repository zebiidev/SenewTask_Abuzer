/**
 * MongoDB connection configuration
 * Uses Mongoose ODM for data persistence
 */

import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

let isConnected = false;

/**
 * Connect to MongoDB
 * Implements connection pooling and error handling
 */
export const connectDB = async () => {
    if (isConnected) {
        logger.info("MongoDB already connected");
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/flash-sale";

        await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error("MongoDB connection error", { error: error.message });
        process.exit(1);
    }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async () => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        logger.info("MongoDB disconnected successfully");
    } catch (error) {
        logger.error("MongoDB disconnection error", { error: error.message });
    }
};

/**
 * Get MongoDB connection status
 */
export const getDBStatus = () => {
    return {
        connected: isConnected,
        state: mongoose.connection.readyState,
    };
};
