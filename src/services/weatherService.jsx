
import axios from "axios";

// Open-Meteo Weather API endpoint
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const WEATHER_CACHE_KEY = "smart-weather-cache";
const WEATHER_CACHE_DURATION = 10 * 60 * 1000;
const MAX_CACHED_LOCATIONS = 8;
const memoryCache = new Map();

// Current weather variables
const currentVariables = [
    "temperature_2m",
    "relative_humidity_2m",
    "wind_speed_10m",
    "uv_index",
    "visibility",
    "weather_code",
    "apparent_temperature",
    "is_day",
];

// Hourly forecast variables
const hourlyVariables = [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation_probability",
    "weather_code",
    "wind_speed_10m",
    "uv_index",
    "visibility",
    "is_day",
    "surface_pressure",
];

// Daily forecast variables
const dailyVariables = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_probability_max",
];

const getLocationKey = (latitude, longitude) =>
    `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

// Return recently fetched data so the app can render it before revalidating.
export const getCachedWeather = (latitude, longitude) => {
    const key = getLocationKey(latitude, longitude);
    const cached = memoryCache.get(key);

    if (cached && Date.now() - cached.savedAt < WEATHER_CACHE_DURATION) {
        return cached.data;
    }

    try {
        const storedCache = JSON.parse(
            localStorage.getItem(WEATHER_CACHE_KEY) || "{}"
        );
        const stored = storedCache[key];

        if (
            stored?.data &&
            Date.now() - stored.savedAt < WEATHER_CACHE_DURATION
        ) {
            memoryCache.set(key, stored);
            return stored.data;
        }
    } catch (error) {
        console.warn("Unable to read cached weather data:", error);
    }

    return null;
};

const cacheWeather = (latitude, longitude, data) => {
    const key = getLocationKey(latitude, longitude);
    const cached = { savedAt: Date.now(), data };

    memoryCache.set(key, cached);
    if (memoryCache.size > MAX_CACHED_LOCATIONS) {
        const oldestKey = memoryCache.keys().next().value;
        memoryCache.delete(oldestKey);
    }

    try {
        const storedCache = JSON.parse(
            localStorage.getItem(WEATHER_CACHE_KEY) || "{}"
        );
        storedCache[key] = cached;

        const recentEntries = Object.entries(storedCache)
            .sort((first, second) => second[1].savedAt - first[1].savedAt)
            .slice(0, MAX_CACHED_LOCATIONS);

        localStorage.setItem(
            WEATHER_CACHE_KEY,
            JSON.stringify(Object.fromEntries(recentEntries))
        );
    } catch (error) {
        console.warn("Unable to save cached weather data:", error);
    }
};

// Retrieve current weather, hourly forecast and daily forecast
export const getCurrentWeather = async (latitude, longitude, signal) => {
    try {
        const response = await axios.get(WEATHER_API_URL, {
            signal,
            params: {
                latitude,
                longitude,

                // Current weather information
                current: currentVariables.join(","),

                // Seven-day hourly forecast
                hourly: hourlyVariables.join(","),

                // Seven-day daily forecast
                daily: dailyVariables.join(","),

                // Number of forecast days
                forecast_days: 7,

                // Automatically detect the selected location's timezone
                timezone: "auto",
            },
        });

        cacheWeather(latitude, longitude, response.data);

        // Return the complete API response
        return response.data;

    } catch (error) {
        if (axios.isCancel(error) || signal?.aborted) {
            throw error;
        }

        console.error("Weather API Error:", error);

        throw new Error(
            "Unable to retrieve weather information. Please try again."
        );
    }
};
