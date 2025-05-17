import { useOS } from "@/components/contexts/OSContext";
import { useState, useEffect } from "react";

// Define the structure for app shortcut data
interface AppShortcut {
  id: string;
  name: string;
  icon: string; // Icon emoji or path to icon image
  appId: string; // ID to launch the corresponding app
}

export default function DesktopIcons() {
  const { launchApp } = useOS();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // Debug
  useEffect(() => {
    console.log("DesktopIcons mounted, launchApp available:", !!launchApp);
  }, [launchApp]);

  // App shortcuts data - can be moved to a config file or context
  const appShortcuts: AppShortcut[] = [
    {
      id: "file-explorer",
      name: "File Explorer",
      icon: "📁",
      appId: "fileExplorer",
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
  ];

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

  return (
    <div className="desktop-icons">
      {appShortcuts.map((app) => (
        <div
          key={app.id}
          className={`desktop-icon ${
            selectedIcon === app.id ? "selected" : ""
          }`}
          onClick={(e) => handleIconClick(app.id, e)}
          onDoubleClick={(e) => handleIconDoubleClick(app.appId, e)}
          data-app-id={app.appId} // Important: Use appId, not id for better matching
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
          grid-template-columns: repeat(auto-fill, 80px);
          grid-auto-rows: 100px;
          gap: 16px;
          padding: 24px;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2; /* Above wallpaper but below windows */
          pointer-events: none; /* Let events pass through to wallpaper */
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
          width: 80px;
          height: 100px;
          user-select: none;
          z-index: 3;
          pointer-events: auto; /* Allow interactions with icons */
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
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
        }

        .app-icon {
          font-size: 32px;
        }

        .app-name {
          font-size: 12px;
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
