"use client";

import { useState, useEffect } from "react";
import { useOS } from "@/components/contexts/OSContext";

// Define the interface for the Notepad Component props
interface NotepadProps {
  windowId?: string; // Optional windowId for saving content specific to a window instance
}

export default function Notepad({ windowId = "default" }: NotepadProps) {
  const {
    addNotification,
    createFile,
    getFileContent,
    updateFileContent,
    getFileById,
    fileSystem,
  } = useOS();

  const [content, setContent] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string>("Untitled.txt");
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [saveLocation, setSaveLocation] = useState<string | null>(null);
  const [saveLocations, setSaveLocations] = useState<
    { id: string; name: string }[]
  >([]);

  // Load folders for save dialog
  useEffect(() => {
    // Get all folders
    const folders = fileSystem.filter((item) => item.type === "folder");
    setSaveLocations(folders.map((f) => ({ id: f.id, name: f.name })));
  }, [fileSystem]);

  // Try to load file from localStorage (for backward compatibility)
  useEffect(() => {
    const savedContent = localStorage.getItem(`notepad-${windowId}`);
    const savedFileName = localStorage.getItem(`notepad-filename-${windowId}`);

    if (savedContent) {
      setContent(savedContent);
    }

    if (savedFileName) {
      setFileName(savedFileName);
    }
  }, [windowId]);

  // Check if we should open a file from file explorer
  useEffect(() => {
    const fileToOpen = localStorage.getItem("notepad-open-file");
    if (fileToOpen) {
      // Clear the stored file ID
      localStorage.removeItem("notepad-open-file");

      // Get file content
      const fileContent = getFileContent(fileToOpen);
      const file = getFileById(fileToOpen);

      if (file && fileContent !== undefined) {
        setContent(fileContent);
        setFileName(file.name);
        setCurrentFileId(fileToOpen);
        setSaved(true);

        addNotification({
          title: "Notepad",
          message: `Opened ${file.name}`,
          icon: "notepad",
        });
      }
    }
  }, [addNotification, getFileById, getFileContent]);

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaved(false);
  };

  // Save content to file system
  const handleSave = () => {
    if (currentFileId) {
      // Update existing file
      updateFileContent(currentFileId, content);
      setSaved(true);

      addNotification({
        title: "Notepad",
        message: `File "${fileName}" saved successfully`,
        icon: "notepad",
      });
    } else {
      // Show save dialog
      setShowSaveDialog(true);
    }
  };

  // Save As function
  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  // Execute save with location
  const executeSave = () => {
    if (!saveLocation) {
      addNotification({
        title: "Notepad",
        message: "Please select a location to save the file",
        type: "warning",
      });
      return;
    }

    // Create new file
    const newFileId = createFile(fileName, saveLocation, content, "text/plain");
    setCurrentFileId(newFileId);
    setSaved(true);
    setShowSaveDialog(false);

    addNotification({
      title: "Notepad",
      message: `File "${fileName}" saved successfully`,
      icon: "notepad",
    });
  };

  // Handle filename changes
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
    setSaved(false);
  };

  // Create new document
  const handleNew = () => {
    if (!saved) {
      const confirmCreate = window.confirm(
        "You have unsaved changes. Do you want to continue without saving?"
      );
      if (!confirmCreate) return;
    }

    setContent("");
    setFileName("Untitled.txt");
    setCurrentFileId(null);
    setSaved(true);
  };

  // Open file dialog
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<
    { id: string; name: string }[]
  >([]);

  // Load text files for open dialog
  useEffect(() => {
    const textFiles = fileSystem.filter(
      (item) => item.type === "file" && item.name.toLowerCase().endsWith(".txt")
    );
    setAvailableFiles(textFiles.map((f) => ({ id: f.id, name: f.name })));
  }, [fileSystem]);

  // Open file function
  const handleOpen = () => {
    if (!saved) {
      const confirmOpen = window.confirm(
        "You have unsaved changes. Do you want to continue without saving?"
      );
      if (!confirmOpen) return;
    }

    setShowOpenDialog(true);
  };

  // Execute open file
  const executeOpen = (fileId: string) => {
    const fileContent = getFileContent(fileId);
    const file = getFileById(fileId);

    if (file && fileContent !== undefined) {
      setContent(fileContent);
      setFileName(file.name);
      setCurrentFileId(fileId);
      setSaved(true);
      setShowOpenDialog(false);

      addNotification({
        title: "Notepad",
        message: `Opened ${file.name}`,
        icon: "notepad",
      });
    }
  };

  return (
    <div className="notepad-container">
      <div className="notepad-toolbar">
        <button onClick={handleNew}>New</button>
        <button onClick={handleOpen}>Open</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleSaveAs}>Save As</button>
        <div className="file-name-container">
          <input
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
            className="file-name-input"
          />
          {!saved && <span className="unsaved-indicator">*</span>}
        </div>
      </div>

      {showSaveDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Save File</h3>
            <div className="dialog-content">
              <div className="dialog-field">
                <label>File name:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={handleFileNameChange}
                />
              </div>

              <div className="dialog-field">
                <label>Save in:</label>
                <select
                  value={saveLocation || ""}
                  onChange={(e) => setSaveLocation(e.target.value)}
                >
                  <option value="">Select a folder</option>
                  {saveLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dialog-actions">
              <button onClick={executeSave}>Save</button>
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showOpenDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Open File</h3>
            <div className="dialog-content">
              <div className="file-list">
                {availableFiles.length > 0 ? (
                  availableFiles.map((file) => (
                    <div
                      key={file.id}
                      className="file-item"
                      onClick={() => executeOpen(file.id)}
                    >
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-files">No text files found</div>
                )}
              </div>
            </div>

            <div className="dialog-actions">
              <button onClick={() => setShowOpenDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <textarea
        value={content}
        onChange={handleChange}
        className="notepad-editor"
        placeholder="Start typing..."
        spellCheck={true}
        autoFocus
      />

      <style jsx>{`
        .notepad-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .notepad-toolbar {
          display: flex;
          padding: 6px;
          gap: 6px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }

        .notepad-toolbar button {
          padding: 4px 12px;
          background-color: var(--button-bg);
          border: 1px solid var(--button-border);
          border-radius: 4px;
          color: var(--button-text);
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .notepad-toolbar button:hover {
          background-color: var(--button-bg-hover);
        }

        .file-name-container {
          display: flex;
          align-items: center;
          margin-left: auto;
          padding: 0 10px;
        }

        .file-name-input {
          padding: 4px;
          border: 1px solid transparent;
          border-radius: 4px;
          background-color: transparent;
          color: var(--text-color);
          font-size: 12px;
        }

        .file-name-input:focus {
          border-color: var(--focus-border);
          outline: none;
        }

        .unsaved-indicator {
          color: var(--warning-color);
          margin-left: 4px;
          font-weight: bold;
        }

        .notepad-editor {
          flex: 1;
          padding: 10px;
          border: none;
          resize: none;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .notepad-editor:focus {
          outline: none;
        }

        .dialog-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .dialog {
          background-color: var(--bg-color);
          border-radius: 8px;
          padding: 16px;
          width: 80%;
          max-width: 500px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .dialog h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 16px;
        }

        .dialog-content {
          margin-bottom: 20px;
        }

        .dialog-field {
          margin-bottom: 12px;
        }

        .dialog-field label {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .dialog-field input,
        .dialog-field select {
          width: 100%;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--input-bg);
          color: var(--text-color);
        }

        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .dialog-actions button {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--button-bg);
          color: var(--text-color);
          cursor: pointer;
        }

        .dialog-actions button:hover {
          background-color: var(--hover-bg);
        }

        .file-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }

        .file-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .file-item:hover {
          background-color: var(--hover-bg);
        }

        .file-icon {
          margin-right: 8px;
        }

        .no-files {
          padding: 16px;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
