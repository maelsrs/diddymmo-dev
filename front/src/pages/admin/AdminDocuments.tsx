import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

export default function AdminDocuments() {
  const api = useApi();
  const [docs, setDocs] = useState<any[]>([]);

  const load = () => api.get("/documents").then((r) => r.ok && setDocs(r.data));
  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    await api.del(`/documents/${id}`);
    load();
  };

  return (
    <div className={styles.page}>
      <h1>Documents</h1>
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
              <td>
                {d.property?.address}, {d.property?.city}
              </td>
              <td>{d.tenant?.name}</td>
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
    </div>
  );
}
