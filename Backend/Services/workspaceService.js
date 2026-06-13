const workspaceModel = require('../Model/workspaceModel');
const { NewError } = require("../Middleware/errMiddleware");
const userModel = require('../Model/userModel');
const crypto = require('crypto');
const workspaceLinkModel = require("../Model/workspaceLinkModel");
const projectModel = require("../Model/projectModel");
const taskModel = require("../Model/TaskModel")
const { createNotification } = require('./notificationService')
const logger = require('../Utils/logger')
const teamModel = require('../Model/teamModel')
const activityModel = require('../Model/ActivityModel');
const commentModel = require('../Model/commentModel')
const sendEmail = require('../Utils/sendEmail');
const { getIo } = require('../socket')
const notificationModel = require('../Model/NotificationModel')

let createWorkspaceService = async (payload, session) => {
    let { id, name, type, members } = payload;
    let uniqueMember = [...new Map(
        members.map(m => [m.userId.toString(), m])
    ).values()]
    let workspaceMember = [
        {
            userId: id,
            role: "ADMIN"
        }, ...uniqueMember.filter(m => id.toString() !== m.userId.toString())
    ];
    let createnewWorkspace = await workspaceModel.create([{
        name, type,
        createdBy: id,
        members: workspaceMember
    }], { session });
    let newWorkspace = createnewWorkspace[0];
    const bulkOps = workspaceMember.map(m => ({
        updateOne: {
            filter: {
                _id: m.userId,
                "workspaces.workspaceId": { $ne: newWorkspace._id }
            },
            update: {
                $addToSet: {
                    workspaces: {
                        workspaceId: newWorkspace._id,
                        role: m.role
                    }
                }
            }
        }
    }));
    if (bulkOps.length > 0) {
        await userModel.bulkWrite(bulkOps, { session });
    }
    getIo().emit("workspace-created", newWorkspace);
    return newWorkspace;
}

let getMemberListService = async (id, workspace) => {
    let members = workspace.members.map(m => (
        {
            userId: m.userId,
            role: m.role
        }
    ));
    return members;
}

let inviteLinkService = async (payload) => {
    let { id, targetEmail, targetRole, workspace } = payload;
    let target = await userModel.findOne({ email: targetEmail }).select("_id").lean()
    if (target) {
        let isMember = workspace.members.find(m => target._id.toString() === m.userId.toString());
        if (isMember) {
            throw new NewError("User is already member of workspace", 409);
        }
    }
    let token = await crypto.randomBytes(32).toString("hex");
    let hashToken = await crypto.createHash('sha256').update(token).digest("hex");
    await workspaceLinkModel.updateOne(
        { workspaceId: workspace._id, email: targetEmail },
        {
            $set: {
                token: hashToken,
                invitedBy: id,
                role: targetRole,
                expiresAt: Date.now() + 10 * 60 * 1000
            }
        },
        { upsert: true });
    if (target) {
        await createNotification({
            userId: target._id,
            workspaceId: workspace._id,
            teamId: null,
            type: "INVITE_IN_WORKSPACE",
            entityId: workspace._id,
            entityType: "WORKSPACE",
            to: "USER",
            message: `You are invited to workspace ${workspace.name}`,
            metadata: {
                workspaceName: workspace.name,
                invitedBy: id,
                role: targetRole
            }
        });
    }
    await sendEmail(
        targetEmail,
        `You are invited to Workspace ${workspace.name}`,
        `<h3>Invite Token<b>:  ${token}</b></h3>
             <p>It will expire in 5 minutes.</p>`
    );
    return;
}

