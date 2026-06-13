import {
    useContext,
    useMemo,
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";
import "../styles/Workspace.css";
import {
    useCreateTask
} from "../queries/taskQueries";

import { useTeamMembers } from "../queries/teamQueries";
import { useProjectTasks } from "../queries/projectQueries";

function CreateTask() {
    const navigate = useNavigate();

    const { teamId, projectId } = useParams();

    const {
        data: teamMember = [],
        isLoading: loadingMembers
    } = useTeamMembers(teamId);

    const {
        data: taskList = [],
        isLoading: loadingTasks
    } = useProjectTasks(projectId);


    const [formData, setFormData] =
        useState({
            title: '',
            description: '',
            assignedTo: '',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            dueDate: ''
        });

    const [errors, setErrors] =
        useState({});

    const [serverError, setServerError] =
        useState('');

    const [
        successMessage,
        setSuccessMessage
    ] = useState('');

    const createTaskMutation =
        useCreateTask(projectId);

    const [
        dependencySearch,
        setDependencySearch
    ] = useState('');

    const [
        selectedDependencies,
        setSelectedDependencies
    ] = useState([]);

    const validate = () => {
        const nextErrors = {};

        if (!formData.title.trim()) {
            nextErrors.title =
                'Task title is required.';
        }

        if (!formData.priority) {
            nextErrors.priority =
                'Priority is required.';
        }

        if (!formData.assignedTo) {
            nextErrors.assignedTo =
                'Assign task to a member.';
        }

        if (
            formData.dueDate &&
            new Date(formData.dueDate) <
            new Date(
                new Date().toDateString()
            )
        ) {
            nextErrors.dueDate =
                'Due date cannot be in the past.';
        }

        setErrors(nextErrors);

        return (
            Object.keys(nextErrors)
                .length === 0
        );
    };

    const handleChange = (event) => {
        const { name, value } =
            event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ''
        }));

        setServerError('');
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setServerError("");
        setSuccessMessage("");

        if (!validate()) {
            return;
        }

        createTaskMutation.mutate(
            {
                title:
                    formData.title.trim(),

                description:
                    formData.description.trim() ||
                    "Add Description",

                assignedTo:
                    formData.assignedTo,

                status:
                    formData.status,

                priority:
                    formData.priority,

                dependencies:
                    selectedDependencies.map(
                        task => task._id
                    ),

                dueDate:
                    formData.dueDate
            },
            {
                onSuccess: () => {

                    setSuccessMessage(
                        "Task created successfully. Redirecting..."
                    );

                    setTimeout(() => {
                        navigate(-1);
                    }, 600);

                },

                onError: (error) => {

                    setServerError(
                        error.message
                    );

                }
            }
        );
    };

    const dependencyResults =
        useMemo(() => {
            if (
                !dependencySearch.trim()
            ) {
                return [];
            }

            return taskList.filter(
                (task) => {
                    const matchesSearch =
                        task.title
                            .toLowerCase()
                            .includes(
                                dependencySearch.toLowerCase()
                            );

                    const alreadySelected =
                        selectedDependencies.some(
                            (dep) =>
                                dep._id ===
                                task._id
                        );

                    return (
                        matchesSearch &&
                        !alreadySelected
                    );
                }
            );
        }, [
            dependencySearch,
            taskList,
            selectedDependencies
        ]);

    const handleDependencySearch =
        (event) => {
            setDependencySearch(
                event.target.value
            );
        };

    const handleSelectDependency =
        (task) => {
            setSelectedDependencies(
                (prev) => [
                    ...prev,
                    task
                ]
            );

            setDependencySearch('');
        };

    const handleRemoveDependency =
        (taskId) => {
            setSelectedDependencies(
                (prev) =>
                    prev.filter(
                        (task) =>
                            task._id !==
                            taskId
                    )
            );
        };

    return (
        <div className="workspace-page">
            <div className="workspace-card">
                <div className="workspace-header">
                    <h1>Create Task</h1>

                    <p>
                        Add task details
                        below to create a
                        new project task.
                    </p>
                </div>

                <form
                    className="workspace-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {serverError ? (
                        <div
                            className="workspace-error"
                            aria-live="polite"
                        >
                            {serverError}
                        </div>
                    ) : null}

                    {successMessage ? (
                        <div
                            className="workspace-success"
                            aria-live="polite"
                        >
                            {successMessage}
                        </div>
                    ) : null}

                    {/* TITLE */}
                    <div className="form-group">
                        <label htmlFor="title">
                            Task Title
                        </label>

                        <input
                            id="title"
                            type="text"
                            name="title"
                            placeholder="Enter task title"
                            value={
                                formData.title
                            }
                            onChange={
                                handleChange
                            }
                            className={
                                errors.title
                                    ? 'input-error'
                                    : ''
                            }
                            disabled={
                                createTaskMutation.isPending
                            }
                            aria-invalid={
                                !!errors.title
                            }
                        />

                        {errors.title ? (
                            <p className="error-message">
                                {
                                    errors.title
                                }
                            </p>
                        ) : null}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            placeholder="Add task description"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                createTaskMutation.isPending
                            }
                            rows={5}
                        />
                    </div>

                    {/* ASSIGN MEMBER */}
                    <div className="form-group">
                        <label htmlFor="assignedTo">
                            Assign To
                        </label>

                        <select
                            id="assignedTo"
                            name="assignedTo"
                            value={
                                formData.assignedTo
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                createTaskMutation.isPending
                            }
                            className={
                                errors.assignedTo
                                    ? 'input-error'
                                    : ''
                            }
                            aria-invalid={
                                !!errors.assignedTo
                            }
                        >
                            <option value="">
                                Select Member
                            </option>

                            {teamMember.map(
                                (member) => (
                                    <option
                                        key={
                                            member
                                                .userId
                                                ._id
                                        }
                                        value={
                                            member
                                                .userId
                                                ._id
                                        }
                                    >
                                        {
                                            member
                                                .userId
                                                .name
                                        }
                                    </option>
                                )
                            )}
                        </select>

                        {errors.assignedTo ? (
                            <p className="error-message">
                                {
                                    errors.assignedTo
                                }
                            </p>
                        ) : null}
                    </div>

                    {/* STATUS */}
                    <div className="form-group">
                        <label htmlFor="status">
                            Task Status
                        </label>

                        <select
                            id="status"
                            name="status"
                            value={
                                formData.status
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                createTaskMutation.isPending
                            }
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
                    </div>

                    {/* PRIORITY */}
                    <div className="form-group">
                        <label htmlFor="priority">
                            Priority
                        </label>

                        <select
                            id="priority"
                            name="priority"
                            value={
                                formData.priority
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                createTaskMutation.isPending
                            }
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
                    <div className="form-group">
                        <label htmlFor="dependencies">
                            Dependencies
                        </label>

                        <input
                            id="dependencies"
                            type="text"
                            placeholder="Search project tasks..."
                            value={
                                dependencySearch
                            }
                            onChange={
                                handleDependencySearch
                            }
                            disabled={
                                createTaskMutation.isPending
                            }
                        />

                        {dependencyResults.length >
                            0 ? (
                            <div className="dependency-results">
                                {dependencyResults.map(
                                    (task) => (
                                        <button
                                            type="button"
                                            key={
                                                task._id
                                            }
                                            className="dependency-result-item"
                                            onClick={() =>
                                                handleSelectDependency(
                                                    task
                                                )
                                            }
                                        >
                                            <span>
                                                {
                                                    task.title
                                                }
                                            </span>

                                            <small>
                                                {
                                                    task.status
                                                }
                                            </small>
                                        </button>
                                    )
                                )}
                            </div>
                        ) : null}

                        <div className="selected-dependencies">
                            {selectedDependencies.map(
                                (task) => (
                                    <div
                                        key={
                                            task._id
                                        }
                                        className="dependency-chip"
                                    >
                                        <span>
                                            {
                                                task.title
                                            }
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveDependency(
                                                    task._id
                                                )
                                            }
                                            aria-label={`Remove dependency ${task.title}`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* DUE DATE */}
                    <div className="form-group">
                        <label htmlFor="dueDate">
                            Due Date
                        </label>

                        <input
                            id="dueDate"
                            type="date"
                            name="dueDate"
                            value={
                                formData.dueDate
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                createTaskMutation.isPending
                            }
                            min={
                                new Date()
                                    .toISOString()
                                    .split('T')[0]
                            }
                            className={
                                errors.dueDate
                                    ? 'input-error'
                                    : ''
                            }
                        />

                        {errors.dueDate ? (
                            <p className="error-message">
                                {
                                    errors.dueDate
                                }
                            </p>
                        ) : null}
                    </div>

                    <div className="workspace-actions">
                        <button
                            type="submit"
                            className="workspace-submit"
                            disabled={
                                createTaskMutation.isPending
                            }
                        >
                            {createTaskMutation.isPending
                                ? "Creating..."
                                : "Create Task"}
                        </button>

                        <Link
                            to={`/project/${projectId}`}
                            className="workspace-cancel"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTask;