const idValidator = require("../Validation/idValidation");
const workspaceMiddleware = require('../Middleware/workspaceMiddleware');
const teamMiddleware = require("../Middleware/teamMiddleware");
const projectMiddleware = require('../Middleware/projectMiddleware')

let workspaceId = idValidator("workspaceId")
let teamId = idValidator("teamId");
let userId = idValidator("userId");
let existId = idValidator("id");
let projectId = idValidator("projectId");
let taskId = idValidator("taskId")
let commentId = idValidator("commentId");
let notificationId = idValidator("notificationId");

let adminRole = workspaceMiddleware(["ADMIN"]);
let authRole = workspaceMiddleware(["ADMIN", "LEADER"]);
let allRole = workspaceMiddleware(["ADMIN", "LEADER", "MEMBER"]);

let adminTeamRole = teamMiddleware(['ADMIN']);
let authTeamRole = teamMiddleware(['ADMIN','LEADER']);
let allTeamRole = teamMiddleware(['ADMIN','LEADER','MEMBER']);

let adminProjectRole = projectMiddleware(['ADMIN']);
let authProjectRole = projectMiddleware(["ADMIN","LEADER"])
let allProjectRole = projectMiddleware(["ADMIN","LEADER","MEMBER"])

module.exports = {
    workspaceId, teamId, userId, existId,projectId, 
    taskId,commentId,notificationId,
    adminRole, authRole, allRole,
    adminTeamRole, authTeamRole, allTeamRole,
    adminProjectRole, authProjectRole, allProjectRole
}