
import React from "react";

import {
    Droplets,
    Wind,
    Sun,
    Eye,
} from "lucide-react";

import WeatherMetricCard from "./WeatherMetricCard";

function WeatherDetails({ weather }) {
    if (!weather) {
        return null;
    }

    // Convert visibility from metres to kilometres
    const visibility =
        typeof weather.visibility === "number"
            ? (weather.visibility / 1000).toFixed(2)
            : null;

    return (
        <div className="weather-details-grid">

            <WeatherMetricCard
                title="Humidity"
                value={weather.relative_humidity_2m}
                unit="%"
                icon={Droplets}
            />

            <WeatherMetricCard
                title="Wind"
                value={weather.wind_speed_10m}
                unit="km/h"
                icon={Wind}
            />

            <WeatherMetricCard
                title="UV Index"
                value={weather.uv_index}
                unit=""
                icon={Sun}
            />

            <WeatherMetricCard
                title="Visibility"
                value={visibility}
                unit="km"
                icon={Eye}
            />

        </div>
    );
}

export default WeatherDetails;
