let { NewError } = require("../Middleware/errMiddleware");
let validateResult = require('../Utils/ValidateResult')
let { registerService, loginService, logoutService,
    verifyRefreshTokenService, verifyingEmailService,
    verifyUserService, forgotPasswordService,
    resetPasswordService } = require('../Services/authService');
const cloudinary = require('../Config/cloudinary');
const logger = require("../Utils/logger");

let register = async (req, res, next) => {
    validateResult(req);
    let { email, password } = req.body;
    let data = req.body;
    if (!data) {
        return next(new NewError("Invalid Credentials", 400))
    }
    email = email.toLowerCase().trim();
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        if (!result) {
            logger.error("Avatar upload failed", {
                email: email,
                error: err.message
            });
            return next(new NewError("cant upload", 400))
        }
        data.avatar = result.secure_url;
    }
    let newUser = await registerService(email, password, data);

    logger.info("User register successfully", { id: newUser._id, email: email })
    res.json({
        success: true,
        message: "Verify Your Email"
    })
}

let login = async (req, res, next) => {
    validateResult(req);

    let { email, password } = req.body;
    email = email.toLowerCase().trim();
    let { existUser, accessToken, refreshToken } = await loginService(email, password, req.ip);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    logger.info("User login successfully", { id: existUser._id, email: email })
    res.json({
        success: true,
        data: existUser,
        accessToken
    })
}

let logout = async (req, res, next) => {
    let id = req.userId;
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new NewError("Invalid Token", 401))
    }
    await logoutService(refreshToken);
    res.clearCookie("refreshToken");
    logger.info("User logout successfully", { id: id })
    res.json({
        success: true,
        message: "User got logout"
    })
}

let verifyRefreshToken = async (req, res, next) => {
    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new NewError("Invalid Token", 401))
    }
    await verifyRefreshTokenService(refreshToken);
    res.json({
        success: true,
        newAccessToken
    })
}

let verifyUser = async (req, res, next) => {
    let { email, otp } = req.body;

    if (!email || !otp) {
        return next(new NewError("Email and OTP are required", 400));
    }
    await verifyUserService(email, otp);
    res.json({
        success: true,
        message: "User Verified. You can login now"
    });
};

let verifyEmail = async (req, res, next) => {
    console.log("anything")
    let { email } = req.body;

    await verifyingEmailService(email);
    res.json({
        success: true,
        message: "OTP sent to your email"
    });
};

let forgotPassword = async (
    req,
    res,
    next
) => {

    let { email } = req.body;

    if (!email) {
        return next(
            new NewError(
                "Email is required",
                400
            )
        );
    }

    await forgotPasswordService(email);

    res.json({
        success: true,
        message: "OTP sent to your email"
    });
};

let resetPassword = async (
    req,
    res,
    next
) => {

    let {
        email,
        otp,
        password
    } = req.body;

    if (
        !email ||
        !otp ||
        !password
    ) {
        return next(
            new NewError(
                "All fields are required",
                400
            )
        );
    }

    await resetPasswordService(
        email,
        otp,
        password
    );

    res.json({
        success: true,
        message:
            "Password reset successfully. Please login"
    });
};

module.exports = {
    register, login, logout, verifyRefreshToken,
    verifyEmail, verifyUser, forgotPassword, resetPassword
}