const mongoose = require('mongoose');

const workspaceInviteSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["LEADER","MEMBER"],
        default: "member"
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

workspaceInviteSchema.index({ workspaceId: 1 });
workspaceInviteSchema.index({ email: 1, workspaceId: 1 }, { unique: true });
workspaceInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const WorkspaceInvite = mongoose.model("WorkspaceInvite", workspaceInviteSchema);

module.exports = WorkspaceInvite;
