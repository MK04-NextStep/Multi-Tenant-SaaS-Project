const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },

    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },

    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    },

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    action: {
        type: String,
        enum: [
            "TASK_CREATED",
            "TASK_UPDATED",
            "TASK_DELETED",
            "TASK_STATUS_CHANGED",

            "TEAM_CREATED",
            "TEAM_MEMBER_ADDED",

            "PROJECT_CREATED",
            "PROJECT_SUBMITTED",
            "PROJECT_APPROVED",
            "PROJECT_REJECTED",

            "TASK_ASSIGNED",
            "MENTIONED_IN_COMMENT",
            "PROJECT_APPROVED",
            "DUE_DATE_REMINDER",

            "COMMENT_CREATED",
            "COMMENT_UPDATED",
            "COMMENT_DELETED",

            "USER_JOINED",
            "ROLE_UPDATED"
        ],
        required: true
    },

    metadata: {
        type: mongoose.Schema.Types.Mixed
    }

}, { timestamps: true });

activitySchema.index({ workspaceId: 1, createdAt: -1 });
activitySchema.index({ projectId: 1 });
activitySchema.index({ teamId: 1 });
activitySchema.index({ userId: 1 });

module.exports = mongoose.model("Activity", activitySchema);