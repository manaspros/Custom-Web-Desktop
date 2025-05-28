"use client";

import { useState, useEffect, useCallback } from "react";
import { useOS } from "@/components/contexts/OSContext";

interface PDFViewerProps {
  windowId?: string;
}

export default function PDFViewer({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  windowId: _windowId = "default"
}: PDFViewerProps) {
  const { getFileById, getFileContent, addNotification, fileSystem } = useOS();

  // Prefix with _ to indicate intentional non-use or use in a conditional later
  const [_currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("No document open");
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<
    { id: string; name: string }[]
  >([]);
  const [zoom, setZoom] = useState(100);

  // Fix dependency issue with useCallback
  const openPdfFile = useCallback(
    (fileId: string) => {
      const fileContent = getFileContent(fileId);
      const file = getFileById(fileId);

      console.log("File content:", fileContent);
      console.log("File object:", file);

      if (file && fileContent) {
        // For PDFs, the content is a URL or data URI
        setPdfUrl(fileContent);
        setFileName(file.name);
        setCurrentFileId(fileId);
        setShowOpenDialog(false);

        addNotification({
          title: "PDF Viewer",
          message: `Opened ${file.name}`,
          icon: "pdfviewer",
        });
      } else {
        addNotification({
          title: "PDF Viewer",
          message: "Could not open the file",
          type: "error",
        });
      }
    },
    [getFileContent, getFileById, addNotification]
  );

  // Load PDF files for open dialog
  useEffect(() => {
    const pdfFiles = fileSystem.filter(
      (item) => item.type === "file" && item.name.toLowerCase().endsWith(".pdf")
    );
    setAvailableFiles(pdfFiles.map((f) => ({ id: f.id, name: f.name })));
  }, [fileSystem]);

  // Check if we should open a file from file explorer
  useEffect(() => {
    const fileToOpen = localStorage.getItem("pdf-open-file");
    if (fileToOpen) {
      // Clear the stored file ID
      localStorage.removeItem("pdf-open-file");
      openPdfFile(fileToOpen);

      // Log for debugging
      console.log("Opening PDF file:", fileToOpen);
    }
  }, [openPdfFile]); // Added missing dependency

  // Remove unused variables from this effect
  useEffect(() => {
    // Load default example if needed for testing
    // const examplePdfUrl = "/Manas_Choudhary_Resume.pdf";

    // Rest of the effect logic
  }, []);

  // Open file dialog
  const handleOpen = () => {
    setShowOpenDialog(true);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <button onClick={handleOpen}>Open</button>
        <button onClick={handleZoomOut} disabled={!pdfUrl}>
          Zoom Out
        </button>
        <button onClick={handleZoomReset} disabled={!pdfUrl}>
          {zoom}%
        </button>
        <button onClick={handleZoomIn} disabled={!pdfUrl}>
          Zoom In
        </button>
        <div className="file-name">{fileName}</div>
      </div>

      {showOpenDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Open PDF Document</h3>
            <div className="dialog-content">
              <div className="file-list">
                {availableFiles.length > 0 ? (
                  availableFiles.map((file) => (
                    <div
                      key={file.id}
                      className="file-item"
                      onClick={() => openPdfFile(file.id)}
                    >
                      <span className="file-icon">📕</span>
                      <span className="file-name">{file.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-files">No PDF files found</div>
                )}
              </div>
            </div>

            <div className="dialog-actions">
              <button onClick={() => setShowOpenDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="pdf-container">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="pdf-frame"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        ) : (
          <div className="no-pdf">
            <div className="pdf-icon">📕</div>
            <p>No PDF document open</p>
            <button onClick={handleOpen}>Open a PDF</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .pdf-viewer {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .pdf-toolbar {
          display: flex;
          padding: 8px;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          align-items: center;
        }

        .pdf-toolbar button {
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--button-bg);
          color: var(--text-color);
          cursor: pointer;
          font-size: 13px;
        }

        .pdf-toolbar button:hover:not(:disabled) {
          background-color: var(--button-bg-hover);
        }

        .pdf-toolbar button:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .file-name {
          margin-left: auto;
          font-size: 14px;
          opacity: 0.8;
        }

        .pdf-container {
          flex: 1;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
        }

        :global([data-theme="dark"]) .pdf-container {
          background-color: #2a2a2a;
        }

        .pdf-frame {
          width: 100%;
          height: 100%;
          border: none;
          transform-origin: center;
        }

        .no-pdf {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        :global([data-theme="dark"]) .no-pdf {
          color: #aaa;
        }

        .pdf-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .no-pdf button {
          margin-top: 16px;
          padding: 8px 16px;
          background-color: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
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
      `}</style>
    </div>
  );
}
