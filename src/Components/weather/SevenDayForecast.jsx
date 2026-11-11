
import React from "react";
import DailyForecastItem from "./DailyForecastItem";

function SevenDayForecast({
    daily,
    selectedDate,
    onDaySelect,
}) {
    // Check whether daily forecast data exists
    if (!daily || !daily.time) {
        return null;
    }

    return (
        <section className="seven-day-forecast">

            <h2>7-Day Forecast</h2>

            <div className="seven-day-forecast-list">
                <table
                    className="daily-forecast-table"
                    aria-label="Seven-day weather forecast"
                >
                    <thead>
                        <tr>
                            <th scope="col">Day</th>
                            <th scope="col">Weather</th>
                            <th scope="col">High</th>
                            <th scope="col">Low</th>
                            <th scope="col">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {daily.time.map((date, index) => (
                            <DailyForecastItem
                                key={date}
                                date={date}
                                weatherCode={daily.weather_code?.[index]}
                                maxTemperature={
                                    daily.temperature_2m_max?.[index]
                                }
                                minTemperature={
                                    daily.temperature_2m_min?.[index]
                                }
                                precipitationProbability={
                                    daily.precipitation_probability_max?.[index]
                                }
                                uvIndex={daily.uv_index_max?.[index]}
                                isSelected={selectedDate === date}
                                onClick={() => onDaySelect(date)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

        </section>
    );
}

export default SevenDayForecast;
