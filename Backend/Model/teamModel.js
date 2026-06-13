const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
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
                enum: ["ADMIN","LEADER", "MEMBER"],
                default: "MEMBER"
            }
        }
    ]
}, {
    timestamps: true
});

teamSchema.index({ createdBy: 1 });
teamSchema.index({ "members.userId": 1 });
teamSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;