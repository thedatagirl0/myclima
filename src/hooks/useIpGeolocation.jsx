import { useEffect, useState } from "react";

const IP_GEOLOCATION_URL =
  "https://ipwho.is/?fields=success,city,region,country,latitude,longitude";

function useIpGeolocation(enabled = true) {
  const [coordinates, setCoordinates] = useState(null);
  const [city, setCity] = useState(null);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    const controller = new AbortController();

    const findApproximateLocation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(IP_GEOLOCATION_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Approximate location lookup failed.");
        }

        const data = await response.json();
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);

        if (
          !data.success ||
          data.latitude === null ||
          data.latitude === undefined ||
          data.longitude === null ||
          data.longitude === undefined ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          throw new Error("Approximate location lookup returned invalid data.");
        }

        if (isMounted) {
          setCoordinates({ latitude, longitude });
          setCity(data.city || data.region || null);
          setCountry(data.country || null);
        }
      } catch (locationError) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }

        console.error("Approximate location lookup failed:", locationError);
        setError(
          "Couldn't find your approximate location. Search for a city to see its weather."
        );
      } finally {
        if (isMounted && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    findApproximateLocation();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [enabled]);

  return {
    coordinates,
    city,
    country,
    loading,
    error,
  };
}

export default useIpGeolocation;
