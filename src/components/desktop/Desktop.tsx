"use client";

import { useState, useEffect, MouseEvent } from "react";
import { useOS } from "@/components/contexts/OSContext";
import Taskbar from "../taskbar/Taskbar";
import WindowManager from "../windows/WindowManager";
import StartMenu from "../taskbar/StartMenu";
import NotificationCenter from "@/components/system/NotificationCenter";
import WidgetPanel from "@/components/system/WidgetPanel";
import ContextMenu from "@/components/desktop/ContextMenu";
import DesktopIcons from "./DesktopIcons";
import SearchPanel from "@/components/system/SearchPanel";

interface DesktopProps {
  className?: string;
}

export default function Desktop({ className }: DesktopProps) {
  const {
    wallpaper,
    isStartMenuOpen,
    isNotificationCenterOpen,
    isWidgetPanelOpen,
    isSearchPanelOpen,
  } = useOS();

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetType: "desktop" | "app";
    appData: {
      id: string;
      name: string;
      appId: string;
    } | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    targetType: "desktop",
    appData: null,
  });
  // Handle context menu
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Ignore clicks on the taskbar completely
    if (e.target instanceof Element) {
      const taskbarElement = document.querySelector(".taskbar-position");
      if (taskbarElement && taskbarElement.contains(e.target)) {
        return;
      }
    }

    // Check if clicking on an app icon (using a more robust approach)
    const target = e.target as HTMLElement;
    const appIcon = target.closest("[data-app-id]");

    // Handle right-clicks differently based on where they occurred
    if (appIcon) {
      console.log("Right-clicked on app icon");
      // Right-click on app icon
      const appId = appIcon.getAttribute("data-app-id");
      const appName = appIcon.querySelector(".app-name")?.textContent || "";

      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        targetType: "app",
        appData: {
          id: appId || "",
          name: appName,
          appId: appId || "",
        },
      });
    } else {
      console.log("Right-clicked on desktop");
      // Right-click on desktop or wallpaper
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        targetType: "desktop",
        appData: null,
      });
    }
  };

  // Handle click to close context menu
  const handleClick = (e: MouseEvent) => {
    if (contextMenu.visible) {
      // Don't close if clicking inside context menu
      if (e.target instanceof Element) {
        const contextMenuElement = document.querySelector(".context-menu");
        if (contextMenuElement && contextMenuElement.contains(e.target)) {
          return;
        }
      }

      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Use window-level event listeners for document clicks
  useEffect(() => {
    const handleWindowClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    // Add listener to window to catch all clicks
    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [contextMenu]);
  return (
    <div
      className={`desktop-container ${className || ""}`}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Wallpaper */}
      <div
        className="wallpaper"
        style={{
          backgroundImage: `url(${wallpaper})`,
        }}
      />
      {/* Desktop Icons - Make sure it's defined before WindowManager */}
      <DesktopIcons />
      {/* Windows */}
      <WindowManager />
      {/* Context Menu - Set high z-index */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          targetType={contextMenu.targetType}
          appData={contextMenu.appData}
        />
      )}
      {/* UI Elements */}
      {isStartMenuOpen && <StartMenu />}
      {isNotificationCenterOpen && <NotificationCenter />}
      {isWidgetPanelOpen && <WidgetPanel />}
      {isSearchPanelOpen && <SearchPanel />}
      {/* Taskbar - Keep separate from desktop event handling */}
      <div className="taskbar-container">
        <Taskbar className="taskbar-position" />
      </div>{" "}
      <style jsx>{`
        .desktop-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: var(--bg-color);
        }

        .wallpaper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--bg-color);
          background-size: cover;
          background-position: center;
          z-index: 1;
          pointer-events: auto; /* Allow right-clicks on wallpaper */
        }

        .taskbar-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          pointer-events: auto;
        } /* Override global styles for context menu */
        :global(.context-menu) {
          z-index: 9999 !important;
          pointer-events: auto !important;
        }

        /* Ensure desktop icons receive proper events */
        :global(.desktop-icons) {
          pointer-events: auto !important;
          z-index: 10 !important;
        }

        :global(.desktop-icon) {
          pointer-events: auto !important;
          z-index: 11 !important;
        }

        /* Make window portal respect pointer events */
        :global(#window-portal) {
          pointer-events: none !important; /* Base state is none */
        }

        :global(#window-portal .window) {
          pointer-events: auto !important; /* But windows themselves should capture events */
        }
      `}</style>
    </div>
  );
}
