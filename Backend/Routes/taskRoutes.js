const express = require('express');
const asyncHandler = require('../Utils/asyncHandler');
const authMiddleware = require("../Middleware/authMiddleware")
const { createTask, listTask, updateTask, deleteTask, updateStatus, getOneTask,filterTasks,updateAssignedTask } = require("../Controller/taskController")
const { projectId, taskId, adminProjectRole, 
    authProjectRole, allProjectRole} = require('../Middleware/idMiddleware')
const taskMiddleware = require('../Middleware/taskMiddleware')

const route = express.Router();

route.use(authMiddleware)
route.use("/:projectId", projectId);

route.post("/:projectId/new-task",
    allProjectRole, asyncHandler(createTask));
route.get("/:projectId/task-list",
    allProjectRole, asyncHandler(listTask));
    
route.get("/:projectId/:taskId/get",taskId, allProjectRole,taskMiddleware,
    asyncHandler(getOneTask))
route.get("/:projectId/tasks", asyncHandler(filterTasks));

route.patch("/:projectId/:taskId/update-task",
    adminProjectRole,taskId,taskMiddleware, asyncHandler(updateTask));

route.patch("/:projectId/:taskId/update-status",
    allProjectRole,taskId,taskMiddleware,asyncHandler(updateStatus))
route.patch("/:projectId/:taskId/update-assignedto",
    allProjectRole,taskId,taskMiddleware,asyncHandler(updateAssignedTask))

route.delete("/:projectId/:taskId/delete-task",
    adminProjectRole,taskId,taskMiddleware,asyncHandler(deleteTask));

module.exports = route;