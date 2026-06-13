let taskModel = require('../Model/TaskModel');
let { NewError } = require("./errMiddleware");

let taskMiddleware = async(req, res, next) => {
    try {
        let taskId = req.params.taskId;
        let project = req.project;

        let task = await taskModel.findById(taskId);
        if (!task) {
            return next(new NewError("no such task", 404))
        }
        if (task.projectId.toString() !== project._id.toString()) {
            return next(new NewError("No such task", 403))
        }
        req.task = task;
        next()
    }catch(e){
        next(e)
    }
}

module.exports = taskMiddleware;