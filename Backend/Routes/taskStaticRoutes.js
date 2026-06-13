const express = require('express');
const asyncHandler = require('../Utils/asyncHandler');
const authMiddleware = require("../Middleware/authMiddleware")
const { projectId, authProjectRole, allProjectRole} = require('../Middleware/idMiddleware')
const getProjectTaskStatus  = require('../Controller/taskStaticController')

const route = express.Router();

route.use(authMiddleware);

route.get(
    "/:projectId/dashboard-stats",
    projectId,
    allProjectRole,
    asyncHandler(getProjectTaskStatus)
);

module.exports = route;