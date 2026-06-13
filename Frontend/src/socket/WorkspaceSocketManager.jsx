import { useEffect, useContext } from "react";
import socket from "../socket";
import WorkspaceContext from "../context/WorkspaceContext";
import userData from "../context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import {useNavigate} from 'react-router-dom'

export default function WorkspaceSocketManager() {
  const { workspaceId, setWorkspaceRole } = useContext(WorkspaceContext);
  const { userId, me } = useContext(userData);
  const queryClient = useQueryClient();

  let navigate = useNavigate();

  useEffect(() => {
    console.log("Socket connected:", socket.connected);

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED:", socket.id);
    });

  }, []);
  useEffect(() => {

    me?.workspaces?.forEach(ws => {
      socket.emit("join-workspace", ws.workspaceId);
    });
  }, [userId]);

  // OPTIONAL: page-based join (safe fallback)
  useEffect(() => {
    if (!workspaceId) return;

    socket.emit("join-workspace", workspaceId);

    return () => {
      socket.emit("leave-workspace", workspaceId);
    };
  }, [workspaceId]);

  useEffect(() => {
    const onMemberAdded = (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", data.workspaceId],
      });
    };

    const onMemberRemoved = (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", data.workspaceId],
      });
      if (data.userId === me?._id) {
        navigate("/dashboard");
    }
    };

    const onRoleUpdated = (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-members", data.workspaceId],
      });

      if (data.userId === userId) {
        setWorkspaceRole(data.role);
      }
    };

    const onWorkspaceUpdated = (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspaceId],
      });
    };

    const onWorkspaceDeleted = (data) => {
      queryClient.removeQueries({
        queryKey: ["workspace", data.workspaceId],
      });

      queryClient.removeQueries({
        queryKey: ["workspace-members", data.workspaceId],
      });

      queryClient.removeQueries({
        queryKey: ["workspace-teams", data.workspaceId],
      });

      if (workspaceId === data.workspaceId) {
        navigate("/dashboard");
      }
    };

    socket.on("workspace-member-added", onMemberAdded);
    socket.on("workspace-member-left", onMemberRemoved);
    socket.on("workspace-role-updated", onRoleUpdated);
    socket.on("workspace-updated", onWorkspaceUpdated);
    socket.on("workspace-deleted", onWorkspaceDeleted);

    return () => {
      socket.off("workspace-member-added", onMemberAdded);
      socket.off("workspace-member-left", onMemberRemoved);
      socket.off("workspace-role-updated", onRoleUpdated);
      socket.off("workspace-updated", onWorkspaceUpdated);
      socket.off("workspace-deleted", onWorkspaceDeleted);
    };
  }, [userId, workspaceId]);

  return null;
}