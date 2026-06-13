const mongoose = require('mongoose');
const { NewError } = require('../Middleware/errMiddleware');
const { createTeamService, inviteTeamService,
    joinTeamService, leaveTeamService, assignRoleService,
    updateTeamService, deleteMemberService,
    deleteTeamService } = require("../Services/teamService")
const validateResult = require('../Utils/ValidateResult')
const logger = require('../Utils/logger')
const userModel = require('../Model/userModel');
const teamModel = require('../Model/teamModel')
const notificationModel = require('../Model/NotificationModel')

let createTeam = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.userId;
        let { name, workspaceId, members = [] } = req.body;
        console.log(name, workspaceId)
        if (!name || !workspaceId) {
            throw new NewError("Invalid Information", 400)
        }
        let payload = { id, name, workspaceId, members };
        await createTeamService(payload, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "Team created Successfully"
        })
    } catch (err) {
        logger.error("Team creation transaction failed", {
            error: err.message
        });
        await session.abortTransaction();
        session.endSession();
        next(err)
    }
}

let listUserTeams = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let workspace = req.workspace;
    let user = await userModel
        .findById(id)
        .select("teams")
        .lean();
    const teamIds = user.teams.map(
        (t) => t.teamId
    );
    const teams = await teamModel.find({
        _id: { $in: teamIds },
        workspaceId: workspace._id
    }).lean();

    const teamList = teams.map((team) => {
        const membership = user.teams.find(
            (t) =>
                t.teamId.toString() ===
                team._id.toString()
        );
        return {
            ...team,
            role: membership?.role || "MEMBER"
        };
    });
    res.json({
        success: true,
        data: teamList
    })
}

let teamDetails = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let team = req.team;
    let teamRole = req.teamRole
    await team.populate("members.userId", 'name email');
    res.json({
        success: true,
        data: team,
        role: teamRole
    })
}

let listTeamMembers = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let team = req.team;
    await team.populate("members.userId", 'name email');
    let teamMember = team.members.map(m => (
        {
            userId: m.userId,
            role: m.role
        }
    ))
    res.json({
        success: true,
        data: teamMember
    })
}

let inviteTeam = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let team = req.team;
    let { targetEmail, targetRole } = req.body;
    let payload = { id, team, targetEmail, targetRole };
    await inviteTeamService(payload);
    res.json({
        success: true,
        message: "Email is send to Invited User"
    })
}

let joinTeam = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let id = req.userId;
        let {token} = req.body;
        if (!token) {
            throw new NewError("Invalid Token", 400)
        }
        let payload = { id, token }
        await joinTeamService(payload, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "User added successfully"
        })
    } catch (err) {
        logger.error("Join Team transaction failed", {
            error: err.message
        });
        await session.abortTransaction();
        session.endSession();
        next(err)
    }
}

let assignRole = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        validateResult(req);
        let id = req.userId;
        let team = req.team;
        let userId = req.params.userId;
        let { role } = req.body;
        if (!userId || !role) {
            throw new NewError(" Invalid Credentials", 400)
        }
        if (id === userId) {
            throw new NewError("User cannot assign role to himeself", 400)
        }
        let payload = { id, team, userId, role }
        await assignRoleService(payload, session)
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "Role changed successfully"
        })
    } catch (err) {
        logger.error("Workspace deletion transaction failed", {
            error: err.message
        });
        await session.abortTransaction();
        session.endSession();
        next(err)
    }
}

let updateTeam = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let team = req.team;
    let { name } = req.body;
    if (!name) { return next(new NewError("there is nothing to change", 400)) }
    await updateTeamService(team, name);
    res.json({
        success: true,
        message: "Team update successfully"
    })
}

let deleteMember = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        validateResult(req);
        let id = req.userId;
        let team = req.team;
        let targetId = req.params.userId;
        if (!targetId) {
            return next(new NewError("Invalid Id", 400));
        }
        await deleteMemberService(id,targetId, team, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "User Leaves successfully"
        })
    } catch (e) {
        logger.error("Delete Team Member transaction failed", {
            error: e.message
        });
        await session.abortTransaction();
        session.endSession();
        next(e)
    }
}

let deleteTeam = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        validateResult(req);
        let id = req.userId;
        let team = req.team;
        await deleteTeamService(id, team, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "Team delete successfully"
        })
    } catch (e) {
        logger.error("Team deletion transaction failed", {
            error: e.message
        });
        await session.abortTransaction();
        session.endSession()
        next(e)
    }
}

let leaveTeam = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        validateResult(req);
        let id = req.userId;
        let team = req.team;
        let payload = { id, team }
        await leaveTeamService(payload, session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: "Team Leaves Successfully"
        })
    } catch (err) {
        logger.error("Leaving Team transaction failed", {
            workspaceId,
            error: err.message
        });
        await session.abortTransaction();
        session.endSession();
        next(err)
    }
}

module.exports = {
    createTeam, listUserTeams, teamDetails, listTeamMembers,
    inviteTeam, joinTeam, assignRole,
    updateTeam, deleteMember, deleteTeam, leaveTeam,
}