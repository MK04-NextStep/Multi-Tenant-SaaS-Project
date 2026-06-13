import React from 'react'
import { useNavigate } from 'react-router-dom'

function InsideDashHeader({ name, role, path, word }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-panel">
      <div className="dashboard-workspace-main">
        <div>
          <h1>{name}</h1>
        </div>

        <div className="dashboard-workspace-main">
          <span className="dashboard-chip">
            {role}
          </span>

          <button
            className="dashboard-workspace-btn-new"
            onClick={() => navigate(path)}
          >
            {word} Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsideDashHeader
