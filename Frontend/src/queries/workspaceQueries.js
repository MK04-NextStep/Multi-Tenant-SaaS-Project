import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authorizedFetch } from "../lib/api";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

function useWorkspace(workspaceId) {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => {
            const res = await authorizedFetch(`/workspace/${workspaceId}`);
            const body = await res.json();

            if (!res.ok) throw new Error(body.message);

            return {
                workspace: body.data,
                role: body.role
            };
        },
        enabled: !!workspaceId
    });
}

function useWorkspaceMembers(workspaceId) {
    return useQuery({
        queryKey: ["workspace-members", workspaceId],
        queryFn: async () => {
            const res = await authorizedFetch(`/workspace/${workspaceId}/members`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data.data;
        },
        enabled: !!workspaceId
    });
}

function useWorkspaceTeams(workspaceId) {
    return useQuery({
        queryKey: ["workspace-teams", workspaceId],
        queryFn: async () => {
            const res = await authorizedFetch(`/team/team-list/${workspaceId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data.data;
        },
        enabled: !!workspaceId
    });
}

function useUpdateWorkspaceRole(workspaceId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }) => {
            const res = await authorizedFetch(
                `/workspace/users/${workspaceId}/${userId}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        role
                    })
                }
            );

            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        // optional immediate refresh
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["workspace-members", workspaceId]
            });
        }
    });
}

function useUpdateWorkspace(workspaceId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, type }) => {
            const res = await authorizedFetch(
                `/workspace/${workspaceId}/update-workspace`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        type
                    })
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
                queryKey: ["workspace", workspaceId]
            });
        }
    });
}

function useLeaveWorkspace(workspaceId) {
    return useMutation({
        mutationFn: async () => {
            const res = await authorizedFetch(
                `/workspace/${workspaceId}/leave/me`,
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

function useRemoveWorkspaceMember(workspaceId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (memberId) => {
            const res = await authorizedFetch(
                `/workspace/${workspaceId}/leave/${memberId}`,
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
                queryKey: ["workspace-members", workspaceId]
            });
        }
    });
}

export {
    useWorkspace, useWorkspaceMembers, useWorkspaceTeams,
    useUpdateWorkspaceRole, useUpdateWorkspace, useLeaveWorkspace
    ,useRemoveWorkspaceMember
}