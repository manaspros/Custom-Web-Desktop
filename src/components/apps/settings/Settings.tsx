"use client";

import { useState } from "react";
import { useOS } from "@/components/contexts/OSContext";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <div className="settings-section">
      <h2>{title}</h2>
      <div className="settings-section-content">{children}</div>
      <style jsx>{`
        .settings-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .settings-section:last-child {
          border-bottom: none;
        }

        .settings-section h2 {
          font-size: 18px;
          margin: 0 0 15px 0;
          color: var(--heading-color);
        }

        .settings-section-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
      `}</style>
    </div>
  );
};

interface SettingItemProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="setting-item">
      <div className="setting-info">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="setting-control">{children}</div>
      <style jsx>{`
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border-radius: 8px;
          background-color: var(--item-bg);
        }

        .setting-info {
          flex: 1;
        }

        .setting-info h3 {
          font-size: 16px;
          margin: 0 0 5px 0;
          font-weight: 500;
        }

        .setting-info p {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }

        .setting-control {
          margin-left: 15px;
        }
      `}</style>
    </div>
  );
};

// Toggle Switch Component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  readOnly?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  readOnly = false,
}) => {
  // Create a proper onChange handler that prevents changes if readOnly
  const handleChange = () => {
    if (!readOnly) {
      onChange();
    }
  };

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange} // This ensures React doesn't complain
        disabled={readOnly} // Using disabled instead of readOnly is more appropriate for checkboxes
      />
      <span className="switch-slider"></span>
      <style jsx>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .switch-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .switch-slider {
          background-color: #0078d4;
        }

        input:checked + .switch-slider:before {
          transform: translateX(22px);
        }
      `}</style>
    </label>
  );
};

// Dropdown Select Component
interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ value, options, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="settings-dropdown"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      <style jsx>{`
        .settings-dropdown {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background-color: var(--dropdown-bg);
          color: var(--text-color);
          min-width: 150px;
          font-size: 14px;
          cursor: pointer;
        }

        .settings-dropdown:focus {
          outline: none;
          border-color: #0078d4;
        }
      `}</style>
    </select>
  );
};

// Main Settings App Component
export default function Settings({
  windowId = "default",
}: {
  windowId?: string;
}) {
  const { theme, toggleTheme, wallpaper, changeWallpaper, addNotification } =
    useOS();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [timeFormat, setTimeFormat] = useState("12h");
  const [wallpapers] = useState([
    { id: "default", path: "/wallpapers/default.png", name: "Default" },
    { id: "landscape", path: "/wallpapers/landscape.png", name: "Landscape" },
    { id: "abstract", path: "/wallpapers/abstract.jpg", name: "Abstract" },
    { id: "dark", path: "/wallpapers/dark.png", name: "Dark Theme" },
    { id: "light", path: "/wallpapers/light.png", name: "Light Theme" },
  ]);

  // Handle settings changes
  const handleWallpaperChange = (path: string) => {
    changeWallpaper(path);
    addNotification({
      title: "Settings",
      message: "Wallpaper changed successfully",
      icon: "settings",
    });
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled((prev) => !prev);

    addNotification({
      title: "Settings",
      message: `Notifications ${
        !notificationsEnabled ? "enabled" : "disabled"
      }`,
      icon: "settings",
    });
  };

  const handleSoundToggle = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleAutoStartToggle = () => {
    setAutoStart((prev) => !prev);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);

    addNotification({
      title: "Settings",
      message: "Language setting changed. Some changes may require restart.",
      icon: "settings",
    });
  };

  // Fixed unused parameter
  const handleTimeFormatChange = (value: string) => {
    setTimeFormat(value);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <SettingsSection title="Personalization">
          <SettingItem
            title="Theme"
            description="Choose between light and dark mode"
          >
            <ToggleSwitch checked={theme === "dark"} onChange={toggleTheme} />
          </SettingItem>

          <div className="wallpaper-section">
            <h3>Desktop Wallpaper</h3>
            <div className="wallpaper-grid">
              {wallpapers.map((wp) => (
                <div
                  key={wp.id}
                  className={`wallpaper-item ${
                    wallpaper === wp.path ? "selected" : ""
                  }`}
                  onClick={() => handleWallpaperChange(wp.path)}
                >
                  <div
                    className="wallpaper-preview"
                    style={{ backgroundImage: `url(${wp.path})` }}
                  ></div>
                  <span>{wp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="System">
          <SettingItem
            title="Notifications"
            description="Show system and app notifications"
          >
            <ToggleSwitch
              checked={notificationsEnabled}
              onChange={handleNotificationsToggle}
            />
          </SettingItem>

          <SettingItem
            title="Sound Effects"
            description="Play sounds for notifications and system events"
          >
            <ToggleSwitch checked={soundEnabled} onChange={handleSoundToggle} />
          </SettingItem>

          <SettingItem
            title="Auto Start"
            description="Launch apps automatically on startup"
          >
            <ToggleSwitch
              checked={autoStart}
              onChange={handleAutoStartToggle}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="Language & Region">
          <SettingItem
            title="Display Language"
            description="Choose your preferred language"
          >
            <Dropdown
              value={language}
              onChange={handleLanguageChange}
              options={[
                { value: "en-US", label: "English (US)" },
                { value: "en-GB", label: "English (UK)" },
                { value: "es-ES", label: "Spanish" },
                { value: "fr-FR", label: "French" },
                { value: "de-DE", label: "German" },
              ]}
            />
          </SettingItem>

          <SettingItem
            title="Time Format"
            description="Choose how time is displayed"
          >
            <Dropdown
              value={timeFormat}
              onChange={handleTimeFormatChange}
              options={[
                { value: "12h", label: "12-hour (AM/PM)" },
                { value: "24h", label: "24-hour" },
              ]}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="About">
          <div className="about-section">
            <h3>Windows 11 Web Simulator</h3>
            <p>Version 1.0.0</p>
            <p className="about-description">
              This is a web-based simulation of the Windows 11 desktop
              environment built with React and TypeScript.
            </p>
          </div>
        </SettingsSection>
      </div>

      <style jsx>{`
        .settings-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .settings-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .settings-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }

        .settings-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .wallpaper-section h3 {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 500;
        }

        .wallpaper-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 15px;
        }

        .wallpaper-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .wallpaper-item:hover {
          transform: scale(1.05);
        }

        .wallpaper-preview {
          width: 100px;
          height: 60px;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          margin-bottom: 8px;
          border: 2px solid transparent;
        }

        .wallpaper-item.selected .wallpaper-preview {
          border-color: #0078d4;
        }

        .wallpaper-item span {
          font-size: 12px;
        }

        .about-section {
          padding: 15px;
          border-radius: 8px;
          background-color: var(--item-bg);
        }

        .about-section h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 500;
        }

        .about-section p {
          margin: 0 0 5px 0;
          font-size: 14px;
        }

        .about-description {
          margin-top: 15px !important;
          opacity: 0.8;
        }

        :global([data-theme="dark"]) .settings-container {
          --bg-color: #202020;
          --text-color: #e0e0e0;
          --heading-color: #ffffff;
          --border-color: rgba(255, 255, 255, 0.1);
          --item-bg: rgba(255, 255, 255, 0.05);
          --dropdown-bg: #2d2d2d;
        }

        :global([data-theme="light"]) .settings-container {
          --bg-color: #f9f9f9;
          --text-color: #202020;
          --heading-color: #000000;
          --border-color: rgba(0, 0, 0, 0.1);
          --item-bg: rgba(0, 0, 0, 0.02);
          --dropdown-bg: #ffffff;
        }
      `}</style>
    </div>
  );
}
