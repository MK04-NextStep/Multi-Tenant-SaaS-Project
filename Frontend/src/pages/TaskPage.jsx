import {
  useContext,
  useEffect,
  useState
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  Link
} from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import InsideDashHeader from "../components/InsideDashHeader";
import userData from "../context/UserContext";
import TeamContext from "../context/TeamContext";
import TaskContext from "../context/TaskContext";
import {
  useTask,
  useTaskComments,
  useUpdateTaskStatus,
  useAddComment,
  useEditComment,
  useDeleteComment
} from "../queries/taskQueries";
import { useProject } from "../queries/projectQueries";
import UserContext from "../context/UserContext";


function TaskPage() {
  const navigate = useNavigate();

  const { userId } = useContext(UserContext)
  const { taskId } = useParams();
  const { projectId } = useParams();

  const {
    setTaskId
  } = useContext(TaskContext);

  useEffect(() => {
    setTaskId(taskId);

    return () => setTaskId(null);
  }, [taskId]);

  const {
    data: projectData,
    isLoading: loadingProject,
    error: projectError
  } = useProject(projectId);

  const project = projectData?.project;

  const {
    data: taskData,
    isLoading: loadingTask,
    error: taskError
  } = useTask(projectId, taskId);

  const task = taskData?.task;
  const role = taskData?.role;

  const {
    data: comments = [],
    isLoading: loadingComments
  } = useTaskComments(
    projectId,
    taskId
  );

  const loading =
    loadingTask ||
    loadingComments;

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  const updateStatusMutation =
    useUpdateTaskStatus(
      project?._id,
      taskId
    );

  const addCommentMutation =
    useAddComment(
      projectId,
      taskId
    );

  const editCommentMutation =
    useEditComment(taskId);

  const deleteCommentMutation =
    useDeleteComment(
      project?._id,
      taskId
    );

  const handleAddComment = () => {

    if (!newComment.trim()) {
      return;
    }

    addCommentMutation.mutate(
      newComment.trim(),
      {
        onSuccess: () => {
          setNewComment("");
        }
      }
    );
  };

  const handleStatusChange = (e) => {
    updateStatusMutation.mutate(
      e.target.value
    );
  };

  const handleDeleteComment = (
    commentId
  ) => {

    if (role !== "ADMIN") {
      return;
    }

    deleteCommentMutation.mutate(
      commentId
    );
  };

  const handleEditComment = (
    commentId
  ) => {

    if (!editMessage.trim()) {
      return;
    }

    editCommentMutation.mutate(
      {
        commentId,
        message:
          editMessage.trim()
      },
      {
        onSuccess: () => {
          setEditingCommentId(
            null
          );

          setEditMessage("");
        }
      }
    );
  };

  if (loading) {

    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          Loading task...
        </div>
      </div>
    );

  }

  if (taskError || !task) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-panel dashboard-alert">

          <p>
            {taskError || "Task not found"}
          </p>

          <button
            className="dashboard-btn-primary"
            onClick={() => navigate(-1)}
          >
            Go Back
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
          name={task.title}
          role={task.status}
          path={`/${projectId}/${taskId}/task-settings`}
          word={"Task"}
          state={{
            assignedTo: task.assignedTo,
            createdBy: task.createdBy
          }}
        />
        <div className="dashboard-grid">
          {/* LEFT */}
          <div className="project-left-section">
            {/* TASK OVERVIEW */}
            <div className="dashboard-panel">
              <h2 className="dashboard-heading">
                Task Overview
              </h2>
              <p className="project-description">
                {task.description}
              </p>
              <div className="project-stats-grid">
                {/* STATUS */}
                <div className="project-stat-card">
                  <h3>Status</h3>
                  {task.assignedTo._id === userId ? (

                    <select
                      value={task.status}
                      onChange={handleStatusChange}
                      className="project-status-select"
                    >
                      <option value="IN_PROGRESS">
                        IN PROGRESS
                      </option>

                      <option value="DONE">
                        DONE
                      </option>

                      <option value="BLOCKED">
                        BLOCKED
                      </option>

                    </select>

                  ) : (

                    <p>{task.status}</p>

                  )}

                </div>

                {/* PRIORITY */}
                <div className="project-stat-card">

                  <h3>Priority</h3>

                  <p>{task.priority}</p>

                </div>

                {/* ASSIGNED TO */}
                <div className="project-stat-card">
                  <h3>Assigned To</h3>
                  <p>
                    {task?.assignedTo?.name ||
                      "Unassigned"}
                  </p>
                </div>
              </div>
            </div>
            {task?.dependencies?.length > 0 && (
              <div className="dashboard-panel">
                <h3 className="dashboard-heading">
                  Dependencies
                </h3>

                <div className="dependency-list">
                  {task.dependencies.map((dependency) => (

                    <Link
                      key={dependency._id}
                      to={`/${project._id}/${dependency._id}/task`}
                    >
                      <div className="task-card">
                        <div>
                          <h3>{dependency.title}</h3>
                          <p>{dependency.status}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT */}
          <div className="project-right-section">

            <div className="dashboard-panel">

              <h2 className="dashboard-heading">
                Comments
              </h2>

              {/* ADD COMMENT */}
              <div className="comment-box">

                <textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) =>
                    setNewComment(e.target.value)
                  }
                />

                <button
                  className="dashboard-btn-primary"
                  onClick={handleAddComment}
                  disabled={
                    addCommentMutation.isPending
                  }
                >
                  {
                    addCommentMutation.isPending
                      ? "Adding..."
                      : "Add Comment"
                  }
                </button>

              </div>

              {/* COMMENTS */}
              <div className="comment-list">

                {comments.length === 0 ? (

                  <div className="analytics-empty">
                    No comments yet.
                  </div>

                ) : (

                  comments.map((c) => (

                    <div
                      key={c._id}
                      className="comment-card"
                    >

                      <div className="comment-header">

                        <strong>
                          {c?.userId?.name}
                        </strong>

                        <span>
                          {c?.role}
                        </span>

                        <small>
                          {new Date(
                            c.createdAt
                          ).toLocaleString()}
                        </small>

                      </div>

                      {editingCommentId === c._id ? (

                        // <div>

                        //   <textarea
                        //     value={editMessage}
                        //     onChange={(e) =>
                        //       setEditMessage(
                        //         e.target.value
                        //       )
                        //     }
                        //   />

                        //   <button
                        //     className="file-btn delete"
                        //     onClick={() =>
                        //       handleEditComment(c._id)
                        //     }
                        //   >
                        //     Save Edit
                        //   </button>

                        // </div>
                        <div className="comment-edit-box">
                          <textarea
                            placeholder="Write a comment..."
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                          />

                          <div className="comment-actions">
                            <button
                              className="dashboard-btn-primary"
                              onClick={() => {
                                handleEditComment(c._id);
                              }}
                            >
                              Save
                            </button>

                            <button
                              className="file-btn delete"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditMessage("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                      ) : (

                        <p>{c.message}</p>

                      )}

                      {userId === c?.userId?._id && (

                        <button
                          className="file-btn"
                          onClick={() => {

                            setEditingCommentId(c._id);

                            setEditMessage(
                              c.message
                            );

                          }}
                        >
                          Edit
                        </button>

                      )}

                      {role === "ADMIN" && (

                        <button
                          className="file-btn delete"
                          onClick={() =>
                            handleDeleteComment(c._id)
                          }
                        >
                          Delete
                        </button>

                      )}

                    </div>

                  ))

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default TaskPage;