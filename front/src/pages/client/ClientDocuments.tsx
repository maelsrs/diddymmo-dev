import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import styles from "./Client.module.css";

const TYPE_LABELS: Record<string, string> = {
  CONTRAT: "Contrat",
  QUITTANCE: "Quittance",
  FACTURE: "Facture",
  ETAT_DES_LIEUX: "État des lieux",
  AUTRE: "Autre",
};

export default function ClientDocuments() {
  const api = useApi();
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    api.get("/documents/my").then((r) => r.ok && setDocs(r.data));
  }, []);

  return (
    <div className={styles.page}>
      <h1>Mes documents</h1>
      {docs.length === 0 ? (
        <p className={styles.empty}>Aucun document disponible.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Bien</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.link}
                  >
                    {d.name}
                  </a>
                </td>
                <td>
                  <span className={`${styles.badge} ${styles.badgeGray}`}>
                    {TYPE_LABELS[d.type] ?? d.type}
                  </span>
                </td>
                <td>
                  {d.property?.address}, {d.property?.city}
                </td>
                <td>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
