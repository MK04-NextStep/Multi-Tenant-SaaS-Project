let { NewError } = require("./errMiddleware");
let teamModel = require("../Model/teamModel");
let workspaceModel = require("../Model/workspaceModel")
const logger = require('../Utils/logger')

let teamMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            let id = req.userId;
            let teamId = req.params.teamId;
            if (!teamId) {
                return next(new NewError("Invalid Id", 400))
            }
            let team = await teamModel.findById(teamId);
            if (!team) {
                return next(new NewError("Invalid Team", 404))
            }
            if (req.workspace) {
                let workspace = req.workspace;
                if (team.workspaceId.toString() !== workspace._id.toString()) {
                    return next(new NewError("Team is not part of workspace", 403))
                }
            }
            let isMember = team.members.find(t => t.userId.toString() === id.toString())
            if (!isMember) {
                return next(new NewError("User is not part of team", 403))
            }
            let workspace = await workspaceModel.findById(team.workspaceId)
                .select("members").lean();
            if (!workspace) {
                return next(new NewError("Workspace not found", 404))
            }
            let isWorkspaceMember = workspace.members.find(
                w => w.userId.toString() === id.toString()
            )
            if (!isWorkspaceMember) {
                return next(new NewError("User is not part of workspace", 403))
            }
            if (allowedRoles.length && !allowedRoles.includes(isMember.role)) {
                logger.warn("Unauthorized workspace access attempt", {
                    userId: req.userId,
                    teamId
                });
                return next(new NewError("Acess Denied", 403))
            }
            req.team = team;
            req.teamRole = isMember.role;
            return next();
        } catch (e) {
            next(new NewError("Invalid team", 400));
        }
    }
}

module.exports = teamMiddleware;