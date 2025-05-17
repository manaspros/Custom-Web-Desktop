"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Define types for our applications
export type AppType = {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultSize?: { width: number; height: number };
  isResizable?: boolean;
  isPinned?: boolean;
};

// Define types for open window state
export type WindowState = {
  id: string;
  appId: string;
  title: string;
  isActive: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
};

// Define the OS context state type
type OSContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  wallpaper: string;
  isStartMenuOpen: boolean;
  isNotificationCenterOpen: boolean;
  isWidgetPanelOpen: boolean;
  isSearchPanelOpen: boolean;
  apps: AppType[];
  openWindows: WindowState[];
  notifications: any[];
  pinnedApps: string[];
  recentApps: string[];
  openApp: (appId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (
    windowId: string,
    position: { x: number; y: number }
  ) => void;
  updateWindowSize: (
    windowId: string,
    size: { width: number; height: number }
  ) => void;
  toggleStartMenu: () => void;
  toggleNotificationCenter: () => void;
  toggleWidgetPanel: () => void;
  toggleSearchPanel: () => void;
  changeWallpaper: (url: string) => void;
  addNotification: (notification: any) => void;
  dismissNotification: (id: string) => void;
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  launchApp: (appId: string) => void;
  clearNotifications: () => void;
};

// Create the context with default values
export const OSContext = createContext<OSContextType>({
  theme: "light",
  setTheme: () => {},
  wallpaper: "/wallpapers/default.jpg",
  isStartMenuOpen: false,
  isNotificationCenterOpen: false,
  isWidgetPanelOpen: false,
  isSearchPanelOpen: false,
  apps: [],
  openWindows: [],
  notifications: [],
  pinnedApps: [],
  recentApps: [],
  openApp: () => {},
  closeWindow: () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  restoreWindow: () => {},
  focusWindow: () => {},
  updateWindowPosition: () => {},
  updateWindowSize: () => {},
  toggleStartMenu: () => {},
  toggleNotificationCenter: () => {},
  toggleWidgetPanel: () => {},
  toggleSearchPanel: () => {},
  changeWallpaper: () => {},
  addNotification: () => {},
  dismissNotification: () => {},
  pinApp: () => {},
  unpinApp: () => {},
  launchApp: () => {},
  clearNotifications: () => {},
});

