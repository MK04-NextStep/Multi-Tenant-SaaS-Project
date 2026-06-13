const { NewError } = require('../Middleware/errMiddleware');
const teamModel = require('../Model/teamModel');
const userModel = require('../Model/userModel');
const crypto = require('crypto');
const teamLink = require('../Model/teamLinkModel');
const workspaceModel = require("../Model/workspaceModel");
const projectModel = require("../Model/projectModel")
const taskModel = require('../Model/TaskModel')
const logger = require('../Utils/logger')
const notificationModel = require('../Model/NotificationModel')
const { createNotification } = require('./notificationService')
const sendEmail = require("../Utils/sendEmail")
const { getIo } = require("../socket")

let createTeamService = async (payload, session) => {
    let { id, name, workspaceId, members } = payload;
    let existUser = await userModel.findById(id).select("workspaces").lean().session(session);
    let isWorkspaceMember = existUser.workspaces.find(
        w => w.workspaceId.toString() === workspaceId.toString());
    if (!isWorkspaceMember) {
        throw new NewError("Access Denied", 403);
    }
    let newMembers = [...new Map(
        members.map(m => [m.userId.toString(), m]))
        .values()]
    let teamMembers = [
        {
            userId: id,
            role: "ADMIN"
        },
        ...newMembers.filter(m => m.userId.toString() !== id.toString())
    ]
    let newTeam = await teamModel.create([
        {
            name: name,
            workspaceId: workspaceId,
            createdBy: id,
            members: teamMembers
        }], { session })
    let createdTeam = newTeam[0];
    //bulk conditional atomic array update
    let bulkOps = teamMembers.map(m => ({
        updateOne: {
            filter: {
                _id: m.userId,
                //$ne : if team exist then skipped updation
                "teams.teamId": { $ne: createdTeam._id }
            },
            update: {
                //$addToSet: skip duplicate, better than $push
                $addToSet: {
                    teams: {
                        teamId: createdTeam._id,
                        workspaceId,
                        role: m.role
                    }
                }
            }
        }
    }));
    if (bulkOps.length > 0) {
        await userModel.bulkWrite(bulkOps, { session });
    }
    getIo()
        .to(workspaceId.toString())
        .emit("team-created", {
            workspaceId: workspaceId.toString(),
            teamId: createdTeam._id.toString()
        });
    return;
}

let inviteTeamService = async (payload) => {
    console.log("sevcie")
    let { id, team, targetEmail, targetRole } = payload;
    let targetUser = await userModel.findOne({ email: targetEmail })
        .select("workspaces teams").lean()
    if (!targetUser) {
        throw new NewError("No user exist", 404)
    }
    let isWorkspaceMember = targetUser.workspaces.find(
        w => w.workspaceId.toString() === team.workspaceId.toString());
    if (!isWorkspaceMember) {
        throw new NewError("User is not part of workspace", 403)
    }
    let isMember = await targetUser.teams.find(
        t => t.teamId.toString() === team._id.toString());
    if (isMember) {
        throw new NewError("User is already part of team", 403);
    }
    let token = await crypto.randomBytes(32).toString("hex")
    let hashToken = await crypto.createHash("sha256").update(token).digest("hex");
    const tokenTeam = await teamLink.updateOne(
        { teamId: team._id, email: targetEmail },
        {
            $set: {
                token: hashToken,
                invitedBy: id,
                role: targetRole,
                expiresAt: Date.now() + 10 * 60 * 1000
            }
        },
        { upsert: true }
    )
    if (targetUser) {
        let note = await createNotification({
            userId: targetUser._id,
            workspaceId: team.workspaceId,
            teamId: team._id,
            type: "INVITE_IN_TEAM",
            entityId: team._id,
            entityType: "TEAM",
            to: "WORKSPACE",
            message: `You are invited to team ${team.name}`,
            metadata: {
                teamName: team.name,
                invitedBy: id, role: "MEMBER"
            }
        })
    }
    await sendEmail(
        targetEmail,
        `You are invited to Team ${team.name}`,
        `<h3>Invite Token<b>: ${token}</b></h3>
                 <p>It will expire in 5 minutes.</p>`
    );
    return
}

