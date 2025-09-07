import { http } from "../../../lib/http";

export async function searchEvents({ personalityType, zip, limit = 20 }) {
  const { data } = await http.post("/events/search", { personalityType, zip, limit });
  return data?.data ?? [];
}

export async function getPersonalities() {
  const { data } = await http.get("/events/personalities");
  return data?.data ?? [];
}
