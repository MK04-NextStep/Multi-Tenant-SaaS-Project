import { useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../socket";

import ProjectContext from "../context/ProjectContext";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function ProjectSocketManager() {

    const queryClient = useQueryClient();
    const { me, userId } = useContext(UserContext);
    const navigate = useNavigate()

    const {
        projectId
    } = useContext(ProjectContext);


    useEffect(() => {

        if (!me?.projects?.length) return;

        me?.projects?.forEach((project) => {
            socket.emit("join-project", project.projectId);
        });

    }, [me]);

    useEffect(() => {

        if (!projectId) return;

        socket.emit("join-project", projectId);

        return () => {
            socket.emit("leave-project", projectId);
        };

    }, [projectId]);

    useEffect(() => {
        const onProjectUpdated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["project", data.projectId]
            });
        };

        const onProjectDeleted = (data) => {

            queryClient.removeQueries({
                queryKey: ["project", data.projectId]
            });

            queryClient.removeQueries({
                queryKey: ["project-tasks", data.projectId]
            });

            queryClient.removeQueries({
                queryKey: ["project-stats", data.projectId]
            });
            if (String(projectId) === String(data.projectId)) {
                navigate("/dashboard");
            }
        };

        const onTaskCreated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["project-tasks", data.projectId]
            });

            queryClient.invalidateQueries({
                queryKey: ["project-stats", data.projectId]
            });
        };

        const onTaskDeleted = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["project-tasks", data.projectId]
            });

            queryClient.invalidateQueries({
                queryKey: ["project-stats", data.projectId]
            });
        };

        const onTaskUpdated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["project-tasks", data.projectId]
            });

            queryClient.invalidateQueries({
                queryKey: ["project-stats", data.projectId]
            });
        };

        socket.on("project-updated", onProjectUpdated);
        socket.on("project-deleted", onProjectDeleted);

        socket.on("task-created", onTaskCreated);
        socket.on("task-deleted", onTaskDeleted);
        socket.on("task-updated", onTaskUpdated);

        return () => {

            socket.off("project-updated", onProjectUpdated);
            socket.off("project-deleted", onProjectDeleted);

            socket.off("task-created", onTaskCreated);
            socket.off("task-deleted", onTaskDeleted);
            socket.off("task-updated", onTaskUpdated);
        };

    }, []);

    // Files
    useEffect(() => {
        const onFileUploaded = (data) => {

            queryClient.invalidateQueries({
                queryKey: ["project-files", projectId]
            });


        };

        const onFileDeleted = (data) => {

            queryClient.invalidateQueries({
                queryKey: ["project-files", projectId]
            });

        };

        socket.on("file-uploaded", onFileUploaded);
        socket.on("file-deleted", onFileDeleted);

        return () => {
            socket.off("file-uploaded", onFileUploaded);
            socket.off("file-deleted", onFileDeleted);
        };

    }, [projectId]);

    return null;
}