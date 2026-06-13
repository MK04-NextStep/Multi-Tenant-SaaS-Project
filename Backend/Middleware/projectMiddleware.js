const projectModel = require('../Model/projectModel');
const teamModel = require("../Model/teamModel");
const workspaceModel = require('../Model/workspaceModel');
const { NewError } = require("./errMiddleware");

let projectMiddleware = (allowedRoles) => {
    return async (req, resizeBy, next) => {
        try {
            let id = req.userId;
            let { projectId } = req.params;

            if (!projectId) {
                return next(new NewError("Invalid project id", 400));
            }

            let project = await projectModel.findById(projectId);

            if (!project) {
                return next(new NewError("Project not found", 404));
            }

            let team = await teamModel
                .findById(project.teamId)
                .select("members")
                .lean();

            if (!team) {
                return next(new NewError("Team not found", 404));
            }

            let member = team.members.find(
                m => m.userId.toString() === id.toString()
            );

            if (!member) {
                return next(new NewError("Access denied", 403));
            }
            if(!allowedRoles.includes(member.role)){
                return next(new NewError("Access Denied", 403))
            }

            req.project = project;
            req.projectRole = member.role;

            return next();

        } catch (e) {
            return next(e);
        }
    }
}

module.exports = projectMiddleware;