import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
const HEATING_LABELS: Record<string, string> = {
  INDIVIDUEL_GAZ: "Gaz individuel",
  INDIVIDUEL_ELECTRIQUE: "Électrique individuel",
  COLLECTIF: "Chauffage collectif",
  POMPE_A_CHALEUR: "Pompe à chaleur",
  AUTRE: "Autre",
};
const TYPE_LABELS: Record<string, string> = {
  CONTRAT: "Contrat",
  QUITTANCE: "Quittance",
  FACTURE: "Facture",
  ETAT_DES_LIEUX: "État des lieux",
  AUTRE: "Autre",
};

const euro = (n: number) => `${n.toLocaleString("fr-FR")} €`;
const date = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";

// Pas de table de paiements en base : on calcule l'échéance comme le 1er du mois prochain.
const nextPaymentDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

export default function ClientPropertyDetail() {
  const { id } = useParams();
  const api = useApi();
  const [p, setP] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/real-estate/${id}`), api.get("/documents/my")])
      .then(([prop, d]) => {
        if (prop.ok) setP(prop.data);
        if (d.ok)
          setDocs(
            (d.data as any[]).filter(
              (doc) => doc.propertyId === id || doc.property?.id === id,
            ),
          );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.page}>Chargement…</div>;
  if (!p)
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Bien introuvable.</p>
        <Link to="/espace-client" className={styles.link}>
          ← Retour à mes biens
        </Link>
      </div>
    );

  const isRental = p.listingType === "LOCATION";
  const rent = p.price ?? 0;
  const charges = p.charges ?? 0;
  const total = rent + charges;

  const rows: [string, string][] = [
    ["Type de bien", p.propertyType === "MAISON" ? "Maison" : "Appartement"],
    ["Surface", `${p.surface} m²`],
    ["Pièces", String(p.rooms)],
    ["Étage", p.floor != null ? String(p.floor) : "—"],
    ["Année de construction", String(p.constructionYear)],
    ["Chauffage", HEATING_LABELS[p.heatingType] ?? "—"],
    ["Meublé", p.furnished === "MEUBLE" ? "Oui" : "Non"],
    ["DPE / GES", `${p.dpe} / ${p.ges}`],
    ["Ascenseur", p.hasElevator ? "Oui" : "Non"],
    ["Accessible PMR", p.accessiblePMR ? "Oui" : "Non"],
    [
      "Transports",
      p.nearTransport ? p.transportDetails || "À proximité" : "—",
    ],
    ["Disponible depuis", date(p.availableFrom)],
  ];

  return (
    <div className={styles.page}>
      <Link to="/espace-client" className={styles.link}>
        ← Retour à mes biens
      </Link>

      <h1 style={{ marginTop: 12 }}>
        {p.address}, {p.city}
      </h1>
      <p>
        {p.quarter} &middot; {p.zipCode}{" "}
        <span
          className={`${styles.badge} ${STATUS_BADGE[p.status] ?? styles.badgeGray}`}
        >
          {STATUS_LABELS[p.status] ?? p.status}
        </span>
      </p>

      {/* Paiement / loyer */}
      <div className={styles.card}>
        {isRental ? (
          <>
            <h3>Prochain paiement</h3>
            <p style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0" }}>
              {euro(total)}
            </p>
            <p>
              À régler le <strong>{date(nextPaymentDate().toISOString())}</strong>
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Loyer {euro(rent)}
              {charges > 0 ? ` + charges ${euro(charges)}` : " (charges comprises)"}
            </p>
          </>
        ) : (
          <>
            <h3>Prix d'achat</h3>
            <p style={{ fontSize: "1.6rem", fontWeight: 700, margin: "4px 0" }}>
              {euro(rent)}
            </p>
          </>
        )}
      </div>

      {/* Gestionnaire */}
      <div className={styles.card}>
        <h3>Votre gestionnaire</h3>
        <p>{p.contact?.name ?? "—"}</p>
        {p.contact?.email && (
          <p>
            <a href={`mailto:${p.contact.email}`} className={styles.link}>
              {p.contact.email}
            </a>
          </p>
        )}
        <Link
          to={`/espace-client/tickets/nouveau?property=${p.id}`}
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ marginTop: 8, display: "inline-block" }}
        >
          Signaler un problème
        </Link>
      </div>

      {/* Caractéristiques */}
      <div className={styles.card}>
        <h3>Caractéristiques</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "8px 24px",
            marginTop: 8,
          }}
        >
          {rows.map(([k, v]) => (
            <div
              key={k}
              style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
            >
              <span style={{ color: "#6b7280" }}>{k}</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className={styles.card}>
        <h3>Documents du bien</h3>
        {docs.length === 0 ? (
          <p className={styles.empty}>Aucun document pour ce bien.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
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
                  <td>{date(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
