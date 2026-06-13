const express = require('express');
const asyncHandler = require('../Utils/asyncHandler');
const authMiddleware = require("../Middleware/authMiddleware")
const { projectId, taskId,commentId, adminProjectRole, 
    authProjectRole, allProjectRole,
    allTeamRole} = require('../Middleware/idMiddleware');
const { addComment, editComment, deleteComment, getComments } = require('../Controller/commentController');
const taskMiddleware = require('../Middleware/taskMiddleware')
const commentMiddleware = require('../Middleware/commentMiddleware')

const route = express.Router();

route.use(authMiddleware)

route.get("/:projectId/:taskId/get-comment", projectId,taskId,allProjectRole,
    taskMiddleware, asyncHandler(getComments))

route.post("/:projectId/:taskId/add-comments",projectId, taskId, 
    allProjectRole,taskMiddleware,asyncHandler(addComment));

route.patch("/:commentId/edit-comments",commentId,
    commentMiddleware,asyncHandler(editComment));

route.delete("/:projectId/:commentId/delete-comments",
    projectId,commentId, allProjectRole,
    commentMiddleware, asyncHandler(deleteComment));

module.exports = route;