// Provider component
export const OSProvider: React.FC<{
  children: ReactNode;
  registeredApps: AppType[];
}> = ({ children, registeredApps }) => {
  // States
  const [theme, setTheme] = useState<string>("light");
  const [apps, setApps] = useState<AppType[]>(registeredApps);
  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pinnedApps, setPinnedApps] = useState<string[]>([]);
  const [recentApps, setRecentApps] = useState<string[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] =
    useState(false);
  const [isWidgetPanelOpen, setIsWidgetPanelOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState("/wallpapers/default.jpg");
  const [highestZIndex, setHighestZIndex] = useState(0);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("win11-theme") as
      | "light"
      | "dark"
      | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedPinnedApps = localStorage.getItem("win11-pinned-apps");
    const savedRecentApps = localStorage.getItem("win11-recent-apps");
    const savedWallpaper = localStorage.getItem("win11-wallpaper");

    if (savedPinnedApps) setPinnedApps(JSON.parse(savedPinnedApps));
    if (savedRecentApps) setRecentApps(JSON.parse(savedRecentApps));
    if (savedWallpaper) setWallpaper(savedWallpaper);
  }, []);

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem("win11-theme", theme);
    localStorage.setItem("win11-pinned-apps", JSON.stringify(pinnedApps));
    localStorage.setItem("win11-recent-apps", JSON.stringify(recentApps));
    localStorage.setItem("win11-wallpaper", wallpaper);

    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, pinnedApps, recentApps, wallpaper]);

  // Window management functions
  const openApp = (appId: string) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    // Update recent apps
    setRecentApps((prev) => {
      const filtered = prev.filter((id) => id !== appId);
      return [appId, ...filtered].slice(0, 6); // Keep only last 6
    });

    // Check if app is already open
    const existingWindow = openWindows.find(
      (w) => w.appId === appId && !w.isMinimized
    );
    if (existingWindow) {
      focusWindow(existingWindow.id);
      return;
    }

    // Calculate initial position with offset for cascading windows
    const openCount = openWindows.length;
    const offset = (openCount % 5) * 30;

    const newWindow: WindowState = {
      id: `window-${Date.now()}`,
      appId,
      title: app.name,
      isActive: true,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + offset, y: 100 + offset },
      size: app.defaultSize || { width: 800, height: 600 },
      zIndex: highestZIndex + 1,
    };

    setHighestZIndex((prev) => prev + 1);

    // Deactivate all other windows and add new one
    setOpenWindows((prev) => [
      ...prev.map((w) => ({ ...w, isActive: false })),
      newWindow,
    ]);
  };

  const closeWindow = (windowId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const minimizeWindow = (windowId: string) => {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMinimized: true, isActive: false } : w
      )
    );

    // Focus next available window if there is one
    const availableWindows = openWindows.filter(
      (w) => !w.isMinimized && w.id !== windowId
    );

    if (availableWindows.length > 0) {
      focusWindow(availableWindows[0].id);
    }
  };

  const maximizeWindow = (windowId: string) => {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === windowId
          ? { ...w, isMaximized: true, isActive: true }
          : { ...w, isActive: false }
      )
    );
  };

  const restoreWindow = (windowId: string) => {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === windowId
          ? { ...w, isMaximized: false, isMinimized: false, isActive: true }
          : { ...w, isActive: false }
      )
    );
  };

  const focusWindow = (windowId: string) => {
    const newZIndex = highestZIndex + 1;
    setHighestZIndex(newZIndex);

    setOpenWindows((prev) =>
      prev.map((w) =>
        w.id === windowId
          ? { ...w, isActive: true, isMinimized: false, zIndex: newZIndex }
          : { ...w, isActive: false }
      )
    );
  };

  const updateWindowPosition = (
    windowId: string,
    position: { x: number; y: number }
  ) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, position } : w))
    );
  };

  const updateWindowSize = (
    windowId: string,
    size: { width: number; height: number }
  ) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, size } : w))
    );
  };

  // Menu and panel toggles
  const toggleStartMenu = () => {
    setIsStartMenuOpen((prev) => !prev);
    if (isNotificationCenterOpen) setIsNotificationCenterOpen(false);
    if (isWidgetPanelOpen) setIsWidgetPanelOpen(false);
    if (isSearchPanelOpen) setIsSearchPanelOpen(false);
  };

  const toggleNotificationCenter = () => {
    setIsNotificationCenterOpen((prev) => !prev);
    if (isStartMenuOpen) setIsStartMenuOpen(false);
    if (isWidgetPanelOpen) setIsWidgetPanelOpen(false);
    if (isSearchPanelOpen) setIsSearchPanelOpen(false);
  };

  const toggleWidgetPanel = () => {
    setIsWidgetPanelOpen((prev) => !prev);
    if (isStartMenuOpen) setIsStartMenuOpen(false);
    if (isNotificationCenterOpen) setIsNotificationCenterOpen(false);
    if (isSearchPanelOpen) setIsSearchPanelOpen(false);
  };

  const toggleSearchPanel = () => {
    setIsSearchPanelOpen((prev) => !prev);
    if (isStartMenuOpen) setIsStartMenuOpen(false);
    if (isNotificationCenterOpen) setIsNotificationCenterOpen(false);
    if (isWidgetPanelOpen) setIsWidgetPanelOpen(false);
  };

  // Wallpaper change
  const changeWallpaper = (url: string) => {
    setWallpaper(url);
  };

  // Notification system
  const addNotification = (notification: any) => {
    const newNotification = {
      id: `notification-${Date.now()}`,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Auto dismiss after 5 seconds if not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 5000);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // App pinning
  const pinApp = (appId: string) => {
    setPinnedApps((prev) => {
      if (prev.includes(appId)) return prev;
      return [...prev, appId];
    });
  };

  const unpinApp = (appId: string) => {
    setPinnedApps((prev) => prev.filter((id) => id !== appId));
  };

  // Generate a randomized position for new windows
  const generateWindowPosition = () => {
    const offsetX = Math.floor(Math.random() * 100);
    const offsetY = Math.floor(Math.random() * 100);
    return {
      x: 100 + offsetX,
      y: 100 + offsetY,
    };
  };

  // Launch app (create new window)
  const launchApp = (appId: string) => {
    console.log("Launching app:", appId); // Add debug log

    // App title mapping
    const appTitles: { [key: string]: string } = {
      fileExplorer: "File Explorer",
      browser: "Microsoft Edge",
      notepad: "Notepad",
      calendar: "Calendar",
      weather: "Weather",
      calculator: "Calculator",
      settings: "Settings",
    };

    // Default dimensions
    const defaultDimensions: {
      [key: string]: { width: number; height: number };
    } = {
      fileExplorer: { width: 800, height: 600 },
      browser: { width: 1000, height: 700 },
      notepad: { width: 600, height: 500 },
      calendar: { width: 800, height: 600 },
      weather: { width: 500, height: 700 },
      calculator: { width: 350, height: 500 },
      settings: { width: 900, height: 700 },
    };

    const title = appTitles[appId] || "Application";
    const { width, height } = defaultDimensions[appId] || {
      width: 800,
      height: 600,
    };
    const { x, y } = generateWindowPosition();
    const id = `window-${appId}-${Date.now()}`;

    // Check if window is already open
    const existingWindowIndex = openWindows.findIndex(
      (window) => window.appId === appId && !window.isMinimized
    );

    if (existingWindowIndex !== -1) {
      // Focus existing window
      focusWindow(openWindows[existingWindowIndex].id);
      return;
    }

    // Get highest z-index
    const highestZIndex = openWindows.reduce(
      (max, window) => Math.max(max, window.zIndex),
      0
    );

    const newWindow: WindowState = {
      id,
      appId,
      title,
      isActive: true,
      isMinimized: false,
      isMaximized: false,
      position: { x, y },
      size: { width, height },
      zIndex: highestZIndex + 1,
    };

    // Add the new window and update active window
    setOpenWindows((prev) => {
      // Set all other windows as inactive
      const updatedWindows = prev.map((window) => ({
        ...window,
        isActive: false,
      }));

      return [...updatedWindows, newWindow];
    });

    setHighestZIndex((prev) => prev + 1);
    setIsStartMenuOpen(false);
    setIsNotificationCenterOpen(false);
    setIsWidgetPanelOpen(false);
  };

  // Context value
  const contextValue: OSContextType = {
    theme,
    setTheme,
    wallpaper,
    isStartMenuOpen,
    isNotificationCenterOpen,
    isWidgetPanelOpen,
    isSearchPanelOpen,
    apps,
    openWindows,
    notifications,
    pinnedApps,
    recentApps,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    toggleStartMenu,
    toggleNotificationCenter,
    toggleWidgetPanel,
    toggleSearchPanel,
    changeWallpaper,
    addNotification,
    dismissNotification,
    pinApp,
    unpinApp,
    launchApp,
    clearNotifications,
  };

  return (
    <OSContext.Provider value={contextValue}>{children}</OSContext.Provider>
  );
};

// Custom hook for using the OS context
export const useOS = () => useContext(OSContext);
