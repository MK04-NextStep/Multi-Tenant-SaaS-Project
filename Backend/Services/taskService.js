const taskModel = require("../Model/TaskModel");
const userModel = require("../Model/userModel");
const { NewError } = require("../Middleware/errMiddleware");
const logger = require('../Utils/logger')
const { getIo } = require('../socket')

let createTaskService = async (data) => {
    let { id, title, description, assignedTo, status,
        priority, dependencies = [], dueDate, project } = data;
    let newData = {
        title, description, workspaceId: project.workspaceId,
        teamId: project.teamId, projectId: project._id, assignedTo,
        createdBy: id, status, priority, dependencies, dueDate
    }
    let newTask = await taskModel.create(newData);
    if (!newTask) {
        throw new NewError("Task is not created", 500);
    }
    return newTask;
}

let listTaskService = async (project) => {
    let taskList = await taskModel.find(
        {
            workspaceId: project.workspaceId,
            teamId: project.teamId,
            projectId: project._id
        }
    )
    if (taskList.length === 0) {
        return []
    }
    return taskList;
}

let updateTaskService = async (id, task, data) => {

    let allowedFields = [
        "title",
        "description",
        "priority",
        "dependencies",
        "dueDate"
    ];

    const filterData = (data, allowedFields) => {
        return Object.fromEntries(
            Object.entries(data).filter(([key]) =>
                allowedFields.includes(key)
            )
        );
    };

    const filteredData =
        filterData(data, allowedFields);

    let updateTask = await taskModel.updateOne(
        {
            _id: task._id
        },
        {
            $set: filteredData
        }
    );
    return;
}

let updateStatusService = async (id, task, status) => {
    if (task.assignedTo.toString() !== id.toString()) {
        throw new NewError("Access Denied", 400)
    }
    let updatedTask = await taskModel.updateOne(
        { _id: task._id }, { $set: { status } })
    getIo()
        .to(task._id.toString())
        .emit("task-status-updated", {
            taskId: task._id.toString(),
            projectId: task.projectId.toString(),
            status
        });
    return;
}

let deleteTaskService = async (userId, task) => {

    // STEP 1: Block if task is required by others
    const hasDependents = await taskModel.exists({
        dependencies: task._id
    });

    if (hasDependents) {
        return "Cannot delete task. Other tasks depend on it.";
    }

    // STEP 2: Delete task
    await taskModel.findByIdAndDelete(task._id);

    // STEP 3: Cleanup (safe but optional redundancy)
    await taskModel.updateMany(
        {},
        {
            $pull: {
                dependencies: task._id
            }
        }
    );

    return "Task deleted successfully";
};

module.exports = {
    createTaskService, listTaskService,
    updateTaskService, deleteTaskService, updateStatusService
}