let joinTeamService = async (payload, session) => {
    let { id, token } = payload;
    let hashToken = await crypto.createHash('sha256').update(token).digest('hex');
    let targetTeamId = await teamLink.findOne({
        token: hashToken,
        expiresAt: { $gt: Date.now() }
    }).select("teamId email role").lean().session(session)
    if (!targetTeamId) {
        throw new NewError("No such team existed", 404)
    }
    let targetTeam = await teamModel.findById(targetTeamId.teamId)
        .select("workspaceId").lean().session(session);
    if (!targetTeam) {
        throw new NewError("Team not found", 404);
    }

    let targetUser = await userModel.findOne({ email: targetTeamId.email })
        .select("_id workspaces").lean().session(session);
    if (!targetUser) {
        throw new NewError("Please SignUp first", 404);
    }
    if (targetUser._id.toString() !== id.toString()) {
        throw new NewError("Access Denied", 403);
    }
    let isWorkspaceMember = targetUser.workspaces.find(
        w => w.workspaceId.toString() === targetTeam.workspaceId.toString())
    if (!isWorkspaceMember) {
        throw new NewError("User is not part of workspace", 403)
    }
    const teamUpdate = await teamModel.updateOne(
        {
            _id: targetTeamId.teamId,
            workspaceId: targetTeam.workspaceId
        },
        {
            $addToSet: {
                members: {
                    userId: targetUser._id,
                    role: targetTeamId.role
                }
            }
        },
        { session: session }
    )
    if (teamUpdate.matchedCount === 0) {
        throw new NewError("Team not found", 400)
    }
    const userUpdate = await userModel.updateOne(
        {
            _id: targetUser._id,
            "teams.teamId": { $ne: targetTeamId.teamId }
        },
        {
            $addToSet: {
                teams: {
                    teamId: targetTeamId.teamId,
                    role: targetTeamId.role
                }
            }
        },
        { session: session }
    )
    if (userUpdate.matchedCount === 0) {
        throw new NewError("Use is already in the team",409)
    }
    await createNotification({
        userId: id,
        workspaceId: targetTeam.workspaceId,
        teamId: targetTeam._id,
        type: "JOINED_TEAM",
        entityId: targetTeam._id,
        entityType: "TEAM",
        to: "WORKSPACE",
        message: `you are member of team ${targetTeam.name}`,
        metadata: {
            teamName: targetTeam.name,
            acceptedBy: id, role: "MEMBER"
        }
    })
    getIo()
        .to(targetTeam._id.toString())
        .emit("team-member-added", {
            teamId: targetTeam._id.toString(),
            userId: id.toString()
        });
    await teamLink.deleteOne({ token: hashToken }).session(session)
    return;
}

let assignRoleService = async (payload, session) => {
    let { id, team, userId, role } = payload;
    let targetUser = team.members.find(
        t => t.userId.toString() === userId.toString())
    if (!targetUser || targetUser.role === "ADMIN") {
        logger.warn("Forbidden role assignment attempt", {
            adminId: id,
            targetRole: role
        });
        throw new NewError("Access Denied", 403)
    }
    const teamUpdate = await teamModel.updateOne(
        {
            _id: team._id,
            "members.userId": userId
        },
        {
            $set: {
                "members.$.role": role
            }
        }, { session }
    )
    if (teamUpdate.matchedCount === 0) {
        throw new NewError("No such user exist", 404)
    }
    const userUpdate = await userModel.updateOne(
        {
            _id: userId,
            "teams.teamId": team._id
        },
        {
            $set: {
                "teams.$.role": role
            }
        }, { session }
    )
    if (userUpdate.matchedCount === 0) {
        throw new NewError("No such team exist", 404)
    }
    getIo()
        .to(team._id.toString())
        .emit("team-role-updated", {
            teamId: team._id.toString(),
            userId: id.toString(),
            role
        });
    return;
}

