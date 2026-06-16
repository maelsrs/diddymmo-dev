import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  LOUE: "Loué",
  VENDU: "Vendu",
};
const STATUS_BADGE: Record<string, string> = {
  DISPONIBLE: styles.badgeGreen,
  LOUE: styles.badgeBlue,
  VENDU: styles.badgeRed,
};

export default function AdminProperties() {
  const api = useApi();
  const [properties, setProperties] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    const qs = filter ? `?status=${filter}` : "";
    api
      .get(`/real-estate${qs}`)
      .then((r) => {
        if (r.ok) {
          setProperties(r.data);
          setError("");
        } else {
          setError(r.data?.error || "Impossible de charger les biens");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bien ?")) return;
    const r = await api.del(`/real-estate/${id}`);
    if (!r.ok) {
      setError(r.data?.error || "Suppression impossible");
      return;
    }
    load();
  };

  return (
    <div className={styles.page}>
      <h1>Biens immobiliers</h1>
      <div className={styles.toolbar}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="DISPONIBLE">Disponible</option>
          <option value="LOUE">Loué</option>
          <option value="VENDU">Vendu</option>
        </select>
        <Link
          to="/admin/properties/new"
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          Ajouter un bien
        </Link>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p>Chargement…</p>
      ) : properties.length === 0 ? (
        <p>Aucun bien.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Adresse</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Prix</th>
              <th>Locataire</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.address}, {p.city}
                </td>
                <td>{p.listingType}</td>
                <td>
                  <span
                    className={`${styles.badge} ${STATUS_BADGE[p.status] ?? styles.badgeGray}`}
                  >
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </td>
                <td>
                  {typeof p.price === "number"
                    ? `${p.price.toLocaleString()} €`
                    : "—"}
                </td>
                <td>{p.tenant?.name ?? "—"}</td>
                <td className={styles.actions}>
                  <Link
                    to={`/admin/properties/${p.id}`}
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
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
