import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import workspaceData from '../context/WorkspaceContext';
import { authorizedFetch } from '../lib/api';

function GeneralSettings({ word, existData, handleFunction }) {
    const location = useLocation();
    const navigate = useNavigate();
    const role = location.state?.role;
    const { name, type, id } = existData;

    if (type) {
        const [data, setData] = useState({
            name: ""
        })
    }

    const [data, setData] = useState({
        name: "", type: ""
    })

    useEffect(() => {
        setData({
            name: name || "",
            type: type || "Private"
        });
    }, [existData]);
    const [loading, setLoading] = useState(false);

    return (
        <div className="dashboard-panel">
            <h2 className="dashboard-heading">
                General Settings
            </h2>
            <p className="dashboard-hint">
                Update {word} information.
            </p>
            <div className="settings-form">
                <div className="settings-group">
                    <label>
                        {word} Name
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) =>
                            setData(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                        className="settings-input"
                    />
                </div>

                <div className="settings-group">
                    <label>
                        {word} Type
                    </label>
                    <select
                        value={data.type}
                        onChange={(e) =>
                            setData(prev => ({
                                ...prev,
                                type: e.target.value
                            }))}
                        className="settings-input"
                    >
                        <option value="Private">
                            Private
                        </option>
                        <option value="Public">
                            Public
                        </option>
                    </select>
                </div>
                {
                    // hasData &&
                    // <div>
                    //     <div className="settings-group">
                    //         <label>
                    //             Project Description
                    //         </label>
                    //         <textarea
                    //             value={description}
                    //             onChange={(e) =>
                    //                 setDescription(
                    //                     e.target.value
                    //                 )
                    //             }
                    //             className="settings-input settings-textarea"
                    //             rows={5}
                    //         />
                    //     </div>
                    //     <div className="settings-group">
                    //         <label>
                    //             GitHub Repository URL
                    //         </label>
                    //         <input
                    //             type="text"
                    //             value={githubRepoUrl}
                    //             onChange={(e) =>
                    //                 setGithubRepoUrl(
                    //                     e.target.value
                    //                 )
                    //             }
                    //             className="settings-input"
                    //             placeholder="https://github.com/username/repository"
                    //         />
                    //     </div>
                    // </div>
                }
                <button
                    className="settings-save-btn"
                    onClick={() => handleFunction(data, setLoading)}
                    disabled={loading}
                >
                    {
                        loading
                            ? "Saving..."
                            : "Save Changes"
                    }
                </button>
            </div>
        </div>
    )
}

export default GeneralSettings
