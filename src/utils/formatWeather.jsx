
// Weather conditions based on Open-Meteo WMO codes

const weatherConditions = {
    3: { description: "Overcast", icon: "cloud" },

    45: { description: "Fog", icon: "cloud-fog" },
    48: { description: "Depositing rime fog", icon: "cloud-fog" },

    51: { description: "Light drizzle", icon: "cloud-drizzle" },
    53: { description: "Moderate drizzle", icon: "cloud-drizzle" },
    55: { description: "Dense drizzle", icon: "cloud-drizzle" },
    56: { description: "Light freezing drizzle", icon: "cloud-drizzle" },
    57: { description: "Dense freezing drizzle", icon: "cloud-drizzle" },

    61: { description: "Slight rain", icon: "cloud-rain" },
    63: { description: "Moderate rain", icon: "cloud-rain" },
    65: { description: "Heavy rain", icon: "cloud-rain" },

    66: { description: "Light freezing rain", icon: "cloud-hail" },
    67: { description: "Heavy freezing rain", icon: "cloud-hail" },

    71: { description: "Slight snowfall", icon: "cloud-snow" },
    73: { description: "Moderate snowfall", icon: "cloud-snow" },
    75: { description: "Heavy snowfall", icon: "cloud-snow" },
    77: { description: "Snow grains", icon: "cloud-snow" },

    80: { description: "Slight rain showers", icon: "cloud-rain" },
    81: { description: "Moderate rain showers", icon: "cloud-rain" },
    82: { description: "Violent rain showers", icon: "cloud-rain" },

    85: { description: "Slight snow showers", icon: "cloud-snow" },
    86: { description: "Heavy snow showers", icon: "cloud-snow" },

    95: { description: "Thunderstorm", icon: "cloud-lightning" },
    96: { description: "Thunderstorm with slight hail", icon: "cloud-lightning" },
    97: { description: "Heavy thunderstorm", icon: "cloud-lightning" },
    99: { description: "Thunderstorm with heavy hail", icon: "cloud-lightning" },
};

function formatWeather(weatherCode, isDay = 1) {
    // Validate the weather code
    if (
        weatherCode === null ||
        weatherCode === undefined ||
        weatherCode === ""
    ) {
        return {
            description: "Weather unavailable",
            icon: "cloud",
        };
    }

    const code = Number(weatherCode);
    const isNight = Number(isDay) === 0;

    // Handle clear sky
    if (code === 0) {
        return {
            description: "Clear sky",
            icon: isNight ? "moon" : "sun",
        };
    }

    // Handle mainly clear
    if (code === 1) {
        return {
            description: "Mainly clear",
            icon: isNight ? "cloud-moon" : "cloud-sun",
        };
    }

    // Handle partly cloudy
    if (code === 2) {
        return {
            description: "Partly cloudy",
            icon: isNight ? "cloud-moon" : "cloud-sun",
        };
    }

    // Handle all other weather conditions
    return (
        weatherConditions[code] || {
            description: "Unknown weather condition",
            icon: "cloud",
        }
    );
}

export default formatWeather;
