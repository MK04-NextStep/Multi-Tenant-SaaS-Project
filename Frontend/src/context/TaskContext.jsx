import { createContext, useState } from "react";

const TaskContext = createContext();

export default TaskContext

function TaskProvider({ children }) {

    const [taskId, setTaskId] = useState(null);

    const [task, setTask] = useState(null);

    return (
        <TaskContext.Provider
            value={{
                taskId,
                setTaskId,

                task,
                setTask
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export {TaskProvider};