export default function EventCard({ event }) {
  return (
    <article style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.name}
          style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 6 }}
        />
      )}
      <a href={event.url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 8, fontWeight: 600 }}>
        {event.name}
      </a>
      <div style={{ fontSize: 14, color: "#555" }}>
        {event.date} {event.venueName ? ` • ${event.venueName}` : ""} {event.venueCity ? ` • ${event.venueCity}` : ""}
      </div>
    </article>
  );
}
