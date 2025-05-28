import { useRef, useEffect } from "react";
import { useOS } from "@/components/contexts/OSContext";

export default function NotificationCenter() {
  const { notifications, dismissNotification, toggleNotificationCenter } =
    useOS();
  const notificationCenterRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationCenterRef.current &&
        !notificationCenterRef.current.contains(event.target as Node)
      ) {
        toggleNotificationCenter();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleNotificationCenter]);

  // Group notifications by date
  const today = new Date().toDateString();

  const notificationsByDate = notifications.reduce<
    Record<string, typeof notifications>
  >((acc, notification) => {
    const date = new Date(notification.timestamp).toDateString();
    const key = date === today ? "Today" : date;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(notification);
    return acc;
  }, {});

  // Sort date groups with Today first, then by date (newest first)
  const sortedDates = Object.keys(notificationsByDate).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    return new Date(b).getTime() - new Date(a).getTime();
  });
  return (
    <div ref={notificationCenterRef} className="notification-center">
      <div className="notification-header">
        <h2 className="notification-title">Notifications</h2>
      </div>
      <div className="notifications-container">
        {" "}
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <span className="notification-icon">🔔</span>
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="notifications-list">
            {" "}
            {sortedDates.map((date) => (
              <div key={date} className="notification-group">
                <h3 className="notification-date">{date}</h3>{" "}
                {notificationsByDate[date].map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                  >
                    {" "}
                    <div className="notification-header-flex">
                      <h4 className="notification-title-small">
                        {notification.title}
                      </h4>
                      <button
                        className="dismiss-btn"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <div className="notification-time">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>{" "}
      <div className="notification-footer">
        <button className="clear-all-btn">Clear all</button>
        <button className="settings-btn">Notification settings</button>
      </div>
    </div>
  );
}
