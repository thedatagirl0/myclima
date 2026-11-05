
import {
    Sun,
    Moon,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    CloudHail,
    CloudSnow,
    CloudLightning,
    CloudMoon,
    CloudSun,
} from "lucide-react";

// Match weather icon names to Lucide React components
const weatherIcons = {
    sun: Sun,
    moon: Moon,
    cloud: Cloud,
    "cloud-fog": CloudFog,
    "cloud-drizzle": CloudDrizzle,
    "cloud-rain": CloudRain,
    "cloud-hail": CloudHail,
    "cloud-snow": CloudSnow,
    "cloud-lightning": CloudLightning,
    "cloud-moon": CloudMoon,
    "cloud-sun": CloudSun,
};

function WeatherIcon({ icon, size = 48 }) {
    // Find the matching icon component
    const IconComponent = weatherIcons[icon] || Cloud;

    return (
        <IconComponent
            size={size}
            strokeWidth={1.8}
            role="img"
            aria-label={icon || "Weather icon"}
        />
    );
}

export default WeatherIcon;
