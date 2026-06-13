import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader";
import InsideDashHeader from "../components/InsideDashHeader";

import userData from "../context/UserContext";
import teamData from "../context/TeamContext";

import "../styles/projectDashboard.css";

import {
    useProject,
    useProjectTasks,
    useProjectStats,
    useUpdateProjectStatus,
    useUpdateMentorApproval
} from "../queries/projectQueries";
import ProjectContext from "../context/ProjectContext";
import { useUploadFile, useDeleteFile, useProjectFiles } from '../queries/fileQueries'

function ProjectDashboard() {

    const navigate = useNavigate();

    const { me } = useContext(userData);

    const { projectId } = useParams();

    const { setProjectId } = useContext(ProjectContext);

    useEffect(() => {
        setProjectId(projectId);

        return () => setProjectId(null);
    }, [projectId])
    // -------------------------
    // Queries
    // -------------------------

    const {
        data,
        isLoading: loadingProject,
        error: projectError
    } = useProject(projectId);

    let project = data?.project;
    let projectRole = data?.projectRole

    const {
        data: tasks = [],
        isLoading: loadingTasks
    } = useProjectTasks(projectId);

    const {
        data: taskStats,
        isLoading: loadingStats
    } = useProjectStats(projectId);

    const loading =
        loadingProject ||
        loadingTasks ||
        loadingStats;

    // -------------------------
    // Mutations
    // -------------------------

    const updateStatus =
        useUpdateProjectStatus(projectId);

    const updateMentor =
        useUpdateMentorApproval(projectId);

    // -------------------------
    // Local UI state only
    // -------------------------

    const handleStatusChange = (e) => {
        updateStatus.mutate(e.target.value);
    };

    const handleMentorApproved = (e) => {
        updateMentor.mutate(e.target.value);
    };

    const { data: files = [], isLoading } = useProjectFiles(projectId);

    const uploadMutation = useUploadFile(projectId);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        uploadMutation.mutate(file);
    };

    const deleteMutation = useDeleteFile(projectId);

    const handleDownload = async (file) => {
        const response = await fetch(file.fileUrl);

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = file.fileName;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    Loading project dashboard...
                </div>
            </div>
        );
    }

    if (projectError || !project) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-panel dashboard-alert">
                    <p>
                        {projectError?.message ||
                            "Project not found."}
                    </p>

                    <Link
                        to="/dashboard"
                        className="dashboard-link-primary"
                    >
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-shell">

                <DashboardHeader me={me} />

                <InsideDashHeader
                    name={project.title}
                    role={project.status}
                    path={`/${projectId}/project-settings`}
                    word="Project"
                />

                <div className="dashboard-grid">

                    {/* LEFT */}
                    <div className="project-left-section">

                        <div className="dashboard-panel">

                            <div className="project-top-row">

                                <div>
                                    <h2 className="dashboard-heading">
                                        Project Overview
                                    </h2>

                                    <p className="project-description">
                                        {project.description}
                                    </p>
                                </div>

                                <div
                                    className={
                                        project.mentorApproved === "APPROVED"
                                            ? "mentor-badge approved"
                                            : "mentor-badge pending"
                                    }
                                >
                                    {project.mentorApproved === "APPROVED"
                                        ? "Mentor Approved"
                                        : "Pending Review"}
                                </div>

                            </div>

                            {/* STATS */}
                            <div className="project-stats-grid">

                                <div className="project-stat-card">
                                    <h3>Status</h3>

                                    {projectRole === "ADMIN" ? (
                                        <select
                                            value={project.status}
                                            onChange={handleStatusChange}
                                            className="project-status-select"
                                        >
                                            <option value="IDEA">IDEA</option>
                                            <option value="IN_PROGRESS">IN PROGRESS</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                        </select>
                                    ) : (
                                        <p>{project.status}</p>
                                    )}
                                </div>

                                <div className="project-stat-card">
                                    <h3>Progress</h3>
                                    <p>
                                        {taskStats?.progress?.completionRate || 0}%
                                    </p>
                                </div>

                                <div className="project-stat-card">
                                    <h3>Mentor Approval</h3>

                                    {projectRole === "LEADER" ? (
                                        <select
                                            value={project.mentorApproved}
                                            onChange={handleMentorApproved}
                                            className="project-status-select"
                                        >
                                            <option value="APPROVED">APPROVED</option>
                                            <option value="REJECTED">REJECTED</option>
                                            <option value="PENDING">PENDING</option>
                                        </select>
                                    ) : (
                                        <p>{project.mentorApproved}</p>
                                    )}
                                </div>

                                <div className="project-stat-card">
                                    <h3>Total Tasks</h3>
                                    <p>{tasks.length}</p>
                                </div>

                            </div>

                            {/* PROGRESS BAR */}
                            <div className="progress-bar-wrapper">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${taskStats?.progress?.completionRate || 0}%`
                                    }}
                                />
                            </div>

                            {/* ACTIONS */}
                            <div className="project-actions">
                                <button
                                    className="dashboard-btn-primary"
                                    onClick={() =>
                                        navigate(`/${projectId}/task-analysis`)
                                    }
                                >
                                    Advanced Analytics
                                </button>
                            </div>

                        </div>

                        {/* TASKS */}
                        <div className="dashboard-panel">

                            <div className="panel-header">
                                <h2 className="dashboard-heading">
                                    Recent Tasks
                                </h2>

                                <button
                                    className="dashboard-btn-primary"
                                    onClick={() =>
                                        navigate(`/${project.teamId._id}/${projectId}/task/new`)
                                    }
                                >
                                    +
                                </button>
                            </div>

                            <div className="task-list">
                                {tasks.map((task) => (
                                    <Link
                                        key={task._id}
                                        to={`/${project._id}/${task._id}/task`}
                                    >
                                        <div className="task-card">
                                            <div>
                                                <h3>{task.title}</h3>
                                                <p>{task.status}</p>
                                            </div>

                                            <span
                                                className={`priority-badge ${task.priority.toLowerCase()}`}
                                            >
                                                {task.priority}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="project-right-section">

                        <div className="dashboard-panel">

                            <h2 className="dashboard-heading">
                                Project Details
                            </h2>

                            <div className="project-meta-list">

                                <div className="project-meta-row">
                                    <span>Repository:</span>

                                    {project.githubRepoUrl ? (
                                        <a
                                            href={project.githubRepoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            GitHub Repo
                                        </a>
                                    ) : (
                                        <strong>Not Added</strong>
                                    )}
                                </div>

                                <div className="project-meta-row">
                                    <span>Team:</span>
                                    <strong>{project?.teamId?.name}</strong>
                                </div>

                                <div className="project-meta-row">
                                    <span>Created:</span>
                                    <strong>
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </strong>
                                </div>

                                <div className="project-meta-row">
                                    <span>Mentor Approval:</span>
                                    <strong>{project.mentorApproved}</strong>
                                </div>

                            </div>

                        </div>
                        {/* FILES */}
                            <div className="dashboard-panel">

                                <h2 className="dashboard-heading">
                                    Task Files
                                </h2>

                                <div className="file-list">

                                    {files.length === 0 ? (

                                        <div className="analytics-empty">
                                            No files uploaded.
                                        </div>

                                    ) : (

                                        files.map((file) => (

                                            <div
                                                key={file._id}
                                                className="file-card"
                                            >

                                                <div className="file-left">

                                                    <div className="file-icon">
                                                        📄
                                                    </div>

                                                    <div>

                                                        <h3>{file.fileName}</h3>

                                                        <p>
                                                            Uploaded by {file.uploadedBy.name}
                                                        </p>

                                                    </div>

                                                </div>

                                                <div className="file-actions">
                                                    <button className="file-btn"
                                                        onClick={() => handleDownload(file)}>
                                                        Download
                                                    </button>
                                                    {projectRole=== "ADMIN" && (
                                                        <button
                                                            className="file-btn delete"
                                                            onClick={() => deleteMutation.mutate(file._id)}
                                                        >
                                                            Delete
                                                        </button>

                                                    )}

                                                </div>

                                            </div>

                                        ))

                                    )}

                                </div>

                                <div className="upload-section">

                                    <input
                                        type="file"
                                        id="file-upload"
                                        hidden
                                        onChange={handleFileChange}
                                    />

                                    <button
                                        className="dashboard-btn-primary"
                                        onClick={() =>
                                            document.getElementById("file-upload").click()
                                        }
                                    >
                                        + Upload File
                                    </button>

                                </div>

                            </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default ProjectDashboard;