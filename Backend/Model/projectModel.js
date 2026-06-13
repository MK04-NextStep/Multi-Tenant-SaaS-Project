const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
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
    status: {
        type: String,
        enum: ["IDEA", "IN_PROGRESS", "COMPLETED"],
        default: "IDEA"
    },
    mentorApproved: {
        type: String,
        enum: ["APPROVED","PENDING","REJECTED"],
        default: "PENDING"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    githubRepoUrl: {
        type: String,
        match: /^https?:\/\/(www\.)?github\.com\/.+/
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    evaluatedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

projectSchema.index({ workspaceId: 1, teamId: 1 });
projectSchema.index({ workspaceId: 1, status: 1 });
projectSchema.index({ createdBy: 1 });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;