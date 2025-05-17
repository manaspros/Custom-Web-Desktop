import { useRef, useEffect, useState } from "react";
import { useOS } from "@/components/contexts/OSContext";

// Use the same weather data type as the Weather app
interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

// News API interfaces
interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export default function WidgetPanel() {
  const { toggleWidgetPanel, addNotification } = useOS();
  const widgetPanelRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Default location - can be made configurable
  const defaultLocation = "Delhi";

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch weather data - using same approach as Weather app
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const API_KEY = "e489df13f9830ddd638f0a6d75b4b706";

        // Fetch current weather
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${defaultLocation}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();

        // Map weather icon codes to emoji - same logic as Weather app
        const getWeatherEmoji = (iconCode: string) => {
          const iconMap: { [key: string]: string } = {
            "01d": "☀️", // clear sky day
            "01n": "🌙", // clear sky night
            "02d": "⛅", // few clouds day
            "02n": "☁️", // few clouds night
            "03d": "☁️", // scattered clouds
            "03n": "☁️",
            "04d": "☁️", // broken clouds
            "04n": "☁️",
            "09d": "🌧️", // shower rain
            "09n": "🌧️",
            "10d": "🌦️", // rain day
            "10n": "🌧️", // rain night
            "11d": "⛈️", // thunderstorm
            "11n": "⛈️",
            "13d": "❄️", // snow
            "13n": "❄️",
            "50d": "🌫️", // mist
            "50n": "🌫️",
          };

          return iconMap[iconCode] || "🌤️";
        };

        // Format the data using the same structure as Weather app
        setWeatherData({
          location: data.name,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: getWeatherEmoji(data.weather[0].icon),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        addNotification({
          title: "Weather Widget",
          message: "Could not fetch weather data",
          type: "warning",
        });

        // Fallback data
        setWeatherData({
          location: defaultLocation,
          temperature: 22,
          condition: "Sunny",
          icon: "☀️",
        });
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, [addNotification]);

  // Fetch news from NewsAPI
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(null);

      try {
        const NEWS_API_KEY = "c43b8b9197f14cb581bf956fd7eee1fe";
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const data: NewsApiResponse = await response.json();

        if (data.status !== "ok") {
          throw new Error(`API returned error: ${data.status}`);
        }

        setNewsArticles(data.articles.slice(0, 3)); // Limit to 3 news items
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsError("Could not load news");
        addNotification({
          title: "News Widget",
          message: "Could not fetch latest news",
          type: "warning",
        });
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();

    // Refresh news every hour
    const newsInterval = setInterval(fetchNews, 60 * 60 * 1000);

    return () => clearInterval(newsInterval);
  }, [addNotification]);

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

  // Format news publication date
  const formatNewsDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) {
      return "Just now";
    } else if (diffHrs < 24) {
      return `${diffHrs} ${diffHrs === 1 ? "hour" : "hours"} ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div ref={widgetPanelRef} className="widget-panel">
      <div className="widget-header">
        <h2 className="widget-panel-title">Widgets</h2>
      </div>

      <div className="widgets-container">
        {/* Time and Date Widget */}
        <div className="widget time-date-widget">
          <div className="time-display">{formattedTime}</div>
          <div className="date-display">{formattedDate}</div>
        </div>

        {/* Weather Widget */}
        <div className="widget weather-widget">
          {weatherLoading ? (
            <div className="weather-loading">Loading weather...</div>
          ) : weatherData ? (
            <div className="weather-content">
              <div>
                <div className="weather-location">{weatherData.location}</div>
                <div className="weather-temp">{weatherData.temperature}°C</div>
                <div className="weather-condition">{weatherData.condition}</div>
              </div>
              <div className="weather-icon">{weatherData.icon}</div>
            </div>
          ) : (
            <div className="weather-error">Weather data unavailable</div>
          )}
        </div>

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
            <div className="day-label">Sa</div>
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
        </div>

        {/* News Widget - with real data from NewsAPI */}
        <div className="widget news-widget">
          <h3 className="widget-title">Latest News</h3>
          <div className="news-container">
            {newsLoading ? (
              <div className="news-loading">Loading latest headlines...</div>
            ) : newsError ? (
              <div className="news-error">{newsError}</div>
            ) : newsArticles.length > 0 ? (
              newsArticles.map((article, index) => (
                <div key={index} className="news-item">
                  <h4 className="news-headline">{article.title}</h4>
                  <p className="news-summary">
                    {article.description || "No description available"}
                  </p>
                  <div className="news-meta">
                    <span className="news-source">{article.source.name}</span>
                    <span className="news-time">
                      {formatNewsDate(article.publishedAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="news-error">No news available</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ...existing code... */

        .weather-loading,
        .weather-error,
        .news-loading,
        .news-error {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80px;
          font-size: 14px;
          opacity: 0.8;
        }

        .weather-loading,
        .weather-error {
          color: white;
        }

        .news-item {
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .news-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .news-headline {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 6px 0;
        }

        .news-summary {
          font-size: 13px;
          margin: 0 0 6px 0;
          opacity: 0.9;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          opacity: 0.7;
        }

        .news-source {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
