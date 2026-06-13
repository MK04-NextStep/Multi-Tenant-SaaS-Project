const express = require('express');
const asyncHandler = require("../Utils/asyncHandler");
const authMiddleware = require('../Middleware/authMiddleware')
const { createProject, getProject, userstatus, 
    mentorApproved, getProjectList, deleteProject, 
    updateProject,
    getProjectByStatus} = require('../Controller/projectController');
const projectMiddleware = require('../Middleware/projectMiddleware');
const teamMiddleware = require('../Middleware/teamMiddleware');
const status = require("../Validation/projectRoleValidator");
const { projectId, teamId, allTeamRole, adminTeamRole, allProjectRole, 
    adminProjectRole, authProjectRole } = require("../Middleware/idMiddleware");
const { workspaceCreateLimiter, workspaceAdminLimiter } = require("../Middleware/rateLimitMiddleware")

const route = express.Router();

route.use(authMiddleware)

route.post("/:teamId/new",teamId, adminTeamRole, workspaceCreateLimiter,
    asyncHandler(createProject));
route.get("/:projectId/project-details",projectId,
    allProjectRole, asyncHandler(getProject));
route.get("/:teamId/project-list",teamId,
    allTeamRole,asyncHandler(getProjectList))
route.get("/:teamId/getbyStatus", teamId, 
    allTeamRole, asyncHandler(getProjectByStatus))

route.patch("/:projectId/user/status",projectId, adminProjectRole ,
    status,workspaceAdminLimiter, asyncHandler(userstatus));
route.patch("/:projectId/mentor/status",projectId,authProjectRole,
    status,workspaceAdminLimiter,asyncHandler(mentorApproved));
route.patch("/:projectId/update-project-details",projectId,
    adminProjectRole, workspaceAdminLimiter,asyncHandler(updateProject))

route.delete("/:projectId/delete",projectId, adminProjectRole,workspaceAdminLimiter, asyncHandler(deleteProject))

module.exports = route;