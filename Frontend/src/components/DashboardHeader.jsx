import '../styles/dashbordHeader.css'
import { authorizedFetch, getAccessToken } from "../lib/api"
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useMe} from '../queries/dashboardQueries'

function DashboardHeader({ workspaceId = null }) {
    const {
        data: me,
        isLoading: meLoading,
        error: meError
    } = useMe(); const navigate = useNavigate();

    const logout = async () => {
        try {
            await authorizedFetch('/auth/logout', {
                method: 'POST',
            });
        } catch (err) {
            setError(err.message || 'Logout failed');
        } finally {
            localStorage.removeItem('accessToken');
            navigate('/login');
        }
    };

    return (
        <div className="dashboard-top-bar">
            <div className="dashboard-brand">
                <span className="dashboard-logo">◎</span>
                <div>
                    <p className="dashboard-title">Dashboard</p>
                    <p className="dashboard-sub">Workspaces and people you share spaces with.</p>
                </div>
            </div>
            <div className="dashboard-user-block">
                {me.avatar ? (
                    <img src={me.avatar} alt="" className="dashboard-avatar" />
                ) : (
                    <div className="dashboard-avatar dashboard-avatar-fallback">
                        {(me.name || me.email || '?').charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="dashboard-user-meta">
                    <p className="dashboard-user-name">{me.name}</p>
                    <p className="dashboard-user-email">{me.email}</p>
                </div>
                <button type="button" className="dashboard-btn-ghost" onClick={logout}>
                    Log out
                </button>
                {workspaceId ?
                    <Link to={`/${workspaceId}/notification`}>
                        <button type="button" className="dashboard-btn-ghost">
                            Notifications
                        </button>
                    </Link> :
                    <Link to={'/notification'}>
                        <button type="button" className="dashboard-btn-ghost">
                            Notifications
                        </button>
                    </Link>}

            </div>
        </div>
    )
}

export default DashboardHeader
