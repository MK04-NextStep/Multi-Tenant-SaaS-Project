import { useMemo, useState } from 'react';
import '../styles/notifications.css';
import { authorizedFetch } from '../lib/api';
import { Link } from 'react-router-dom';

function NotificationList({ notifications, loading,
  error, markAllRead, markRead, deleteNotification }) {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const displayedNotifications =
    useMemo(() => {

      if (!showUnreadOnly) {
        return notifications;
      }

      return notifications.filter(
        notification =>
          !notification.isRead
      );

    }, [
      showUnreadOnly,
      notifications
    ]);
  let inviteList = new Set(["INVITE_IN_WORKSPACE", "INVITE_IN_TEAM"])

  return (
    <div className="dashboard-panel">
      <div className="notification-header"><div>
        <h2 className="dashboard-heading">
          Notifications
        </h2>

        <p className="dashboard-hint">
          Stay updated with workspace,
          team, project and task
          activity.
        </p>
      </div>

        <div className="notification-actions">
          <button
            className={
              showUnreadOnly
                ? 'notification-filter active'
                : 'notification-filter'
            }
            onClick={() =>
              setShowUnreadOnly(
                (prev) => !prev
              )
            }
          >
            {showUnreadOnly
              ? 'Show All'
              : 'Show Unread'}
          </button>

          <button
            className="dashboard-btn-primary"
            onClick={markAllRead}
          >
            Mark All Read
          </button>
        </div>
      </div>
      {loading ? (
        <div className="notification-empty">
          Loading notifications...
        </div>
      ) : error ? (
        <div className="notification-empty">
          {error}
        </div>
      ) : displayedNotifications.length ===
        0 ? (
        <div className="notification-empty">
          No notifications found.
        </div>
      ) : (
        <div className="notification-list">
          {displayedNotifications.map(
            (notification) => (
              <div
                key={notification._id}
                className={
                  notification.read
                    ? 'notification-card'
                    : 'notification-card unread'
                }
              >
                <div className="notification-top">
                  <div
                    className={`notification-type ${notification.type.toLowerCase()}`}
                  >
                    {notification.type}
                  </div>

                  {!notification.read && (
                    <span className="unread-dot"></span>
                  )}
                </div>

                <h3>
                  {notification.title}
                </h3>

                <p>
                  {notification.message}
                </p>

                <span className="notification-time">
                  {notification.time}
                </span>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className='dashboard-btn-primary'
                      type="button"
                      onClick={() =>
                        markRead(
                          notification._id
                        )
                      }
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    type="button"
                    className='dashboard-btn-primary'

                    onClick={() =>
                      deleteNotification(
                        notification._id
                      )
                    }
                  >
                    Delete
                  </button>
                  {!notification.isRead &&
                    inviteList.has(notification.type) && (
                      <Link
                        to="/accept-invite"
                        state={{ entity: notification.entityType?.toLowerCase() }}
                      >
                        <button
                          className="dashboard-btn-primary"
                          type="button"
                        >
                          Accept the invitation
                        </button>
                      </Link>
                    )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default NotificationList;