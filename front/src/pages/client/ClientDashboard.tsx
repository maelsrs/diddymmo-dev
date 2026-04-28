import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import styles from "./Client.module.css";

const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  LOUE: "Loué",
  VENDU: "Vendu",
};
const STATUS_BADGE: Record<string, string> = {
  LOUE: styles.badgeBlue,
  VENDU: styles.badgeRed,
};

export default function ClientDashboard() {
  const api = useApi();
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/real-estate/my/tenancies")
      .then((r) => r.ok && setProperties(r.data));
  }, []);

  return (
    <div className={styles.page}>
      <h1>Mes biens</h1>
      {properties.length === 0 ? (
        <p className={styles.empty}>
          Aucun bien ne vous est assigné pour le moment.
        </p>
      ) : (
        properties.map((p) => (
          <div key={p.id} className={styles.card}>
            <h3>
              {p.address}, {p.city}
            </h3>
            <p>
              {p.propertyType} &middot; {p.surface}m&sup2; &middot; {p.rooms}{" "}
              pièce{p.rooms > 1 ? "s" : ""} &middot;{" "}
              <span
                className={`${styles.badge} ${STATUS_BADGE[p.status] ?? styles.badgeGray}`}
              >
                {STATUS_LABELS[p.status] ?? p.status}
              </span>
            </p>
            <p>
              Contact : {p.contact?.name} ({p.contact?.email})
            </p>
          </div>
        ))
      )}
    </div>
  );
}
