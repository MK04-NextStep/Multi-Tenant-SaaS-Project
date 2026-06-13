import { useEffect } from "react";
import socket from "../socket";

import { useMe } from "../queries/dashboardQueries";

function UserSocketManager() {

    const { data: me } = useMe();

    useEffect(() => {

        if (!me?._id) return;

        socket.emit(
            "join-user",
            me._id
        );

        return () => {

            socket.emit(
                "leave-user",
                me._id
            );

        };

    }, [me?._id]);

    return null;
}

export default UserSocketManager;