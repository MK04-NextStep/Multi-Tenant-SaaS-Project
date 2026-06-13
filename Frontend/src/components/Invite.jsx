import { useState } from "react";
import '../styles/Dashboard.css';
import { authorizedFetch } from "../lib/api";

function Invite({ path }) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [role, setRole] = useState("MEMBER");

    const handleInvite = async () => {
        try {
            let res = await authorizedFetch(path, {
                method: "POST",
                body: JSON.stringify({
                    targetEmail: inviteEmail,
                    targetRole: role
                })
            })
            let body = await res.json();
            if (!res.ok) {
                new Error(body.message || "could not send invitaion")
            }
        } catch (e) {
            console.log(e)
        }
    };

    return (
        <div className="dashboard-panel">
            <h2 className="dashboard-heading">
                Invite Member</h2>

            <p className="dashboard-hint">
                Invite a new member to collaborate.</p>
            <input
                type="email"
                placeholder="Enter email address"
                className="dashboard-input"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
            />
            <input
                type="string"
                placeholder="MEMBER OR LEADER"
                className="dashboard-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
            />
            <button
                onClick={handleInvite}
                className='invite-button'>
                Send Invite
            </button>
        </div>
    )
}

export default Invite