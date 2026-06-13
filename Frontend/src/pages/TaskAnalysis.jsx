import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStats } from '../queries/statsQueries';
import DashboardHeader from '../components/DashboardHeader';
import InsideDashHeader from '../components/InsideDashHeader';
import '../styles/TaskAnalysis.css';

function TaskAnalysis() {

  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading,
    error,
  } = useProjectStats(projectId);

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-panel dashboard-alert">

          <p>
            {error?.message || 'Analytics not found.'}
          </p>

          <button
            className="analytics-back-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <DashboardHeader />
        <InsideDashHeader
          name="Project Analytics"
          role="Advanced Insights"
        />

        {/* TOP STATS */}
        <div className="analytics-grid">

          <div className="analytics-card">
            <h3>Total Tasks</h3>
            <p>{stats?.overview?.totalTasks || 0}</p>
          </div>

          <div className="analytics-card">
            <h3>Completed</h3>
            <p>{stats?.overview?.completed || 0}</p>
          </div>

          <div className="analytics-card">
            <h3>In Progress</h3>
            <p>{stats?.overview?.inProgress || 0}</p>
          </div>

          <div className="analytics-card">
            <h3>Overdue</h3>
            <p>{stats?.overview?.overdue || 0}</p>
          </div>

        </div>

        {/* PROGRESS */}
        <div className="dashboard-panel">

          <div className="analytics-header">

            <h2 className="dashboard-heading">
              Project Progress
            </h2>

            <button
              className="analytics-back-btn"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

          </div>

          <div className="progress-wrapper">

            <div
              className="progress-fill"
              style={{
                width: `${stats?.progress?.completionRate || 0}%`
              }}
            ></div>

          </div>

          <p className="progress-text">
            {stats?.progress?.completionRate || 0}% Completed
          </p>

        </div>

        {/* PRODUCTIVITY + DEPENDENCIES */}
        <div className="analytics-two-column">

          {/* PRODUCTIVITY */}
          <div className="dashboard-panel">

            <h2 className="dashboard-heading">
              Productivity
            </h2>

            <div className="analytics-list">

              <div className="analytics-row">
                <span>Tasks Created This Week</span>

                <strong>
                  {stats?.productivity?.tasksCreatedThisWeek || 0}
                </strong>
              </div>

              <div className="analytics-row">
                <span>Tasks Completed This Week</span>

                <strong>
                  {stats?.productivity?.tasksCompletedThisWeek || 0}
                </strong>
              </div>

              <div className="analytics-row">
                <span>Net Flow</span>

                <strong>
                  {stats?.productivity?.netFlow || 0}
                </strong>
              </div>

            </div>

          </div>

          {/* DEPENDENCIES */}
          <div className="dashboard-panel">

            <h2 className="dashboard-heading">
              Dependencies
            </h2>

            <div className="analytics-list">

              <div className="analytics-row">
                <span>Blocked Tasks</span>

                <strong>
                  {stats?.dependencies?.blockedTasks || 0}
                </strong>
              </div>

              <div className="analytics-row">
                <span>Blocking Tasks</span>

                <strong>
                  {stats?.dependencies?.blockingTasks || 0}
                </strong>
              </div>

              <div className="analytics-row">
                <span>High Priority Overdue</span>

                <strong>
                  {stats?.priority?.highPriorityOverdue || 0}
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* ASSIGNEES */}
        <div className="dashboard-panel">

          <h2 className="dashboard-heading">
            Assignee Workload
          </h2>

          <div className="assignee-list">

            {stats?.assignees?.length === 0 ? (

              <div className="analytics-empty">
                No assignee data available.
              </div>

            ) : (

              stats?.assignees?.map((user) => (

                <div
                  key={user._id}
                  className="assignee-card"
                >

                  <div>

                    <h3>
                      {user?.name || 'Unknown User'}
                    </h3>

                    <p>
                      {user?.assignedTasks || 0} Tasks Assigned
                    </p>

                    <p>
                      {user?.completedTasks || 0} Completed Tasks
                    </p>

                    <p>
                      {user?.overduedTasks || 0} Overdue Tasks
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

        {/* PRIORITY DISTRIBUTION */}
        <div className="dashboard-panel">

          <h2 className="dashboard-heading">
            Priority Distribution
          </h2>

          <div className="distribution-list">

            {stats?.priority?.distribution?.length === 0 ? (

              <div className="analytics-empty">
                No priority data available.
              </div>

            ) : (

              stats?.priority?.distribution?.map((item, idx) => (

                <div
                  key={idx}
                  className="distribution-row"
                >

                  <span>{item?._id}</span>

                  <strong>{item?.count}</strong>

                </div>

              ))

            )}

          </div>

        </div>

        {/* UPCOMING DEADLINES */}
        <div className="dashboard-panel">

          <h2 className="dashboard-heading">
            Upcoming Deadlines
          </h2>

          <div className="deadline-list">

            {stats?.deadlines?.upcoming?.length === 0 ? (

              <div className="analytics-empty">
                No upcoming deadlines.
              </div>

            ) : (

              stats?.deadlines?.upcoming?.map((task, idx) => (

                <div
                  key={idx}
                  className="deadline-card"
                >

                  <div>

                    <h3>{task?.title}</h3>

                    <p>
                      {task?.dueDate
                        ? new Date(task.dueDate)
                          .toLocaleDateString()
                        : 'No Due Date'}
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default TaskAnalysis;