const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,

    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["IN_PROGRESS", "DONE", "BLOCKED"],
        default: "TODO"
    },

    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "MEDIUM"
    },

    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }],

    dueDate: Date,

    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

taskSchema.index({ workspaceId: 1, projectId: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ workspaceId: 1, status: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;