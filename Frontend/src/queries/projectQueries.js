import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorizedFetch } from "../lib/api";

function useCreateProject() {
    return useMutation({
        mutationFn: async ({
            teamId,
            title,
            description,
            status,
            githubRepoUrl
        }) => {

            const res = await authorizedFetch(
                `/project/${teamId}/new`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        status,
                        githubRepoUrl
                    })
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        }
    });
}

function useProject(projectId) {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/project/${projectId}/project-details`
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return {
                project: body.data,
                projectRole: body.role
            }
        },
        enabled: !!projectId
    });
}

function useProjectTasks(projectId) {
    return useQuery({
        queryKey: ["project-tasks", projectId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/task/${projectId}/task-list`
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body.data;
        },
        enabled: !!projectId
    });
}

function useProjectStats(projectId) {
    return useQuery({
        queryKey: ["project-stats", projectId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/stat/${projectId}/dashboard-stats`
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body.data;
        },
        enabled: !!projectId
    });
}

function useUpdateProject(projectId) {

    const queryClient =
        useQueryClient();

    return useMutation({

        mutationFn: async ({
            title,
            description,
            githubRepoUrl
        }) => {

            const res =
                await authorizedFetch(
                    `/project/${projectId}/update-project-details`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            title,
                            description,
                            githubRepoUrl
                        })
                    }
                );

            const body =
                await res.json();

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
                    "project",
                    projectId
                ]
            });
            console.log("hello")
        }
    });
}

function useUpdateProjectStatus(projectId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (status) => {
            const res = await authorizedFetch(
                `/project/${projectId}/user/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
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
                queryKey: ["project", projectId]
            });
        }
    });
}

function useUpdateMentorApproval(projectId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (status) => {
            const res = await authorizedFetch(
                `/project/${projectId}/mentor/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
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
                queryKey: ["project", projectId]
            });
        }
    });
}

export {
    useCreateProject,
    useProject,
    useProjectTasks,
    useProjectStats,
    useUpdateProject, 
    useUpdateProjectStatus,
    useUpdateMentorApproval
};