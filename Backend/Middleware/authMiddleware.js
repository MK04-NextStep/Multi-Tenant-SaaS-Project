const jstoken = require('jsonwebtoken');
const { NewError } = require('./errMiddleware');
const userModel = require('../Model/userModel');
const logger = require('../Utils/logger')

const verifyAccessToken = async (req, res, next) => {
    try {
        let accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith("Bearer")) {
            return next(new NewError("Invalid Token", 400));
        }

        accessToken = accessToken.split(" ")[1];
        let userData = await jstoken.verify(accessToken, "thisisthesecretkey");
        if (!userData) {
            return next(new NewError("Invalid Token", 401));
        }
        let user = await userModel.findById(userData.userId).select("_id").lean();
        if (!user) {
            return next(new NewError("User not found", 404))
        }
        req.userId = userData.userId;
        next();
    } catch (err) {
        logger.error("JWT verification crashed", {
            error: err.message
        });
        next(new NewError("Invalid Token", 500))
    }
}

module.exports = verifyAccessToken;