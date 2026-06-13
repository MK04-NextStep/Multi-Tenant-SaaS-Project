import { createContext, useState } from "react";

const ProjectContext = createContext();

export default ProjectContext;

function ProjectProvider({ children }) {
    const [projectId, setProjectId] = useState(null);

    return (
        <ProjectContext.Provider
            value={{
                projectId, setProjectId
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export { ProjectProvider };