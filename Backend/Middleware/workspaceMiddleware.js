let { NewError } = require('./errMiddleware');
let workspaceModel = require('../Model/workspaceModel')
const logger = require('../Utils/logger')

let workspaceMiddleware = (allowedRole) => {
    return async (req, res, next) => {
        try {
            let id = req.userId;
            let workspaceId = req.params.workspaceId;
            if (!workspaceId) {
                return next(new NewError("Invalid Id", 400));
            }
            let workspace = await workspaceModel.findById(workspaceId);
            if (!workspace) {
                return next(new NewError("Such workspace does not exist", 404))
            }
            let isMember = workspace.members.find(
                w => w.userId.toString() === id.toString()
            )
            if (!isMember) {
                return next(new NewError("User is not part of workspace", 403))
            }
            if (!allowedRole.includes(isMember.role)) {
                logger.warn("Unauthorized workspace access attempt", {
                    userId: req.userId,
                    workspaceId
                });
                return next(new NewError("Access Denied", 403))
            }
            req.workspace = workspace;
            req.workspaceRole = isMember.role;
            next();
        } catch (e) {
            console.log(e)
            return next(new NewError("Access Denied", 400))
        }
    }
}

module.exports = workspaceMiddleware;