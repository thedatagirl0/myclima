
import React from "react";

import HourlyForecastItem from "./HourlyForecastItem";
import formatWeather from "../../utils/formatWeather";

function HourlyForecast({ hourly, currentWeather }) {

  // Check if hourly and current weather data exist
  if (
    !hourly ||
    !hourly.time ||
    !currentWeather ||
    !currentWeather.time
  ) {
    return null;
  }

  // Get the date of the current weather
  const currentDate = currentWeather.time.slice(0, 10);

  // Get the current weather timestamp
  const currentTimestamp = currentWeather.time;

  // Format hourly time
  const formatHour = (time) => {
    const hour = Number(time.slice(11, 13));

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    const formattedTime = `${displayHour} ${period}`;

    // Include the weekday when the forecast crosses into another day
    const forecastDate = time.slice(0, 10);

    if (forecastDate !== currentDate) {
      const dayName = new Date(
        `${forecastDate}T12:00:00Z`
      ).toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });

      return `${dayName} ${formattedTime}`;
    }

    return formattedTime;
  };

  // Convert hourly API arrays into individual forecast objects
  const hourlyItems = hourly.time

    .map((time, index) => ({
      time,
      temperature: hourly.temperature_2m?.[index],
      humidity: hourly.relative_humidity_2m?.[index],
      feelsLike: hourly.apparent_temperature?.[index],
      precipitationProbability:
        hourly.precipitation_probability?.[index],
      weatherCode: hourly.weather_code?.[index],
      isDay: hourly.is_day?.[index],
      windSpeed: hourly.wind_speed_10m?.[index],
      uvIndex: hourly.uv_index?.[index],
      visibility: hourly.visibility?.[index],
      pressure: hourly.surface_pressure?.[index],
    }))

    // Keep all upcoming hours, including hours after midnight
    .filter((hour) => hour.time > currentTimestamp)

    // Display the next 23 forecast hours
    .slice(0, 23);

  // Create the current weather card
  const currentHour = {
    time: "Now",
    temperature: currentWeather.temperature_2m,
    weatherInfo: formatWeather(
      currentWeather.weather_code,
      currentWeather.is_day
    ),
    precipitationProbability:
      currentWeather.precipitation_probability ?? null,
    isCurrent: true,
  };

  return (
    <section className="hourly-forecast">

      <h2>Hourly Forecast</h2>

      <div className="hourly-forecast-list">

        {/* Current weather card */}
        <HourlyForecastItem
          key="now"
          {...currentHour}
        />

        {/* Next 23 hourly forecast cards */}
        {hourlyItems.map((hour) => {

          const weatherInfo = formatWeather(
            hour.weatherCode,
            hour.isDay
          );

          return (
            <HourlyForecastItem
              key={hour.time}
              time={formatHour(hour.time)}
              temperature={hour.temperature}
              weatherInfo={weatherInfo}
              precipitationProbability={
                hour.precipitationProbability
              }
              isCurrent={false}
            />
          );
        })}

      </div>

    </section>
  );
}

export default HourlyForecast;
