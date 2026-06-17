/**
 * Server Entry Point
 * Initializes database and Redis connections, starts Express server
 */

import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { logger } from "./utils/logger.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

let server;

/**
 * Start the server
 * Connects to MongoDB and Redis, then starts Express server
 */
const startServer = async () => {
    try {
        logger.info("Starting server", { environment: NODE_ENV, port: PORT });

        // Connect to MongoDB
        await connectDB();

        // Connect to Redis
        await connectRedis();

        // Start Express server
        server = app.listen(PORT, () => {
            logger.info("Server running successfully", {
                port: PORT,
                environment: NODE_ENV,
                url: `http://localhost:${PORT}`,
            });
        });

        // Handle graceful shutdown
        process.on("SIGTERM", () => gracefulShutdown());
        process.on("SIGINT", () => gracefulShutdown());
    } catch (error) {
        logger.error("Failed to start server", { error: error.message });
        process.exit(1);
    }
};

/**
 * Graceful shutdown
 * Closes database and Redis connections properly
 */
const gracefulShutdown = async () => {
    logger.info("Received shutdown signal, closing connections gracefully");

    if (server) {
        server.close(async () => {
            logger.info("HTTP server closed");

            // Close database connections
            await disconnectDB();
            await disconnectRedis();

            logger.info("Graceful shutdown complete");
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger.error("Forced shutdown after timeout");
            process.exit(1);
        }, 10000);
    }
};

// Start the server
startServer();

export default app;
