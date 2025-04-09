import { useEffect, useState } from "react";

export default function usePosition() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          console.log(position);
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  };

  const clearLocation = () => {
    setLocation(null);
  };

  useEffect(() => {
    getLocation();
    return () => {
      clearLocation();
    };
  }, []);

  return {
    lat: location?.coords.latitude,
    lng: location?.coords.longitude,
  };
}
