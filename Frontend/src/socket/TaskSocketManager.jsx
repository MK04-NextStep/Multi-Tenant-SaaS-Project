import { useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../socket";
import TaskContext from '../context/TaskContext'

export default function TaskSocketManager() {
    const queryClient = useQueryClient();

    const {
        taskId
    } = useContext(TaskContext);

    useEffect(() => {
        if (!taskId) return;

        socket.emit("join-task", taskId);

        return () => {
            socket.emit("leave-task", taskId);
        };
    }, [taskId]);

    useEffect(() => {
        const onTaskUpdated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data.taskId]
            });

            queryClient.invalidateQueries({
                queryKey: ["project-stats", data.projectId]
            });
        };

        const onTaskDeleted = (data) => {
            queryClient.removeQueries({
                queryKey: ["task", data.taskId]
            });

            queryClient.removeQueries({
                queryKey: ["task-comments", data.taskId]
            });

            queryClient.invalidateQueries({
                queryKey: ["project-stats", data.projectId]
            });
        };

        const onTaskStatusUpdated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data.taskId]
            });

            queryClient.invalidateQueries({
                queryKey: ["project-stats", data.projectId]
            });
            data.projectId
        };

        const onCommentAdded = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["task-comments", data.taskId]
            });
        };

        const onCommentEdited = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["task-comments", data.taskId]
            });
        };

        const onCommentDeleted = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["task-comments", data.taskId]
            });
        };

        const onTaskAssigned = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data.taskId]
            });
            queryClient.invalidateQueries({
                queryKey: ["project-stats", data.projectId]
            });
        };

        socket.on(
            "task-assigned",
            onTaskAssigned
        );

        socket.on("task-updated", onTaskUpdated);
        socket.on("task-deleted", onTaskDeleted);
        socket.on("task-status-updated", onTaskStatusUpdated);

        socket.on("comment-added", onCommentAdded);
        socket.on("comment-edited", onCommentEdited);
        socket.on("comment-deleted", onCommentDeleted);

        return () => {
            socket.off("task-updated", onTaskUpdated);
            socket.off("task-deleted", onTaskDeleted);
            socket.off("task-status-updated", onTaskStatusUpdated);

            socket.off("comment-added", onCommentAdded);
            socket.off("comment-edited", onCommentEdited);
            socket.off("comment-deleted", onCommentDeleted);
        };
    }, [taskId]);

    return null;
} 