/**
 * Simple logger utility for consistent logging across the application
 */

const LOG_LEVELS = {
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    DEBUG: "DEBUG",
};

const log = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data }),
    };

    if (level === LOG_LEVELS.ERROR) {
        console.error(JSON.stringify(logEntry));
    } else if (level === LOG_LEVELS.WARN) {
        console.warn(JSON.stringify(logEntry));
    } else {
        console.log(JSON.stringify(logEntry));
    }
};

export const logger = {
    error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
    warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
    info: (message, data) => log(LOG_LEVELS.INFO, message, data),
    debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
};
