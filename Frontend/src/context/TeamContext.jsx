import { createContext, useState } from "react";

const TeamContext = createContext();

export default TeamContext;

function TeamProvider({ children }) {
    const [teamId, setTeamId] = useState(null);
    const [teamRole, setTeamRole] = useState(null);

    return (
        <TeamContext.Provider
            value={{
                teamId,
                setTeamId,
                teamRole,
                setTeamRole,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
}

export { TeamProvider };