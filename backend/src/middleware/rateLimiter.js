const rateLimit = require('express-rate-limit');

/**
 * @desc    General API rate limiter
 * @limit   200 requests per 15 minutes window
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per window
    message: {
        success: false,
        error: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @desc    Rate limiter for authentication routes
 * @limit   15 requests per 15 minutes window
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window during development
    message: {
        success: false,
        error: "Too many authentication attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter
};
