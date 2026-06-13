import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import "../styles/worksapceDashboard.css";

import DashboardHeader from "../components/DashboardHeader";
import InsideDashHeader from "../components/InsideDashHeader";
import EntityList from "../components/EntityList";
import Invite from "../components/Invite";
import List from "../components/List";

import TeamContext from "../context/TeamContext";

import {
    useTeam,
    useTeamMembers,
    useTeamProjects,
    useUpdateTeamRole
} from "../queries/teamQueries";

function TeamDashboard() {
    const navigate = useNavigate();
    const {teamId} = useParams();
    const [filter, setFilter] = useState("ALL");

    const {
        setTeamId,
    } = useContext(TeamContext);

    // Keep TeamContext synced
    useEffect(() => {
        setTeamId(teamId);

        return () => setTeamId(null);
    }, [teamId]);

    // -------------------------
    // Queries
    // -------------------------

    const {
        data,
        isLoading: loadingTeam
    } = useTeam(teamId);

    let team = data?.team;
    let teamRole = data?.role;

    const {
        data: members = [],
        isLoading: loadingMembers
    } = useTeamMembers(teamId);

    const {
        data: projects = [],
        isLoading: loadingProjects
    } = useTeamProjects(teamId);

    const loading =
        loadingTeam ||
        loadingMembers ||
        loadingProjects;

    // -------------------------
    // Mutations
    // -------------------------

    const updateRoleMutation =
        useUpdateTeamRole(teamId);

    const handleRoleChange = (userId, role) => {
        updateRoleMutation.mutate({
            userId,
            role
        });
    };

    // -------------------------
    // Filtering
    // -------------------------

    const displayedProjects =
        filter === "ALL"
            ? projects
            : projects.filter(
                project =>
                    project.status === filter
            );

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    Loading Team dashboard...
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-panel dashboard-alert">
                    <p>Team not found.</p>

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

                <DashboardHeader workspaceId={team.workspaceId}/>

                <InsideDashHeader
                    name={team.name}
                    role={teamRole}
                    path={`/${teamId}/team-settings`}
                    word={"Team"}
                />

                <div className="dashboard-grid">

                    <div className="team-grid">

                        <div className="notification-actions">

                            <button
                                className="dashboard-btn-primary"
                                onClick={() => setFilter("ALL")}
                            >
                                All
                            </button>

                            <button
                                className="dashboard-btn-primary"
                                onClick={() =>
                                    setFilter("IN_PROGRESS")
                                }
                            >
                                In Progress
                            </button>

                            <button
                                className="dashboard-btn-primary"
                                onClick={() =>
                                    setFilter("COMPLETED")
                                }
                            >
                                Completed
                            </button>

                            <button
                                className="dashboard-btn-primary"
                                onClick={() =>
                                    setFilter("IDEA")
                                }
                            >
                                Idea
                            </button>

                        </div>

                        <EntityList
                            list={displayedProjects}
                            heading="Your Projects"
                            createPath={`/${teamId}/project/new`}
                            routePrefix="project"
                            displayKey="title"
                            badgeKey="status"
                            role={teamRole}
                        />

                        {teamRole === "ADMIN" && (
                            <Invite
                                path={`/team/invite/${teamId}`}
                            />
                        )}

                    </div>

                    <div className="dashboard-panel">

                        <h2 className="dashboard-heading">
                            Team Members
                        </h2>

                        <p className="dashboard-hint">
                            Manage member access and permissions.
                        </p>

                        <div className="team-gap">

                            {members.map((member) => (
                                <List
                                    key={member.userId._id}
                                    member={member}
                                    role={teamRole || role}
                                    handleRoleChange={
                                        handleRoleChange
                                    }
                                />
                            ))}

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default TeamDashboard;