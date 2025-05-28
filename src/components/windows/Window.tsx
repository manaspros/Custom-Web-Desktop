"use client";

import { useState, useRef, useEffect } from "react";
import { useOS, WindowState, AppType } from "@/components/contexts/OSContext";

interface WindowProps {
  window: WindowState;
  app: AppType;
}

export default function Window({ window, app }: WindowProps) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useOS();

  const windowRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // Click window to focus
  const handleWindowClick = () => {
    if (!window.isActive) {
      focusWindow(window.id);
    }
  };

  // Start dragging handler
  const handleDragStart = (e: React.MouseEvent) => {
    if (window.isMaximized) return;

    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
  };

  // Start resizing handler
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (window.isMaximized || !app.isResizable) return;

    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: window.size.width, height: window.size.height });
    setInitialPos({ x: window.position.x, y: window.position.y });
  };

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(e.clientX - dragOffset.x, 0);
        const newY = Math.max(e.clientY - dragOffset.y, 0);
        updateWindowPosition(window.id, { x: newX, y: newY });
      } else if (isResizing && resizeDirection) {
        const dx = e.clientX - resizeStartPos.x;
        const dy = e.clientY - resizeStartPos.y;
        const minWidth = 400;
        const minHeight = 300;

        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        let newX = initialPos.x;
        let newY = initialPos.y;

        // Calculate new size based on resize direction
        if (resizeDirection.includes("e")) {
          newWidth = Math.max(initialSize.width + dx, minWidth);
        } else if (resizeDirection.includes("w")) {
          const possibleWidth = Math.max(initialSize.width - dx, minWidth);
          if (possibleWidth !== minWidth || dx < 0) {
            newX = initialPos.x + dx;
            newWidth = initialSize.width - dx;
          }
        }

        if (resizeDirection.includes("s")) {
          newHeight = Math.max(initialSize.height + dy, minHeight);
        } else if (resizeDirection.includes("n")) {
          const possibleHeight = Math.max(initialSize.height - dy, minHeight);
          if (possibleHeight !== minHeight || dy < 0) {
            newY = initialPos.y + dy;
            newHeight = initialSize.height - dy;
          }
        }

        updateWindowPosition(window.id, { x: newX, y: newY });
        updateWindowSize(window.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragOffset,
    isResizing,
    resizeDirection,
    resizeStartPos,
    initialSize,
    initialPos,
    updateWindowPosition,
    updateWindowSize,
    window.id,
  ]);

  // Double click title bar to toggle maximize
  const handleTitleBarDoubleClick = () => {
    if (window.isMaximized) {
      restoreWindow(window.id);
    } else {
      maximizeWindow(window.id);
    }
  };

  // Window positioning and sizing
  const style: React.CSSProperties = window.isMaximized
    ? {
        top: 0,
        left: 0,
        width: "100%",
        height: "calc(100% - 48px)", // Account for taskbar
        transform: "none",
        borderRadius: 0,
        zIndex: window.zIndex,
      }
    : {
        top: `${window.position.y}px`,
        left: `${window.position.x}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        zIndex: window.zIndex,
      };

  // Don't render minimized windows
  if (window.isMinimized) {
    return null;
  }

  // Render the window
  return (
    <div
      ref={windowRef}
      className={`window ${window.isActive ? "active" : ""}`}
      style={{ ...style, pointerEvents: "auto" }} // Ensure window catches clicks
      onClick={handleWindowClick}
    >
      {/* Window title bar */}
      <div
        className={`window-header ${window.isActive ? "active" : "inactive"}`}
        onMouseDown={handleDragStart}
        onDoubleClick={handleTitleBarDoubleClick}
      >
        <div className="window-title">
          <span className="window-icon">{window.title[0]}</span>
          <span className="window-title-text">{window.title}</span>
        </div>{" "}
        <div className="window-controls">
          <button
            className="window-control-button minimize-btn"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(window.id);
            }}
          >
            <span className="control-icon">_</span>
          </button>
          <button
            className="window-control-button maximize-btn"
            onClick={(e) => {
              e.stopPropagation();
              // Fix the unused expression
              if (window.isMaximized) {
                restoreWindow(window.id);
              } else {
                maximizeWindow(window.id);
              }
            }}
          >
            {window.isMaximized ? "❐" : "□"}
          </button>
          <button
            className="window-control-button close-btn"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
          >
            ✕
          </button>
        </div>
      </div>
      {/* Window content */}
      <div className="window-content">
        <app.component />
      </div>
      {/* Resize handles - only if app is resizable and window is not maximized */}
      {app.isResizable && !window.isMaximized && (
        <>
          <div
            className="resize-handle resize-n"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="resize-handle resize-e"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
          <div
            className="resize-handle resize-s"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="resize-handle resize-w"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="resize-handle resize-ne"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="resize-handle resize-se"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="resize-handle resize-sw"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="resize-handle resize-nw"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
        </>
      )}
    </div>
  );
}
