import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorizedFetch } from "../lib/api";

function useCreateTeam() {
    return useMutation({
        mutationFn: async ({ name, workspaceId }) => {
            const res = await authorizedFetch("/team", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    workspaceId
                })
            });

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        }
    });
}

function useTeam(teamId) {
    return useQuery({
        queryKey: ["team", teamId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/team/${teamId}/team-details`
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return {
                team: body.data,
                role: body.role
            }
        },
        enabled: !!teamId
    });
}

function useTeamMembers(teamId) {
    return useQuery({
        queryKey: ["team-members", teamId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/team/${teamId}/team-members`
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body.data;
        },
        enabled: !!teamId
    });
}

function useTeamProjects(teamId) {
    return useQuery({
        queryKey: ["team-projects", teamId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/project/${teamId}/project-list`
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body.data;
        },
        enabled: !!teamId
    });
}

function useUpdateTeamRole(teamId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }) => {
            const res = await authorizedFetch(
                `/team/users/${teamId}/${userId}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ role })
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
                queryKey: ["team-members", teamId]
            });
        }
    });
}

function useUpdateTeam(teamId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name }) => {
            const res = await authorizedFetch(
                `/team/${teamId}/team-update`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name })
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
                queryKey: ["team", teamId]
            });
        }
    });
}

function useLeaveTeam(teamId) {
    return useMutation({
        mutationFn: async () => {
            const res = await authorizedFetch(
                `/team/${teamId}/leave/me`,
                {
                    method: "DELETE"
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

function useRemoveTeamMember(teamId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (memberId) => {
            const res = await authorizedFetch(
                `/team/${teamId}/leave/${memberId}`,
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
                queryKey: ["team-members", teamId]
            });
        }
    });
}

export {
    useCreateTeam,
    useTeam,
    useTeamMembers,
    useTeamProjects,
    useUpdateTeamRole,
    useUpdateTeam,
    useLeaveTeam,
    useRemoveTeamMember
};