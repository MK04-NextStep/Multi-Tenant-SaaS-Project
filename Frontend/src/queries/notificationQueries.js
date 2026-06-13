import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";

import { authorizedFetch } from "../lib/api";

export function useNotifications(workspaceId) {
    return useQuery({
        queryKey: [
            "notifications",
            workspaceId || "user"
        ],

        queryFn: async () => {

            const path = workspaceId
                ? `/notification/${workspaceId}`
                : "/notification/user/getUser-notification";

            const res =
                await authorizedFetch(path);

            const body =
                await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body.data || [];
        }
    });
}

export function useMarkAllNotificationsRead(
    workspaceId
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async () => {

            const path = workspaceId
                ? `/notification/${workspaceId}/read-all`
                : "/notification/user/read-all-user";

            const res =
                await authorizedFetch(
                    path,
                    {
                        method: "POST"
                    }
                );

            const body =
                await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "notifications",
                    workspaceId || "user"
                ]
            });
        }
    });
}

export function useMarkNotificationRead(
    workspaceId
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async (
            notificationId
        ) => {

            const res =
                await authorizedFetch(
                    `/notification/${notificationId}/read`,
                    {
                        method: "PATCH"
                    }
                );

            const body =
                await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "notifications",
                    workspaceId || "user"
                ]
            });
        }
    });
}

export function useDeleteNotification(
    workspaceId
) {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: async (
            notificationId
        ) => {

            const res =
                await authorizedFetch(
                    `/notification/${notificationId}/delete`,
                    {
                        method: "DELETE"
                    }
                );

            const body =
                await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [
                    "notifications",
                    workspaceId || "user"
                ]
            });
        }
    });
}