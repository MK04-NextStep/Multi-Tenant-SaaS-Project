const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true
        },

        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
            index: true
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true
        },

        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        edited: {
            type: Boolean,
            default: false
        },

        editedAt: {
            type: Date
        },

        isDeleted: {
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true
    }
);

commentSchema.index({
    taskId: 1,
    createdAt: -1
});
commentSchema.index({
    userId: 1,
    createdAt: -1
});

commentSchema.index({
    projectId: 1,
    createdAt: -1
});

commentSchema.index({workspaceId: 1,
    teamId: 1,
    projectId: 1
});

commentSchema.index({taskId: 1,isDeleted: 1});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;