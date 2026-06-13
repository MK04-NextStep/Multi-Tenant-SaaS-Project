import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authorizedFetch } from "../lib/api";

export function useProjectFiles(projectId) {
    return useQuery({
        queryKey: ["project-files", projectId],
        queryFn: async () => {
            const res = await authorizedFetch(
                `/files/${projectId}/files`
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            return data.data;
        },
        enabled: !!projectId
    });
}

export function useUploadFile(projectId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file) => {

            const formData = new FormData();

            formData.append("file", file);

            const res = await authorizedFetch(
                `/files/${projectId}/files`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            return data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project-files", projectId]
            });
        }
    });
}

export function useDeleteFile(projectId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fileId) => {

            const res = await authorizedFetch(
                `/files/${projectId}/files/${fileId}/delete-file`,
                {
                    method: "DELETE"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            return data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project-files", projectId]
            });
        }
    });
}