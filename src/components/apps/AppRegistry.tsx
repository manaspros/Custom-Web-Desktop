import Calculator from "@/components/apps/calculator/Calculator";
import Notepad from "@/components/apps/notepad/Notepad";
import FileExplorer from "@/components/apps/explorer/FileExplorer";
import Terminal from "@/components/apps/terminal/Terminal";
import Settings from "@/components/apps/settings/Settings";
import Weather from "@/components/apps/weather/Weather";
import Calendar from "@/components/apps/calendar/Calendar";
import PDFViewer from "@/components/apps/pdfviewer/PDFViewer";
import { AppType } from "@/components/contexts/OSContext";

// Define all applications in the OS
const registeredApps: AppType[] = [
  {
    id: "calculator",
    name: "Calculator",
    icon: "🧮",
    component: Calculator,
    defaultSize: { width: 320, height: 500 },
    isResizable: true,
    isPinned: true,
  },
  {
    id: "notepad",
    name: "Notepad",
    icon: "📝",
    component: Notepad,
    defaultSize: { width: 600, height: 500 },
    isResizable: true,
    isPinned: true,
  },
  {
    id: "explorer",
    name: "File Explorer",
    icon: "📁",
    component: FileExplorer,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isPinned: true,
  },
  {
    id: "terminal",
    name: "Terminal",
    icon: "💻",
    component: Terminal,
    defaultSize: { width: 700, height: 500 },
    isResizable: true,
    isPinned: false,
  },
  {
    id: "settings",
    name: "Settings",
    icon: "⚙️",
    component: Settings,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isPinned: true,
  },
  {
    id: "weather",
    name: "Weather",
    icon: "🌤️",
    component: Weather,
    defaultSize: { width: 400, height: 600 },
    isResizable: true,
    isPinned: false,
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "📅",
    component: Calendar,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isPinned: true,
  },
  {
    id: "pdfviewer",
    name: "PDF Viewer",
    icon: "📕",
    component: PDFViewer,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isPinned: false,
  },
];

export default registeredApps;
