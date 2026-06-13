const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    device: String,
    ipAddress: String
}, { timestamps: true });

tokenSchema.index({ userId: 1 });
tokenSchema.index({ refreshToken: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;