"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useOS } from "@/components/contexts/OSContext";
import Window from "./Window";

export default function WindowManager() {
  const { openWindows, apps } = useOS();

  // Create portal container when component mounts
  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      !document.getElementById("window-portal")
    ) {
      const portalContainer = document.createElement("div");
      portalContainer.id = "window-portal";
      portalContainer.style.position = "absolute";
      portalContainer.style.top = "0";
      portalContainer.style.left = "0";
      portalContainer.style.width = "100%";
      portalContainer.style.height = "100%";
      portalContainer.style.zIndex = "20";
      portalContainer.style.pointerEvents = "none"; // Allow clicks to pass through when no windows
      document.body.appendChild(portalContainer);

      // Clean up on unmount
      return () => {
        document.body.removeChild(portalContainer);
      };
    }
  }, []);

  // Render nothing on the server or if portal container doesn't exist yet
  if (
    typeof document === "undefined" ||
    !document.getElementById("window-portal")
  ) {
    return null;
  }

  return createPortal(
    <>
      {openWindows.map((window) => {
        const app = apps.find((a) => a.id === window.appId);
        if (!app) return null;

        return <Window key={window.id} window={window} app={app} />;
      })}
    </>,
    document.getElementById("window-portal")!
  );
}
