import "../styles/workspaceSettings.css";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader";
import DeleteSection from "../components/DeleteSection";

import {
    useProject,
    useUpdateProject
} from "../queries/projectQueries";

function ProjectSettings() {

    const { projectId } = useParams();

    const {
        data,
        isLoading
    } = useProject(projectId);

    const project = data?.project;
    const teamRole = data?.projectRole;

    const updateProjectMutation =
        useUpdateProject(projectId);

    const [form, setForm] = useState({
        title: "",
        description: "",
        githubRepoUrl: ""
    });

    useEffect(() => {

        if (!project) return;

        setForm({
            title: project.title || "",
            description:
                project.description || "",
            githubRepoUrl:
                project.githubRepoUrl || ""
        });

    }, [project]);

    const handleUpdateProject = () => {

        updateProjectMutation.mutate({
            title: form.title,
            description:
                form.description,
            githubRepoUrl:
                form.githubRepoUrl
        });

    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!project) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-shell">
                    <div className="dashboard-panel">
                        Project not found.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            <div className="dashboard-shell">

                <DashboardHeader />

                <div className="settings-layout">

                    {/* LEFT */}

                    <div className="settings-left">

                        {teamRole === "ADMIN" && (

                            <div className="dashboard-panel">

                                <h2 className="dashboard-heading">
                                    General Settings
                                </h2>

                                <p className="dashboard-hint">
                                    Update project information.
                                </p>

                                <div className="settings-form">

                                    <div className="settings-group">

                                        <label>
                                            Project Name
                                        </label>

                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) =>
                                                setForm(prev => ({
                                                    ...prev,
                                                    title:
                                                        e.target.value
                                                }))
                                            }
                                            className="settings-input"
                                        />

                                    </div>

                                    <div className="settings-group">

                                        <label>
                                            Project Description
                                        </label>

                                        <textarea
                                            rows={5}
                                            value={
                                                form.description
                                            }
                                            onChange={(e) =>
                                                setForm(prev => ({
                                                    ...prev,
                                                    description:
                                                        e.target.value
                                                }))
                                            }
                                            className="settings-input settings-textarea"
                                        />

                                    </div>

                                    <div className="settings-group">

                                        <label>
                                            GitHub Repository URL
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.githubRepoUrl
                                            }
                                            onChange={(e) =>
                                                setForm(prev => ({
                                                    ...prev,
                                                    githubRepoUrl:
                                                        e.target.value
                                                }))
                                            }
                                            className="settings-input"
                                        />

                                    </div>

                                    <button
                                        className="settings-save-btn"
                                        onClick={
                                            handleUpdateProject
                                        }
                                        disabled={
                                            updateProjectMutation.isPending
                                        }
                                    >
                                        {
                                            updateProjectMutation.isPending
                                                ? "Saving..."
                                                : "Save Changes"
                                        }
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                    {/* RIGHT */}

                    <div className="settings-right">

                        {teamRole === "ADMIN" && (

                            <DeleteSection
                                word="Project"
                                api={`/project/${projectId}/delete`}
                            />

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ProjectSettings;