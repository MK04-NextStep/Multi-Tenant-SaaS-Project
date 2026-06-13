import { useState } from "react";

function AssignTask({
    members,
    currentAssignee,
    mutation
}) {
    const [assignedTo, setAssignedTo] = useState(
        currentAssignee?._id || ""
    );

    const handleAssign = () => {
        mutation.mutate(assignedTo);
    };

    return (
        <div className="assign-task-container">

            <div className="assign-task-current">
                <span>Current Assignee</span>
                <p>
                    {currentAssignee?.name ||
                        "Unassigned"}
                </p>
            </div>

            <label>Assign To</label>

            <select
                className="assign-task-select"
                value={assignedTo}
                onChange={(e) =>
                    setAssignedTo(e.target.value)
                }
            >
                <option value="">
                    Unassigned
                </option>

                {members.map((member) => (
                    <option
                        key={member.userId._id}
                        value={member?.userId?._id}
                    >
                        {member?.userId?.name}
                    </option>
                ))}
            </select>

            <button
                className="assign-task-btn"
                onClick={handleAssign}
                disabled={mutation.isPending}
            >
                {mutation.isPending
                    ? "Updating..."
                    : "Update Assignee"}
            </button>
        </div>
    );
}

export default AssignTask;