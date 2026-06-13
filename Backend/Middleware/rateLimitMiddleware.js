const rateLimit = require('express-rate-limit')
const logger = require('../Utils/logger')

let message = { 
    success: false,
    message: "Too many requests"
}
let logging = logger.warn("Rate limit exceeded");

const globalLimiter = rateLimit({ //gloabal rate limiting
    windowMs: 15 * 60 * 1000,
    max: 300,
    message,
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({ //strict rate limiting for register and login
    windowMs: 15 * 60 * 1000,
    max: 10,
    message,
    skipSuccessfulRequests: true,
});

// special rate limiters for heavy routes
const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message
});

const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message
});

const workspaceCreateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message
});

const inviteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message
});

const workspaceAdminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message
});

module.exports = {
    globalLimiter, authLimiter, sensitiveLimiter,
    searchLimiter, workspaceCreateLimiter, inviteLimiter,
    workspaceAdminLimiter
}