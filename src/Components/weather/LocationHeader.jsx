
import React from "react";
import { MapPin, Clock } from "lucide-react";

function LocationHeader({
    city,
    country,
    localDateTime,
    isApproximate,
}) {
    return (
        <section className="location-header">
            <div className="location-title-row">
                <div className="location-name">
                    <MapPin size={20} color="#ff7a7a" strokeWidth={2.3} />

                    <div>
                        <h2>
                            {city || "Your Location"}
                            {country && `, ${country}`}
                        </h2>
                    </div>
                </div>
            </div>

            {isApproximate && (
                <p className="location-accuracy">
                    Approximate location based on your internet connection
                </p>
            )}

            {localDateTime && (
                <div className="location-date">
                    <Clock size={16} color="#7dd3fc" strokeWidth={2.2} />
                    <span>{localDateTime}</span>
                </div>
            )}
        </section>
    );
}

export default LocationHeader;