let acceptUserService = async (payload, session) => {
    let { token, id } = payload;
    let hashToken = await crypto.createHash('sha256').update(token).digest("hex");
    let workspace = await workspaceLinkModel.findOne({
        token: hashToken,
        expiresAt: { $gt: Date.now() }
    }).select("email workspaceId role").lean().session(session);
    if (!workspace) {
        throw new NewError("Invalid Token", 404);
    }
    let targetUser = await userModel.findOne({ email: workspace.email }).select("_id").lean().session(session);
    if (!targetUser) {
        throw new NewError("Please SignUp first ", 404);
    }
    if (targetUser._id.toString() !== id.toString()) {
        throw new NewError("Access Denied", 403);
    }
    const workspaceUpdate = await workspaceModel.updateOne(
        {
            _id: workspace.workspaceId,
            "members.userId": { $ne: targetUser._id }
        },
        {
            $addToSet: {
                members: {
                    userId: targetUser._id,
                    role: workspace.role
                }
            }
        },
        { session }
    );
    if (workspaceUpdate.matchedCount === 0) {
        throw new NewError("Workspace not found", 404);
    }
    await userModel.updateOne(
        {
            _id: targetUser._id,
            "workspaces.workspaceId": { $ne: workspace.workspaceId }
        },
        {
            $addToSet: {
                workspaces: {
                    workspaceId: workspace.workspaceId,
                    role: workspace.role
                }
            }
        },
        { session }
    )
    const member = await userModel
        .findById(id)
        .select("_id name email");
    await createNotification({
        userId: id,
        workspaceId: workspace.workspaceId,
        teamId: null,
        type: "JOINED_WORKSAPCE",
        entityId: workspace.workspaceId,
        entityType: "WORKSPACE",
        to: "USER",
        message: "user accepted the invitation",
        metadata: null
    })
    getIo()
        .to(workspace.workspaceId.toString())
        .emit("workspace-member-added", {
            workspaceId: workspace.workspaceId,
            member
        });
    await workspaceLinkModel.deleteOne({ token: hashToken }).session(session);
    logger.info("Member added to workspace", {
        workspaceId: workspace.workspaceId,
        targetUserId: targetUser._id
    });

    return;
}

let assignRoleService = async (payload, session) => {
    let { id, targetId, workspace, role } = payload;
    let workspaceId = workspace._id;
    let user = workspace.members.find(m => m.userId.toString() === targetId.toString());
    if (!user) {
        throw new NewError("No user Existed", 400);
    }
    if (user.role === "ADMIN") {
        logger.warn("Forbidden role assignment attempt", {
            adminId: id,
            targetRole: role
        });
        throw new NewError("cannot change admin role", 403);
    }
    const workspaceUpdate = await workspaceModel.updateOne(
        {
            _id: workspace._id,
            "members.userId": targetId
        },
        {
            $set: {
                "members.$.role": role
            }
        },
        { session }
    );

    if (workspaceUpdate.matchedCount === 0) {
        throw new NewError("User not part of workspace", 404)
    }

    const userUpdate = await userModel.updateOne(
        {
            _id: targetId,
            "workspaces.workspaceId": workspace._id
        },
        {
            $set: {
                "workspaces.$.role": role
            }
        },
        { session }
    );
    if (userUpdate.matchedCount === 0) {
        throw new NewError("workspace not found in user", 404)
    }
    getIo()
        .to(workspaceId.toString())
        .emit("workspace-role-updated", {
            workspaceId: workspaceId.toString(),
            userId: targetId,
            role
        });
    return;
}

let updateWorkspaceService = async (payload) => {
    let { id, workspace, name, type } = payload;
    workspaceId = workspace._id
    let updateData = {}
    if (name) { updateData.name = name }
    if (type) { updateData.type = type }
    if(!name && !type) { throw new NewError("there is nothing to change", 400) }
    let update = await workspaceModel.findByIdAndUpdate(
        workspace._id, updateData, { new: true, runValidators: true })
    getIo()
        .to(workspaceId.toString())
        .emit("workspace-updated", {
            workspaceId: workspaceId.toString()
        });
    return update;
}

