import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function MemberManagment({ word, members, removeMemberMutation }) {
    const navigate = useNavigate();

    const handleRemoveMember = (memberId) => {
        removeMemberMutation.mutate(memberId);
    };

    return (
        <div className="dashboard-panel">
            <h2 className="dashboard-heading">
                Manage Members
            </h2>
            <p className="dashboard-hint">
                Remove members from {word}
            </p>
            <div className="settings-member-list">
                {
                    members.map(
                        (member) => (
                            <div
                                key={member.userId._id}
                                className="settings-member-card"
                            >
                                <div className="settings-member-info">
                                    <div className="settings-avatar">
                                        {
                                            member.userId.name.charAt(0)
                                        }
                                    </div>
                                    <div>
                                        <h3>{member.userId.name}</h3>
                                        <p>{member.role}</p>
                                    </div>
                                </div>
                                <button
                                    className="remove-member-btn"
                                    onClick={() =>
                                        handleRemoveMember(member.userId._id)
                                    }
                                    disabled={removeMemberMutation.isPending}
                                >
                                    {
                                        removeMemberMutation.isPending
                                            ? "Removing..."
                                            : "Remove"
                                    }
                                </button>
                            </div>
                        )
                    )
                }
            </div>
        </div>
    );
}

export default MemberManagment;