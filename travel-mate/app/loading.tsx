export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background: "var(--background)",
      }}
    >
      <div className="spinner" style={{ width: "50px", height: "50px" }} />
      <p style={{ color: "var(--muted)", fontSize: "1rem" }}>
        Loading your adventure...
      </p>
    </div>
  );
}
