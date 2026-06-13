const express = require('express');
const authMiddleware = require('../Middleware/authMiddleware');
const { createTeam, listUserTeams, teamDetails,listTeamMembers, 
    inviteTeam, joinTeam, assignRole, updateTeam,
    deleteMember, deleteTeam,leaveTeam,} = require('../Controller/teamController');
const asyncHandler = require("../Utils/asyncHandler");
const { workspaceId, teamId, userId } = require('../Middleware/idMiddleware');
const { adminTeamRole, authTeamRole, allTeamRole, allRole} = require('../Middleware/idMiddleware')
const { workspaceCreateLimiter, inviteLimiter, workspaceAdminLimiter } = require('../Middleware/rateLimitMiddleware')

const route = express.Router();

route.use(authMiddleware)

route.post("/",workspaceCreateLimiter, createTeam);

route.get("/team-list/:workspaceId", workspaceId,allRole, asyncHandler(listUserTeams));
route.get("/:teamId/team-details",teamId,allTeamRole,asyncHandler(teamDetails));
route.get("/:teamId/team-members",teamId, allTeamRole, asyncHandler(listTeamMembers))

route.post("/invite/:teamId",teamId, authTeamRole,inviteLimiter, asyncHandler(inviteTeam));
route.post("/accept-invite",inviteLimiter, joinTeam);

route.patch("/users/:teamId/:userId/role",teamId,userId ,
    workspaceAdminLimiter,adminTeamRole, assignRole);

route.patch("/:teamId/team-update",teamId,workspaceAdminLimiter,
     adminTeamRole,asyncHandler(updateTeam))

route.delete("/:teamId/leave/me",teamId, allTeamRole, leaveTeam);
route.delete("/:teamId/leave/:userId",teamId, userId,
    workspaceAdminLimiter,authTeamRole, deleteMember);
route.delete("/:teamId/delete",teamId,workspaceAdminLimiter, adminTeamRole, deleteTeam)

module.exports = route;