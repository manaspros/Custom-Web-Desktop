"use client";

import { useState, useEffect } from "react";
import { useOS } from "@/components/contexts/OSContext";

// Define types for file system
interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified?: Date;
  parent: string | null;
  icon: string;
}

export default function FileExplorer() {
  const { addNotification } = useOS();

  // Mock file system data
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    {
      id: "desktop",
      name: "Desktop",
      type: "folder",
      parent: null,
      modified: new Date("2023-10-01"),
      icon: "🖥️",
    },
    {
      id: "documents",
      name: "Documents",
      type: "folder",
      parent: null,
      modified: new Date("2023-10-01"),
      icon: "📁",
    },
    {
      id: "downloads",
      name: "Downloads",
      type: "folder",
      parent: null,
      modified: new Date("2023-10-01"),
      icon: "📥",
    },
    {
      id: "pictures",
      name: "Pictures",
      type: "folder",
      parent: null,
      modified: new Date("2023-09-25"),
      icon: "🖼️",
    },
    {
      id: "music",
      name: "Music",
      type: "folder",
      parent: null,
      modified: new Date("2023-09-20"),
      icon: "🎵",
    },
    {
      id: "doc1",
      name: "Project Report.docx",
      type: "file",
      size: 2500,
      parent: "documents",
      modified: new Date("2023-10-10"),
      icon: "📄",
    },
    {
      id: "doc2",
      name: "Resume.pdf",
      type: "file",
      size: 1200,
      parent: "documents",
      modified: new Date("2023-09-28"),
      icon: "📄",
    },
    {
      id: "img1",
      name: "Vacation Photo.jpg",
      type: "file",
      size: 3500,
      parent: "pictures",
      modified: new Date("2023-09-15"),
      icon: "🖼️",
    },
    {
      id: "img2",
      name: "Family.png",
      type: "file",
      size: 2800,
      parent: "pictures",
      modified: new Date("2023-08-20"),
      icon: "🖼️",
    },
    {
      id: "music1",
      name: "Favorite Song.mp3",
      type: "file",
      size: 8500,
      parent: "music",
      modified: new Date("2023-07-15"),
      icon: "🎵",
    },
    {
      id: "dl1",
      name: "Installation.exe",
      type: "file",
      size: 15000,
      parent: "downloads",
      modified: new Date("2023-10-05"),
      icon: "📦",
    },
    {
      id: "dl2",
      name: "Dataset.zip",
      type: "file",
      size: 25000,
      parent: "downloads",
      modified: new Date("2023-09-30"),
      icon: "🗜️",
    },
    {
      id: "desktop1",
      name: "Shortcut.lnk",
      type: "file",
      size: 1,
      parent: "desktop",
      modified: new Date("2023-10-10"),
      icon: "🔗",
    },
  ]);

  const [currentPath, setCurrentPath] = useState<string[]>(["This PC"]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "details">(
    "details"
  );
  const [sortBy, setSortBy] = useState<"name" | "size" | "type" | "modified">(
    "name"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Handle navigation to a folder
  const navigateToFolder = (folderId: string | null, folderName: string) => {
    if (folderId === null) {
      // Navigate to root
      setCurrentPath(["This PC"]);
      setCurrentFolder(null);
    } else {
      const folder = fileSystem.find((item) => item.id === folderId);
      if (folder) {
        setCurrentFolder(folderId);

        // Update breadcrumb path
        if (currentFolder === null) {
          setCurrentPath([...currentPath, folderName]);
        } else {
          // Going deeper
          setCurrentPath([...currentPath, folderName]);
        }
      }
    }
    setSelectedItem(null);
  };

  // Handle navigation to parent folder
  const navigateUp = () => {
    if (currentPath.length > 1) {
      const newPath = [...currentPath];
      newPath.pop();
      setCurrentPath(newPath);

      if (newPath.length === 1) {
        setCurrentFolder(null); // Back to root
      } else {
        // Find parent folder by name
        const parentName = newPath[newPath.length - 1];
        const parentFolder = fileSystem.find(
          (item) => item.type === "folder" && item.name === parentName
        );
        setCurrentFolder(parentFolder ? parentFolder.id : null);
      }
    }
    setSelectedItem(null);
  };

  // Get current directory contents
  const getCurrentContents = () => {
    let contents = fileSystem.filter((item) => item.parent === currentFolder);

    // Sort contents
    contents = [...contents].sort((a, b) => {
      // First sort by folder/file type
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;

      // Then sort by the selected criterion
      switch (sortBy) {
        case "name":
          return sortDirection === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "type":
          return sortDirection === "asc"
            ? a.type.localeCompare(b.type)
            : b.type.localeCompare(a.type);
        case "size":
          if (a.size === undefined) return -1;
          if (b.size === undefined) return 1;
          return sortDirection === "asc" ? a.size - b.size : b.size - a.size;
        case "modified":
          if (!a.modified) return -1;
          if (!b.modified) return 1;
          return sortDirection === "asc"
            ? a.modified.getTime() - b.modified.getTime()
            : b.modified.getTime() - a.modified.getTime();
        default:
          return 0;
      }
    });

    return contents;
  };

  // Format file size for display
  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return "";

    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Toggle sort direction or change sort criteria
  const handleSortChange = (
    criteria: "name" | "size" | "type" | "modified"
  ) => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(criteria);
      setSortDirection("asc");
    }
  };

  // Handle double click on item
  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (item.type === "folder") {
      navigateToFolder(item.id, item.name);
    } else {
      // Simulate file opening
      addNotification({
        title: "File Explorer",
        message: `Opening ${item.name}`,
        icon: "explorer",
      });
    }
  };

  // Handle creating a new folder
  const handleCreateNewFolder = () => {
    const newFolderName = "New Folder";
    let uniqueName = newFolderName;
    let counter = 1;

    // Ensure folder name is unique
    while (
      fileSystem.some(
        (item) => item.parent === currentFolder && item.name === uniqueName
      )
    ) {
      uniqueName = `${newFolderName} (${counter})`;
      counter++;
    }

    const newFolder: FileSystemItem = {
      id: `folder-${Date.now()}`,
      name: uniqueName,
      type: "folder",
      parent: currentFolder,
      modified: new Date(),
      icon: "📁",
    };

    setFileSystem([...fileSystem, newFolder]);
    setSelectedItem(newFolder.id);
  };

  return (
    <div className="file-explorer">
      <div className="toolbar">
        <div className="navigation-buttons">
          <button
            onClick={navigateUp}
            disabled={currentPath.length <= 1}
            title="Up"
            className="nav-button"
          >
            ⬆️
          </button>

          <div className="address-bar">
            {currentPath.map((segment, index) => (
              <span key={index} className="path-segment">
                {index > 0 && <span className="separator">&gt;</span>}
                <span
                  className="path-item"
                  onClick={() => {
                    if (index === 0) {
                      navigateToFolder(null, "This PC");
                    } else if (index < currentPath.length - 1) {
                      // Find folder by name
                      const folder = fileSystem.find(
                        (item) =>
                          item.type === "folder" && item.name === segment
                      );
                      if (folder) {
                        navigateToFolder(folder.id, folder.name);
                      }
                    }
                  }}
                >
                  {segment}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="view-controls">
          <button
            className={`view-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            📋
          </button>
          <button
            className={`view-button ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            📊
          </button>
          <button
            className={`view-button ${viewMode === "details" ? "active" : ""}`}
            onClick={() => setViewMode("details")}
            title="Details View"
          >
            📝
          </button>
        </div>
      </div>

      <div className="action-bar">
        <button className="action-button" onClick={handleCreateNewFolder}>
          New Folder
        </button>
      </div>

      {viewMode === "details" ? (
        <div className="file-list-details">
          <table>
            <thead>
              <tr>
                <th className="column-icon"></th>
                <th
                  className={`column-name sortable ${
                    sortBy === "name" ? `sorted-${sortDirection}` : ""
                  }`}
                  onClick={() => handleSortChange("name")}
                >
                  Name
                  {sortBy === "name" && (
                    <span className="sort-indicator">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className={`column-type sortable ${
                    sortBy === "type" ? `sorted-${sortDirection}` : ""
                  }`}
                  onClick={() => handleSortChange("type")}
                >
                  Type
                  {sortBy === "type" && (
                    <span className="sort-indicator">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className={`column-size sortable ${
                    sortBy === "size" ? `sorted-${sortDirection}` : ""
                  }`}
                  onClick={() => handleSortChange("size")}
                >
                  Size
                  {sortBy === "size" && (
                    <span className="sort-indicator">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className={`column-date sortable ${
                    sortBy === "modified" ? `sorted-${sortDirection}` : ""
                  }`}
                  onClick={() => handleSortChange("modified")}
                >
                  Date Modified
                  {sortBy === "modified" && (
                    <span className="sort-indicator">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {getCurrentContents().map((item) => (
                <tr
                  key={item.id}
                  className={selectedItem === item.id ? "selected" : ""}
                  onClick={() => setSelectedItem(item.id)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                >
                  <td className="column-icon">
                    <span className="item-icon">{item.icon}</span>
                  </td>
                  <td className="column-name">{item.name}</td>
                  <td className="column-type">
                    {item.type === "folder"
                      ? "Folder"
                      : item.name.split(".").pop()?.toUpperCase()}
                  </td>
                  <td className="column-size">
                    {item.type === "folder" ? "" : formatFileSize(item.size)}
                  </td>
                  <td className="column-date">
                    {item.modified?.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === "grid" ? (
        <div className="file-list-grid">
          {getCurrentContents().map((item) => (
            <div
              key={item.id}
              className={`grid-item ${
                selectedItem === item.id ? "selected" : ""
              }`}
              onClick={() => setSelectedItem(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <div className="item-icon">{item.icon}</div>
              <div className="item-name">{item.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="file-list">
          {getCurrentContents().map((item) => (
            <div
              key={item.id}
              className={`list-item ${
                selectedItem === item.id ? "selected" : ""
              }`}
              onClick={() => setSelectedItem(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-name">{item.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="status-bar">
        <span>{getCurrentContents().length} items</span>
        <span>
          {selectedItem &&
            `Selected: ${fileSystem.find((i) => i.id === selectedItem)?.name}`}
        </span>
      </div>

      <style jsx>{`
        .file-explorer {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }

        .navigation-buttons {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .nav-button {
          background-color: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          margin-right: 4px;
          border-radius: 4px;
        }

        .nav-button:hover:not(:disabled) {
          background-color: var(--hover-bg);
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .address-bar {
          flex: 1;
          display: flex;
          align-items: center;
          background-color: var(--input-bg);
          border-radius: 4px;
          padding: 4px 8px;
          margin-left: 8px;
          overflow-x: auto;
          white-space: nowrap;
        }

        .path-segment {
          display: inline-flex;
          align-items: center;
        }

        .separator {
          margin: 0 6px;
          opacity: 0.6;
        }

        .path-item {
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .path-item:hover {
          background-color: var(--hover-bg);
        }

        .view-controls {
          display: flex;
          gap: 4px;
          padding-left: 8px;
        }

        .view-button {
          background-color: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
        }

        .view-button:hover {
          background-color: var(--hover-bg);
        }

        .view-button.active {
          background-color: var(--active-bg);
        }

        .action-bar {
          padding: 6px 10px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }

        .action-button {
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid var(--button-border);
          background-color: var(--button-bg);
          cursor: pointer;
          font-size: 13px;
        }

        .action-button:hover {
          background-color: var(--button-bg-hover);
        }

        .file-list-details {
          flex: 1;
          overflow-y: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 8px;
          position: sticky;
          top: 0;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          user-select: none;
        }

        .sortable {
          cursor: pointer;
        }

        .sortable:hover {
          background-color: var(--hover-bg);
        }

        .sort-indicator {
          margin-left: 4px;
          font-size: 10px;
        }

        tbody tr {
          border-bottom: 1px solid var(--border-color);
        }

        tbody tr:hover {
          background-color: var(--hover-bg);
        }

        tr.selected {
          background-color: var(--selected-bg) !important;
        }

        td {
          padding: 6px 8px;
        }

        .column-icon {
          width: 32px;
          text-align: center;
        }

        .column-name {
          min-width: 200px;
        }

        .column-type {
          width: 120px;
        }

        .column-size {
          width: 80px;
          text-align: right;
        }

        .file-list {
          flex: 1;
          padding: 8px;
          overflow-y: auto;
        }

        .list-item {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          cursor: pointer;
          border-radius: 4px;
        }

        .list-item:hover {
          background-color: var(--hover-bg);
        }

        .list-item.selected {
          background-color: var(--selected-bg);
        }

        .file-list-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          padding: 16px;
          overflow-y: auto;
        }

        .grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .grid-item:hover {
          background-color: var(--hover-bg);
        }

        .grid-item.selected {
          background-color: var(--selected-bg);
        }

        .item-icon {
          font-size: 24px;
          margin-right: 8px;
          margin-bottom: 6px;
        }

        .grid-item .item-icon {
          font-size: 32px;
          margin-right: 0;
        }

        .grid-item .item-name {
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          padding: 6px 10px;
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          font-size: 12px;
        }

        :global([data-theme="dark"]) .file-explorer {
          --bg-color: #202020;
          --bg-secondary: #252525;
          --text-color: #e0e0e0;
          --border-color: rgba(255, 255, 255, 0.1);
          --hover-bg: rgba(255, 255, 255, 0.05);
          --active-bg: rgba(255, 255, 255, 0.1);
          --selected-bg: rgba(0, 120, 212, 0.4);
          --input-bg: rgba(255, 255, 255, 0.05);
          --button-bg: rgba(255, 255, 255, 0.05);
          --button-bg-hover: rgba(255, 255, 255, 0.1);
          --button-border: rgba(255, 255, 255, 0.1);
        }

        :global([data-theme="light"]) .file-explorer {
          --bg-color: #f9f9f9;
          --bg-secondary: #f0f0f0;
          --text-color: #202020;
          --border-color: rgba(0, 0, 0, 0.1);
          --hover-bg: rgba(0, 0, 0, 0.04);
          --active-bg: rgba(0, 0, 0, 0.08);
          --selected-bg: rgba(0, 120, 212, 0.2);
          --input-bg: rgba(255, 255, 255, 0.8);
          --button-bg: #ffffff;
          --button-bg-hover: #f5f5f5;
          --button-border: rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
