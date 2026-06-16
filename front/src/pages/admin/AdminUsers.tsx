import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

export default function AdminUsers() {
  const api = useApi();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/users")
      .then((r) => {
        if (r.ok) {
          setUsers(r.data);
          setError("");
        } else {
          setError(r.data?.error || "Impossible de charger les utilisateurs");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const r = await api.del(`/users/${id}`);
    if (!r.ok) {
      setError(r.data?.error || "Suppression impossible");
      return;
    }
    load();
  };

  const rankBadge = (rank: string) => {
    const cls =
      rank === "ADMINISTRATOR"
        ? styles.badgeRed
        : rank === "EMPLOYEE"
          ? styles.badgeBlue
          : styles.badgeGray;
    return <span className={`${styles.badge} ${cls}`}>{rank}</span>;
  };

  return (
    <div className={styles.page}>
      <h1>Utilisateurs</h1>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p>Chargement…</p>
      ) : users.length === 0 ? (
        <p>Aucun utilisateur.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rang</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{rankBadge(u.rank)}</td>
                <td className={styles.actions}>
                  <Link
                    to={`/admin/users/${u.id}`}
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
