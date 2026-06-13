const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
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
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: Number,
    mimeType: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

fileSchema.index({ workspaceId: 1, teamId: 1, projectId: 1 });

const fileModel = mongoose.model(
    "fileModel",
    fileSchema
)

module.exports = fileModel