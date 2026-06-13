import { createContext, useState } from "react";

const WorkspaceContext = createContext();
export default WorkspaceContext

function WorkspaceProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [workspaceRole, setWorkspaceRole] = useState(null);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceId,
        setWorkspaceId,
        workspaceRole,
        setWorkspaceRole,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export { WorkspaceProvider}