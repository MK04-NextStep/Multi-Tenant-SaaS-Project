const commentModel = require("../Model/commentModel");
const taskModel = require("../Model/TaskModel");
const { NewError } = require("../Middleware/errMiddleware");
const logger = require('../Utils/logger');
const { getIo } = require('../socket')

let addComment = async (req, res, next) => {
    let userId = req.userId;
    let project = req.project;
    let task = req.task;

    let { message } = req.body;

    if (!message || !message.trim()) {
        return next(new NewError("Comment message is required", 400));
    }

    let newComment = await commentModel.create({
        workspaceId: project.workspaceId,
        teamId: project.teamId,
        projectId: project._id,
        taskId: task._id,
        userId,
        role: req.projectRole,
        message
    });

    getIo()
        .to(task._id.toString()) // task room
        .emit("comment-added", {
            taskId: task._id.toString(),
            comment: newComment
        });

    res.json({
        success: true,
        data: newComment
    });
};

let editComment = async (req, res, next) => {
    let userId = req.userId;
    let comment = req.comment;
    let { message } = req.body;
    if (!message || !message.trim()) {
        return next(new NewError("Comment message is required", 400));
    }
    if (comment.userId.toString() !== userId.toString()) {
        return next(new NewError("Access denied", 403));
    }
    comment.message = message;
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();
    getIo()
        .to(comment.taskId.toString())
        .emit("comment-edited", {
            taskId: comment.taskId.toString(),
            commentId: comment._id.toString()
        });
    res.json({
        success: true,
        message: "Comment updated successfully",
        data: comment
    });
};

let deleteComment = async (req, res, next) => {
    let userId = req.userId;
    let projectRole = req.projectRole;

    let comment = req.comment;
    let isOwner = comment.userId.toString() === userId.toString();
    let isAdmin = projectRole === "ADMIN";
    if (!isOwner && !isAdmin) {
        return next(new NewError("Access denied", 403));
    }
    comment.isDeleted = true;
    await comment.save();
    getIo()
    .to(comment.taskId.toString())
    .emit("comment-deleted", {
        taskId: comment.taskId.toString(),
        commentId: comment._id.toString()
    });
    res.json({
        success: true,
        message: "Comment deleted successfully"
    });
};

let getComments = async (req, res, next) => {
    let role = req.projectRole;
    let task = req.task;
    let comments = await commentModel
        .find({
            taskId: task._id,
            isDeleted: false
        })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .lean();
    res.json({
        success: true,
        data: comments
    });
}

module.exports = {
    addComment,
    editComment,
    deleteComment, getComments
};