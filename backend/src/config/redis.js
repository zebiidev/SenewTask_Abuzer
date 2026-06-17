/**
 * Redis connection configuration
 * Used for reservation management with atomic operations
 */

import { createClient } from "redis";
import { logger } from "../utils/logger.js";

let redisClient = null;
let isConnected = false;

/**
 * Initialize and connect to Redis
 * Implements connection pooling and error handling
 */
export const connectRedis = async () => {
    if (isConnected && redisClient) {
        logger.info("Redis already connected");
        return redisClient;
    }

    try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

        redisClient = createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger.error("Redis max reconnect attempts reached");
                        return new Error("Redis max reconnect attempts reached");
                    }
                    return retries * 50;
                },
            },
        });

        // Handle connection events
        redisClient.on("error", (error) => {
            logger.error("Redis connection error", { error: error.message });
        });

        redisClient.on("connect", () => {
            logger.info("Redis connected successfully");
        });

        redisClient.on("ready", () => {
            logger.info("Redis ready for commands");
        });

        redisClient.on("reconnecting", () => {
            logger.warn("Redis reconnecting");
        });

        await redisClient.connect();
        isConnected = true;

        return redisClient;
    } catch (error) {
        logger.error("Failed to connect to Redis", { error: error.message });
        process.exit(1);
    }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
    if (!redisClient) {
        throw new Error("Redis client not initialized. Call connectRedis first.");
    }
    return redisClient;
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async () => {
    if (!isConnected || !redisClient) {
        return;
    }

    try {
        await redisClient.disconnect();
        isConnected = false;
        redisClient = null;
        logger.info("Redis disconnected successfully");
    } catch (error) {
        logger.error("Redis disconnection error", { error: error.message });
    }
};

/**
 * Get Redis connection status
 */
export const getRedisStatus = () => {
    return {
        connected: isConnected,
        isReady: redisClient?.isReady || false,
    };
};
