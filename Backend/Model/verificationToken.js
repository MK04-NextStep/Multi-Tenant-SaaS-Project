const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true,
        unique: true
    },
    lastVerificationTime: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['verify', 'reset'],
        required: true
    }
}, { timestamps: true });

verificationTokenSchema.index({ userId: 1 });
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationTokenSchema.index({ userId: 1,type: 1});

const Token = mongoose.model("VerificationToken", verificationTokenSchema);

module.exports = Token;