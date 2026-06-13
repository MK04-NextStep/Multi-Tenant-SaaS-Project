import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";

import "../styles/Dashboard.css";

import DashboardHeader from "../components/DashboardHeader";
import EntityList from "../components/EntityList";
import UserSearch from "../components/UserSearch";

import userData from "../context/UserContext";

import { useMyWorkspaces, useMe } from "../queries/dashboardQueries";

function Dashboard() {

    const { setUserId, setMe } = useContext(userData)

    const {
        data: me,
        isLoading: meLoading,
        error: meError
    } = useMe();

    useEffect(() => {
        setUserId(me?._id)
    }, [me])

    const {
        data: workspaces = [],
        isLoading: workspaceLoading,
        error
    } = useMyWorkspaces();

    const loading =
        meLoading ||
        workspaceLoading;

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    Loading your dashboard...
                </div>
            </div>
        );
    }

    if (!me) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-card dashboard-alert">
                    <p>
                        You need to sign in again.
                    </p>

                    <Link
                        to="/login"
                        className="dashboard-link-primary"
                    >
                        Go to sign in
                    </Link>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-card dashboard-alert">
                    <p>{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-shell">

                <DashboardHeader />

                <main className="dashboard-grid">

                    <EntityList
                        list={workspaces}
                        heading="Your Workspaces"
                        createPath="/workspace/new"
                        routePrefix="workspace"
                        displayKey="name"
                        badgeKey="role"
                        role="ADMIN"
                    />

                    <UserSearch />

                </main>

            </header>
        </div>
    );
}

export default Dashboard;