let deleteMemberService = async (id, workspace, targetId, session) => {
    let targetUser = await userModel.findById(targetId).select("workspaces ").lean().session(session)
    if (!targetUser) {
        throw new NewError("Invalid Credentials", 400);
    }
    let isTargetMember = targetUser.workspaces.find(w => w.workspaceId.toString() === workspace._id.toString())
    if (!isTargetMember) {
        throw new NewError("User is not part of workspace", 404);
    }
    if (isTargetMember.role === 'ADMIN') {
        throw new NewError("Access Denied", 403)
    }
    await teamModel.updateMany(
        { workspaceId: workspace._id },
        {
            $pull: {
                members: {
                    userId: targetId
                }
            }
        }, { session }
    )
    await workspaceModel.updateOne(
        { _id: workspace._id },
        {
            $pull: {
                members: {
                    userId: targetId
                }
            }
        }, { session }
    )
    await userModel.updateOne(
        { _id: targetId },
        {
            $pull: {
                workspaces: {
                    workspaceId: workspace._id
                },
                teams: {
                    workspaceId: workspace._id
                }
            }
        }, { session }
    )
    await createNotification({
        userId: targetId,
        workspaceId: workspace._id,
        teamId: null,
        type: "REMOVED_FROM_WORKSPACE",
        entityId: workspace._id,
        entityType: "WORKSPACE",
        to: "USER",
        message: `You are removed from workspace ${workspace.name}`,
        metadata: {
            workspaceName: workspace.name,
            RemovedBy: id, role: "MEMBER"
        }
    })
   getIo()
    .to(workspace._id.toString())
    .emit("workspace-member-left", {
        workspaceId: workspace._id.toString(),
        userId: targetId.toString()
    });
    return;
}

let deleteWorkspaceService = async (id, workspace, session) => {
    let workspaceId = workspace._id;
    let members = workspace.members;
    let notifications = members
        .filter(member => member.userId.toString() !== id.toString())
        .map(member => ({
            userId: member.userId,
            workspaceId: workspaceId,
            type: "WORKSPACE_DELETED",
            entityId: workspaceId,
            entityType: "WORKSPACE",
            to: "USER",
            message: `Workspace ${workspace.name} was deleted`,
            metadata: {
                workspaceName: workspace.name,
                deletedBy: id
            }
        }))
    if (notifications.length > 0) {
        await notificationModel.insertMany(
            notifications,
            { session }
        );
    }
    await projectModel.deleteMany({ workspaceId }).session(session)
    await taskModel.deleteMany({ workspaceId }).session(session)
    await userModel.updateMany(
        { "teams.workspaceId": workspaceId },
        {
            $pull: {
                teams: {
                    workspaceId: workspaceId
                }
            }
        }, { session }
    )
    await teamModel.deleteMany({ workspaceId }).session(session)
    await activityModel.deleteMany({
        workspaceId
    }).session(session);
    await commentModel.deleteMany({
        workspaceId
    }).session(session);
    await userModel.updateMany(
        { "workspaces.workspaceId": workspaceId },
        {
            $pull: {
                workspaces: {
                    workspaceId: workspaceId
                }
            }
        }, { session }
    )
    await workspaceModel.deleteOne({ _id: workspaceId }).session(session)
    getIo()
        .to(workspaceId.toString())
        .emit("workspace-deleted", {
            workspaceId: workspaceId.toString()
        });
    return;
}

let leaveWorkspaceService = async (id, workspace, session) => {
    let workspaceId = workspace._id;
    await teamModel.updateMany(
        { workspaceId: workspaceId },
        {
            $pull: {
                members: {
                    userId: id
                }
            }
        }, { session }
    )
    await workspaceModel.updateOne(
        { _id: workspaceId },
        {
            $pull: {
                members: {
                    userId: id
                }
            }
        }, { session }
    )
    await userModel.updateOne(
        { _id: id },
        {
            $pull: {
                workspaces: {
                    workspaceId: workspaceId
                },
                teams: {
                    workspaceId: workspaceId
                }
            }
        }, { session }
    )
    getIo()
    .to(workspaceId.toString())
    .emit("workspace-member-left", {
        workspaceId: workspaceId.toString(),
        userId: id.toString()
    });
    return;
}

module.exports = {
    createWorkspaceService, inviteLinkService,
    acceptUserService, assignRoleService,
    getMemberListService, updateWorkspaceService,
    deleteMemberService, deleteWorkspaceService,
    leaveWorkspaceService
}