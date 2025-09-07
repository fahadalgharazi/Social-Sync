export default function Footer() {
  return (
    <footer style={{ marginTop: 40, padding: 12, borderTop: "1px solid #eee", fontSize: 12, color: "#666" }}>
      © {new Date().getFullYear()} Social Sync
    </footer>
  );
}
