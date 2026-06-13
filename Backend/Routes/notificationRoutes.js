const express = require('express');
const { getNotification, markAsRead, deleteNotification, 
    readAll, countUnread, getNotificationUser,
     getUnreadUserNotification, readAllUser, 
     getUnread} = require('../Controller/notificationController');
const asyncHandler = require("../Utils/asyncHandler");
const authMiddleware = require("../Middleware/authMiddleware");
const {allRole, workspaceId,notificationId} = require('../Middleware/idMiddleware')

const route = express.Router();

route.use(authMiddleware);

route.get("/user/getUser-notification", asyncHandler(getNotificationUser))
route.post("/user/get-unread-user", asyncHandler(getUnreadUserNotification))
route.post("/user/read-all-user", asyncHandler(readAllUser))

route.get("/:workspaceId/",workspaceId, allRole,  asyncHandler(getNotification));

route.patch("/:notificationId/read", notificationId, asyncHandler(markAsRead));

route.delete("/:notificationId/delete",notificationId, asyncHandler(deleteNotification));

route.post("/:workspaceId/read-all",workspaceId,allRole,asyncHandler(readAll))

route.post("/:workspaceId/cound- unread",workspaceId,allRole, asyncHandler(countUnread))

route.post("/:workspaceId/unread", workspaceId, allRole, asyncHandler(getUnread))

module.exports = route;