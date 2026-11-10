
import React, { useEffect, useState } from "react";

import useIpGeolocation from "./hooks/useIpGeolocation";
import useWeather from "./hooks/useWeather";
import useTheme from "./hooks/useTheme";

import formatWeather from "./utils/formatWeather";
import getRecommendation from "./utils/getRecommendation";

import AppHeader from "./Components/layout/AppHeader";
import LocationHeader from "./Components/weather/LocationHeader";
import MainWeatherCard from "./Components/weather/MainWeatherCard";

import HourlyForecast from "./Components/weather/HourlyForecast";
import SevenDayForecast from "./Components/weather/SevenDayForecast";

import LoadingState from "./Components/ui/LoadingState";
import ErrorMessage from "./Components/ui/ErrorMessage";

import {
    getCachedCityBackground,
    getCityBackground,
} from "./services/cityImageService";

import "./App.css";

function App() {
    // Theme management
    const { theme, toggleTheme } = useTheme();

    // Resolve a default location without requesting browser location permission.
    const [selectedLocation, setSelectedLocation] = useState(() => {
        if (typeof window === "undefined") {
            return null;
        }

        try {
            const savedLocation = localStorage.getItem("weather-selected-location");
            return savedLocation ? JSON.parse(savedLocation) : null;
        } catch (error) {
            return null;
        }
    });

    const {
        coordinates,
        city,
        country,
        loading: locationLoading,
        error: locationError,
    } = useIpGeolocation(!selectedLocation);

    useEffect(() => {
        if (selectedLocation) {
            localStorage.setItem(
                "weather-selected-location",
                JSON.stringify(selectedLocation)
            );
            return;
        }

        localStorage.removeItem("weather-selected-location");
    }, [selectedLocation]);

    // Prefer a manually selected city over the approximate IP-based location.
    const weatherCoordinates = selectedLocation
        ? {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
        }
        : coordinates;

    // Get weather information
    const {
        weatherData,
        loading: weatherLoading,
        error: weatherError,
    } = useWeather(weatherCoordinates);

    // Track selected day and hour
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);

    // Manage live clock
    const [clockNow, setClockNow] = useState(Date.now());

    // Store city background information
    const [cityBackground, setCityBackground] = useState({
        imageUrl: null,
        attribution: null,
        sourceUrl: null,
        licenseUrl: null,
    });

    // Determine displayed location
    const displayCity = selectedLocation?.name || city;
    const displayCountry = selectedLocation?.country || country;

    // City background
    const backgroundCity = displayCity;

    // Load background whenever the city changes
    useEffect(() => {
        let isActive = true;
        const controller = new AbortController();

        const loadBackground = async () => {
            if (!backgroundCity) {
                setCityBackground({
                    imageUrl: null,
                    attribution: null,
                    sourceUrl: null,
                    licenseUrl: null,
                });
                return;
            }

            const cachedBackground = getCachedCityBackground(backgroundCity);
            if (cachedBackground) {
                setCityBackground(cachedBackground);
                return;
            }

            const result = await getCityBackground(
                backgroundCity,
                controller.signal
            );

            if (isActive && result) {
                setCityBackground(result);
            }
        };

        loadBackground();

        return () => {
            isActive = false;
            controller.abort();
        };
    }, [backgroundCity]);

    // Update clock every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setClockNow(Date.now());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Handle city selection
    const handleCitySelect = (location) => {
        setSelectedLocation(location || null);
        setSelectedDate(null);
        setSelectedHour(null);
    };

    // Current weather
    const currentWeather = weatherData?.current;

    // Today's date according to the weather API
    const todayDate = currentWeather?.time?.slice(0, 10);

    // Selected date or today
    const activeDate = selectedDate || todayDate;

    // Display selected hour or current weather
    const displayedWeather = selectedHour || currentWeather;

    // Get location timezone
    const timezone = weatherData?.timezone;

    // Format local date and time
    const localDateTime = timezone
        ? new Intl.DateTimeFormat("en-GB", {
            timeZone: timezone,
            dateStyle: "full",
            timeStyle: "short",
        }).format(new Date(clockNow))
        : null;

    // Handle selecting a day
    const handleDaySelect = (date) => {
        setSelectedDate(date);

        // Restore current weather when today is selected
        if (date === todayDate) {
            setSelectedHour(null);
            return;
        }

        // Find the first available hour of the selected day
        const firstHourIndex = weatherData?.hourly?.time?.findIndex(
            (time) => time.slice(0, 10) === date
        );

        if (firstHourIndex === undefined || firstHourIndex === -1) {
            setSelectedHour(null);
            return;
        }

        const hourly = weatherData.hourly;

        // Create the selected hour's weather object
        const firstHour = {
            time: hourly.time[firstHourIndex],
            temperature_2m: hourly.temperature_2m?.[firstHourIndex],
            relative_humidity_2m:
                hourly.relative_humidity_2m?.[firstHourIndex],
            apparent_temperature:
                hourly.apparent_temperature?.[firstHourIndex],
            precipitation_probability:
                hourly.precipitation_probability?.[firstHourIndex],
            weather_code: hourly.weather_code?.[firstHourIndex],
            is_day: hourly.is_day?.[firstHourIndex],
            wind_speed_10m: hourly.wind_speed_10m?.[firstHourIndex],
            uv_index: hourly.uv_index?.[firstHourIndex],
            visibility: hourly.visibility?.[firstHourIndex],
            surface_pressure: hourly.surface_pressure?.[firstHourIndex],
        };

        setSelectedHour(firstHour);
    };

    // Interpret weather code
    const weatherInfo = displayedWeather
        ? formatWeather(
            displayedWeather.weather_code,
            displayedWeather.is_day
        )
        : null;

    // Generate weather recommendation
    const recommendation = displayedWeather
        ? getRecommendation({
            weatherCode: displayedWeather.weather_code,
            temperature: displayedWeather.temperature_2m,
            windSpeed: displayedWeather.wind_speed_10m,
            isDay: displayedWeather.is_day,
        })
        : null;

    return (
        <div
            className={`App ${theme}-theme`}
            style={{
                backgroundImage: cityBackground.imageUrl
                    ? `linear-gradient(rgba(0, 0, 0, 0.30), rgba(0, 0, 0, 0.30)), url("${cityBackground.imageUrl}")`
                    : theme === "dark"
                        ? "linear-gradient(135deg, #172235, #26364b)"
                        : "linear-gradient(135deg, #dceef8, #f4e6d7)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                minHeight: "100vh",
            }}
        >
            <main className="location-card">

                {/* APPLICATION HEADER */}
                <AppHeader
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onCitySelect={handleCitySelect}
                />

                {/* LOCATION LOADING */}
                {!selectedLocation && locationLoading && (
                    <LoadingState message="Finding your approximate location..." />
                )}

                {/* LOCATION ERROR */}
                {!selectedLocation && locationError && (
                    <ErrorMessage message={locationError} />
                )}

                {/* LOCATION HEADER */}
                {(displayCity || displayCountry) && (
                    <LocationHeader
                        city={displayCity}
                        country={displayCountry}
                        localDateTime={localDateTime}
                    />
                )}

                {/* WEATHER LOADING */}
                {weatherLoading && (
                    <LoadingState message="Retrieving weather information..." />
                )}

                {/* WEATHER ERROR */}
                {weatherError && (
                    <ErrorMessage message={weatherError} />
                )}

                {/* CURRENT WEATHER */}
                {displayedWeather && (
                    <section className="current-weather-section">

                        {/* MAIN WEATHER CARD */}
                        <MainWeatherCard
                            weather={displayedWeather}
                            weatherInfo={weatherInfo}
                            recommendation={recommendation}
                        />
                    </section>
                )}

                {/* HOURLY FORECAST */}
                {displayedWeather && (
                    <HourlyForecast
                        hourly={weatherData?.hourly}
                        currentWeather={currentWeather}
                        selectedDate={activeDate}
                        selectedTime={selectedHour?.time || null}
                        onHourSelect={setSelectedHour}
                    />
                )}

                {/* SEVEN-DAY FORECAST */}
                {displayedWeather && (
                    <SevenDayForecast
                        daily={weatherData?.daily}
                        selectedDate={activeDate}
                        onDaySelect={handleDaySelect}
                    />
                )}

            </main>

            {/* IMAGE ATTRIBUTION */}
            {cityBackground.sourceUrl && (
                <p className="image-attribution">
                    Background image:{" "}
                    {cityBackground.attribution || "Wikimedia Commons"}

                    {" · "}

                    <a
                        href={cityBackground.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        View image source
                    </a>

                    {cityBackground.licenseUrl && (
                        <>
                            {" · "}

                            <a
                                href={cityBackground.licenseUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Image license
                            </a>
                        </>
                    )}
                </p>
            )}

        </div>
    );
}

export default App;
