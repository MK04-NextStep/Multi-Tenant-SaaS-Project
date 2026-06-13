import { useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../styles/worksapceDashboard.css';

import DashboardHeader from '../components/DashboardHeader';
import InsideDashHeader from '../components/InsideDashHeader';
import List from '../components/List';
import Invite from '../components/Invite';
import EntityList from '../components/EntityList';

import socket from '../socket';

// React Query hooks
import { useWorkspace, useWorkspaceMembers, useWorkspaceTeams, useUpdateWorkspaceRole } from '../queries/workspaceQueries'
import WorkspaceContext from '../context/WorkspaceContext';

function WorkspaceDashboard() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { setWorkspaceId } = useContext(WorkspaceContext);

  useEffect(() => {
    setWorkspaceId(workspaceId);

    return () => setWorkspaceId(null);
  }, [workspaceId]);

  // -------------------------
  // React Query DATA
  // -------------------------
  const {
    data,
    isLoading: loadingWorkspace,
    error
  } = useWorkspace(workspaceId);

  const workspace = data?.workspace;
  const workspaceRole = data?.role;
  const { data: members = [], isLoading: loadingMembers } =
    useWorkspaceMembers(workspaceId);

  const { data: teamList = [], isLoading: loadingTeams } =
    useWorkspaceTeams(workspaceId);

  const loading = loadingWorkspace || loadingMembers || loadingTeams;
  const updateRoleMutation =
    useUpdateWorkspaceRole(workspaceId);

  const handleRoleChange = (userId, role) => {
    updateRoleMutation.mutate({
      userId,
      role
    });
  };


  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          Loading workspace dashboard...
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-panel dashboard-alert">
          <p>Workspace not found.</p>

          <Link to="/dashboard" className="dashboard-link-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">

        {/* TOP BAR */}
        <DashboardHeader workspaceId={workspaceId}/>

        {/* WORKSPACE HEADER */}
        <InsideDashHeader
          name={workspace.name}
          role={workspaceRole}
          path={`/${workspaceId}/workspace-settings`}
          word="Workspace"
        />

        <div className="dashboard-grid">

          {/* TEAMS */}
          <div className="team-grid">
            <EntityList
              list={teamList}
              heading="Your Teams"
              createPath={`/team/${workspaceId}/new`}
              routePrefix="team"
              displayKey="name"
              badgeKey="role"
              role={workspaceRole}
            />

            {workspaceRole === "ADMIN" && (
              <Invite path={`/workspace/invite/${workspaceId}`} />
            )}
          </div>

          {/* MEMBERS */}
          <div className="dashboard-panel">
            <h2 className="dashboard-heading">Workspace Members</h2>
            <p className="dashboard-hint">
              Manage member access and permissions.
            </p>

            <div className="team-gap">
              {members.map((member) => (
                <List
                  key={member.userId._id}
                  member={member}
                  role={workspaceRole}
                  handleRoleChange={handleRoleChange}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default WorkspaceDashboard;