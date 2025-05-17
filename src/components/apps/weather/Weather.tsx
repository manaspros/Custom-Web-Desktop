"use client";

import { useState, useEffect } from "react";
import { useOS } from "@/components/contexts/OSContext";

interface WeatherProps {
  isWidget?: boolean;
  windowId?: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    day: string;
    temperature: number;
    condition: string;
    icon: string;
  }[];
}

export default function Weather({
  isWidget = false,
  windowId = "default",
}: WeatherProps) {
  const { theme, addNotification } = useOS();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<string>("Delhi");

  // Fetch weather data from OpenWeatherMap API
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);

      try {
        const API_KEY = "e489df13f9830ddd638f0a6d75b4b706";

        // Fetch current weather
        const currentWeatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
        );

        if (!currentWeatherResponse.ok) {
          throw new Error("Failed to fetch current weather");
        }

        const currentWeatherData = await currentWeatherResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`
        );

        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch forecast");
        }

        const forecastData = await forecastResponse.json();

        // Map weather icon codes to emoji
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

        // Process 5-day forecast (one forecast per day)
        const dailyForecasts = [];
        const processedDates = new Set();
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Skip today since we already have current weather
        let forecastStartIndex = 0;

        for (
          let i = 0;
          i < forecastData.list.length && dailyForecasts.length < 5;
          i++
        ) {
          const forecast = forecastData.list[i];
          const forecastDate = new Date(forecast.dt * 1000);
          const dateString = forecastDate.toDateString();

          if (
            !processedDates.has(dateString) &&
            forecastDate.getDate() !== new Date().getDate()
          ) {
            processedDates.add(dateString);
            const dayName = days[forecastDate.getDay()];
            dailyForecasts.push({
              day: forecastStartIndex === 0 ? "Tomorrow" : dayName,
              temperature: Math.round(forecast.main.temp),
              condition: forecast.weather[0].main,
              icon: getWeatherEmoji(forecast.weather[0].icon),
            });
            forecastStartIndex++;
          }
        }

        // Create full weather data object
        const weatherData: WeatherData = {
          location: currentWeatherData.name,
          temperature: Math.round(currentWeatherData.main.temp),
          condition: currentWeatherData.weather[0].main,
          icon: getWeatherEmoji(currentWeatherData.weather[0].icon),
          humidity: currentWeatherData.main.humidity,
          windSpeed: Math.round(currentWeatherData.wind.speed * 3.6), // Convert m/s to km/h
          forecast: dailyForecasts,
        };

        setWeatherData(weatherData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        addNotification({
          title: "Weather Error",
          message: `Could not fetch weather for ${location}. Please try another location.`,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather every 30 minutes
    const intervalId = setInterval(fetchWeather, 1800000);

    return () => clearInterval(intervalId);
  }, [location, addNotification]);

  // Handle location search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchInput = e.currentTarget.elements.namedItem(
      "location"
    ) as HTMLInputElement;
    if (searchInput.value.trim()) {
      setLocation(searchInput.value);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`weather-container ${isWidget ? "widget" : ""}`}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>

        <style jsx>{`
          .weather-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: ${isWidget ? "10px" : "20px"};
            border-radius: 8px;
          }

          .widget {
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 120, 212, 0.1);
            border-left-color: rgba(0, 120, 212, 1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // If data loaded
  if (weatherData) {
    // Widget view (compact)
    if (isWidget) {
      return (
        <div className="weather-widget">
          <div className="current-weather">
            <div className="location">{weatherData.location}</div>
            <div className="temp-container">
              <div className="weather-icon">{weatherData.icon}</div>
              <div className="temperature">{weatherData.temperature}°C</div>
            </div>
            <div className="condition">{weatherData.condition}</div>
          </div>

          <style jsx>{`
            .weather-widget {
              display: flex;
              flex-direction: column;
              padding: 15px;
              border-radius: 12px;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .current-weather {
              text-align: center;
            }

            .location {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 5px;
            }

            .temp-container {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 5px;
            }

            .weather-icon {
              font-size: 30px;
              margin-right: 10px;
            }

            .temperature {
              font-size: 24px;
              font-weight: 700;
            }

            .condition {
              font-size: 14px;
              opacity: 0.9;
            }
          `}</style>
        </div>
      );
    }

    // Full app view
    return (
      <div className="weather-app">
        <div className="weather-header">
          <h1>Weather</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="location"
              placeholder="Search location..."
              defaultValue={location}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        <div className="current-weather">
          <div className="location-info">
            <h2>{weatherData.location}</h2>
            <p className="date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="condition">{weatherData.condition}</p>
          </div>

          <div className="temp-display">
            <div className="weather-icon-large">{weatherData.icon}</div>
            <div className="temp-large">{weatherData.temperature}°C</div>
          </div>

          <div className="weather-details">
            <div className="detail">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{weatherData.humidity}%</span>
            </div>
            <div className="detail">
              <span className="detail-label">Wind</span>
              <span className="detail-value">{weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-items">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <div className="day-name">{day.day}</div>
                <div className="day-icon">{day.icon}</div>
                <div className="day-temp">{day.temperature}°C</div>
                <div className="day-condition">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="refresh-btn"
          onClick={() => setLocation(location)} // Force refresh
        >
          Refresh
        </button>

        <style jsx>{`
          .weather-app {
            display: flex;
            flex-direction: column;
            height: 100%;
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: 20px;
            overflow-y: auto;
          }

          .weather-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
          }

          .weather-header h1 {
            font-size: 24px;
            margin: 0;
          }

          .search-form {
            display: flex;
            gap: 10px;
          }

          .search-form input {
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            background-color: var(--input-bg);
            color: var(--text-color);
          }

          .search-form button {
            padding: 8px 16px;
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .current-weather {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 12px;
            background-color: var(--bg-secondary);
          }

          .location-info {
            text-align: center;
            margin-bottom: 15px;
          }

          .location-info h2 {
            font-size: 22px;
            margin: 0 0 5px 0;
          }

          .date {
            margin: 0 0 5px 0;
            opacity: 0.8;
          }

          .condition {
            margin: 0;
            font-weight: 500;
          }

          .temp-display {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 15px 0;
          }

          .weather-icon-large {
            font-size: 60px;
            margin-right: 20px;
          }

          .temp-large {
            font-size: 48px;
            font-weight: 700;
          }

          .weather-details {
            display: flex;
            gap: 40px;
            margin-top: 15px;
          }

          .detail {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .detail-label {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 5px;
          }

          .detail-value {
            font-size: 16px;
            font-weight: 600;
          }

          .forecast {
            margin-bottom: 20px;
          }

          .forecast h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
          }

          .forecast-items {
            display: flex;
            justify-content: space-between;
            overflow-x: auto;
            padding-bottom: 10px;
          }

          .forecast-day {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            min-width: 100px;
            border-radius: 8px;
            background-color: var(--bg-secondary);
          }

          .day-name {
            font-weight: 600;
            margin-bottom: 10px;
          }

          .day-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }

          .day-temp {
            font-weight: 600;
            margin-bottom: 5px;
          }

          .day-condition {
            font-size: 12px;
            opacity: 0.8;
            text-align: center;
          }

          .refresh-btn {
            align-self: center;
            padding: 10px 20px;
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: auto;
            margin-bottom: 20px;
          }

          :global([data-theme="dark"]) .weather-app {
            --bg-secondary: rgba(50, 50, 50, 0.4);
            --border-color: rgba(255, 255, 255, 0.1);
            --input-bg: rgba(30, 30, 30, 0.8);
            --accent-color: #0078d4;
          }

          :global([data-theme="light"]) .weather-app {
            --bg-secondary: rgba(240, 240, 240, 0.8);
            --border-color: rgba(0, 0, 0, 0.1);
            --input-bg: rgba(255, 255, 255, 0.9);
            --accent-color: #0078d4;
          }
        `}</style>
      </div>
    );
  }

  // Fallback
  return null;
}
