const getApproxLocation = async () => {
  const res = await fetch("http://ip-api.com/json/");
  if (res.ok) {
    const data = await res.json();
    return { lat: data.lat, lng: data.lon };
  }
  return { lat: null, lng: null };
};

const getCachedApproxLocation = async () => {
  const cachedLocation = localStorage.getItem("approxLocation");
  if (cachedLocation) {
    return JSON.parse(cachedLocation);
  }
  const { lat, lng } = await getApproxLocation();
  localStorage.setItem("approxLocation", JSON.stringify({ lat, lng }));
  return { lat, lng };
};

export { getApproxLocation, getCachedApproxLocation };
