
import React from "react";

function WeatherRecommendation({ message }) {
    // Don't display anything if there is no recommendation
    if (!message) {
        return null;
    }

    return (
        <div className="weather-recommendation" role="note">
            <p>
                <strong>💡 Weather Tip:</strong> {message}
            </p>
        </div>
    );
}

export default WeatherRecommendation;
