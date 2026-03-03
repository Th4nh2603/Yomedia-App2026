export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 12 }}>
        Server app is running
      </h1>
      <p style={{ color: "#555", maxWidth: 480, textAlign: "center" }}>
        Use the <code>/api/sftp/connect</code> endpoint to test SFTP
        connectivity from your Next.js server.
      </p>
    </main>
  );
}

