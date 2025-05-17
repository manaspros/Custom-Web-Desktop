import { useOS } from "@/components/contexts/OSContext";
import { useEffect, useRef } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  targetType: "desktop" | "app";
  appData?: {
    id: string;
    name: string;
    appId: string;
  } | null;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  targetType,
  appData,
}: ContextMenuProps) {
  const { toggleTheme, theme, addNotification, launchApp } = useOS();
  const menuRef = useRef<HTMLDivElement>(null);

  // Ensure the context menu doesn't go off-screen
  const adjustPosition = () => {
    const menuWidth = 240;
    const menuHeight = 320;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const adjustedX = Math.min(x, windowWidth - menuWidth);
    const adjustedY = Math.min(y, windowHeight - menuHeight);

    return { x: adjustedX, y: adjustedY };
  };

  const { x: adjustedX, y: adjustedY } = adjustPosition();

  // Close the context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleRefresh = () => {
    addNotification({
      title: "Refreshing desktop",
      message: "Desktop refreshed successfully.",
      type: "info",
    });
    onClose();
  };

  const handleLaunchApp = () => {
    if (appData) {
      launchApp(appData.appId);
      onClose();
    }
  };

  const handleNewFolder = () => {
    addNotification({
      title: "New Folder",
      message: "Creating a new folder...",
      type: "info",
    });
    onClose();
  };

  // Prevent clicks inside the menu from bubbling to window
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
      onClick={handleMenuClick}
    >
      <ul className="context-menu-list">
        {targetType === "app" && appData && (
          <>
            <li className="context-menu-item" onClick={handleLaunchApp}>
              <span className="context-menu-icon">▶️</span> Open
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">📌</span> Pin to taskbar
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">✂️</span> Cut
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">📋</span> Copy
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">🗑️</span> Delete
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">📝</span> Rename
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">⚙️</span> Properties
            </li>
          </>
        )}

        {targetType === "desktop" && (
          <>
            <li className="context-menu-item">
              <span className="context-menu-icon">👁️</span> View
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">📋</span> Sort by
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="context-menu-item" onClick={handleRefresh}>
              <span className="context-menu-icon">🔄</span> Refresh
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">📋</span> Paste
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">📁</span> New
              <span className="submenu-arrow">▶</span>
            </li>
            <li className="context-menu-item" onClick={toggleTheme}>
              <span className="context-menu-icon">
                {theme === "light" ? "🌙" : "☀️"}
              </span>
              Toggle {theme === "light" ? "Dark" : "Light"} Mode
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">🖼️</span> Display settings
            </li>
            <li className="context-menu-item">
              <span className="context-menu-icon">⚙️</span> Personalize
            </li>
          </>
        )}
      </ul>

      <style jsx>{`
        .context-menu {
          position: fixed;
          width: 240px;
          background-color: var(--window-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow);
          z-index: 9999; /* Ensure it's above everything else */
          animation: fadeIn 0.15s ease-out;
          overflow: hidden;
          pointer-events: auto;
        }

        .context-menu-list {
          list-style: none;
          padding: 4px 0;
          margin: 0;
        }

        .context-menu-item {
          padding: 8px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 14px;
          transition: background-color 0.1s;
          position: relative;
        }

        .context-menu-item:hover {
          background-color: var(--hover-bg);
        }

        .context-menu-icon {
          margin-right: 12px;
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .submenu-arrow {
          position: absolute;
          right: 10px;
          font-size: 10px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
