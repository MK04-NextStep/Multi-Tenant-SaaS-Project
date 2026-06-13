const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["PERSONAL", "PUBLIC"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            role: {
                type: String,
                enum: ["ADMIN","LEADER","MEMBER"],
                default: "MEMBER"
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

workspaceSchema.index({ createdBy: 1 });
workspaceSchema.index({ "members.userId": 1 });
workspaceSchema.index({ _id: 1, "members.userId": 1 });

const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = Workspace;