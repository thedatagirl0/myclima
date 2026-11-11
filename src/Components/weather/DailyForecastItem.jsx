
import React, { useEffect, useRef, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
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
    const descriptionRef = useRef(null);
    const [isDescriptionClipped, setIsDescriptionClipped] = useState(false);

    useEffect(() => {
        const descriptionElement = descriptionRef.current;
        if (!descriptionElement) {
            return undefined;
        }

        const updateTooltipVisibility = () => {
            const isSmallScreen = window.matchMedia("(max-width: 520px)").matches;
            setIsDescriptionClipped(
                isSmallScreen &&
                    descriptionElement.scrollWidth >
                        descriptionElement.clientWidth
            );
        };

        updateTooltipVisibility();
        window.addEventListener("resize", updateTooltipVisibility);

        const resizeObserver =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateTooltipVisibility)
                : null;
        resizeObserver?.observe(descriptionElement);

        return () => {
            window.removeEventListener("resize", updateTooltipVisibility);
            resizeObserver?.disconnect();
        };
    }, [weatherInfo.description]);

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <tr
            className={`daily-forecast-item ${
                isSelected ? "selected-day" : ""
            }`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-selected={isSelected}
        >
            <td className="daily-forecast-date">
                <h3>{dateInfo.day}</h3>
                <p>{dateInfo.fullDate}</p>
            </td>

            <td className="daily-forecast-weather">
                <WeatherIcon icon={weatherInfo.icon} size={36} />
                <Tooltip
                    describeChild
                    title={
                        isDescriptionClipped ? weatherInfo.description : ""
                    }
                    enterTouchDelay={0}
                >
                    <span ref={descriptionRef}>{weatherInfo.description}</span>
                </Tooltip>
            </td>

            <td className="daily-forecast-temperature high-temperature">
                {maxTemperature !== null && maxTemperature !== undefined
                    ? `${Math.round(maxTemperature)}°`
                    : "--"}
            </td>

            <td className="daily-forecast-temperature low-temperature">
                {minTemperature !== null && minTemperature !== undefined
                    ? `${Math.round(minTemperature)}°`
                    : "--"}
            </td>

            <td className="daily-forecast-details">
                {precipitationProbability !== null &&
                    precipitationProbability !== undefined && (
                        <p>💧 {precipitationProbability}%</p>
                    )}
                {uvIndex !== null && uvIndex !== undefined && (
                    <p>☀️ UV {uvIndex}</p>
                )}
            </td>
        </tr>
    );
}

export default DailyForecastItem;
