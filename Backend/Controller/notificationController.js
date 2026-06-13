const { NewError } = require('../Middleware/errMiddleware');
const { getNotificationService, markAsReadService
    , deleteNotificationService } = require("../Services/notificationService")
const notificationModel = require('../Model/NotificationModel')
const logger = require('../Utils/logger')


let getNotification = async (req, res, next) => {
    let id = req.userId;
    let workspace = req.workspace;
    let notificationList = await getNotificationService(id, workspace);
    res.json({
        success: true,
        data: notificationList
    })
}

let getNotificationUser = async (req, res, next) => {
    let id = req.userId;
    let notificationList = await notificationModel.find(
        {
            userId: id,
            to: "USER"
        }
    )
    if (notificationList.length === 0) {
        return res.json({
            success: true,
            data: []
        })
    }
    res.json({
        success: true,
        data: notificationList
    })
}

let getUnreadUserNotification = async (req, res, next) => {
    let id = req.userId;
    let notificationList = await notificationModel.find(
        {
            userId: id,
            entityType: "USER",
            isRead: false
        }
    )
    if (notificationList.length === 0) {
        return res.json({
            success: true,
            data: []
        })
    }
    res.json({
        success: true,
        data: notificationList
    })
}

let getUnread = async(req,res,next) => {
     let id = req.userId;
    let workspace = req.workspace;
    let list = await notificationModel.find({
        userId: id,
        workspaceId: workspace._id,
        isRead: false
    })
    res.json({
        success: true,
        data: list
    })
}

let readAllUser = async (req, res, next) => {
    let id = req.userId;
    let notificationList = await notificationModel.updateMany(
        {
            userId: id,
            entityType: "USER",
            isRead: false
        },
        {
            $set: {
                isRead: true
            }
        }
    )
    res.json({
        success: true,
        data: notificationList
    })
}

let markAsRead = async (req, res, next) => {
    let id = req.userId;
    let notificationId = req.params.notificationId;
    if (!notificationId) {
        return next(new NewError("Invalid Id", 400))
    }
    await markAsReadService(id, notificationId);
    res.json({
        success: true,
        message: "Readed"
    })
}

let deleteNotification = async (req, res, next) => {
    let id = req.userId;
    let notificationId = req.params.notificationId;
    if (!notificationId) {
        return next(new NewError("Invalid Id", 400));
    }
    await deleteNotificationService(id, notificationId);
    res.json({
        success: true,
        message: "Notification got deleted"
    })
}

let readAll = async (req, res, next) => {
    let id = req.userId;
    let workspace = req.workspace;
    await notificationModel.updateMany(
        {
            userId: id,
            workspaceId: workspace._id,
            isRead: false
        },
        {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }
    )
    res.json({
        success: true,
        message: "Mark all read done"
    })
}

let countUnread = async (req, res, next) => {
    let id = req.userId;
    let workspace = req.workspace;
    let list = await notificationModel.countDocuments({
        userId: id,
        workspaceId: workspace._id,
        isRead: false
    })
    res.json({
        success: true,
        data: list
    })
}

module.exports = {
    getNotification, markAsRead, deleteNotification,
    countUnread, readAll, getNotificationUser, getUnreadUserNotification,
    readAllUser, getUnread
}