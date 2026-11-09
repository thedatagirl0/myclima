
const weatherEmoji = {
    sun: "☀️",
    moon: "🌙",
    cloud: "☁️",
    "cloud-fog": "🌫️",
    "cloud-drizzle": "🌦️",
    "cloud-rain": "🌧️",
    "cloud-hail": "🌧️",
    "cloud-snow": "❄️",
    "cloud-lightning": "⛈️",
    "cloud-moon": "🌙",
    "cloud-sun": "🌤️",
};

function WeatherIcon({ icon, size = 48 }) {
    const emoji = weatherEmoji[icon] || "☀️";

    return (
        <span
            role="img"
            aria-label={icon || "Weather icon"}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: `${size}px`,
                height: `${size}px`,
                fontSize: `${Math.max(size * 0.7, 24)}px`,
                lineHeight: 1,
                filter: "drop-shadow(0 6px 12px rgba(255, 178, 73, 0.35))",
                userSelect: "none",
            }}
        >
            {emoji}
        </span>
    );
}

export default WeatherIcon;
