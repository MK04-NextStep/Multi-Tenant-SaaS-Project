const mongoose = require('mongoose');

const teamInviteSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
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
        enum: ['ADMIN',"MENTOR","MEMBER"],
        default: "member"
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

teamInviteSchema.index({ email: 1, teamId: 1 },{ unique: true });
teamInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TeamInvite = mongoose.model(
    "TeamInvite", teamInviteSchema
)

module.exports = TeamInvite;