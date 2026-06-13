const express = require('express');
const { getProfile, getUser, searchUsers } = require('../Controller/userController');
const asyncHandler = require("../Utils/asyncHandler");
const authMiddleware = require("../Middleware/authMiddleware")
const {existId} = require('../Middleware/idMiddleware')
const { searchLimiter } = require('../Middleware/rateLimitMiddleware')

const route = express.Router();

route.use(authMiddleware)

route.get("/me",asyncHandler(getProfile));
route.get("/search",searchLimiter, asyncHandler(searchUsers));
route.get("/:id",existId, asyncHandler(getUser));

module.exports = route;