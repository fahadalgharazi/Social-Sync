import { http } from "../../../lib/http";

export async function searchEvents({ personalityType, limit = 20, page = 0 }) {
  const { data } = await http.post("/events/search", { personalityType, limit, page });
  // depending on your controller shape, adapt this line:
  return data?.data?.items ?? data?.data ?? [];
}

export async function getPersonalities() {
  const { data } = await http.get("/events/personalities");
  return data?.data ?? [];
}
