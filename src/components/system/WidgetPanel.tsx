import { useRef, useEffect, useState } from "react";
import { useOS } from "@/components/contexts/OSContext";

export default function WidgetPanel() {
  const { toggleWidgetPanel } = useOS();
  const widgetPanelRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: 22,
    condition: "Sunny",
    location: "New York",
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetPanelRef.current &&
        !widgetPanelRef.current.contains(event.target as Node)
      ) {
        toggleWidgetPanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleWidgetPanel]);

  // Format the date strings
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = currentTime.toLocaleDateString(undefined, dateOptions);
  const formattedTime = currentTime.toLocaleTimeString(undefined, timeOptions);
  return (
    <div ref={widgetPanelRef} className="widget-panel">
      <div className="widget-header">
        <h2 className="widget-panel-title">Widgets</h2>
      </div>

      <div className="widgets-container">
        {" "}
        {/* Time and Date Widget */}
        <div className="widget time-date-widget">
          <div className="time-display">{formattedTime}</div>
          <div className="date-display">{formattedDate}</div>
        </div>
        {/* Weather Widget */}
        <div className="widget weather-widget">
          {" "}
          <div className="weather-content">
            <div>
              <div className="weather-location">{weather.location}</div>
              <div className="weather-temp">{weather.temp}°C</div>
              <div className="weather-condition">{weather.condition}</div>
            </div>
            <div className="weather-icon">
              {weather.condition === "Sunny"
                ? "☀️"
                : weather.condition === "Cloudy"
                ? "☁️"
                : weather.condition === "Rainy"
                ? "🌧️"
                : "❓"}
            </div>
          </div>
        </div>{" "}
        {/* Calendar Widget */}
        <div className="widget calendar-widget">
          <h3 className="widget-title">Calendar</h3>
          <div className="calendar-grid">
            <div className="day-label">Su</div>
            <div className="day-label">Mo</div>
            <div className="day-label">Tu</div>
            <div className="day-label">We</div>
            <div className="day-label">Th</div>
            <div className="day-label">Fr</div>
            <div className="day-label">Sa</div>{" "}
            {/* Placeholder calendar days - would be generated dynamically in a real app */}
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`calendar-day ${
                  i + 1 === currentTime.getDate() ? "current-day" : ""
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>{" "}
        {/* News Widget */}
        <div className="widget news-widget">
          <h3 className="widget-title">News</h3>
          <div className="news-container">
            <div className="news-item">
              <h4 className="news-headline">Technology advancements in 2025</h4>
              <p className="news-summary">
                The latest breakthroughs in AI and quantum computing...
              </p>
            </div>
            <div className="news-item">
              <h4 className="news-headline">
                Global climate initiative launched
              </h4>
              <p className="news-summary">
                Major countries agree on new emissions targets...
              </p>
            </div>
            <div className="news-item">
              <h4 className="news-headline">Sports highlights of the week</h4>
              <p className="news-summary">
                Record breaking performances in athletics...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
