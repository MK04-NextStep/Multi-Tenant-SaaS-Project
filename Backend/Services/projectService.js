let projectModel = require('../Model/projectModel');
let userModel = require('../Model/userModel')
let { NewError } = require("../Middleware/errMiddleware");
let teamModel = require("../Model/teamModel")
let logger = require("../Utils/logger")
let notificationModel = require('../Model/NotificationModel');
const validateResult = require('../Utils/ValidateResult');
const { getIo } = require("../socket");

let createProjectService = async (data) => {
    let { id, title, description = "Add Description", workspaceId,
        teamId, status = "IDEA", mentorApproved, githubRepoUrl } = data;
    let newProject = await projectModel.create({
        title, description,
        workspaceId, teamId, status, mentorApproved,
        createdBy: id, githubRepoUrl
    });
    if (!newProject) {
        logger.error("Project creation failed", {
            teamId,
            error: err.message
        });
        throw new NewError("project is not created", 500)
    }
    let members = await teamModel.findById(teamId).select("members").lean()
    getIo().to(teamId.toString())
    .emit("project-created", {
        teamId: teamId.toString(),
        projectId: newProject._id.toString()
    })


    let notifications = members.members
        .filter(member => member.userId.toString() !== id.toString())
        .map(member => ({
            userId: member.userId,
            workspaceId: workspaceId,
            type: "PROJECT_CREATED",
            entityId: newProject._id,
            entityType: "PROJECT",
            to: "WORKSPACE",
            message: `Project ${newProject.title} is created`,
            metadata: {
                projectName: newProject.title,
                deletedBy: id
            }
        }))
    await notificationModel.insertMany(notifications);

    notifications.forEach(notification => {
        getIo()
            .to(notification.userId.toString())
            .emit("notification-created");
    });
    return newProject;
}

let getProjectListService = async (team) => {
    let projectList = await projectModel.find({
        teamId: team._id,
        workspaceId: team.workspaceId
    }).populate()
    return projectList;
}

let mentorApprovedService = async (id, project, status, role) => {
    if (role !== "LEADER") {
        logger.warn("Unauthorized mentor approval attempt", {
            projectId: project._id,
            mentorId: id
        });
        throw new NewError("Access Denied", 403)
    }
    if (status.toLowerCase() === "rejected") {
        project.mentorApproved = "REJECTED";
    }
    if (status.toLowerCase() === "approved") {
        project.mentorApproved = "APPROVED";
        project.approvedBy = id;
    }
    project.evaluatedAt = Date.now();
    await project.save();
    let entityType = status === "approved" ? "PROJECT_APPROVED" : "PROJECT_REJECTED";
    let members = await teamModel.findById(project.teamId).select("members").lean()
    let notifications = members.members
        .filter(member => member.userId.toString() !== id.toString())
        .map(member => ({
            userId: member.userId,
            workspaceId: project.workspaceId,
            teamId: project.teamId,
            type: entityType,
            entityId: project._id,
            entityType: "PROJECT",
            to: "TEAM",
            message: `Project ${project.name} is ${status}`,
            metadata: {
                projectName: project.name,
                evaluatedBy: id
            }
        }))
    getIo()
        .to(project._id.toString())
        .emit("project-updated", {
            projectId: project._id.toString()
        });
    await notificationModel.insertMany(notifications);
    return;
}

let userStatusService = async (project, status, role) => {
    project.status = status;
    await project.save();
    getIo()
        .to(project._id.toString())
        .emit("project-updated", {
            projectId: project._id.toString()
        });
    return;
}

let deleteProjectService = async (id, project, role) => {
    await projectModel.findByIdAndDelete(project._id);
    let note = getIo().to(project._id.toString())
    .emit("project-deleted",{
        teamId: project.teamId.toString(),
        projectId: project._id
    })
    return;
}

let updateProjectService = async (id, updateData, project, role) => {
    let newData = await projectModel.findByIdAndUpdate(
        project._id, updateData, { new: true })
    if (!newData) {
        throw new NewError("Data did not updated", 404)
    }
    let note = getIo()
        .to(project._id.toString())
        .emit("project-updated", {
            projectId: project._id.toString()
        });
    console.log(note)
    return;
}

let getProjectByStatusService = async (team, status) => {
    let list = await projectModel.find(
        {
            teamId: team._id,
            workspaceId: team.workspaceId,
            status
        }
    )
    if (list.length <= 0) {
        return []
    }
    return list;
}

module.exports = {
    createProjectService,
    mentorApprovedService, getProjectListService,
    userStatusService, deleteProjectService, updateProjectService,
    getProjectByStatusService
}