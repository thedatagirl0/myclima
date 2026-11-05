
import React from "react";

function WeatherMetricCard({ title, value, unit, icon: Icon }) {
    // Check whether the measurement is available
    const isAvailable =
        value !== null &&
        value !== undefined &&
        value !== "";

    return (
        <div className="weather-metric-card">
            <div className="metric-header">
                {Icon && <Icon size={24} aria-hidden="true" />}

                <h3>{title}</h3>
            </div>

            <p>
                {isAvailable
                    ? `${value}${unit ? ` ${unit}` : ""}`
                    : "Unavailable"}
            </p>
        </div>
    );
}

export default WeatherMetricCard;
