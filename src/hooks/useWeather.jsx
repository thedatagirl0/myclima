
import { useEffect, useState } from "react";
import { getCurrentWeather } from "../services/weatherService";

function useWeather(coordinates) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't request weather without coordinates
    if (!coordinates) {
      setWeatherData(null);
      return;
    }

    let isMounted = true;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        // Retrieve weather using the user's coordinates
        const data = await getCurrentWeather(
          coordinates.latitude,
          coordinates.longitude
        );

        if (isMounted) {
          setWeatherData(data);
        }

      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };

  }, [coordinates?.latitude, coordinates?.longitude]);

  return {
    weatherData,
    loading,
    error,
  };
}

export default useWeather;
