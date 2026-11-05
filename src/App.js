
import React, { useEffect, useState } from "react";
import useGeolocation from "./hooks/useGeolocation";
import useWeather from "./hooks/useWeather";
import formatWeather from "./utils/formatWeather";
import WeatherIcon from "./Components/weather/WeatherIcon";
import getRecommendation from "./utils/getRecommendation";
import WeatherRecommendation from "./Components/weather/WeatherRecommendation";
import WeatherDetails from "./Components/weather/WeatherDetails";
import HourlyForecast from "./Components/weather/HourlyForecast";

import "./App.css";

function App() {
  // Get user's location
  const {
    coordinates,
    city,
    country,
    locality,
    loading: locationLoading,
    error: locationError,
    geocodingError,
  } = useGeolocation();

  // Get weather information
  const {
    weatherData,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather(coordinates);

  // Manage the live clock
  const [clockNow, setClockNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setClockNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Extract current weather and timezone
  const currentWeather = weatherData?.current;
  const timezone = weatherData?.timezone;

  // Format the selected city's local date and time
  const localDateTime = timezone
    ? new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(clockNow))
    : null;

  // Interpret the numerical weather code
  const weatherInfo = currentWeather
    ? formatWeather(
      currentWeather.weather_code,
      currentWeather.is_day
    )
    : null;

  // Generate a recommendation based on current weather
  const recommendation = currentWeather
    ? getRecommendation({
      weatherCode: currentWeather.weather_code,
      temperature: currentWeather.temperature_2m,
      windSpeed: currentWeather.wind_speed_10m,
      isDay: currentWeather.is_day,
    })
    : null;
  return (
    <div className="App">
      <main className="location-card">

        <h1>🌦️ Smart Weather App</h1>
        <p>Discover the weather around you!</p>

        {/* LOCATION LOADING */}
        {locationLoading && (
          <p className="loading">
            Detecting your location...
          </p>
        )}

        {/* LOCATION ERROR */}
        {locationError && (
          <p className="error">
            {locationError}
          </p>
        )}

        {/* LOCATION INFORMATION */}
        {coordinates && (
          <div className="location-info">

            <h2>📍 Your Location</h2>

            <h3>
              {city || "Identifying city..."}
              {country && `, ${country}`}
            </h3>

            {locality && (
              <p>
                <strong>Locality:</strong> {locality}
              </p>
            )}

            {geocodingError && (
              <p className="error">
                {geocodingError}
              </p>
            )}

            <hr />

            <p>
              <strong>Latitude:</strong>{" "}
              {coordinates.latitude.toFixed(4)}
            </p>

            <p>
              <strong>Longitude:</strong>{" "}
              {coordinates.longitude.toFixed(4)}
            </p>

          </div>
        )}

        {/* WEATHER LOADING */}
        {weatherLoading && (
          <p className="loading">
            Retrieving weather information...
          </p>
        )}

        {/* WEATHER ERROR */}
        {weatherError && (
          <p className="error">
            {weatherError}
          </p>
        )}

        {/* CURRENT WEATHER */}
        {currentWeather && (
          <div className="location-info">

            <h2>☀️ Current Weather</h2>

            {/* Local date and time */}
            {localDateTime && (
              <p>
                <strong>Local date and time:</strong>{" "}
                {localDateTime}
              </p>
            )}

            {/* Weather data timestamp */}
            <p>
              <strong>Weather data time:</strong>{" "}
              {currentWeather.time}
            </p>

            {/* Weather icon and description */}
            {weatherInfo && (
              <div>
                <WeatherIcon
                  icon={weatherInfo.icon}
                  size={64}
                />

                <h3>{weatherInfo.description}</h3>
                <WeatherRecommendation message={recommendation} />
              </div>
            )}

            {/* Weather measurements */}
            <p>
              <strong>Temperature:</strong>{" "}
              {currentWeather.temperature_2m} °C
            </p>

            <p>
              <strong>Feels like:</strong>{" "}
              {currentWeather.apparent_temperature} °C
            </p>

            {/* Weather Details */}
            <WeatherDetails weather={currentWeather} />
            <p className="success">
              Weather retrieved successfully! 🎉
            </p>
            {/* Hourly Forecast */}
            <HourlyForecast
              hourly={weatherData?.hourly}
              currentWeather={currentWeather}
            />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
