const { NewError } = require("../Middleware/errMiddleware");
const { createWorkspaceService, inviteLinkService,
    acceptUserService, assignRoleService,
    getMemberListService, updateWorkspaceService,
    deleteMemberService, deleteWorkspaceService,
    leaveWorkspaceService } = require('../Services/workspaceService');
const mongoose = require('mongoose')
const userModel = require("../Model/userModel")
const validateResult = require('../Utils/ValidateResult')
const logger = require('../Utils/logger')
const workspaceModel = require('../Model/workspaceModel')

let createWorkspace = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.userId;
        let { name, type, members = [] } = req.body;
        if (!name || !type) {
            return next(new NewError("Invalid credentials", 400));
        }
        let payload = { id, name, type, members };
        let newWorkspace = await createWorkspaceService(payload, session);
        await session.commitTransaction();
        session.endSession();
        logger.info("Workspace created", {
            workspaceId: newWorkspace._id,
            ownerId: id
        });
        res.json({
            success: true,
            data: newWorkspace
        })
    } catch (err) {
        logger.error("Workspace creation transaction failed", {
            error: err.message
        });
        await session.abortTransaction();
        session.endSession();
        next(new NewError("Internal Server Error", 500))
    }
}

let getWorkspace = async (req, res, next) => {
    let id = req.userId;
    let user = await userModel
        .findById(id)
        .select('workspaces')
        .lean();
    const workspaceIds = user.workspaces.map(
        w => w.workspaceId
    );

    const workspaces = await workspaceModel.find({
        _id: { $in: workspaceIds }
    }).lean();

    const workspaceList = workspaces.map((workspace) => {
        const membership = user.workspaces.find(
            w =>
                w.workspaceId.toString() ===
                workspace._id.toString()
        );

        return {
            ...workspace,
            role: membership?.role || "MEMBER"
        };
    });
    res.json({
        success: true,
        data: workspaceList
    });
};

let getMembers = async (req, res, next) => {
    validateResult(req);
    let workspace = req.workspace;
    let workspaceRole = req.workspaceRole
    res.json({
        success: true,
        data: workspace,
        role: workspaceRole
    })
}

let getMemberList = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let workspace = req.workspace;
    await workspace.populate("members.userId", "name email");
    let members = await getMemberListService(id, workspace);
    res.json({
        success: true,
        data: members
    })
}

let inviteLink = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let workspace = req.workspace;
    let { targetEmail, targetRole } = req.body;
    let payload = { id, targetEmail, targetRole, workspace };
    await inviteLinkService(payload);
    res.json({
        success: true,
       message: "Email is send to Invited User"
    })
}

let acceptUser = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let {token} = req.body;
        let id = req.userId;
        if (!token) {
            return next(new NewError("Invalid Token", 400))
        }
        let payload = { token, id };
        await acceptUserService(payload, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "User added in workspace"
        })
    } catch (err) {
        logger.error("User acceptance transaction failed", {
            error: err.message
        });
        await session.abortTransaction();
        session.endSession();
        console.log(err)
        next(new NewError("Internal Server Error", 500))
    }
}

let assignRole = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        validateResult(req);
        let id = req.userId;
        let targetId = req.params.userId;
        let workspace = req.workspace;
        let { role } = req.body;

        if (!targetId) {
            return next(new NewError("Invalid Id", 400))
        }
        if (id.toString() === targetId.toString()) {
            return next(new NewError("User cannot change own role", 400))
        }
        let payload = { id, targetId, workspace, role };
        await assignRoleService(payload, session);

        await session.commitTransaction();
        await session.endSession();
        logger.info("Role updated", {
            workspaceId: workspace._id,
            targetUserId: targetId,
            role: role
        });
        res.json({
            success: true,
            message: "User role update successfully"
        })
    } catch (err) {
        logger.error("Assign Role transaction failed", {
            error: err.message
        });
        console.log(err)
        await session.abortTransaction();
        await session.endSession();
        next(new NewError("Internal Server Error", 500))
    }
}

let updateWorkspace = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let workspace = req.workspace;
    let { name, type } = req.body;
    let payload = { id, workspace, name, type };
    let update = await updateWorkspaceService(payload);
    res.json({
        success: true,
        data: update
    })
}

let deleteMember = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        validateResult(req);
        let id = req.userId;
        let workspace = req.workspace;
        let targetId = req.params.userId;
        if (!targetId) {
            return next(new NewError("Invalid Id", 400));
        }
        await deleteMemberService(id, workspace, targetId, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "User Leaves successfully"
        })
    } catch (e) {
        logger.error("Delete Workspace Member transaction failed", {
            error: e.message
        });
        await session.abortTransaction();
        session.endSession();
        next(e)
    }
}

let deleteWorkspace = async (req, res, next) => {
    let workspace = req.workspace;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        validateResult(req);
        let id = req.userId;
        await deleteWorkspaceService(id, workspace, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "Workspace delete successfully"
        })
    } catch (e) {
        logger.error("Workspace deletion transaction failed", {
            workspaceId: workspace._id,
            error: e.message
        });
        await session.abortTransaction();
        session.endSession()
        next(e)
    }
}

let leaveWorkspace = async (req, res, next) => {
    let workspace = req.workspace;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        validateResult(req);
        let id = req.userId;
        await leaveWorkspaceService(id, workspace, session)
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "User leaves the workspace"
        })
    } catch (e) {
        logger.error("Workspace deletion transaction failed", {
            workspaceId: workspace._id,
            error: e.message
        });
        await session.abortTransaction();
        session.endSession();
        next(e)
    }
}
module.exports = {
    createWorkspace, getWorkspace, inviteLink,
    acceptUser, assignRole, getMembers, getMemberList,
    deleteWorkspace, updateWorkspace, leaveWorkspace, deleteMember
}