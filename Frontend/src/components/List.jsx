import React, { useContext } from 'react'
import workspaceData from '../context/WorkspaceContext'

function List({ member, handleRoleChange, role="MEMBER" }) {
    return (
        <div key={member.userId._id} className="dashboard-workspace-card">
            <div className="dashboard-workspace-main">
                <div>
                    <div className='team-name'>
                        {member.userId.name}
                    </div>
                    <div className="dashboard-id-line">
                        {member.userId.email}
                    </div>
                </div>
                {role === "ADMIN" ? (
                    <select
                    value={member.role}
                    onChange={(e) =>
                        handleRoleChange(
                            member.userId._id,
                            e.target.value
                        )
                    }
                    className='change-role'>
                    <option value="LEADER">LEADER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MEMBER">MEMBER</option>
                </select>
                ): (
                    <b><h3>{member.role}</h3></b>
                )}
            </div>
        </div>
    )
}

export default List
