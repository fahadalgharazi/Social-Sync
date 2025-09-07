import fetch from "node-fetch";
const ZIP_CACHE = new Map();

export async function zipToLatLng(zip) {
  if (ZIP_CACHE.has(zip)) return ZIP_CACHE.get(zip);
  const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!r.ok) throw new Error("Invalid ZIP code");
  const j = await r.json();
  const place = j.places?.[0];
  const lat = Number(place?.latitude);
  const lng = Number(place?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("ZIP missing coords");
  const val = { lat, lng, city: place["place name"], state: place["state abbreviation"] };
  ZIP_CACHE.set(zip, val);
  return val;
}
