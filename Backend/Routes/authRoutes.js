const express = require('express');
const operation = require('../Controller/authController');
const verifyAccessToken = require('../Middleware/authMiddleware');
const { authValidator, emailValidator, passwordValidator } = require('../Validation/authValidation');
const asyncHandler = require('../Utils/asyncHandler');
const upload = require('../Middleware/multer');
const authMiddleware = require("../Middleware/authMiddleware");
const { authLimiter, sensitiveLimiter } = require('../Middleware/rateLimitMiddleware')

const route = express.Router();

route.post("/register",authLimiter,upload.single("avatar"),
    authValidator, asyncHandler(operation.register));
route.post("/login",authLimiter,authValidator, asyncHandler(operation.login));
route.post("/logout",verifyAccessToken, asyncHandler(operation.logout));

route.post("/refresh-token", asyncHandler(operation.verifyRefreshToken));
route.post(
    "/verify-email",
    emailValidator,
    asyncHandler(operation.verifyEmail)
);

route.post(
    "/verify-otp",
    asyncHandler(operation.verifyUser)
);
route.post(
    "/forgot-password",
    asyncHandler(operation.forgotPassword)
);

route.post(
    "/reset-password",
    asyncHandler(operation.resetPassword)
);

module.exports = route;