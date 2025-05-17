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

// Define icon size options
export type IconSize = "small" | "medium" | "large";

// Define sort options
export type SortOption = "name" | "size" | "type" | "date";

// Define view settings interface
export interface ViewSettings {
  iconSize: IconSize;
  autoArrange: boolean;
  alignToGrid: boolean;
  showIcons: boolean;
  sortBy: SortOption;
  sortDirection: "asc" | "desc";
}

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
  iconSize: IconSize;
  changeIconSize: (size: IconSize) => void;

  // View settings
  viewSettings: ViewSettings;
  updateViewSettings: (settings: Partial<ViewSettings>) => void;
  sortIcons: (by: SortOption) => void;
  toggleAutoArrange: () => void;
  toggleAlignToGrid: () => void;
  toggleShowIcons: () => void;

  // App management
  deleteApp: (appId: string) => void;
  cutApp: (appId: string) => void;
  copyApp: (appId: string) => void;
  pasteApp: () => void;
  renameApp: (appId: string, newName: string) => void;
  showAppProperties: (appId: string) => void;

  // Clipboard
  clipboard: any | null;
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
  iconSize: "medium",
  changeIconSize: () => {},

  // View settings
  viewSettings: {
    iconSize: "medium",
    autoArrange: false,
    alignToGrid: true,
    showIcons: true,
    sortBy: "name",
    sortDirection: "asc",
  },
  updateViewSettings: () => {},
  sortIcons: () => {},
  toggleAutoArrange: () => {},
  toggleAlignToGrid: () => {},
  toggleShowIcons: () => {},

  // App management
  deleteApp: () => {},
  cutApp: () => {},
  copyApp: () => {},
  pasteApp: () => {},
  renameApp: () => {},
  showAppProperties: () => {},

  // Clipboard
  clipboard: null,
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
  const [iconSize, setIconSize] = useState<IconSize>("medium");

  // View settings state
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    iconSize: "medium",
    autoArrange: false,
    alignToGrid: true,
    showIcons: true,
    sortBy: "name",
    sortDirection: "asc",
  });

  // Clipboard state for cut/copy/paste operations
  const [clipboard, setClipboard] = useState<any | null>(null);

  // Deleted apps tracking (for undo functionality)
  const [deletedApps, setDeletedApps] = useState<AppType[]>([]);

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
    const savedIconSize = localStorage.getItem(
      "win11-icon-size"
    ) as IconSize | null;

    if (savedPinnedApps) setPinnedApps(JSON.parse(savedPinnedApps));
    if (savedRecentApps) setRecentApps(JSON.parse(savedRecentApps));
    if (savedWallpaper) setWallpaper(savedWallpaper);
    if (savedIconSize) setIconSize(savedIconSize);

    const savedViewSettings = localStorage.getItem("win11-view-settings");
    if (savedViewSettings) {
      try {
        setViewSettings(JSON.parse(savedViewSettings));
      } catch (e) {
        console.error("Failed to parse view settings", e);
      }
    }
  }, []);

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem("win11-theme", theme);
    localStorage.setItem("win11-pinned-apps", JSON.stringify(pinnedApps));
    localStorage.setItem("win11-recent-apps", JSON.stringify(recentApps));
    localStorage.setItem("win11-wallpaper", wallpaper);
    localStorage.setItem("win11-icon-size", iconSize);
    localStorage.setItem("win11-view-settings", JSON.stringify(viewSettings));

    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, pinnedApps, recentApps, wallpaper, iconSize, viewSettings]);

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

  // Change icon size - update in both places for consistency
  const changeIconSize = (size: IconSize) => {
    setIconSize(size);
    setViewSettings((prev) => ({ ...prev, iconSize: size }));
    addNotification({
      title: "Desktop",
      message: `Icon size changed to ${size}`,
      type: "info",
    });
  };

  // Update view settings
  const updateViewSettings = (settings: Partial<ViewSettings>) => {
    setViewSettings((prev) => ({ ...prev, ...settings }));
  };

  // Sort icons
  const sortIcons = (by: SortOption) => {
    setViewSettings((prev) => {
      // If same sort option, toggle direction
      const direction =
        prev.sortBy === by && prev.sortDirection === "asc" ? "desc" : "asc";
      return { ...prev, sortBy: by, sortDirection: direction };
    });

    addNotification({
      title: "Desktop",
      message: `Sorted icons by ${by}`,
      type: "info",
    });
  };

  // Toggle auto arrange
  const toggleAutoArrange = () => {
    setViewSettings((prev) => {
      const newValue = !prev.autoArrange;
      return { ...prev, autoArrange: newValue };
    });

    addNotification({
      title: "Desktop",
      message: viewSettings.autoArrange
        ? "Auto-arrange disabled"
        : "Auto-arrange enabled",
      type: "info",
    });
  };

  // Toggle align to grid
  const toggleAlignToGrid = () => {
    setViewSettings((prev) => {
      const newValue = !prev.alignToGrid;
      return { ...prev, alignToGrid: newValue };
    });

    addNotification({
      title: "Desktop",
      message: viewSettings.alignToGrid
        ? "Align to grid disabled"
        : "Align to grid enabled",
      type: "info",
    });
  };

  // Toggle show desktop icons
  const toggleShowIcons = () => {
    setViewSettings((prev) => {
      const newValue = !prev.showIcons;
      return { ...prev, showIcons: newValue };
    });

    addNotification({
      title: "Desktop",
      message: viewSettings.showIcons
        ? "Desktop icons hidden"
        : "Desktop icons shown",
      type: "info",
    });
  };

  // App management functions
  const deleteApp = (appId: string) => {
    // Find the app
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    // Store it for potential recovery
    setDeletedApps((prev) => [...prev, app]);

    // Remove from apps list (this is a simulation - in a real OS, you'd just hide the shortcut)
    setApps((prev) => prev.filter((a) => a.id !== appId));

    // Also remove from pinned/recent if needed
    if (pinnedApps.includes(appId)) {
      unpinApp(appId);
    }

    if (recentApps.includes(appId)) {
      setRecentApps((prev) => prev.filter((id) => id !== appId));
    }

    addNotification({
      title: "Delete",
      message: `${app.name} moved to Recycle Bin`,
      type: "info",
    });
  };

  const cutApp = (appId: string) => {
    // Find the app
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    // Add to clipboard
    setClipboard({ type: "cut", app });

    addNotification({
      title: "Cut",
      message: `${app.name} cut to clipboard`,
      type: "info",
    });
  };

  const copyApp = (appId: string) => {
    // Find the app
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    // Add to clipboard
    setClipboard({ type: "copy", app });

    addNotification({
      title: "Copy",
      message: `${app.name} copied to clipboard`,
      type: "info",
    });
  };

  const pasteApp = () => {
    if (!clipboard) {
      addNotification({
        title: "Paste",
        message: "Nothing to paste",
        type: "warning",
      });
      return;
    }

    const { type, app } = clipboard;

    if (type === "cut") {
      // For cut, we would actually move the icon
      // But for this simulation, we'll just show a notification
      addNotification({
        title: "Paste",
        message: `${app.name} pasted to desktop`,
        type: "info",
      });

      // Clear clipboard after cut+paste
      setClipboard(null);
    } else if (type === "copy") {
      // For copy, create a duplicate with a slightly different name
      const newApp = {
        ...app,
        id: `${app.id}-copy-${Date.now()}`,
        name: `${app.name} - Copy`,
      };

      setApps((prev) => [...prev, newApp]);

      addNotification({
        title: "Paste",
        message: `${app.name} copied to desktop`,
        type: "info",
      });
    }
  };

  const renameApp = (appId: string, newName: string) => {
    // Find and rename the app
    setApps((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, name: newName } : app))
    );

    addNotification({
      title: "Rename",
      message: `Item renamed to ${newName}`,
      type: "info",
    });
  };

  const showAppProperties = (appId: string) => {
    // Find the app
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    // In a real OS, this would open a properties dialog
    // Here we'll just show a notification with some details
    addNotification({
      title: "Properties",
      message: `${app.name} - Type: Application, Location: Desktop`,
      type: "info",
      persistent: true,
    });
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

  // Launch app function - uses openApp for consistency
  const launchApp = (appId: string) => {
    console.log("Launching app:", appId);
    openApp(appId);
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
    iconSize,
    changeIconSize,
    viewSettings,
    updateViewSettings,
    sortIcons,
    toggleAutoArrange,
    toggleAlignToGrid,
    toggleShowIcons,
    deleteApp,
    cutApp,
    copyApp,
    pasteApp,
    renameApp,
    showAppProperties,
    clipboard,
  };

  return (
    <OSContext.Provider value={contextValue}>{children}</OSContext.Provider>
  );
};

// Custom hook for using the OS context
export const useOS = () => useContext(OSContext);
