import { useState, useRef, useEffect } from "react";
import { useOS } from "@/components/contexts/OSContext";

export default function SearchPanel() {
  const { apps, launchApp, toggleSearchPanel } = useOS();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof apps>([]);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(event.target as Node)
      ) {
        toggleSearchPanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleSearchPanel]);

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = apps.filter((app) =>
      app.name.toLowerCase().includes(query)
    );
    setSearchResults(results);
  }, [searchQuery, apps]);

  // Handle app launch
  const handleAppLaunch = (appId: string) => {
    launchApp(appId);
    toggleSearchPanel();
  };

  return (
    <div className="search-panel" ref={searchPanelRef}>
      <div className="search-header">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Type here to search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="search-results">
        {searchQuery.trim() === "" ? (
          <div className="search-placeholder">
            <div className="search-placeholder-icon">🔍</div>
            <p>Search for apps, settings, and files</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="results-container">
            <h3 className="results-title">Apps</h3>
            <div className="app-results">
              {searchResults.map((app) => (
                <div
                  key={app.id}
                  className="app-result-item"
                  onClick={() => handleAppLaunch(app.id)}
                >
                  <div className="app-result-icon">{app.icon}</div>
                  <div className="app-result-name">{app.name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-results">
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .search-panel {
          position: absolute;
          bottom: 48px;
          left: 50%;
          transform: translateX(-50%);
          width: 650px;
          max-width: 90vw;
          height: 500px;
          max-height: 80vh;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          z-index: 999;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        :global([data-theme="dark"]) .search-panel {
          background-color: rgba(40, 40, 40, 0.9);
          color: white;
        }

        .search-header {
          padding: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        :global([data-theme="dark"]) .search-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.5);
        }

        :global([data-theme="dark"]) .search-icon {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-input {
          width: 100%;
          padding: 12px 40px;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background-color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          outline: none;
        }

        :global([data-theme="dark"]) .search-input {
          background-color: rgba(50, 50, 50, 0.8);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-input:focus {
          border-color: var(--accent-color);
        }

        .clear-search {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.5);
          cursor: pointer;
        }

        :global([data-theme="dark"]) .clear-search {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-results {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .search-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: rgba(0, 0, 0, 0.4);
        }

        :global([data-theme="dark"]) .search-placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .results-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--accent-color);
        }

        .app-results {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
        }

        .app-result-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .app-result-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        :global([data-theme="dark"]) .app-result-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .app-result-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .app-result-name {
          font-size: 14px;
          text-align: center;
        }

        .no-results {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: rgba(0, 0, 0, 0.5);
        }

        :global([data-theme="dark"]) .no-results {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
