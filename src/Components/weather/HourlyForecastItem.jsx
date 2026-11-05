
import React from "react";
import WeatherIcon from "./WeatherIcon";

function HourlyForecastItem({
    time,
    temperature,
    weatherInfo,
    precipitationProbability,
    isCurrent = false,
}) {
    return (
        <div
            className={`hourly-forecast-item ${isCurrent ? "current-hour" : ""
                }`}
        >
            {/* Forecast time */}
            <p>{time}</p>

            {/* Weather icon */}
            <WeatherIcon
                icon={weatherInfo?.icon || "cloud"}
                size={32}
            />

            {/* Temperature */}
            <h3>
                {temperature !== null && temperature !== undefined
                    ? `${temperature}°`
                    : "--"}
            </h3>

            {/* Weather condition */}
            <p>
                {weatherInfo?.description || "Unavailable"}
            </p>

            {/* Precipitation probability */}
            {precipitationProbability !== null &&
                precipitationProbability !== undefined && (
                    <small>
                        💧 {precipitationProbability}%
                    </small>
                )}
        </div>
    );
}

export default HourlyForecastItem;
