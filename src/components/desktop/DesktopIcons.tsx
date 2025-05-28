import { useOS } from "@/components/contexts/OSContext";
import { useState, useEffect, useMemo } from "react";

// Define the structure for app shortcut data
interface AppShortcut {
  id: string;
  name: string;
  icon: string; // Icon emoji or path to icon image
  appId: string; // ID to launch the corresponding app
}

export default function DesktopIcons() {
  const { launchApp, viewSettings } = useOS();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [sortedShortcuts, setSortedShortcuts] = useState<AppShortcut[]>([]);

  // Move app shortcuts to useMemo to fix dependencies
  const appShortcuts = useMemo(
    () => [
      {
        id: "shortcut-1",
        name: "File Explorer",
        icon: "📁",
        appId: "explorer",
      },
      {
        id: "browser",
        name: "Edge",
        icon: "🌐",
        appId: "browser",
      },
      {
        id: "notepad",
        name: "Notepad",
        icon: "📝",
        appId: "notepad",
      },
      {
        id: "calendar",
        name: "Calendar",
        icon: "📅",
        appId: "calendar",
      },
      {
        id: "weather",
        name: "Weather",
        icon: "🌤️",
        appId: "weather",
      },
      {
        id: "calculator",
        name: "Calculator",
        icon: "🧮",
        appId: "calculator",
      },
      {
        id: "settings",
        name: "Settings",
        icon: "⚙️",
        appId: "settings",
      },
    ],
    []
  );

  // Debug
  useEffect(() => {
    console.log("DesktopIcons mounted, launchApp available:", !!launchApp);
  }, [launchApp]);

  // Auto-sort app shortcuts when sort settings change
  useEffect(() => {
    const sorted = [...appShortcuts].sort((a, b) => {
      // Apply current sort settings
      const { sortBy, sortDirection } = viewSettings;

      // Direction multiplier
      const dirMult = sortDirection === "asc" ? 1 : -1;

      switch (sortBy) {
        case "name":
          return dirMult * a.name.localeCompare(b.name);
        case "type":
          // For demo, use the app's ID as a stand-in for file type
          return dirMult * a.appId.localeCompare(b.appId);
        case "size":
          // For demo, use random sizes (in a real system we'd use actual file sizes)
          const sizeA = a.name.length * 1024; // Fake size based on name length
          const sizeB = b.name.length * 1024;
          return dirMult * (sizeA - sizeB);
        case "date":
          // For demo, just use alphabetical as we don't have real dates
          return dirMult * a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setSortedShortcuts(sorted);
  }, [appShortcuts, viewSettings.sortBy, viewSettings.sortDirection, viewSettings]); // Added viewSettings dependency

  // Handle single click (select icon)
  const handleIconClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIcon(id);
  };

  // Handle double click (launch app)
  const handleIconDoubleClick = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    launchApp(appId);
  };

  // Clear selection when clicking elsewhere
  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only clear if clicking directly on the desktop container, not on icons
    if (e.currentTarget === e.target) {
      setSelectedIcon(null);
    }
  };

  // Calculate grid and icon sizing from view settings
  const getIconStyles = () => {
    switch (viewSettings.iconSize) {
      case "large":
        return {
          icon: {
            containerWidth: "120px",
            containerHeight: "140px",
            iconSize: "48px",
            fontSize: "14px",
          },
          grid: {
            gridTemplateColumns: "repeat(auto-fill, 120px)",
            gridAutoRows: "140px",
          },
        };
      case "small":
        return {
          icon: {
            containerWidth: "64px",
            containerHeight: "80px",
            iconSize: "24px",
            fontSize: "11px",
          },
          grid: {
            gridTemplateColumns: "repeat(auto-fill, 64px)",
            gridAutoRows: "80px",
          },
        };
      case "medium":
      default:
        return {
          icon: {
            containerWidth: "80px",
            containerHeight: "100px",
            iconSize: "32px",
            fontSize: "12px",
          },
          grid: {
            gridTemplateColumns: "repeat(auto-fill, 80px)",
            gridAutoRows: "100px",
          },
        };
    }
  };

  const styles = getIconStyles();

  return (
    <div
      className="desktop-icons"
      onClick={handleDesktopClick}
      style={{ display: viewSettings.showIcons ? "grid" : "none" }}
    >
      {sortedShortcuts.map((app) => (
        <div
          key={app.id}
          className={`desktop-icon ${
            selectedIcon === app.id ? "selected" : ""
          }`}
          onClick={(e) => handleIconClick(app.id, e)}
          onDoubleClick={(e) => handleIconDoubleClick(app.appId, e)}
          data-app-id={app.appId}
        >
          <div className="icon-wrapper">
            <div className="app-icon">{app.icon}</div>
          </div>
          <div className="app-name">{app.name}</div>
        </div>
      ))}
      <style jsx>{`
        .desktop-icons {
          display: grid;
          grid-template-columns: ${styles.grid.gridTemplateColumns};
          grid-auto-rows: ${styles.grid.gridAutoRows};
          gap: 16px;
          padding: 24px;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          pointer-events: auto;
        }

        .desktop-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.1s;
          width: ${styles.icon.containerWidth};
          height: ${styles.icon.containerHeight};
          user-select: none;
          z-index: 11;
          pointer-events: auto;
        }

        .desktop-icon:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .desktop-icon.selected {
          background-color: var(--selected-bg);
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${styles.icon.iconSize};
          height: ${styles.icon.iconSize};
          margin-bottom: 8px;
        }

        .app-icon {
          font-size: ${styles.icon.iconSize};
        }

        .app-name {
          font-size: ${styles.icon.fontSize};
          text-align: center;
          color: var(--text-color);
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
