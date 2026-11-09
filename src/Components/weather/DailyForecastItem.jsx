
import React from "react";
import WeatherIcon from "./WeatherIcon";
import formatWeather from "../../utils/formatWeather";

function DailyForecastItem({
    date,
    weatherCode,
    maxTemperature,
    minTemperature,
    precipitationProbability,
    uvIndex,
    isSelected,
    onClick,
}) {
    // Format the forecast date
    const formatDate = (dateString) => {
        const dateObject = new Date(`${dateString}T12:00:00`);

        return {
            day: new Intl.DateTimeFormat("en-US", {
                weekday: "short",
            }).format(dateObject),

            fullDate: new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
            }).format(dateObject),
        };
    };

    const dateInfo = formatDate(date);

    // Identify the weather condition
    const weatherInfo = formatWeather(weatherCode, 1);

    return (
        <button
            type="button"
            className={`daily-forecast-item ${
                isSelected ? "selected-day" : ""
            }`}
            onClick={onClick}
            aria-pressed={isSelected}
        >
            {/* Day and date */}
            <div className="daily-forecast-date">
                <h3>{dateInfo.day}</h3>
                <p>{dateInfo.fullDate}</p>
            </div>

            {/* Weather icon and description */}
            <div className="daily-forecast-weather">
                <WeatherIcon
                    icon={weatherInfo.icon}
                    size={36}
                />
                <p>{weatherInfo.description}</p>
            </div>

            {/* Maximum and minimum temperatures */}
            <div className="daily-forecast-temperatures">
                <strong>
                    {maxTemperature !== null &&
                    maxTemperature !== undefined
                        ? `${Math.round(maxTemperature)}°`
                        : "--"}
                </strong>

                <span>
                    {minTemperature !== null &&
                    minTemperature !== undefined
                        ? `${Math.round(minTemperature)}°`
                        : "--"}
                </span>
            </div>

            {/* Additional daily information */}
            <div className="daily-forecast-details">
                {precipitationProbability !== null &&
                precipitationProbability !== undefined && (
                    <p>💧 {precipitationProbability}%</p>
                )}

                {uvIndex !== null && uvIndex !== undefined && (
                    <p>☀️ UV {uvIndex}</p>
                )}
            </div>
        </button>
    );
}

export default DailyForecastItem;
