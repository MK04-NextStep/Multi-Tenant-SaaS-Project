let { NewError } = require("../Middleware/errMiddleware");
const { createProjectService,
    mentorApprovedService, getProjectListService,
    userStatusService, deleteProjectService,
    updateProjectService,
    getProjectByStatusService } = require('../Services/projectService');
const validateResult = require('../Utils/ValidateResult')
const mongoose = require('mongoose')
const logger = require("../Utils/logger")

let createProject = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let team = req.team;
    let { title, description = "Add Description",
        status = "IDEA",mentorApproved, githubRepoUrl } = req.body;
    let data = {
        id, title, description,
        workspaceId: team.workspaceId,
        teamId: team._id, status,mentorApproved, githubRepoUrl
    }
    let newProject = await createProjectService(data);
    logger.info("Project created", {
        teamId: team._id,
        projectId: newProject._id,
        createdBy: req.userId
    });
    res.json({
        success: true,
        data: { ...newProject, role: req.teamRole}
    })
}

let getProject = async (req, res, next) => {
    validateResult(req)
    let project = req.project;
    await project.populate("teamId", "name")
    logger.info("Project details fetched", {
        projectId: project._id,
        userId: req.userId
    });
    res.json({
        success: true,
        data: project,
        role: req.projectRole
    })
}

let getProjectList = async (req, res, next) => {
    validateResult(req)
    let team = req.team;
    let teamRole = req.teamRole
    let projectList = await getProjectListService(team);
    logger.info("Project list fetched", {
        teamId: team._id,
        userId: req.userId
    });
    res.json({
        success: true,
        data: projectList
    })
}

let mentorApproved = async (req, res, next) => {
    validateResult(req);
    let project = req.project;
    let id = req.userId;
    let { status } = req.body;
    let role = req.projectRole
    await mentorApprovedService(id, project, status, role);
    logger.info("Mentor updated project status", {
        projectId: project._id,
        mentorId: req.userId,
        status
    });
    return res.json({
        success: true,
        message: "Project got analysed by leader"
    })
}

let userstatus = async (req, res, next) => {
    validateResult(req);
    let project = req.project;
    let { status } = req.body;
    let role = req.projectRole
    await userStatusService(project, status, role);
    logger.info("User updated project status", {
        projectId: project._id,
        userId: req.userId,
        status
    });
    return res.json({
        success: true,
        message: "Status Updated"
    })
}

let deleteProject = async (req, res, next) => {
    validateResult(req)
    let project = req.project;
    let role = req.projectRole
    let id = req.userId;
    await deleteProjectService(id, project, role);
    logger.info("Project deleted", {
        projectId: project._id,
        deletedBy: req.userId
    });
    res.json({
        success: true,
        message: "Project deleted successfully"
    })
}

let updateProject = async (req, res, next) => {
    validateResult(req)

    let project = req.project;
    let role = req.projectRole;
    let id = req.userId
    let { title, description, githubRepoUrl } = req.body;
    let updateData = {};
    if (title) { updateData.title = title }
    if (description) { updateData.description = description }
    if (githubRepoUrl) { updateData.url = githubRepoUrl };
    await updateProjectService(id, updateData, project, role);
    logger.info("Project updated", {
        projectId: project._id,
        updatedBy: req.userId
    });
    res.json({
        success: true,
        message: "Project updated successfully"
    })
}

let getProjectByStatus = async (req, res, next) => {
    validateResult(req)
    let team = req.team;
    let id = req.userId;
    let { status } = req.query;
    let list = await getProjectByStatusService(team, status);
    logger.info("Projects filtered by status", {
        teamId: team._id,
        status,
        userId: req.userId
    });
    console.log(list)
    res.json({
        success: true,
        data: list
    })
}

module.exports = {
    createProject, getProject, mentorApproved,
    userstatus, getProjectList, deleteProject, updateProject,
    getProjectByStatus
}