import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../socket";

export default function NotificationSocketManager() {

    const queryClient = useQueryClient();

    useEffect(() => {

        const handleNotification = () => {

            queryClient.invalidateQueries({
                queryKey: ["notifications"]
            });

        };

        socket.on(
            "notification-created",
            handleNotification
        );

        return () => {

            socket.off(
                "notification-created",
                handleNotification
            );

        };

    }, [queryClient]);

    return null;
}