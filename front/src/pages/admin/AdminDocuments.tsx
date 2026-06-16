import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

export default function AdminDocuments() {
  const api = useApi();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/documents")
      .then((r) => {
        if (r.ok) {
          setDocs(r.data);
          setError("");
        } else {
          setError(r.data?.error || "Impossible de charger les documents");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    const r = await api.del(`/documents/${id}`);
    if (!r.ok) {
      setError(r.data?.error || "Suppression impossible");
      return;
    }
    load();
  };

  const propertyLabel = (p: any) =>
    p ? `${p.address}, ${p.city}` : "—";

  return (
    <div className={styles.page}>
      <h1>Documents</h1>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p>Chargement…</p>
      ) : docs.length === 0 ? (
        <p>Aucun document.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Bien</th>
              <th>Locataire</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>
                  <a href={d.url} target="_blank" rel="noreferrer">
                    {d.name}
                  </a>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeGray}`}>
                    {d.type}
                  </span>
                </td>
                <td>{propertyLabel(d.property)}</td>
                <td>{d.tenant?.name ?? "—"}</td>
                <td>
                  <button
                    onClick={() => handleDelete(d.id)}
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
