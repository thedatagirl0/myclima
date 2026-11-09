
import React from "react";
import WeatherIcon from "./WeatherIcon";

function HourlyForecastItem({
  time,
  temperature,
  weatherInfo,
  precipitationProbability,
  isCurrent = false,
  isSelected = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`hourly-forecast-item ${
        isCurrent ? "current-hour" : ""
      } ${isSelected ? "selected-hour" : ""}`}
      onClick={onClick}
    >
      <p>{time}</p>

      <WeatherIcon
        icon={weatherInfo?.icon || "cloud"}
        size={32}
      />

      <h3>
        {temperature !== null && temperature !== undefined
          ? `${temperature}°`
          : "--"}
      </h3>

      <p>{weatherInfo?.description || "Unavailable"}</p>

      {precipitationProbability !== null &&
        precipitationProbability !== undefined && (
          <small>💧 {precipitationProbability}%</small>
        )}
    </button>
  );
}

export default HourlyForecastItem;
