import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorizedFetch } from "../lib/api";

function useCreateTask(projectId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const res = await authorizedFetch(
                `/task/${projectId}/new-task`,
                {
                    method: "POST",
                    body: JSON.stringify(payload)
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project-tasks", projectId]
            });
        }
    });
}

function useTask(projectId, taskId) {
    return useQuery({
        queryKey: ["task", taskId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/task/${projectId}/${taskId}/get`
            );
            const body = await res.json();
            return {
                task: body?.data,
                role: body?.role
            };
        },
        enabled: !!projectId && !!taskId
    });
}

function useTaskComments(projectId, taskId) {
    return useQuery({
        queryKey: ["task-comments", taskId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/comment/${projectId}/${taskId}/get-comment`
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body.data;
        },
        enabled: !!projectId && !!taskId
    });
}

function useUpdateTaskStatus(projectId, taskId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (status) => {
            const res = await authorizedFetch(
                `/task/${projectId}/${taskId}/update-status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status })
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["task", taskId]
            });
        }
    });
}

function useAddComment(projectId, taskId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (message) => {
            const res = await authorizedFetch(
                `/comment/${projectId}/${taskId}/add-comments`,
                {
                    method: "POST",
                    body: JSON.stringify({ message })
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["task-comments", taskId]
            });
        }
    });
}

function useEditComment(taskId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentId, message }) => {
            const res = await authorizedFetch(
                `/comment/${commentId}/edit-comments`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ message })
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["task-comments", taskId]
            });
        }
    });
}

function useDeleteComment(projectId, taskId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId) => {
            const res = await authorizedFetch(
                `/comment/${projectId}/${commentId}/delete-comments`,
                {
                    method: "DELETE"
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["task-comments", taskId]
            });
        }
    });
}

function useUpdateTask(projectId, taskId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const res = await authorizedFetch(
                `/task/${projectId}/${taskId}/update-task`,
                {
                    method: "PATCH",
                    body: JSON.stringify(payload)
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["task", taskId]
            });

            queryClient.invalidateQueries({
                queryKey: ["project-tasks", projectId]
            });
        }
    });
}

function useDeleteTask(projectId, taskId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await authorizedFetch(
                `/task/${projectId}/${taskId}/delete-task`,
                {
                    method: "DELETE"
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project-tasks", projectId]
            });

            queryClient.removeQueries({
                queryKey: ["task", taskId]
            });

            queryClient.removeQueries({
                queryKey: ["task-comments", taskId]
            });
        }
    });
}

function useAssignTask(projectId, taskId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (assignedTo) => {
            const res =
                await authorizedFetch(
                    `/task/${projectId}/${taskId}/update-assignedto`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            assignedTo
                        })
                    }
                );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(
                    body.message
                );
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "task",
                    taskId
                ]
            });
        }
    });
}

export {
    useTask,
    useCreateTask,
    useUpdateTask,
    useTaskComments,
    useUpdateTaskStatus,
    useAddComment,
    useEditComment,
    useDeleteComment,
    useDeleteTask,
    useAssignTask
};