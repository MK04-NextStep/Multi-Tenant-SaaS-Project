const userModel = require("../Model/userModel");
const notificationModel = require('../Model/NotificationModel');
const { NewError } = require('../Middleware/errMiddleware');
const logger = require('../Utils/logger')
const {getIo} = require('../socket')


let getNotificationService = async (id, workspace) => {
    let notificationList = await notificationModel.find({
        userId: id,
        workspaceId: workspace._id
    }).sort({ createdAt: -1 })
    if (notificationList.length === 0) {
        return [];
    }
    return notificationList;
}

let markAsReadService = async (id, notificationId) => {
    let updated = await notificationModel.updateOne(
        {
            _id: notificationId,
            userId: id
        },
        {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }
    )

    if (updated.matchedCount === 0) {
        throw new NewError("Notification not found", 404)
    }
    return;
}

let deleteNotificationService = async (id, notificationId) => {
    let existUser = await userModel.findById(id).select("-password");
    if (!existUser) {
        throw new NewError("No such user exist", 400);
    }
    let notification = await notificationModel.findById({
        _id: notificationId,
        userId: id
    })
    if (!notification) {
        throw new NewError("No such notification", 404);
    }
    let deleted = await notificationModel.deleteOne({
        _id: notificationId,
        userId: id
    })

    if (deleted.deletedCount === 0) {
        throw new NewError("Notification not found", 404)
    }
    return;
}

let createNotification = async ({
    userId, workspaceId, teamId,
    type, entityId, entityType, to,
    message, metadata = {}
}) => {
    let notification = await notificationModel.create({
        userId, workspaceId, teamId,
        type, entityId, to, entityType,
        message, metadata
    })
        console.log(to)
        console.log(notification)

    const io = getIo();


    if (to === "USER") {
        io.to(userId.toString()).emit(
            "notification-created",
            notification
        );

    }

    if (to === "WORKSPACE" && workspaceId) {
        io.to(workspaceId.toString()).emit(
            "notification-created",
            notification
        );

    }
    return notification;
}

module.exports = {
    getNotificationService, markAsReadService, deleteNotificationService
    , createNotification
}