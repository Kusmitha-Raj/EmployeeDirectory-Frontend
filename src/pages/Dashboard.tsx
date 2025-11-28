import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.username?.split("@")[0].toUpperCase();

  return (
    <main
      className="page-wrap"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "25px",
        minHeight: "75vh",
        padding: "20px"
      }}
    >
      {/* CARD 1 — ONLY GREETING */}
      <div
        className="card"
        style={{
          padding: "25px 35px",
          textAlign: "center",
          background: "#eaf1ff",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          maxWidth: "500px",
          width: "100%"
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 700, color: "#1e3a8a" }}>
          <span style={{ color: "#2563eb" }}>Hi {displayName}</span>
        </h2>
        <p style={{ marginTop: "10px", fontSize: "1.2rem", color: "#374151" }}>
          Welcome to Employee Directory App!
        </p>
      </div>

      {/* CARD 2 — IMAGE + INFO */}
      <div
        className="card"
        style={{
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          maxWidth: "900px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "25px",
          background: "#ffffff"
        }}
      >
        {/* LEFT: TEXT */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontWeight: 700, color: "#1e3a8a" }}>
            Employee Directory 
          </h3>

          <p style={{ marginTop: "12px", lineHeight: "1.6", color: "#4b5563" }}>
            Employee Directory helps to quickly find, manage, and update employee
            information across the organization. Admin can add, edit, and remove employees, while regular employees
            get view of their profile and colleagues.
          </p>
        </div>

        {/* RIGHT: IMAGE */}
        <div>
          <img
            src="https://th.bing.com/th/id/OIP.5sE_dCbt70M6gxK3QXKcOAHaEJ?w=328&h=184&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"
            alt="Dashboard Visual"
            style={{
              width: "300px",
              borderRadius: "12px",
            }}
          />
        </div>
      </div>
    </main>
  );
}
