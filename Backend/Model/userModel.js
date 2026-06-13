const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    workspaces: [{
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace"
        },
        role: {
            type: String,
            enum: ["OWNER", "ADMIN", "MEMBER"],
            default: "MEMBER"
        }
    }],

    teams: [
        {
            teamId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Team",
                required: true
            },
            workspaceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Workspace",
                required: true
            },
            role: {
                type: String,
                enum: ["ADMIN","MENTOR", "MEMBER"],
                default: "MEMBER"
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    avatar: String,

    isActive: {
        type: Boolean,
        default: true
    },

    lastLoginAt: Date

}, { timestamps: true });

userSchema.index({ "workspaces.workspaceId": 1 });
userSchema.index({ "teams.teamId": 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;