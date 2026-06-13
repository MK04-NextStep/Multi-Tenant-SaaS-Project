const { NewError } = require("../Middleware/errMiddleware");
const userModel = require("../Model/userModel");
const logger = require('../Utils/logger')

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let searchUsersService = async (requesterId, query) => {
    const trimmed = (query || "").trim();
    if (trimmed.length < 2) {
        throw new NewError("Enter at least 2 characters", 400);
    }

    const requester = await userModel.findById(requesterId).select("workspaces").lean();
    if (!requester) {
        throw new NewError("User not found", 404);
    }

    const wsIds = (requester.workspaces || []).map((ws) => ws.workspaceId).filter(Boolean);
    if (wsIds.length === 0) {
        return [];
    }

    const safe = escapeRegex(trimmed);

    return userModel
        .find({
            _id: { $ne: requesterId },
            "workspaces.workspaceId": { $in: wsIds },
            $or: [{ email: new RegExp(safe, "i") }, { name: new RegExp(safe, "i") }],
        })
        .select("_id name email avatar")
        .limit(25)
        .lean();
};

let getUserService = async (requesterId, targetId) => {
    const requester = await userModel.findById(requesterId).select("workspaces").lean()
    const target = await userModel.findById(targetId).select("-password").lean()
    if (!target) {
        throw new NewError("User not found", 404)
    }

    const sharedWorkspace = requester.workspaces.find(ws =>
        target.workspaces.some(tws =>
            tws.workspaceId.toString() === ws.workspaceId.toString()
        )
    );
    if (!sharedWorkspace) {
        throw new NewError("Access Denied", 403)
    }

    const role = sharedWorkspace.role;
    let allowed = false;
    let scope = "limited";
    if (role === "OWNER" || role === "ADMIN") {
        allowed = true;
        scope = "full";
    } else if (role === "MEMBER") {
        allowed = true;
        scope = "limited";
    }
    if (!allowed) {
        throw new NewError("Access Denied", 403)
    }

    let data;
    if (scope === "full") {
        data = target;
    } else {
        data = {
            _id: target._id,
            name: target.name,
            email: target.email,
            avatar: target.avatar
        };
    }
    return data;
};

module.exports = { getUserService, searchUsersService };