
import axios from "axios";

// Open-Meteo Weather API endpoint
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

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

// Retrieve current weather and hourly forecast
export const getCurrentWeather = async (latitude, longitude) => {
    try {
        const response = await axios.get(WEATHER_API_URL, {
            params: {
                latitude,
                longitude,

                // Current weather information
                current: currentVariables.join(","),

                // Seven-day hourly forecast
                hourly: hourlyVariables.join(","),

                forecast_days: 7,

                // Automatically detect the selected location's timezone
                timezone: "auto",
            },
        });

        // Return the complete API response
        return response.data;

    } catch (error) {
        console.error("Weather API Error:", error);

        throw new Error(
            "Unable to retrieve weather information. Please try again."
        );
    }
};
