
import React from "react";

function WeatherMetricCard({ title, value, unit, icon: Icon }) {

    const isAvailable =
        value !== null &&
        value !== undefined &&
        value !== "";

    const iconColors = {
        Humidity: "#67e8f9",
        Wind: "#7dd3fc",
        "UV Index": "#fbbf24",
        Visibility: "#c4b5fd",
    };

    return (
        <div className="weather-metric-card">

            {/* Metric icon */}
            {Icon && (
                <Icon
                    className="metric-icon"
                    size={28}
                    strokeWidth={2.2}
                    color={iconColors[title] || "#ffffff"}
                    aria-hidden="true"
                />
            )}

            {/* Metric information */}
            <div className="metric-content">

                <p>{title}</p>

                <h3>
                    {isAvailable
                        ? `${value}${unit ? ` ${unit}` : ""}`
                        : "--"}
                </h3>

            </div>

        </div>
    );
}

export default WeatherMetricCard;
