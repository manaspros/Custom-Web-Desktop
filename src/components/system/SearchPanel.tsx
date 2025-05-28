import { useState, useRef, useEffect } from "react";
import { useOS, FileSystemItem } from "@/components/contexts/OSContext";

export default function SearchPanel() {
  const { apps, fileSystem, launchApp, toggleSearchPanel } = useOS();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    apps: typeof apps;
    files: FileSystemItem[];
  }>({ apps: [], files: [] });
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
      setSearchResults({ apps: [], files: [] });
      return;
    }

    const query = searchQuery.toLowerCase();

    // Search apps
    const appResults = apps.filter((app) =>
      app.name.toLowerCase().includes(query)
    );

    // Search files
    const fileResults = fileSystem.filter((item) =>
      item.name.toLowerCase().includes(query)
    );

    setSearchResults({
      apps: appResults,
      files: fileResults,
    });
  }, [searchQuery, apps, fileSystem]);

  // Handle app launch
  const handleAppLaunch = (appId: string) => {
    launchApp(appId);
    toggleSearchPanel();
  };

  // Handle file open
  const handleFileOpen = (item: FileSystemItem) => {
    // Determine which app to use based on file type
    const ext = item.name.split(".").pop()?.toLowerCase() || "";

    if (item.type === "folder") {
      // Open folder in File Explorer
      launchApp("explorer");
      // Set current folder
      localStorage.setItem("explorer-open-folder", item.id);
    } else if (ext === "txt") {
      // Open in Notepad
      launchApp("notepad");
      localStorage.setItem("notepad-open-file", item.id);
    } else if (ext === "pdf") {
      // Open in PDF Viewer
      launchApp("pdfviewer");
      localStorage.setItem("pdf-open-file", item.id);
    } else {
      // For other files, open parent folder in explorer
      launchApp("explorer");
      localStorage.setItem("explorer-open-folder", item.parent || "");
    }

    toggleSearchPanel();
  };

  // Get icon for file type
  const getFileIcon = (item: FileSystemItem): string => {
    if (item.type === "folder") return "📁";

    const ext = item.name.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "txt":
        return "📄";
      case "pdf":
        return "📕";
      case "doc":
      case "docx":
        return "📘";
      case "jpg":
      case "jpeg":
      case "png":
        return "🖼️";
      default:
        return "📄";
    }
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
        ) : (
          <div className="results-container">
            {searchResults.apps.length > 0 && (
              <>
                <h3 className="results-title">Apps</h3>
                <div className="app-results">
                  {searchResults.apps.map((app) => (
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
              </>
            )}

            {searchResults.files.length > 0 && (
              <>
                <h3 className="results-title">Files</h3>
                <div className="file-results">
                  {searchResults.files.map((file) => (
                    <div
                      key={file.id}
                      className="file-result-item"
                      onClick={() => handleFileOpen(file)}
                    >
                      <div className="file-result-icon">
                        {getFileIcon(file)}
                      </div>
                      <div className="file-result-info">
                        <div className="file-result-name">{file.name}</div>
                        <div className="file-result-path">{file.path}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {searchResults.apps.length === 0 &&
              searchResults.files.length === 0 && (
                <div className="no-results">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
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

        .file-results {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .file-result-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .file-result-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        :global([data-theme="dark"]) .file-result-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .file-result-icon {
          font-size: 24px;
          margin-right: 12px;
          width: 32px;
          text-align: center;
        }

        .file-result-info {
          flex: 1;
        }

        .file-result-name {
          font-size: 14px;
          font-weight: 500;
        }

        .file-result-path {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 2px;
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
