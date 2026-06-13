import React, {useContext,useState} from 'react';
import { useNavigate} from 'react-router-dom';
import workspaceData from '../context/WorkspaceContext'
import { authorizedFetch } from '../lib/api';

function DeleteSection({ word,api}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleDeleteWorkspace =
        async () => {
            const confirmDelete = window.confirm( `Are you sure you want to delete this ${word}?`);
            if (!confirmDelete) return;
            try {
                setLoading(true);
                const res = await authorizedFetch( api , { method: "DELETE" });
                const body = await res.json();
                if (!res.ok) {
                    throw new Error( body.message || `Could not delete ${word}`);
                }
                navigate("/workspace");
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };

    return (

        <div className="dashboard-panel danger-panel">
            <h2 className="dashboard-heading">
                Delete {word}
            </h2>
            <p className="dashboard-hint">
                This action cannot be undone.
            </p>
            <button
                className="delete-btn"
                onClick={handleDeleteWorkspace}
                disabled={loading}
            >
                {
                    loading
                        ? "Deleting..."
                        : `Delete ${word}`
                }

            </button>

        </div>
    );
}

export default DeleteSection;