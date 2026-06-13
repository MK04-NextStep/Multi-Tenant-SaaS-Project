const express = require('express');
const authMiddleware = require('../Middleware/authMiddleware');
const { createWorkspace, getWorkspace, inviteLink, acceptUser,
    assignRole, getMembers, getMemberList, deleteWorkspace,
    updateWorkspace, leaveWorkspace, deleteMember } = require('../Controller/workspaceController');
const asyncHandler = require('../Utils/asyncHandler');
const { workspaceId, userId, adminRole, authRole, allRole } = require('../Middleware/idMiddleware');
const { workspaceCreateLimiter, inviteLimiter, 
    workspaceAdminLimiter} = require('../Middleware/rateLimitMiddleware')

const route = express.Router();
route.use(authMiddleware)

route.get("/me", asyncHandler(getWorkspace));
route.get("/:workspaceId",workspaceId, allRole,asyncHandler(getMembers));
route.get("/:workspaceId/members",workspaceId, allRole,asyncHandler(getMemberList))

route.post("/",workspaceCreateLimiter, createWorkspace);
route.post("/invite/:workspaceId",workspaceId, 
    authRole,inviteLimiter, asyncHandler(inviteLink));
route.post("/accept-invite",inviteLimiter, acceptUser);

route.patch("/users/:workspaceId/:userId/role", workspaceId, 
    userId,workspaceAdminLimiter,authRole, assignRole);
route.patch("/:workspaceId/update-workspace", workspaceId,
    workspaceAdminLimiter,authRole, asyncHandler(updateWorkspace))

route.delete("/:workspaceId/leave/me",workspaceId,allRole, leaveWorkspace)
route.delete("/:workspaceId/leave/:userId",workspaceId, userId,
    workspaceAdminLimiter, authRole, deleteMember)
route.delete("/:workspaceId/delete", workspaceId,
    workspaceAdminLimiter, adminRole, deleteWorkspace);

module.exports = route;