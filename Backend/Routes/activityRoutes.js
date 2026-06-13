const express = require('express');
const authMiddleware = require('../Middleware/authMiddleware');
const {workspaceId,teamId,taskId,
   adminRole, authTeamRole,allProjectRole } = require('../Middleware/idMiddleware');
const taskMiddleware = require('../Middleware/taskMiddleware')
const {getWorkspaceActivity, getTeamActivity,
    getProjectActivity, getTaskActivity} = require('../Controller/activityController')

const route = express.Router();

route.get("/workspace/:workspaceId",workspaceId, adminRole,
   asyncHandler(getWorkspaceActivity));

route.get("/team/:teamId", teamId, authTeamRole, asyncHandler(getTeamActivity))

route.get("/project/:projectId",projectId, allProjectRole,
   asyncHandler(getProjectActivity));

route.get("/task/:taskId",taskId, taskMiddleware,
   asyncHandler(getTaskActivity));

module.exports = route;
//