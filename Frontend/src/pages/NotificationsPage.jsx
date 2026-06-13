import { useParams } from "react-router-dom";

import NotificationList from "../components/NotificationList";

import {
    useNotifications,
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useDeleteNotification
} from "../queries/notificationQueries";

function NotificationsPage() {

    const { workspaceId } =
        useParams();

    const {
        data: notifications = [],
        isLoading,
        error
    } = useNotifications(workspaceId);

    const markAllRead =
        useMarkAllNotificationsRead(
            workspaceId
        );

    const markRead =
        useMarkNotificationRead(
            workspaceId
        );

    const deleteNotification =
        useDeleteNotification(
            workspaceId
        );

    return (
        <div className="dashboard-page">
            <div className="dashboard-shell">

                <NotificationList
                    notifications={
                        notifications
                    }
                    loading={
                        isLoading
                    }
                    error={
                        error?.message
                    }
                    markAllRead={() =>
                        markAllRead.mutate()
                    }
                    markRead={(id) =>
                        markRead.mutate(id)
                    }
                    deleteNotification={(id) =>
                        deleteNotification.mutate(id)
                    }
                />

            </div>
        </div>
    );
}

export default NotificationsPage;