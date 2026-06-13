import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../styles/Workspace.css";

import WorkspaceContext from "../context/WorkspaceContext";
import { useCreateTeam } from "../queries/teamQueries";

function Team() {
    const navigate = useNavigate();
    const {workspaceId} = useParams()

    const [name, setName] = useState("");
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    const createTeamMutation =
        useCreateTeam();

    const validate = () => {
        const nextErrors = {};

        if (!name.trim()) {
            nextErrors.name =
                "Team name is required.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setServerError("");
        setSuccessMessage("");

        if (!validate()) return;

        createTeamMutation.mutate(
            {
                name: name.trim(),
                workspaceId
            },
            {
                onSuccess: () => {
                    setSuccessMessage(
                        "Team created successfully. Redirecting..."
                    );

                    setName("");

                    setTimeout(() => {
                        navigate(
                            `/workspace/${workspaceId}`
                        );
                    }, 600);
                },

                onError: (error) => {
                    setServerError(error.message);
                }
            }
        );
    };

    return (
        <div className="workspace-page">
            <div className="workspace-card">

                <div className="workspace-header">
                    <h1>Create a Team</h1>
                    <p>
                        Add a new team under your
                        workspace.
                    </p>
                </div>

                <form
                    className="workspace-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {serverError && (
                        <div className="workspace-error">
                            {serverError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="workspace-success">
                            {successMessage}
                        </div>
                    )}

                    <div className="form-group">

                        <label htmlFor="team-name">
                            Team Name
                        </label>

                        <input
                            id="team-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);

                                setErrors(prev => ({
                                    ...prev,
                                    name: ""
                                }));
                            }}
                            placeholder="Enter team name"
                            className={
                                errors.name
                                    ? "input-error"
                                    : ""
                            }
                            disabled={
                                createTeamMutation.isPending
                            }
                        />

                        {errors.name && (
                            <p className="error-message">
                                {errors.name}
                            </p>
                        )}

                    </div>

                    <div className="workspace-actions">

                        <button
                            type="submit"
                            className="workspace-submit"
                            disabled={
                                createTeamMutation.isPending ||
                                !name.trim()
                            }
                        >
                            {createTeamMutation.isPending
                                ? "Creating..."
                                : "Create Team"}
                        </button>

                        <Link
                            to={`/workspace/${workspaceId}`}
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

export default Team;