export type LocationInput = {
  location?: string | null;
  locationName?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  wazeUrl?: string | null;
};

export function buildGoogleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function buildWazeUrl(latitude: number, longitude: number) {
  return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
}

export function hasCoordinates(location: LocationInput) {
  return (
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude) &&
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude)
  );
}

export function normalizeEventLocation(input: LocationInput) {
  const locationName = input.locationName?.trim() ?? "";
  const address = input.address?.trim() ?? "";
  const legacyLocation = input.location?.trim() ?? "";
  const location = locationName || address || legacyLocation;

  const googleMapsUrl =
    input.googleMapsUrl?.trim() ||
    (hasCoordinates(input)
      ? buildGoogleMapsUrl(input.latitude as number, input.longitude as number)
      : "");

  const wazeUrl =
    input.wazeUrl?.trim() ||
    (hasCoordinates(input)
      ? buildWazeUrl(input.latitude as number, input.longitude as number)
      : "");

  return {
    location,
    locationName,
    address,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    googleMapsUrl,
    wazeUrl
  };
}

export function formatLocationText(location: LocationInput) {
  const parts = [location.locationName, location.address]
    .map((part) => part?.trim())
    .filter(Boolean);

  return parts.join(", ") || location.location?.trim() || "";
}
