const activityModel = require('../Model/ActivityModel');
const logger = require('../Utils/logger')


let getWorkspaceActivity = async (req, res, next) => {
    let workspace = req.workspace;
    let list = await activityModel.find({
        workspaceId: workspace._id
    }).populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(50);

    res.json({
        success: true,
        activity
    });
}

let getTeamActivity = async (req, res, next) => {
    let workspace = req.workspace;
    let list = await activityModel.find({
        workspaceId: workspace._id
    }).populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(50);

    res.json({
        success: true,
        activity
    });
}

let getProjectActivity = async (req, res, next) => {
    let workspace = req.workspace;
    let list = await activityModel.find({
        workspaceId: workspace._id
    }).populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(50);

    res.json({
        success: true,
        activity
    });
}

let getTaskActivity = async (req, res, next) => {
    let workspace = req.workspace;
    let list = await activityModel.find({
        workspaceId: workspace._id
    }).populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(50);

    res.json({
        success: true,
        activity
    });
}

let createActivity = async(workspaceId, teamId, projectId, taskId, commentId,
    userId, action, metaData
) => {
    await activityModel.create({
        workspaceId, teamId, projectId, taskId, commentId, userId, action, metaData
    })
}

module.exports = {
    getWorkspaceActivity, getTeamActivity,
    getProjectActivity, getTaskActivity, createActivity
}
