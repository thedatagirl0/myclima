
import { useEffect, useState } from "react";
import {
  getCachedWeather,
  getCurrentWeather,
} from "../services/weatherService";

function useWeather(coordinates) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;

  useEffect(() => {
    // Don't request weather without coordinates
    if (latitude === undefined || longitude === undefined) {
      setWeatherData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const cachedData = getCachedWeather(latitude, longitude);

    setWeatherData(cachedData);
    setLoading(!cachedData);
    setError(null);

    const fetchWeather = async () => {
      try {
        // Retrieve weather using the user's coordinates
        const data = await getCurrentWeather(
          latitude,
          longitude,
          controller.signal
        );

        if (isMounted) {
          setWeatherData(data);
        }

      } catch (err) {
        if (isMounted && !controller.signal.aborted) {
          setError(err.message);
        }

      } finally {
        if (isMounted && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
      controller.abort();
    };

  }, [latitude, longitude]);

  return {
    weatherData,
    loading,
    error,
  };
}

export default useWeather;
