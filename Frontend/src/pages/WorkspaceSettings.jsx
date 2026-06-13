import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader";
import MemberManagment from "../components/MemberManagment";
import LeaveSection from "../components/LeaveSection";
import DeleteSection from "../components/DeleteSection";
import {
  useWorkspace,
  useWorkspaceMembers,
  useUpdateWorkspace, useLeaveWorkspace, useRemoveWorkspaceMember
} from "../queries/workspaceQueries";

function WorkspaceSettings() {
  const { workspaceId } = useParams();

  const {
    data,
    isLoading: loadingWorkspace,
    error
  } = useWorkspace(workspaceId);

  const { data: members = [], isLoading: loadingMembers } =
    useWorkspaceMembers(workspaceId);
  const workspace = data?.workspace;
  const workspaceRole = data?.role;

  const updateWorkspaceMutation =
    useUpdateWorkspace(workspaceId);

  const removeMemberMutation =
    useRemoveWorkspaceMember(workspaceId);

  const [form, setForm] = useState({
    name: "",
    type: "PERSONAL"
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workspace) return;

    setForm({
      name: workspace.name,
      type: workspace.type
    });
  }, [workspace]);

  const handleUpdateWorkspace = () => {
    updateWorkspaceMutation.mutate({
      name: form.name,
      type: form.type
    });
  };

  const leaveWorkspaceMutation =
    useLeaveWorkspace(workspaceId);

  if (loadingWorkspace || loadingMembers) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <DashboardHeader />

        <div className="settings-layout">

          {/* LEFT */}
          <div className="settings-left">

            {workspaceRole === "ADMIN" && (
              <div className="dashboard-panel">

                <h2 className="dashboard-heading">
                  General Settings
                </h2>

                <p className="dashboard-hint">
                  Update workspace information.
                </p>

                <div className="settings-form">

                  <div className="settings-group">
                    <label>Workspace Name</label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm(prev => ({
                          ...prev,
                          name: e.target.value
                        }))
                      }
                      className="settings-input"
                    />
                  </div>

                  <div className="settings-group">
                    <label>Workspace Type</label>

                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm(prev => ({
                          ...prev,
                          type: e.target.value
                        }))
                      }
                      className="settings-input"
                    >
                      <option value="PERSONAL">
                        Personal
                      </option>

                      <option value="PUBLIC">
                        Public
                      </option>
                    </select>
                  </div>

                  <button
                    className="settings-save-btn"
                    onClick={handleUpdateWorkspace}
                    disabled={updateWorkspaceMutation.isPending}
                  >
                    {
                      updateWorkspaceMutation.isPending
                        ? "Saving..."
                        : "Save Changes"
                    }
                  </button>

                </div>
              </div>
            )}

            {(workspaceRole === "ADMIN" ||
              workspaceRole === "LEADER") && (
                <MemberManagment
                  word="Workspace"
                  members={members}
                  removeMemberMutation={removeMemberMutation}
                />
              )}

          </div>

          {/* RIGHT */}
          <div className="settings-right">

            <LeaveSection
              word="Workspace"
              leaveMutation={leaveWorkspaceMutation}
            />

            {workspaceRole === "ADMIN" && (
              <DeleteSection
                word="Workspace"
                api={`/workspace/${workspaceId}/delete`}
              />
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default WorkspaceSettings;