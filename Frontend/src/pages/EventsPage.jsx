import { useEffect, useState } from "react";
import { searchEvents, getMe } from "../features/events/api/eventsApi";
import EventCard from "../features/events/components/EventCard";

export default function EventsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, total: 0, limit: 20 });
  const [personality, setPersonality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load(page = 0) {
    setLoading(true);
    setErr("");
    try {
      // Optional: show the logged-in user (verifies cookie session)
      await getMe().catch(() => null);

      const { items, pagination, meta } = await searchEvents({ personalityType: personality, page, limit: 20 });
      setItems(items);
      setPagination(pagination);
      if (meta?.personalityType) setPersonality(meta.personalityType);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
  }, []);

  const canPrev = pagination.page > 0;
  const canNext = pagination.page + 1 < pagination.totalPages;

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24 }}>Error: {err}</main>;

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1>Events near you</h1>
        <p>Personality cluster: {personality || "—"}</p>
        <p>
          Page {pagination.page + 1} of {Math.max(pagination.totalPages, 1)} • {pagination.total} total
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={!canPrev} onClick={() => load(pagination.page - 1)}>Prev</button>
          <button disabled={!canNext} onClick={() => load(pagination.page + 1)}>Next</button>
        </div>
      </header>

      {items.length === 0 ? (
        <p>No matching local events yet — we widen radius and fall back to virtual if needed.</p>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {items.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </main>
  );
}
