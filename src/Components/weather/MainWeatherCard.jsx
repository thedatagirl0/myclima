
import React from "react";
import WeatherIcon from "./WeatherIcon";
import WeatherRecommendation from "./WeatherRecommendation";

function MainWeatherCard({
    weather,
    weatherInfo,
    recommendation,
}) {
    if (!weather) {
        return null;
    }

    return (
        <section className="current-weather-card">

            <div className="main-weather-info">

                <WeatherIcon
                    icon={weatherInfo?.icon || "cloud"}
                    size={64}
                />

                <div className="main-weather-temperature">
                    <h1>
                        {weather.temperature_2m !== null &&
                        weather.temperature_2m !== undefined
                            ? `${Math.round(weather.temperature_2m)}°`
                            : "--"}
                    </h1>

                    <p>
                        {weatherInfo?.description || "Weather unavailable"}
                    </p>

                    <span>
                        Feels like{" "}
                        {weather.apparent_temperature !== null &&
                        weather.apparent_temperature !== undefined
                            ? `${Math.round(weather.apparent_temperature)}°`
                            : "--"}
                    </span>
                </div>

            </div>

            <div className="main-weather-recommendation">
                <WeatherRecommendation
                    message={recommendation}
                />
            </div>

        </section>
    );
}

export default MainWeatherCard;
