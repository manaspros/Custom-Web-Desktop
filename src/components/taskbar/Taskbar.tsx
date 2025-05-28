import { useOS } from "@/components/contexts/OSContext";
import { useState, useEffect } from "react";

interface TaskbarProps {
  className?: string;
}

export default function Taskbar({ className = "" }: TaskbarProps) {
  const {
    toggleStartMenu,
    isStartMenuOpen,
    toggleNotificationCenter,
    isNotificationCenterOpen,
    toggleWidgetPanel,
    isWidgetPanelOpen,
    toggleSearchPanel,
    isSearchPanelOpen,
    openWindows,
    pinnedApps,
    openApp,
    focusWindow,
    restoreWindow,
    minimizeWindow,
  } = useOS();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Add missing implementation to use the variable
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString());
    };

    // Call once immediately
    updateTime();

    // Set up interval
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get all pinned and open apps for the taskbar
  const taskbarAppIds = Array.from(
    new Set([...pinnedApps, ...openWindows.map((w) => w.appId)])
  );

  // Open resume function
  const openResume = () => {
    // Set the fileId to open
    localStorage.setItem("pdf-open-file", "resume-pdf");
    // Launch the PDF viewer
    openApp("pdfviewer");
  };

  // Prevent event propagation to Desktop component
  const handleTaskbarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`taskbar ${className}`}
      onClick={handleTaskbarClick}
      onContextMenu={(e) => e.stopPropagation()} // Stop right-click propagation
    >
      {/* Start Button */}
      <button
        className={`start-button ${isStartMenuOpen ? "active" : ""}`}
        onClick={toggleStartMenu}
      >
        <span className="text-white text-2xl">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11 3H3V11H11V3Z" fill="white" />
            <path d="M21 3H13V11H21V3Z" fill="white" />
            <path d="M11 13H3V21H11V13Z" fill="white" />
            <path d="M21 13H13V21H21V13Z" fill="white" />
          </svg>
        </span>
      </button>

      {/* Resume Button - Added to bottom left */}
      <button
        className="resume-button"
        onClick={openResume}
        title="View Resume"
      >
        <span>📕</span>
      </button>

      {/* Taskbar Search - Updated to be clickable */}
      <button
        className={`taskbar-search ${isSearchPanelOpen ? "active" : ""}`}
        onClick={toggleSearchPanel}
      >
        🔍 Search
      </button>

      {/* Pinned/Open Apps */}
      <div className="taskbar-apps">
        {taskbarAppIds.map((appId) => {
          // Fixed - Get app info for display
          const app = openWindows.find((w) => w.appId === appId);
          const isActive = openWindows.some(
            (w) => w.appId === appId && w.isActive
          );
          const isAppOpen = openWindows.some((w) => w.appId === appId);
          const openWindowsForApp = openWindows.filter((w) => w.appId === appId);

          return (
            <button
              key={appId}
              className={`taskbar-app-icon
                           ${isActive ? "active" : ""}
                           ${isAppOpen ? "open" : ""}`}
              onClick={() => {
                if (!isAppOpen) {
                  openApp(appId);
                } else {
                  // If app has multiple windows open
                  if (openWindowsForApp.length > 1) {
                    // Toggle between windows
                    // For now, just focus the first non-active window or the first window
                    const nonActiveWindow = openWindowsForApp.find(
                      (w) => !w.isActive
                    );
                    if (nonActiveWindow) {
                      if (nonActiveWindow.isMinimized) {
                        restoreWindow(nonActiveWindow.id);
                      } else {
                        focusWindow(nonActiveWindow.id);
                      }
                    } else {
                      if (openWindowsForApp[0].isMinimized) {
                        restoreWindow(openWindowsForApp[0].id);
                      } else {
                        focusWindow(openWindowsForApp[0].id);
                      }
                    }
                  } else {
                    // Just one window
                    const window = openWindowsForApp[0];
                    if (window.isMinimized) {
                      restoreWindow(window.id);
                    } else if (window.isActive) {
                      minimizeWindow(window.id);
                    } else {
                      focusWindow(window.id);
                    }
                  }
                }
              }}
            >
              {" "}
              <span className="app-icon-text">
                {app ? app.title[0] : appId[0].toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
      {/* System Tray */}
      <div className="system-tray">
        {/* Widget Panel Toggle */}
        <button
          className={`widget-toggle ${isWidgetPanelOpen ? "active" : ""}`}
          onClick={toggleWidgetPanel}
        >
          <span>📰</span>
        </button>{" "}
        {/* Notification Center Toggle */}
        <button
          className={`notification-toggle ${
            isNotificationCenterOpen ? "active" : ""
          }`}
          onClick={toggleNotificationCenter}
        >
          <span>🔔</span>
        </button>
        {/* Time & Date */}
        <div className="time-date">
          <div className="time">{currentTime}</div>
          <div className="date">{currentDate}</div>
        </div>
        {/* Show Desktop Button */}
        <button className="show-desktop"></button>
      </div>
      <style jsx>{`
        .taskbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 48px;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          padding: 0 12px;
          z-index: 100;
          pointer-events: auto;
        }

        .resume-button {
          padding: 8px;
          margin: 0 4px;
          border-radius: 6px;
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          transition: background-color 0.15s;
          cursor: pointer;
        }

        .resume-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .resume-button:active {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .taskbar-search {
          margin: 0 8px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 4px 12px;
          color: white;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .taskbar-search:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .taskbar-search.active {
          background-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
        }

        /* ...existing styles... */
      `}</style>
    </div>
  );
}
