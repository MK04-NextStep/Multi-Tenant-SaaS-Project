const { NewError } = require("../Middleware/errMiddleware");
const userModel = require("../Model/userModel");
const { searchUsersService, getUserService } = require("../Services/userService");
const validateResult = require('../Utils/ValidateResult')
const logger = require('../Utils/logger')

let getProfile = async (req, res, next) => {
    let id = req.userId;
    let existUser = await userModel
        .findById(id)
        .populate('workspaces.workspaceId', 'name')
        .select("-password");
    res.json({
        success: true,
        data: existUser
    })
}
let getUser = async (req, res, next) => {
    validateResult(req);
    const requesterId = req.userId;
    const targetId = req.params.id;
    if (!targetId) {
        return next(new NewError("Invalid Id", 400));
    }
    let data = await getUserService(requesterId, targetId);
    return res.json({
        success: true,
        data
    });
};

let searchUsers = async (req, res, next) => {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    const data = await searchUsersService(req.userId, query);
    res.json({
        success: true,
        data,
    });
};

module.exports = { getProfile, getUser, searchUsers };