
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
      aria-pressed={isSelected}
    >
      <div className="hourly-forecast-time">
        <p>{time}</p>
      </div>

      <div className="hourly-forecast-weather">
        <WeatherIcon
          icon={weatherInfo?.icon || "cloud"}
          size={32}
        />
        <p>{weatherInfo?.description || "Unavailable"}</p>
      </div>

      <div className="hourly-forecast-temperature">
        <h3>
          {temperature !== null && temperature !== undefined
            ? `${temperature}°`
            : "--"}
        </h3>
      </div>

      {precipitationProbability !== null &&
        precipitationProbability !== undefined && (
          <small>💧 {precipitationProbability}%</small>
        )}
    </button>
  );
}

export default HourlyForecastItem;
