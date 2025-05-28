import { useState, useEffect, useRef } from "react";
import { useOS } from "@/components/contexts/OSContext";

export default function StartMenu() {
  const { toggleStartMenu, apps, openApp, pinnedApps, recentApps } = useOS();
  const startMenuRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApps, setFilteredApps] = useState<typeof apps>([]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        startMenuRef.current &&
        !startMenuRef.current.contains(event.target as Node)
      ) {
        toggleStartMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleStartMenu]);

  // Initialize and filter apps
  useEffect(() => {
    // Sort apps alphabetically
    const sortedApps = [...apps].sort((a, b) => a.name.localeCompare(b.name));

    // Filter apps based on search term
    if (searchTerm.trim() === "") {
      setFilteredApps(sortedApps);
    } else {
      const filtered = sortedApps.filter((app) =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApps(filtered);
    }
  }, [apps, searchTerm]);

  // Get pinned apps
  const pinnedAppsList = apps.filter((app) => pinnedApps.includes(app.id));

  // Get recent apps
  const recentAppsList = apps.filter((app) => recentApps.includes(app.id));
  return (
    <div ref={startMenuRef} className="start-menu">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Type here to search"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>{" "}
      {/* Pinned Apps Section */}
      {searchTerm === "" && (
        <div className="pinned-apps">
          <h2 className="section-title">Pinned</h2>
          <div className="app-grid">
            {pinnedAppsList.map((app) => (
              <button
                key={app.id}
                className="app-icon"
                onClick={() => {
                  openApp(app.id);
                  toggleStartMenu();
                }}
              >
                <span className="app-icon-letter">{app.name[0]}</span>
                <span className="app-icon-name">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}{" "}
      {/* Recent Apps Section */}
      {searchTerm === "" && recentAppsList.length > 0 && (
        <div className="recent-apps">
          <h2 className="section-title">Recent</h2>
          <div className="app-grid">
            {recentAppsList.map((app) => (
              <button
                key={app.id}
                className="app-icon"
                onClick={() => {
                  openApp(app.id);
                  toggleStartMenu();
                }}
              >
                <span className="app-icon-letter">{app.name[0]}</span>
                <span className="app-icon-name">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}{" "}
      {/* All Apps Section */}
      <div className="all-apps">
        <h2 className="section-title">
          {searchTerm === "" ? "All apps" : "Search results"}
        </h2>
        <div className="app-list">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              className="app-item"
              onClick={() => {
                openApp(app.id);
                toggleStartMenu();
              }}
            >
              <span className="app-icon-small">{app.name[0]}</span>
              <span className="app-name">{app.name}</span>
            </button>
          ))}
        </div>
      </div>{" "}
      {/* User and Power */}
      <div className="user-power">
        <button className="user-profile">
          <span className="user-avatar">U</span>
          <span className="user-name">User</span>
        </button>
        <button className="power-button">
          <span className="power-icon">⏻</span>
        </button>
      </div>
    </div>
  );
}
