import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import InsideDashHeader from '../components/InsideDashHeader';
import '../styles/workspaceSettings.css';
import LeaveSection from '../components/LeaveSection';
import DeleteSection from '../components/DeleteSection';
import userData from '../context/UserContext';
import AssignTask from '../components/AssignTask';
import { useTask, useUpdateTask, useAssignTask, useDeleteTask } from '../queries/taskQueries';
import { useProject, useProjectTasks } from '../queries/projectQueries';
import { useTeamMembers } from '../queries/teamQueries';
import UserContext from '../context/UserContext';

function TaskSettings() {
    const { taskId, projectId } = useParams();

    const { userId } = useContext(UserContext);

    // Queries
    const {
        data: taskData,
        isLoading: loadingTask
    } = useTask(projectId, taskId);

    const {
        data: projectData,
        isLoading: loadingProject
    } = useProject(projectId);

    const {
        data: projectTasks = [],
        isLoading: loadingTasks
    } = useProjectTasks(projectId);

    const project = projectData?.project;

    const {
        data: members = [],
        isLoading: loadingMembers
    } = useTeamMembers(project.teamId._id);

    const task = taskData?.task;
    const role = taskData?.role;

    // Mutations
    const updateTaskMutation =
        useUpdateTask(projectId, taskId);

    const deleteTaskMutation =
        useDeleteTask(projectId, taskId);

    const assignTaskMutation =
        useAssignTask(projectId, taskId);

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: ""
    });

    const [dependencySearch, setDependencySearch] = useState('');
    const [dependencyResults, setDependencyResults] = useState([]);
    const [selectedDependencies, setSelectedDependencies] = useState([]);
    const [searchingDependencies, setSearchingDependencies] = useState(false);

    useEffect(() => {
        if (!task) return;

        setForm({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate
                ? task.dueDate.split("T")[0]
                : ""
        });
        setSelectedDependencies(
            task.dependencies || []
        );
    }, [task]);

    const handleUpdateTask = () => {
        updateTaskMutation.mutate({
            ...form,
            dependencies: selectedDependencies.map(
                dep => dep._id
            )
        });
    };

    const searchTasks = async (query) => {
        try {
            setSearchingDependencies(true);
            const filtered = projectTasks.filter((task) =>
                task.title
                    .toLowerCase()
                    .includes(query.toLowerCase())
            );

            setDependencyResults(filtered);
        } catch (error) {
            console.log(error);
        } finally {
            setSearchingDependencies(false);
        }
    };

    const handleSelectDependency = (task) => {
        const alreadySelected =
            selectedDependencies.find(
                (dep) => dep._id === task._id
            );

        if (alreadySelected) return;

        setSelectedDependencies((prev) => [
            ...prev,
            task
        ]);

        setDependencySearch('');
        setDependencyResults([]);
    };

    const handleDependencySearch = async (event) => {
        const value = event.target.value;

        setDependencySearch(value);

        if (!value.trim()) {
            setDependencyResults([]);
            return;
        }

        await searchTasks(value);
    };

    const handleRemoveDependency = (taskId) => {
        setSelectedDependencies(prev =>
            prev.filter(dep => dep._id !== taskId)
        );
    };

    if (
        loadingTask ||
        loadingProject ||
        loadingTasks ||
        loadingMembers
    ) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-shell">

                <DashboardHeader />

                <div className="settings-layout">

                    <div className="settings-left">

                        {(role === "ADMIN" ||
                            role === "LEADER") && (

                                <div className="dashboard-panel">
                                    <h2 className="dashboard-heading">
                                        Task Settings
                                    </h2>

                                    <p className="dashboard-hint">
                                        Update task information.
                                    </p>

                                    <div className="settings-form">

                                        {/* TITLE */}
                                        <div className="settings-group">
                                            <label>
                                                Task Title
                                            </label>

                                            <input
                                                type="text"
                                                name="title"
                                                value={form.title || ""}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        title: e.target.value
                                                    }))
                                                }
                                                className="settings-input"
                                                placeholder="Enter task title"
                                            />
                                        </div>

                                        {/* DESCRIPTION */}
                                        <div className="settings-group">
                                            <label>
                                                Description
                                            </label>

                                            <textarea
                                                name="description"
                                                value={form.description || ""}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        description: e.target.value
                                                    }))
                                                }
                                                className="settings-textarea"
                                                placeholder="Add task description"
                                                rows={5}
                                            />
                                        </div>

                                        {/* PRIORITY */}
                                        <div className="settings-group">
                                            <label>
                                                Priority
                                            </label>

                                            <select
                                                name="priority"
                                                value={form.priority || "MEDIUM"}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        priority: e.target.value
                                                    }))
                                                }
                                                className="settings-input"
                                            >
                                                <option value="LOW">
                                                    LOW
                                                </option>

                                                <option value="MEDIUM">
                                                    MEDIUM
                                                </option>

                                                <option value="HIGH">
                                                    HIGH
                                                </option>
                                            </select>
                                        </div>

                                        {/* DEPENDENCIES */}
                                        <div className="settings-group">
                                            <label>
                                                Dependencies
                                            </label>

                                            {/* SEARCH INPUT */}
                                            <input
                                                type="text"
                                                placeholder="Search project tasks..."
                                                value={dependencySearch}
                                                onChange={handleDependencySearch}
                                                className="settings-input"
                                            />

                                            {/* SEARCH RESULTS */}
                                            {dependencyResults.length > 0 && (
                                                <div className="dependency-results">
                                                    {dependencyResults.map((task) => (
                                                        <button
                                                            type="button"
                                                            key={task._id}
                                                            className="dependency-result-item"
                                                            onClick={() =>
                                                                handleSelectDependency(task)
                                                            }
                                                        >
                                                            <span>{task.title}</span>

                                                            <small>{task.status}</small>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* SELECTED DEPENDENCIES */}
                                            <div className="selected-dependencies">
                                                {selectedDependencies.map((task) => (
                                                    <div
                                                        key={task._id}
                                                        className="dependency-chip"
                                                    >
                                                        <span>{task.title}</span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveDependency(task._id)
                                                            }
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* DUE DATE */}
                                        <div className="settings-group">
                                            <label>
                                                Due Date
                                            </label>

                                            <input
                                                type="date"
                                                name="dueDate"
                                                value={form.dueDate || ""}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        dueDate: e.target.value
                                                    }))
                                                }
                                                className="settings-input"
                                            />
                                        </div>

                                        <button
                                            className="settings-save-btn"
                                            onClick={handleUpdateTask}
                                            disabled={handleUpdateTask.isPending}
                                        >
                                            {handleUpdateTask.isPending
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </button>
                                    </div>
                                </div>

                            )}

                    </div>

                    <div className="settings-right">
                        {userId === task.createdBy && (

                            <AssignTask
                                taskId={taskId}
                                members={members}
                                currentAssignee={
                                    task.assignedTo
                                }
                                mutation={
                                    assignTaskMutation
                                }
                            />
                        )}

                        {(role === "ADMIN" ||
                            role === "LEADER") && (

                                <DeleteSection
                                    word="Task"
                                    mutation={
                                        deleteTaskMutation
                                    }
                                />
                            )}

                    </div>

                </div>
            </div>
        </div>
    );
}
export default TaskSettings
