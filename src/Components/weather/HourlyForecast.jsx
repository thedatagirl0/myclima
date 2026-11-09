import React, { useMemo } from "react";
import HourlyForecastItem from "./HourlyForecastItem";
import formatWeather from "../../utils/formatWeather";

function HourlyForecast({
    hourly,
    currentWeather,
    selectedDate,
    selectedTime,
    onHourSelect,
}) {
    const hasData = Boolean(hourly && hourly.time && currentWeather);
    const currentDate = currentWeather?.time?.slice(0, 10) || null;
    const isToday = selectedDate === currentDate;

    const formatHour = (time) => {
        const hour = Number(time.slice(11, 13));
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${displayHour} ${period}`;
    };

    const hourlyItems = useMemo(() => {
        if (!hasData || !hourly || !currentWeather) {
            return [];
        }

        return hourly.time
            .map((time, index) => ({
                time,
                temperature_2m: hourly.temperature_2m?.[index],
                relative_humidity_2m: hourly.relative_humidity_2m?.[index],
                apparent_temperature: hourly.apparent_temperature?.[index],
                precipitation_probability: hourly.precipitation_probability?.[index],
                weather_code: hourly.weather_code?.[index],
                is_day: hourly.is_day?.[index],
                wind_speed_10m: hourly.wind_speed_10m?.[index],
                uv_index: hourly.uv_index?.[index],
                visibility: hourly.visibility?.[index],
                surface_pressure: hourly.surface_pressure?.[index],
            }))
            .filter((hour) => {
                if (isToday) {
                    return hour.time > currentWeather.time;
                }

                return hour.time.slice(0, 10) === selectedDate;
            });
    }, [currentWeather, hasData, hourly, isToday, selectedDate]);

    if (!hasData) {
        return null;
    }

    const displayedHours = isToday
        ? hourlyItems.slice(0, 23)
        : hourlyItems.slice(0, 24);

    return (
        <section className="hourly-forecast">
            <h2>{isToday ? "Next 24 Hours" : "Hourly Forecast"}</h2>

            <div className="hourly-forecast-list">
                {isToday && (
                    <HourlyForecastItem
                        key="now"
                        time="Now"
                        temperature={currentWeather.temperature_2m}
                        weatherInfo={formatWeather(
                            currentWeather.weather_code,
                            currentWeather.is_day
                        )}
                        precipitationProbability={null}
                        isCurrent={true}
                        isSelected={!selectedTime}
                        onClick={() => onHourSelect(null)}
                    />
                )}

                {displayedHours.map((hour) => (
                    <HourlyForecastItem
                        key={hour.time}
                        time={formatHour(hour.time)}
                        temperature={hour.temperature_2m}
                        weatherInfo={formatWeather(hour.weather_code, hour.is_day)}
                        precipitationProbability={hour.precipitation_probability}
                        isSelected={selectedTime === hour.time}
                        onClick={() => onHourSelect(hour)}
                    />
                ))}
            </div>
        </section>
    );
}

export default HourlyForecast;