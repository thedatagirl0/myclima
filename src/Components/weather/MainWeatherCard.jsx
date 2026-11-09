
import React from "react";
import WeatherIcon from "./WeatherIcon";
import WeatherRecommendation from "./WeatherRecommendation";
import WeatherDetails from "./WeatherDetails";

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

            <div className="main-weather-overview">
                <div className="main-weather-info">

                    <WeatherIcon
                        icon={weatherInfo?.icon || "cloud"}
                        size={56}
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
            </div>

            <WeatherDetails weather={weather} />

        </section>
    );
}

export default MainWeatherCard;
