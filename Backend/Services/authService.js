let userModel = require('../Model/userModel')
let { NewError } = require("../Middleware/errMiddleware");
const { accessTokenGenerator, refreshTokenGenerator } = require('../Utils/tokenGenerator');
let bcrypt = require('bcrypt');
let jstoken = require('jsonwebtoken');
let tokenModel = require('../Model/tokenModel')
let verificationModel = require('../Model/verificationToken')
let crypto = require('crypto');
const sendEmail = require('../Utils/sendEmail');
const logger = require('../Utils/logger')

let registerService = async (email, password, data) => {
    let existUser = await userModel.findOne({ email: email })
        .select("_id").lean();
    if (existUser) {
        throw new NewError("User already existed", 409)
    }
    let hashPass = await bcrypt.hash(password, 10);
    let newUser = await userModel.create({ ...data, password: hashPass });
    return newUser
}

let loginService = async (email, password, ip) => {
    let existUser = await userModel.findOne({ email: email })
        .select("_id +password isVerified").lean();
    if (!existUser) {
        logger.warn("Failed login attempt", {
            email: email,
            ip: ip
        });
        throw new NewError("Invalid Credentials", 404);
    }
    let isCorrect = await bcrypt.compare(password, existUser.password);
    if (!isCorrect) {
        logger.warn("Failed login attempt", {
            email: email,
            ip: ip
        });
        throw new NewError("Invalid Credentials", 400)
    }
    if (!existUser.isVerified) {
        throw new NewError("Email Verification Needed", 401);
    }
    let accessToken = accessTokenGenerator(existUser._id);
    let refreshToken = refreshTokenGenerator(existUser._id);
    let hashToken = await bcrypt.hash(refreshToken, 10);
    let expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    let newToken = await tokenModel.create({
        userId: existUser._id,
        refreshToken: hashToken,
        expiresAt: expiry
    })
    return { existUser, accessToken, refreshToken }

}

let logoutService = async (refreshToken) => {
    let verifyToken = await jstoken.verify(refreshToken, "thisismysecretkey");
    let users = await tokenModel.find({ userId: verifyToken.userId })
        .select("refreshToken").lean()
    if (users.length <= 0) {
        throw new NewError("Invalid Token", 404)
    }

    for (let user in users) {
        let match = await bcrypt.compare(refreshToken, user.refreshToken);
        if (match) {
            await user.deleteOne();
            return;
        }
    }
    throw new NewError("Invalid Token")
}

let verifyRefreshTokenService = async (refreshToken) => {
    let userData = await jstoken.verify(refreshToken, "thisismysecretkey");
    let users = await tokenModel.find({ userId: userData.userId })
        .select("expiresAt refreshToken").lean()
    if (users.length <= 0) {
        throw new NewError("Invalid Token", 404)
    }

    for (let user in users) {
        if (Date.now() > user.expiresAt) {
            logger.warn("Invalid refresh token used", {
                userId: userData.userId
            });
            return next(new NewError("Expired Token", 401))
        }
        let hashToken = await bcrypt.compare(refreshToken, user.refreshToken);
        if (hashToken) {
            let newAccessToken = await accessTokenGenerator(userData.userId);
            return;
        }
    }
    throw new NewError("Invalid Token", 401)
}

let verifyingEmailService = async (email) => {
    let existUser = await userModel.findOne({ email })
        .select("isVerified _id email").lean();

    if (!existUser) {
        throw new NewError("Invalid Email", 404);
    }

    if (existUser.isVerified) {
        throw new NewError("User already Verified", 409);
    }

    let existing = await verificationModel.findOne({
        userId: existUser._id,
        type: "verify"
    }).lean();

    if (existing && Date.now() - existing.lastVerificationTime < 60 * 1000) {
        throw new NewError("Please try after sometime", 503);
    }

    await verificationModel.deleteMany({
        userId: existUser._id,
        type: "verify"
    });

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest("hex")

    await verificationModel.create({
        userId: existUser._id,
        email: existUser.email,
        otp: hashedOTP,
        lastVerificationTime: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,
        type: "verify"
    });

    let info = await sendEmail(
        existUser.email,
        "Verify Your Email",
        `<h3>Your OTP is: <b>${otp}</b></h3>
         <p>It will expire in 5 minutes.</p>`
    );

    return true;
};

let verifyUserService = async (email, otp) => {
    let hashedOTP = crypto.createHash('sha256').update(otp).digest("hex")
    let record = await verificationModel.findOne({
        email,
        type: "verify",
        otp: hashedOTP,
        expiresAt: { $gt: Date.now() }
    });

    if (!record) {
        throw new NewError("OTP expired or invalid request", 404);
    }
    let user = await userModel.findById(record.userId);
    if (!user) {
        throw new NewError("User not found", 404);
    }
    user.isVerified = true;
    await user.save();
    await verificationModel.deleteMany({
        userId: record.userId,
        type: "verify"
    });

    return true;
};

let forgotPasswordService = async (email) => {

    let existUser = await userModel.findOne({ email })
        .select("_id email")
        .lean();

    if (!existUser) {
        throw new NewError("Invalid Credentials", 404);
    }

    // Prevent spam requests
    let existingOtp = await verificationModel.findOne({
        userId: existUser._id,
        type: "reset"
    });

    if (
        existingOtp &&
        Date.now() - existingOtp.lastVerificationTime < 60 * 1000
    ) {
        throw new NewError(
            "Please try again after sometime",
            503
        );
    }

    // Remove old OTPs
    await verificationModel.deleteMany({
        userId: existUser._id,
        type: "reset"
    });

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    let hashedOTP = crypto.createHash("sha256").update(otp).digest("hex")

    // Save OTP
    await verificationModel.create({
        userId: existUser._id,
        email: existUser.email,
        hashedOTP,
        lastVerificationTime: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,
        type: "reset"
    });

    // Send Email
    await sendEmail(
        existUser.email,
        "Reset Password OTP",
        `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
        `
    );

    return true;
};

let resetPasswordService = async (
    email,
    otp,
    password
) => {

    let hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    // Find valid OTP record
    let record = await verificationModel.findOne({
        email,
        otp: hashedOTP,
        type: "reset",
        expiresAt: { $gt: Date.now() }
    });

    if (!record) {
        throw new NewError(
            "Invalid or expired OTP",
            404
        );
    }

    // Find user
    let user = await userModel.findById(record.userId);

    if (!user) {
        throw new NewError(
            "User not found",
            404
        );
    }

    // Hash new password
    let hashPass = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashPass;

    await user.save();

    // Delete all reset OTPs
    await verificationModel.deleteMany({
        userId: user._id,
        type: "reset"
    });

    return true;
};

module.exports = {
    registerService,
    loginService,
    logoutService,
    verifyRefreshTokenService,
    verifyingEmailService,
    verifyUserService,
    forgotPasswordService,
    resetPasswordService
}