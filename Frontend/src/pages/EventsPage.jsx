import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { searchEvents } from "../features/events/api/eventsApi";
import EventCard from "../features/events/components/EventCard";

export default function EventsPage() {
  const [personality, setPersonality] = useState(null);
  const [zip, setZip] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // get city (or zip when you add it) from user_data, like your current profile page
        const { data: ud } = await supabase.from("user_data").select("city").eq("id", user.id).single();
        if (ud?.city) setZip(String(ud.city).trim()); // currently storing city; later switch to a zip column

        // get personality
        const { data: up } = await supabase.from("user_personality_data").select("*").eq("id", user.id).single();
        if (up?.personality_type) setPersonality(up.personality_type);

        if (up?.personality_type && ud?.city) {
          const data = await searchEvents({ personalityType: up.personality_type, zip: String(ud.city).trim(), limit: 25 });
          if (!cancel) setEvents(data);
        }
      } catch (e) {
        if (!cancel) setErr(e.message || "Failed to load events");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24 }}>Error: {err}</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Events near {zip || "you"}</h1>
      <p>Cluster: {personality}</p>
      {events.length === 0 ? (
        <p>No matching local events (we widen radius and show virtual as fallback).</p>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {events.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </main>
  );
}
