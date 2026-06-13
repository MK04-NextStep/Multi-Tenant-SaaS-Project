import { useNavigate } from "react-router-dom";

function LeaveSection({
    word,
    leaveMutation
}) {
    const navigate = useNavigate();

    const handleLeave = () => {
        const confirmLeave = window.confirm(
            `Are you sure you want to leave this ${word}?`
        );

        if (!confirmLeave) return;

        leaveMutation.mutate(undefined, {
            onSuccess: () => {
                navigate("/dashboard");
            }
        });
    };

    return (
        <div className="dashboard-panel">
            <h2 className="dashboard-heading">
                Leave {word}
            </h2>

            <p className="dashboard-hint">
                You will lose access to this {word}.
            </p>

            <button
                className="leave-btn"
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
            >
                {
                    leaveMutation.isPending
                        ? "Leaving..."
                        : `Leave ${word}`
                }
            </button>
        </div>
    );
}

export default LeaveSection;