import { useState } from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import "../styles/Workspace.css";

import {
    useCreateProject
} from "../queries/projectQueries";

function Project() {

    const navigate = useNavigate();

    const { teamId } = useParams();
    console.log(teamId)

    const createProject =
        useCreateProject();

    const [formData, setFormData] =
        useState({
            title: "",
            description: "",
            status: "IDEA",
            githubRepoUrl: ""
        });

    const [errors, setErrors] =
        useState({});

    const [serverError, setServerError] =
        useState("");

    const validate = () => {

        const nextErrors = {};

        if (!formData.title.trim()) {
            nextErrors.title =
                "Project title is required.";
        }

        if (
            formData.githubRepoUrl.trim() &&
            !/^https?:\/\/(www\.)?github\.com\/.+/i.test(
                formData.githubRepoUrl.trim()
            )
        ) {
            nextErrors.githubRepoUrl =
                "Enter a valid GitHub repository URL.";
        }

        setErrors(nextErrors);

        return (
            Object.keys(nextErrors)
                .length === 0
        );
    };

    const handleChange = (event) => {

        const { name, value } =
            event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));

        setServerError("");
    };

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setServerError("");

        if (!validate()) {
            return;
        }

        try {

            await createProject.mutateAsync({
                teamId,

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                status:
                    formData.status,

                githubRepoUrl:
                    formData.githubRepoUrl.trim()
            });

            navigate(
                `/team/${teamId}`
            );

        } catch (error) {

            setServerError(
                error.message ||
                "Could not create project."
            );
        }
    };

    return (
        <div className="workspace-page">
            <div className="workspace-card">

                <div className="workspace-header">
                    <h1>Create Project</h1>

                    <p>
                        Add project details
                        below.
                    </p>
                </div>

                <form
                    className="workspace-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {serverError && (
                        <div
                            className="workspace-error"
                        >
                            {serverError}
                        </div>
                    )}

                    <div className="form-group">

                        <label>
                            Project Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={
                                formData.title
                            }
                            onChange={
                                handleChange
                            }
                        />

                        {errors.title && (
                            <p className="error-message">
                                {errors.title}
                            </p>
                        )}

                    </div>

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            rows={5}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={
                                formData.status
                            }
                            onChange={
                                handleChange
                            }
                        >
                            <option value="IDEA">
                                IDEA
                            </option>

                            <option value="PLANNING">
                                PLANNING
                            </option>

                            <option value="IN_PROGRESS">
                                IN PROGRESS
                            </option>

                            <option value="COMPLETED">
                                COMPLETED
                            </option>
                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            GitHub URL
                        </label>

                        <input
                            type="url"
                            name="githubRepoUrl"
                            value={
                                formData.githubRepoUrl
                            }
                            onChange={
                                handleChange
                            }
                        />

                        {errors.githubRepoUrl && (
                            <p className="error-message">
                                {
                                    errors.githubRepoUrl
                                }
                            </p>
                        )}

                    </div>

                    <div className="workspace-actions">

                        <button
                            type="submit"
                            className="workspace-submit"
                            disabled={
                                createProject.isPending
                            }
                        >
                            {createProject.isPending
                                ? "Creating..."
                                : "Create Project"}
                        </button>

                        <Link
                            to={`/team/${teamId}`}
                            className="workspace-cancel"
                        >
                            Cancel
                        </Link>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default Project;