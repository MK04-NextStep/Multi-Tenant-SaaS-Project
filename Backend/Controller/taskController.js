const taskModel = require("../Model/TaskModel");
const userModel = require("../Model/userModel");
const { NewError } = require("../Middleware/errMiddleware");
const { createTaskService, listTaskService,
    updateTaskService, deleteTaskService, updateStatusService } = require("../Services/taskService");
const validateResult = require('../Utils/ValidateResult')
const logger = require('../Utils/logger');
const { getIo } = require("../socket");

let createTask = async (req, res, next) => {
    validateResult(req)
    let id = req.userId;
    let project = req.project;
    let { title, description = "Add Description",
        assignedTo, status = 'TODO',
        priority, dependencies = [], dueDate
    } = req.body;
    let data = {
        id, title, description, assignedTo, status,
        priority, dependencies, dueDate, project
    };
    let newTask = await createTaskService(data);
    res.json({
        success: true,
        data: newTask
    })
}

let getOneTask = async (req, res, next) => {
    validateResult(req)
    let id = req.userId;
    let task = req.task;
    let projectRole = req.projectRole;
    await task.populate([
        { path: "assignedTo", select: "name" },
        { path: "dependencies", select: "title status" }
    ]); res.json({
        success: true,
        data: task,
        role: projectRole
    })
}

let listTask = async (req, res, next) => {
    validateResult(req)
    let project = req.project;
    let taskList = await listTaskService(project);
    res.json({
        success: true,
        data: taskList
    })
}

let filterTasks = async (req, res, next) => {
    validateResult(req);
    let project = req.project;
    let userId = req.userId;
    let { status, priority, assignedTo } = req.query;
    let filter = {
        projectId: project._id
    };
    if (assignedTo === "me") {
        filter.assignedTo = userId;
    }
    else if (assignedTo) {
        filter.assignedTo = assignedTo;
    }
    if (status) {
        filter.status = status;
    }
    if (priority) {
        filter.priority = priority;
    }
    let list = await taskModel.find(filter);
    return res.json({
        success: true,
        data: list
    });
};

let updateTask = async (req, res, next) => {
    validateResult(req)
    let id = req.userId;
    let task = req.task;
    let data = req.body;
    await updateTaskService(id, task, data);
    res.json({
        success: true,
        message: "Task Updated"
    })
}

let updateStatus = async (req, res, next) => {
    validateResult(req)
    let id = req.userId;
    let task = req.task;
    let { status } = req.body;
    if (!status) {
        return next(new NewError("invalid data", 400))
    }
    await updateStatusService(id, task, status);
    return res.json({
        success: true,
        message: "Task updated Successfully"
    })
}

let updateAssignedTask = async (req, res, next) => {
    validateResult(req)
    let id = req.userId;
    let task = req.task;
    let { assignedTo } = req.body;
    if (!assignedTo) {
        return next(new NewError("no body data", 400))
    }
    if (id.toString() !== task.createdBy.toString()) {
        return next(new NewError("Access Denied", 403))
    }
    let updated = await taskModel.updateOne(
        { _id: task._id },
        { $set: { assignedTo } }
    )
    if (!updated.acknowledged) {
        return next(new NewError("cant update", 500))
    }
    getIo().to(task._id.toString()).emit(
        "task-assigned",
        {
            taskId: task._id.toString(),
            assignedTo
        }
    );
    res.json({
        success: true,
        message: "update assignedTo successfully"
    })
}

let deleteTask = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let task = req.task;
    let message = await deleteTaskService(id, task);
    res.json({
        success: true,
        message
    });
};

module.exports = {
    createTask, getOneTask, listTask,
    updateTask, deleteTask, updateStatus,
    updateAssignedTask, filterTasks
}