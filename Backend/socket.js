let io;

const initSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected", socket.id);

        // WORKSPACE

        socket.on("join-workspace", (workspaceId) => {
            socket.join(workspaceId);
        });

        socket.on("leave-workspace", (workspaceId) => {
            socket.leave(workspaceId);
        });

        // TEAM

        socket.on("join-team", (teamId) => {
            socket.join(teamId);
        });

        socket.on("leave-team", (teamId) => {
            socket.leave(teamId);
        });

        // PROJECT

        socket.on("join-project", (projectId) => {
            socket.join(projectId);
            console.log("joined project", projectId);
        });

        socket.on("leave-project", (projectId) => {
            socket.leave(projectId);
        });

        // TASK

        socket.on("join-task", (taskId) => {
            socket.join(taskId);
            console.log("joined task", taskId);
        });

        socket.on("leave-task", (taskId) => {
            socket.leave(taskId);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnect", socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};

module.exports = {
    initSocket,
    getIo
};