let updateTeamService = async (team, name) => {
    let update = await teamModel.updateOne(
        {
            _id: team._id
        },
        {
            $set: { name: name }
        }
    )
    getIo()
        .to(team._id.toString())
        .emit("team-updated", {
            teamId: team._id.toString()
        });
    return;
}

let deleteMemberService = async (id, targetId, team, session) => {
    let existUser = await userModel.findById(id).select("teams")
    let targetUser = await userModel.findById(targetId).select("-password").session(session)
    if (!targetUser) {
        throw new NewError("Invalid Credentials", 404);
    }
    let isTargetMember = targetUser.teams.find(w => w.teamId.toString() === team._id.toString())
    if (!isTargetMember) {
        throw new NewError("User is not part of team", 403)
    }
    if (isTargetMember.role === "ADMIN") {
        throw new NewError("Access Denied", 401)
    }
    await teamModel.updateOne(
        { _id: team._id },
        {
            $pull: {
                members: {
                    userId: targetId
                }
            }
        }, { session }
    )
    await userModel.updateOne(
        {
            _id: targetId
        },
        {
            $pull: {
                teams: {
                    teamId: team._id
                }
            }
        }, { session }
    )
    await createNotification({
        userId: targetId,
        workspaceId: team.workspaceId,
        teamId: team._id,
        type: "REMOVED_FROM_TEAM",
        entityId: team._id,
        entityType: "TEAM",
        to: "WORKSPACE",
        message: `You are removed from ${team.name}`,
        metadata: {
            teamName: team.name,
            removedBy: id, role: "MEMBER"
        }
    })
    getIo()
        .to(team._id.toString())
        .emit("team-member-left", {
            teamId: team._id.toString(),
            userId: targetId.toString()
        });
    return;
}

let deleteTeamService = async (id, team, session) => {
    let members = team.members;
    let notifications = members
        .filter(member => member.userId.toString() !== id.toString())
        .map(member => ({
            userId: member.userId,
            workspaceId: team.workspaceId,
            type: "TEAM_DELETED",
            entityId: team._id,
            entityType: "TEAM",
            message: `Team ${team.name} was deleted`,
            metadata: {
                teamName: team.name,
                deletedBy: id
            }
        }))
    await notificationModel.insertMany(notifications, { session });
    let projectDelete = await projectModel.deleteMany({ teamId: team._id }).session(session)
    let taskDelete = await taskModel.deleteMany({ teamId: team._id }).session(session)
    let teamDelete = await teamModel.findByIdAndDelete(team._id).session(session);

    let userWorkspace = await userModel.updateMany(
        { "teams.teamId": team._id },
        {
            $pull: {
                teams: { teamId: team._id }
            }
        }, { session }
    )
    getIo()
        .to(team._id.toString())
        .emit("team-deleted", {
            teamId: team._id.toString(),
        });

    getIo()
        .to(team.workspaceId.toString())
        .emit("team-removed-from-workspace", {
            workspaceId: team.workspaceId.toString(),
            teamId: team._id.toString()
        });
    return;
}

let leaveTeamService = async (payload, session) => {
    let { id, team } = payload;
    let deleteTeam = await teamModel.updateOne(
        { _id: team._id },
        {
            $pull: {
                members: { userId: id }
            }
        },
        { session }
    )
    if (deleteTeam.modifiedCount === 0) {
        throw new NewError("No such Member found", 404);
    }
    let deleteTeamUser = await userModel.updateOne(
        { _id: id },
        {
            $pull: {
                teams: { teamId: team._id }
            }
        }, { session }
    )
    if (deleteTeamUser.modifiedCount === 0) {
        throw new NewError("No Such team found", 404)
    }
    getIo()
        .to(team._id.toString())
        .emit("team-member-left", {
            teamId: team._id.toString(),
            userId: id.toString()
        });
    return;
}

module.exports = {
    createTeamService, inviteTeamService,
    joinTeamService, leaveTeamService, assignRoleService,
    updateTeamService, deleteMemberService,
    deleteTeamService, leaveTeamService
}
//251