import { useOS } from "@/components/contexts/OSContext";
import { useEffect, useRef, useState } from "react";
import type { IconSize, SortOption } from "@/components/contexts/OSContext";

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
  const {
    toggleTheme,
    theme,
    addNotification,
    launchApp,
    pinApp,
    unpinApp,
    pinnedApps,
    iconSize,
    changeIconSize,
    viewSettings,
    toggleAutoArrange,
    toggleAlignToGrid,
    toggleShowIcons,
    sortIcons,
    deleteApp,
    cutApp,
    copyApp,
    pasteApp,
    renameApp,
    showAppProperties,
    clipboard,
  } = useOS();

  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

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

  // Desktop context menu handlers
  const handleRefresh = () => {
    addNotification({
      title: "Refreshing desktop",
      message: "Desktop refreshed successfully.",
      type: "info",
    });
    onClose();
  };

  const handleDisplaySettings = () => {
    launchApp("settings");
    addNotification({
      title: "Settings",
      message: "Opening display settings...",
      type: "info",
    });
    onClose();
  };

  const handlePersonalize = () => {
    launchApp("settings");
    addNotification({
      title: "Settings",
      message: "Opening personalization settings...",
      type: "info",
    });
    onClose();
  };

  const handleNewFolder = () => {
    addNotification({
      title: "New Folder",
      message: "Created a new folder on the desktop.",
      type: "info",
    });
    onClose();
  };

  const handleNewTextDocument = () => {
    addNotification({
      title: "New Text Document",
      message: "Created a new text document on the desktop.",
      type: "info",
    });
    onClose();
  };

  // Handle icon size change
  const handleIconSizeChange = (size: IconSize) => {
    changeIconSize(size);
    onClose();
  };

  // Handle sort change
  const handleSortChange = (by: SortOption) => {
    sortIcons(by);
    onClose();
  };

  // Handle view option changes
  const handleAutoArrangeToggle = () => {
    toggleAutoArrange();
    onClose();
  };

  const handleAlignToGridToggle = () => {
    toggleAlignToGrid();
    onClose();
  };

  const handleShowIconsToggle = () => {
    toggleShowIcons();
    onClose();
  };

  // App context menu handlers
  const handleLaunchApp = () => {
    if (appData) {
      launchApp(appData.appId);
      onClose();
    }
  };

  const handlePinUnpinApp = () => {
    if (appData) {
      const isPinned = pinnedApps.includes(appData.appId);

      if (isPinned) {
        unpinApp(appData.appId);
        addNotification({
          title: "Taskbar",
          message: `${appData.name} unpinned from taskbar.`,
          type: "info",
        });
      } else {
        pinApp(appData.appId);
        addNotification({
          title: "Taskbar",
          message: `${appData.name} pinned to taskbar.`,
          type: "info",
        });
      }
      onClose();
    }
  };

  const handleCut = () => {
    if (appData) {
      cutApp(appData.appId);
      onClose();
    }
  };

  const handleCopy = () => {
    if (appData) {
      copyApp(appData.appId);
      onClose();
    }
  };

  const handleDelete = () => {
    if (appData) {
      deleteApp(appData.appId);
      onClose();
    }
  };

  const handleRename = () => {
    if (appData) {
      setIsRenaming(true);
      setNewName(appData.name);

      // Focus the input field after it's rendered
      setTimeout(() => {
        if (renameInputRef.current) {
          renameInputRef.current.focus();
          renameInputRef.current.select();
        }
      }, 10);
    }
  };

  const submitRename = () => {
    if (appData && newName.trim()) {
      renameApp(appData.appId, newName);
      setIsRenaming(false);
      onClose();
    }
  };

  const handleProperties = () => {
    if (appData) {
      showAppProperties(appData.appId);
      onClose();
    }
  };

  const handlePaste = () => {
    pasteApp();
    onClose();
  };

  // Toggle submenu visibility
  const toggleSubmenu = (menuName: string) => {
    if (activeSubmenu === menuName) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(menuName);
    }
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
      {isRenaming && appData ? (
        <div className="rename-dialog">
          <input
            ref={renameInputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") {
                setIsRenaming(false);
                onClose();
              }
            }}
          />
          <div className="rename-buttons">
            <button onClick={submitRename}>OK</button>
            <button
              onClick={() => {
                setIsRenaming(false);
                onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <ul className="context-menu-list">
          {targetType === "app" && appData && (
            <>
              <li className="context-menu-item" onClick={handleLaunchApp}>
                <span className="context-menu-icon">▶️</span> Open
              </li>
              <li className="context-menu-item" onClick={handlePinUnpinApp}>
                <span className="context-menu-icon">📌</span>
                {pinnedApps.includes(appData.appId)
                  ? "Unpin from taskbar"
                  : "Pin to taskbar"}
              </li>
              <li className="context-menu-item" onClick={handleCut}>
                <span className="context-menu-icon">✂️</span> Cut
              </li>
              <li className="context-menu-item" onClick={handleCopy}>
                <span className="context-menu-icon">📋</span> Copy
              </li>
              <li className="context-menu-item" onClick={handleDelete}>
                <span className="context-menu-icon">🗑️</span> Delete
              </li>
              <li className="context-menu-item" onClick={handleRename}>
                <span className="context-menu-icon">📝</span> Rename
              </li>
              <li className="context-menu-item" onClick={handleProperties}>
                <span className="context-menu-icon">⚙️</span> Properties
              </li>
            </>
          )}

          {targetType === "desktop" && (
            <>
              <li
                className={`context-menu-item ${
                  activeSubmenu === "view" ? "active" : ""
                }`}
                onClick={() => toggleSubmenu("view")}
              >
                <span className="context-menu-icon">👁️</span> View
                <span className="submenu-arrow">▶</span>
                {activeSubmenu === "view" && (
                  <ul className="submenu view-submenu">
                    <li
                      className={`submenu-item ${
                        iconSize === "large" ? "checked" : ""
                      }`}
                      onClick={() => handleIconSizeChange("large")}
                    >
                      Large icons
                    </li>
                    <li
                      className={`submenu-item ${
                        iconSize === "medium" ? "checked" : ""
                      }`}
                      onClick={() => handleIconSizeChange("medium")}
                    >
                      Medium icons
                    </li>
                    <li
                      className={`submenu-item ${
                        iconSize === "small" ? "checked" : ""
                      }`}
                      onClick={() => handleIconSizeChange("small")}
                    >
                      Small icons
                    </li>
                    <li
                      className={`submenu-item ${
                        viewSettings.autoArrange ? "checked" : ""
                      }`}
                      onClick={handleAutoArrangeToggle}
                    >
                      Auto arrange icons
                    </li>
                    <li
                      className={`submenu-item ${
                        viewSettings.alignToGrid ? "checked" : ""
                      }`}
                      onClick={handleAlignToGridToggle}
                    >
                      Align icons to grid
                    </li>
                    <li
                      className={`submenu-item ${
                        viewSettings.showIcons ? "checked" : ""
                      }`}
                      onClick={handleShowIconsToggle}
                    >
                      Show desktop icons
                    </li>
                  </ul>
                )}
              </li>
              <li
                className={`context-menu-item ${
                  activeSubmenu === "sort" ? "active" : ""
                }`}
                onClick={() => toggleSubmenu("sort")}
              >
                <span className="context-menu-icon">📋</span> Sort by
                <span className="submenu-arrow">▶</span>
                {activeSubmenu === "sort" && (
                  <ul className="submenu sort-submenu">
                    <li
                      className={`submenu-item ${
                        viewSettings.sortBy === "name" ? "checked" : ""
                      }`}
                      onClick={() => handleSortChange("name")}
                    >
                      Name{" "}
                      {viewSettings.sortBy === "name" && (
                        <span className="sort-direction">
                          {viewSettings.sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </li>
                    <li
                      className={`submenu-item ${
                        viewSettings.sortBy === "size" ? "checked" : ""
                      }`}
                      onClick={() => handleSortChange("size")}
                    >
                      Size{" "}
                      {viewSettings.sortBy === "size" && (
                        <span className="sort-direction">
                          {viewSettings.sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </li>
                    <li
                      className={`submenu-item ${
                        viewSettings.sortBy === "type" ? "checked" : ""
                      }`}
                      onClick={() => handleSortChange("type")}
                    >
                      Type{" "}
                      {viewSettings.sortBy === "type" && (
                        <span className="sort-direction">
                          {viewSettings.sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </li>
                    <li
                      className={`submenu-item ${
                        viewSettings.sortBy === "date" ? "checked" : ""
                      }`}
                      onClick={() => handleSortChange("date")}
                    >
                      Date modified{" "}
                      {viewSettings.sortBy === "date" && (
                        <span className="sort-direction">
                          {viewSettings.sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </li>
                  </ul>
                )}
              </li>
              <li className="context-menu-item" onClick={handleRefresh}>
                <span className="context-menu-icon">🔄</span> Refresh
              </li>
              <li
                className={`context-menu-item ${clipboard ? "" : "disabled"}`}
                onClick={clipboard ? handlePaste : undefined}
              >
                <span className="context-menu-icon">📋</span> Paste
              </li>
              <li
                className={`context-menu-item ${
                  activeSubmenu === "new" ? "active" : ""
                }`}
                onClick={() => toggleSubmenu("new")}
              >
                <span className="context-menu-icon">📁</span> New
                <span className="submenu-arrow">▶</span>
                {activeSubmenu === "new" && (
                  <ul className="submenu new-submenu">
                    <li className="submenu-item" onClick={handleNewFolder}>
                      Folder
                    </li>
                    <li
                      className="submenu-item"
                      onClick={handleNewTextDocument}
                    >
                      Text Document
                    </li>
                    <li className="submenu-item">Shortcut</li>
                  </ul>
                )}
              </li>
              <li className="context-menu-item" onClick={toggleTheme}>
                <span className="context-menu-icon">
                  {theme === "light" ? "🌙" : "☀️"}
                </span>
                Toggle {theme === "light" ? "Dark" : "Light"} Mode
              </li>
              <li className="context-menu-item" onClick={handleDisplaySettings}>
                <span className="context-menu-icon">🖼️</span> Display settings
              </li>
              <li className="context-menu-item" onClick={handlePersonalize}>
                <span className="context-menu-icon">⚙️</span> Personalize
              </li>
            </>
          )}
        </ul>
      )}

      <style jsx>{`
        .context-menu {
          position: fixed;
          width: 240px;
          background-color: var(--window-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow);
          z-index: 9999;
          animation: fadeIn 0.15s ease-out;
          overflow: visible;
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
          user-select: none;
        }

        .context-menu-item:hover,
        .context-menu-item.active {
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

        .submenu {
          position: absolute;
          top: 0;
          left: 100%;
          background-color: var(--window-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow);
          list-style: none;
          padding: 4px 0;
          margin: 0;
          min-width: 180px;
          z-index: 10000;
          animation: fadeIn 0.15s ease-out;
        }

        .submenu-item {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.1s;
        }

        .submenu-item:hover {
          background-color: var(--hover-bg);
        }

        .submenu-item.checked {
          position: relative;
          font-weight: 500;
          background-color: var(--hover-bg);
        }

        .submenu-item.checked::before {
          content: "✓";
          position: absolute;
          left: 6px;
          opacity: 0.8;
        }

        .submenu-item.checked {
          padding-left: 24px;
        }

        .rename-dialog {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rename-dialog input {
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .rename-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .rename-buttons button {
          padding: 4px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          color: var(--text-color);
          cursor: pointer;
        }

        .rename-buttons button:hover {
          background-color: var(--hover-bg);
        }

        .context-menu-item.disabled {
          opacity: 0.5;
          cursor: default;
        }

        .context-menu-item.disabled:hover {
          background-color: transparent;
        }

        .sort-direction {
          margin-left: 4px;
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
