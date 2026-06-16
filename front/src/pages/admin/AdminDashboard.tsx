import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

export default function AdminDashboard() {
  const api = useApi();
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    disponible: 0,
    loue: 0,
    vendu: 0,
    tickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/users"),
      api.get("/real-estate"),
      api.get("/tickets"),
    ])
      .then(([u, p, t]) => {
        if (!u.ok || !p.ok || !t.ok) {
          setError("Impossible de charger les statistiques");
          return;
        }
        const props = p.data as any[];
        setStats({
          users: u.data.length,
          properties: props.length,
          disponible: props.filter((x: any) => x.status === "DISPONIBLE")
            .length,
          loue: props.filter((x: any) => x.status === "LOUE").length,
          vendu: props.filter((x: any) => x.status === "VENDU").length,
          tickets: (t.data as any[]).filter((x: any) => x.status !== "CLOSED")
            .length,
        });
      })
      .catch(() => setError("Erreur réseau"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <h1>Dashboard</h1>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Utilisateurs</h3>
            <p>{stats.users}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Biens</h3>
            <p>{stats.properties}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Disponibles</h3>
            <p>{stats.disponible}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Loués</h3>
            <p>{stats.loue}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Vendus</h3>
            <p>{stats.vendu}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Tickets ouverts</h3>
            <p>{stats.tickets}</p>
          </div>
        </div>
      )}
    </div>
  );
}
