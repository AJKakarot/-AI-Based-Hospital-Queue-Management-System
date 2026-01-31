import { NextResponse } from "next/server";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeLocation(locationText) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error("GOOGLE_PLACES_API_KEY is not set");
    return null;
  }

  if (!locationText || !locationText.trim()) {
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(locationText.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedQuery}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data.status === "ZERO_RESULTS") {
      return null;
    }

    if (data.status !== "OK") {
      console.error(`Geocoding API status: ${data.status}`, data.error_message || "");
      return null;
    }

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const firstResult = data.results[0];

    if (
      !firstResult.geometry ||
      !firstResult.geometry.location ||
      firstResult.geometry.location.lat === undefined ||
      firstResult.geometry.location.lng === undefined
    ) {
      console.error("Geocoding result missing location data");
      return null;
    }

    const lat = Number(firstResult.geometry.location.lat);
    const lng = Number(firstResult.geometry.location.lng);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      console.error(`Invalid coordinates: ${lat}, ${lng}`);
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      formattedAddress: firstResult.formatted_address || locationText,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

async function fetchNearbyPlaces(lat, lng, type) {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return [];
  }
}

async function fetchNearbyCare(lat, lng) {
  const [hospitals, clinics] = await Promise.all([
    fetchNearbyPlaces(lat, lng, "hospital"),
    fetchNearbyPlaces(lat, lng, "doctor"),
  ]);

  const results = [];

  hospitals.forEach((place) => {
    results.push({
      hospitalName: place.name,
      address: place.vicinity || place.formatted_address,
      distance: calculateDistance(
        lat,
        lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      ).toFixed(1),
      rating: place.rating || null,
      placeId: place.place_id,
    });
  });

  clinics.forEach((place) => {
    const types = place.types || [];
    const specialty = types.find(
      (t) =>
        !["establishment", "point_of_interest", "health", "doctor"].includes(t)
    );

    results.push({
      hospitalName: place.name,
      doctorName: null,
      specialty: specialty
        ? specialty
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "General Practice",
      address: place.vicinity || place.formatted_address,
      distance: calculateDistance(
        lat,
        lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      ).toFixed(1),
      rating: place.rating || null,
      placeId: place.place_id,
    });
  });

  results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  return results;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { latitude, longitude, locationText } = body;

    let lat, lng, searchLocation = null;

    if (locationText && locationText.trim()) {
      const geocoded = await geocodeLocation(locationText.trim());
      if (!geocoded || geocoded.latitude === undefined || geocoded.longitude === undefined) {
        return NextResponse.json(
          { error: "We couldn't find this location. Try a different search." },
          { status: 400 }
        );
      }
      lat = geocoded.latitude;
      lng = geocoded.longitude;
      searchLocation = geocoded.formattedAddress;

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json(
          { error: "Invalid location coordinates received from geocoding" },
          { status: 400 }
        );
      }
    } else if (latitude !== undefined && longitude !== undefined) {
      lat = Number(latitude);
      lng = Number(longitude);

      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return NextResponse.json(
          { error: "Invalid latitude or longitude values" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Either location text or coordinates are required" },
        { status: 400 }
      );
    }

    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Invalid coordinates. Cannot fetch nearby locations." },
        { status: 400 }
      );
    }

    const results = await fetchNearbyCare(lat, lng);

    return NextResponse.json(
      { results, searchLocation },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch nearby care locations" },
      { status: 500 }
    );
  }
}
