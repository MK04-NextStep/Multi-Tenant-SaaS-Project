import '../styles/workspaceSettings.css';

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader";
import MemberManagment from "../components/MemberManagment";
import LeaveSection from "../components/LeaveSection";
import DeleteSection from "../components/DeleteSection";

import {
  useTeam,
  useTeamMembers,
  useUpdateTeam,
  useLeaveTeam,
  useRemoveTeamMember
} from "../queries/teamQueries";

function TeamSettings() {
  const { teamId } = useParams();

  const {
    data,
    isLoading: loadingTeam
  } = useTeam(teamId);

  const {
    data: members = [],
    isLoading: loadingMembers
  } = useTeamMembers(teamId);

  const team = data?.team;
  const teamRole = data?.role;

  const updateTeamMutation =
    useUpdateTeam(teamId);

  const leaveTeamMutation =
    useLeaveTeam(teamId);

  const removeMemberMutation =
    useRemoveTeamMember(teamId);

  const [form, setForm] = useState({
    name: ""
  });

  useEffect(() => {
    if (!team) return;

    setForm({
      name: team.name
    });
  }, [team]);

  const handleUpdateTeam = () => {
    updateTeamMutation.mutate({
      name: form.name
    });
  };

  if (loadingTeam || loadingMembers) {
    return <div>Loading...</div>;
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
                  Update team information.
                </p>

                <div className="settings-form">

                  <div className="settings-group">
                    <label>Team Name</label>

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

                  <button
                    className="settings-save-btn"
                    onClick={handleUpdateTeam}
                    disabled={updateTeamMutation.isPending}
                  >
                    {
                      updateTeamMutation.isPending
                        ? "Saving..."
                        : "Save Changes"
                    }
                  </button>

                </div>
              </div>
            )}

            {(teamRole === "ADMIN" ||
              teamRole === "LEADER") && (
              <MemberManagment
                word="Team"
                members={members}
                removeMemberMutation={removeMemberMutation}
              />
            )}

          </div>

          {/* RIGHT */}
          <div className="settings-right">

            <LeaveSection
              word="Team"
              leaveMutation={leaveTeamMutation}
            />

            {teamRole === "ADMIN" && (
              <DeleteSection
                word="Team"
                api={`/team/${teamId}/delete`}
              />
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default TeamSettings
