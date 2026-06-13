import { useQuery } from "@tanstack/react-query";
import { authorizedFetch } from "../lib/api";

export function useMyWorkspaces() {
    return useQuery({
        queryKey: ["my-workspaces"],

        queryFn: async () => {
            const res = await authorizedFetch("/workspace/me");
            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message);
            }

            return body.data || [];
        }
    });
}

export function useMe() {
    return useQuery({
        queryKey: ["me"],

        queryFn: async () => {
            const res = await authorizedFetch("/users/me");
            const body = await res.json();

            if (!res.ok) {
                throw new Error(
                    body.message || "Could not load your profile."
                );
            }

            return body.data;
        },
    });
}