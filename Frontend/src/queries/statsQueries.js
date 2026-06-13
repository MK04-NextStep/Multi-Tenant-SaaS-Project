import { useQuery } from "@tanstack/react-query";
import { authorizedFetch } from "../lib/api";

async function getProjectStats(projectId) {

    const res = await authorizedFetch(
        `/stat/${projectId}/dashboard-stats`
    );

    const body = await res.json();

    if (!res.ok) {
        throw new Error(
            body.message || "Could not load analytics"
        );
    }

    return body.data;
}

export function useProjectStats(projectId) {

    return useQuery({
        queryKey: ["project-stats", projectId],
        queryFn: () => getProjectStats(projectId),
        enabled: !!projectId,
    });

}