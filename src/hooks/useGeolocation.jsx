
import { useEffect, useState } from "react";

function useGeolocation() {
  const [coordinates, setCoordinates] = useState(null);
  const [city, setCity] = useState(null);
  const [country, setCountry] = useState(null);
  const [locality, setLocality] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geocodingError, setGeocodingError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // Check browser Geolocation support
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);

      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    // Get the user's current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isMounted) return;

        const userCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Save coordinates in React state
        setCoordinates(userCoordinates);

        try {
          // Prepare reverse geocoding request
          const params = new URLSearchParams({
            latitude: userCoordinates.latitude,
            longitude: userCoordinates.longitude,
            localityLanguage: "en",
          });

          const url =
            `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`;

          // Send request to BigDataCloud
          const response = await fetch(url, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error("Reverse geocoding request failed.");
          }

          // Convert response into JSON
          const data = await response.json();

          if (!isMounted) return;

          // Save location information
          setCity(
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            null
          );

          setCountry(data.countryName || null);
          setLocality(data.locality || null);

          setGeocodingError(null);

        } catch (err) {
          if (!isMounted || err.name === "AbortError") return;

          setGeocodingError(
            "Unable to identify your city. Please try again."
          );
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      },

      (geoError) => {
        if (!isMounted) return;

        switch (geoError.code) {
          case 1:
            setError("Location permission was denied.");
            break;

          case 2:
            setError("Your location is unavailable.");
            break;

          case 3:
            setError("Location request timed out.");
            break;

          default:
            setError("An unknown location error occurred.");
        }

        setLoading(false);
      },

      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

    // Cleanup
    return () => {
      isMounted = false;
      controller.abort();
    };

  }, []);

  // Return all location information
  return {
    coordinates,
    city,
    country,
    locality,
    loading,
    error,
    geocodingError,
  };
}

export default useGeolocation;
