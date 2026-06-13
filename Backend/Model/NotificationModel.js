const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
  },

  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },

  type: {
    type: String,
    enum: [
      "INVITE_IN_WORKSPACE",
      "JOINED_WORKSAPCE",
      "REMOVED_FROM_WORKSPACE",
      "WORKSPACE_DELETED",

      "INVITE_IN_TEAM",
      "JOINED_TEAM",
      "REMOVED_FROM_TEAM",
      "TEAM_DELETED",

      "PROJECT_CREATED",
      "PROJECT_APPROVED",
      "PROJECT_REJECTED",

      "TASK_ASSIGNED",
      "TASK_UPDATED",
      "TASK_STATUS_CHANGED",
      "TEAM_INVITE",
      "TEAM_JOINED",
    ],
    required: true
  },

  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },

  entityType: {
    type: String,
    enum: ["WORKSPACE", "TASK", "PROJECT", "TEAM", "COMMENT"]
  },
  to: {
    type: String,
    enum: ["USER", "WORKSPACE", "TEAM"]
  },
  metadata: {
    type: Object
  },

  message: {
    type: String
  },

  isRead: {
    type: Boolean,
    default: false
  },

  readAt: Date

}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ workspaceId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;