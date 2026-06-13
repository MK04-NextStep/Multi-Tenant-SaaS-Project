import { useContext, useEffect } from "react";
import socket from "../socket";
import userData from "../context/UserContext";
import TeamContext from "../context/TeamContext";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";

export default function TeamSocketManager() {
    const queryClient = useQueryClient();

    const { me, userId } = useContext(UserContext);
    const navigate = useNavigate();

    const {
        teamId,
        setTeamRole
    } = useContext(TeamContext);

    useEffect(() => {
        if (!me?.teams?.length) return;

        me?.teams?.forEach((team) => {
            socket.emit("join-team", team.teamId);
        });
    }, [me]);

    useEffect(() => {

        if (!teamId) return;

        socket.emit("join-team", teamId);
    }, [teamId]);

    useEffect(() => {
        if (!teamId) return;

        socket.emit("join-team", teamId);

        return () => {
            socket.emit("leave-team", teamId);
        };
    }, [teamId]);

    useEffect(() => {
        const onMemberAdded = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["team-members", data.teamId]
            });
        };

        const onMemberRemoved = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["team-members", data.teamId]
            });

            if(userId === data.userId){
                navigate("/dashboard")
            }
        };

        const onRoleUpdated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["team-members", data.teamId]
            });

            if (data.userId === userId) {
                setTeamRole(data.role);
            }
        };

        const onTeamUpdated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["team", data.teamId]
            });
        };

        const onProjectCreated = (data) => {
            queryClient.invalidateQueries({
                queryKey: ["team-projects", data.teamId]
            });
        };

        // const onProjectDeleted = (data) => {
        //     console.log("okay i unsersafda")
        //     queryClient.invalidateQueries({
        //         queryKey: ["team-projects", data.teamId]
        //     });
        //     console.log(teamId)
        //     console.log(data.teamId)
        //     if(teamId === data.teamId){
        //         console.log("YESYESYESYESYEYSEYS")
        //         navigate("/dashboard")
        //     }
        // };

        const onTeamDeleted = (data) => {
            queryClient.removeQueries({
                queryKey: ["team", data.teamId]
            });

            queryClient.removeQueries({
                queryKey: ["team-members", data.teamId]
            });

            queryClient.removeQueries({
                queryKey: ["team-projects", data.teamId]
            });

            if (teamId === data.teamId) {
                if (data.workspaceId) {
                    navigate(`/workspace/${data.workspaceId}`)
                }else{
                    navigate("/dashborad")
                }
            }
        };

        socket.on("team-member-added", onMemberAdded);
        socket.on("team-member-left", onMemberRemoved);
        socket.on("team-role-updated", onRoleUpdated);
        socket.on("team-updated", onTeamUpdated);
        socket.on("team-deleted", onTeamDeleted);

        socket.on("project-created", onProjectCreated);
        // socket.on("project-deleted", onProjectDeleted);

        return () => {
            socket.off("team-member-added", onMemberAdded);
            socket.off("team-member-left", onMemberRemoved);
            socket.off("team-role-updated", onRoleUpdated);
            socket.off("team-updated", onTeamUpdated);
            socket.off("team-deleted", onTeamDeleted);

            socket.off("project-created", onProjectCreated);
            // socket.off("project-deleted", onProjectDeleted);
        };
    }, [me, teamId]);

    return null;
}