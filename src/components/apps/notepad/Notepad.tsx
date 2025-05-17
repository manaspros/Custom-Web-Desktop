"use client";

import { useState, useEffect } from "react";
import { useOS } from "@/components/contexts/OSContext";

// Define the interface for the Notepad Component props
interface NotepadProps {
  windowId?: string; // Optional windowId for saving content specific to a window instance
}

export default function Notepad({ windowId = "default" }: NotepadProps) {
  const { addNotification } = useOS();
  const [content, setContent] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string>("Untitled.txt");

  // Load saved content from local storage if available
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

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaved(false);
  };

  // Save content to local storage
  const handleSave = () => {
    localStorage.setItem(`notepad-${windowId}`, content);
    localStorage.setItem(`notepad-filename-${windowId}`, fileName);
    setSaved(true);

    // Show a notification
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
    setSaved(true);
  };

  return (
    <div className="notepad-container">
      <div className="notepad-toolbar">
        <button onClick={handleNew}>New</button>
        <button onClick={handleSave}>Save</button>
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
      `}</style>
    </div>
  );
}
