
function getRecommendation({
    weatherCode,
    temperature,
    windSpeed,
    isDay,
}) {
    const code = Number(weatherCode);

    const hasTemperature =
        temperature !== null &&
        temperature !== undefined &&
        Number.isFinite(Number(temperature));

    const temp = Number(temperature);
    const wind = Number(windSpeed);

    // 1. Thunderstorms
    if ([95, 96, 99].includes(code)) {
        return "Thunderstorms are expected. Please stay safe!";
    }

    // 2. Snow
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "Snow is expected. Stay warm and take care!";
    }

    // 3. Rain and drizzle
    if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82)
    ) {
        return "Don't forget your umbrella!";
    }

    // 4. Fog
    if ([45, 48].includes(code)) {
        return "It's foggy outside. Take extra care when travelling!";
    }

    // 5. Strong wind
    if (Number.isFinite(wind) && wind >= 35) {
        return "It's quite windy outside. Take care!";
    }

    // 6. Very cold weather
    if (hasTemperature && temp <= 10) {
        return "It's a little chilly today. Stay warm!";
    }

    // 7. Hot weather
    if (hasTemperature && temp >= 30) {
        return "It's a hot day! Stay hydrated and enjoy your day!";
    }

    // 8. Clear or mainly clear weather
    if ([0, 1].includes(code)) {
        return Number(isDay) === 0
            ? "Clear skies tonight. Have a lovely evening!"
            : "Beautiful sunny day! Wear something casual and enjoy your day!";
    }

    // 9. Partly cloudy
    if (code === 2) {
        return "A little sunshine and a few clouds. Enjoy your day!";
    }

    // 10. Overcast
    if (code === 3) {
        return "A cloudy day ahead. Have a lovely day!";
    }

    // Default message
    return "Have a lovely day!";
}

export default getRecommendation;
