import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    if (!user?.is_admin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/stats"),
      ]);
      setUsers(usersRes);
      setStats(statsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (userId) => {
    await api.patch(`/admin/users/${userId}/toggle-active`);
    fetchData();
  };

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Админ панелі</h1>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Басты бет
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === "stats" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("stats")}
        >
          📊 Статистика
        </button>
        <button
          style={activeTab === "users" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("users")}
        >
          👥 Пайдаланушылар ({users.length})
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div style={styles.content}>
          {/* Жалпы карточкалар */}
          <div style={styles.cards}>
            <div style={styles.card}>
              <div style={styles.cardNumber}>{stats.total_users}</div>
              <div style={styles.cardLabel}>Жалпы пайдаланушылар</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardNumber}>{stats.total_analyses}</div>
              <div style={styles.cardLabel}>Жалпы талдаулар</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardNumber}>
                {stats.skin_stats?.oily || 0}
              </div>
              <div style={styles.cardLabel}>Майлы тері</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardNumber}>
                {stats.skin_stats?.dry || 0}
              </div>
              <div style={styles.cardLabel}>Құрғақ тері</div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardNumber}>
                {stats.skin_stats?.normal || 0}
              </div>
              <div style={styles.cardLabel}>Қалыпты тері</div>
            </div>
          </div>

          {/* Соңғы 7 күн */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📅 Соңғы 7 күндегі тіркелулер</h2>
            {stats.daily_registrations.length === 0 ? (
              <p style={styles.empty}>Деректер жоқ</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Күні</th>
                    <th style={styles.th}>Тіркелген</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.daily_registrations.map((d) => (
                    <tr key={d.date}>
                      <td style={styles.td}>{d.date}</td>
                      <td style={styles.td}>{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📅 Соңғы 7 күндегі талдаулар</h2>
            {stats.daily_analyses.length === 0 ? (
              <p style={styles.empty}>Деректер жоқ</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Күні</th>
                    <th style={styles.th}>Талдау саны</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.daily_analyses.map((d) => (
                    <tr key={d.date}>
                      <td style={styles.td}>{d.date}</td>
                      <td style={styles.td}>{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div style={styles.content}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Аты</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Тіркелген күні</th>
                <th style={styles.th}>Онбординг</th>
                <th style={styles.th}>Статус</th>
                <th style={styles.th}>Әрекет</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    {new Date(u.created_at).toLocaleDateString("kk-KZ")}
                  </td>
                  <td style={styles.td}>
                    {u.onboarding_complete ? "✅" : "❌"}
                  </td>
                  <td style={styles.td}>
                    <span style={u.is_active ? styles.active : styles.inactive}>
                      {u.is_active ? "Белсенді" : "Блокталған"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {!u.is_admin && (
                      <button
                        onClick={() => toggleActive(u.id)}
                        style={u.is_active ? styles.blockBtn : styles.unblockBtn}
                      >
                        {u.is_active ? "Блоктау" : "Ашу"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#fff",
    padding: "24px",
    fontFamily: "Inter, sans-serif",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#0f0f0f",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #333",
    borderTop: "3px solid #c9a96e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: 700 },
  backBtn: {
    background: "transparent",
    border: "1px solid #333",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },
  tabs: { display: "flex", gap: 8, marginBottom: 24 },
  tab: {
    background: "#1a1a1a",
    border: "1px solid #333",
    color: "#888",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  tabActive: {
    background: "#c9a96e",
    border: "1px solid #c9a96e",
    color: "#000",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  content: { width: "100%" },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 32,
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
  },
  cardNumber: { fontSize: 36, fontWeight: 700, color: "#c9a96e" },
  cardLabel: { fontSize: 13, color: "#888", marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  empty: { color: "#888", fontStyle: "italic" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    background: "#1a1a1a",
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 13,
    color: "#888",
    borderBottom: "1px solid #2a2a2a",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #1a1a1a",
    fontSize: 14,
  },
  active: {
    background: "#1a3a1a",
    color: "#4caf50",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
  },
  inactive: {
    background: "#3a1a1a",
    color: "#f44336",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
  },
  blockBtn: {
    background: "#3a1a1a",
    border: "none",
    color: "#f44336",
    padding: "5px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  unblockBtn: {
    background: "#1a3a1a",
    border: "none",
    color: "#4caf50",
    padding: "5px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
};