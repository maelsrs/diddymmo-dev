import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

const DPE_GRADES = ["A", "B", "C", "D", "E", "F", "G"];

const blankForm = {
  listingType: "LOCATION",
  propertyType: "APPARTEMENT",
  status: "DISPONIBLE",
  surface: "",
  rooms: "",
  floor: "",
  constructionYear: "",
  heatingType: "INDIVIDUEL_ELECTRIQUE",
  furnished: "NON_MEUBLE",
  dpe: "D",
  ges: "D",
  price: "",
  charges: "",
  address: "",
  street: "",
  quarter: "",
  city: "",
  zipCode: "",
  nearTransport: false,
  transportDetails: "",
  availableFrom: "",
  accessiblePMR: false,
  hasElevator: false,
  contactId: "",
  tenantId: "",
};

type FormState = typeof blankForm;

const toDateInput = (iso: string | null | undefined) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

export default function AdminPropertyEdit() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();

  const [property, setProperty] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>(blankForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Doc form
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("CONTRAT");
  const [docUrl, setDocUrl] = useState("");
  const [docError, setDocError] = useState("");

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    Promise.all([
      api.get(`/real-estate/${id}`),
      api.get("/users"),
      api.get(`/documents?propertyId=${id}`),
    ])
      .then(([p, u, d]) => {
        if (!p.ok) {
          setError(p.data?.error || "Bien introuvable");
          return;
        }
        setProperty(p.data);
        setForm({
          listingType: p.data.listingType ?? "LOCATION",
          propertyType: p.data.propertyType ?? "APPARTEMENT",
          status: p.data.status ?? "DISPONIBLE",
          surface: String(p.data.surface ?? ""),
          rooms: String(p.data.rooms ?? ""),
          floor: p.data.floor != null ? String(p.data.floor) : "",
          constructionYear: String(p.data.constructionYear ?? ""),
          heatingType: p.data.heatingType ?? "INDIVIDUEL_ELECTRIQUE",
          furnished: p.data.furnished ?? "NON_MEUBLE",
          dpe: p.data.dpe ?? "D",
          ges: p.data.ges ?? "D",
          price: String(p.data.price ?? ""),
          charges: p.data.charges != null ? String(p.data.charges) : "",
          address: p.data.address ?? "",
          street: p.data.street ?? "",
          quarter: p.data.quarter ?? "",
          city: p.data.city ?? "",
          zipCode: p.data.zipCode ?? "",
          nearTransport: !!p.data.nearTransport,
          transportDetails: p.data.transportDetails ?? "",
          availableFrom: toDateInput(p.data.availableFrom),
          accessiblePMR: !!p.data.accessiblePMR,
          hasElevator: !!p.data.hasElevator,
          contactId: p.data.contactId ?? "",
          tenantId: p.data.tenantId ?? "",
        });
        if (u.ok) setUsers(u.data);
        if (d.ok) setDocuments(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body: Record<string, unknown> = {
      listingType: form.listingType,
      propertyType: form.propertyType,
      status: form.status,
      surface: Number(form.surface),
      rooms: Number(form.rooms),
      floor: form.floor ? Number(form.floor) : undefined,
      constructionYear: Number(form.constructionYear),
      heatingType: form.heatingType,
      furnished: form.furnished,
      dpe: form.dpe,
      ges: form.ges,
      price: Number(form.price),
      charges: form.charges ? Number(form.charges) : undefined,
      address: form.address,
      street: form.street,
      quarter: form.quarter,
      city: form.city,
      zipCode: form.zipCode,
      nearTransport: form.nearTransport,
      transportDetails: form.transportDetails || undefined,
      availableFrom: form.availableFrom || undefined,
      accessiblePMR: form.accessiblePMR,
      hasElevator: form.hasElevator,
      contactId: form.contactId,
      tenantId: form.tenantId || null,
    };

    const res = await api.put(`/real-estate/${id}`, body);
    setSaving(false);
    if (!res.ok) setError(res.data?.error || "Erreur lors de la mise à jour");
    else navigate("/admin/properties");
  };

  const handleAddDoc = async (e: FormEvent) => {
    e.preventDefault();
    setDocError("");
    if (!form.tenantId) {
      setDocError("Assignez un locataire avant d'ajouter des documents");
      return;
    }
    const res = await api.post("/documents", {
      name: docName,
      type: docType,
      url: docUrl,
      propertyId: id,
      tenantId: form.tenantId,
    });
    if (!res.ok) {
      setDocError(res.data?.error || "Impossible d'ajouter le document");
      return;
    }
    setDocuments((d) => [res.data, ...d]);
    setDocName("");
    setDocUrl("");
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    const r = await api.del(`/documents/${docId}`);
    if (!r.ok) {
      setDocError(r.data?.error || "Suppression impossible");
      return;
    }
    setDocuments((d) => d.filter((x) => x.id !== docId));
  };

  if (loading) return <div className={styles.page}>Chargement…</div>;
  if (!property)
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error || "Bien introuvable"}</p>
      </div>
    );

  const staff = users.filter((u) => u.rank !== "USER");

  return (
    <div className={styles.page}>
      <h1>
        {property.address}, {property.city}
      </h1>
      <p className={styles.subtitle}>
        {property.listingType} &middot; {property.propertyType} &middot;{" "}
        {property.surface}m&sup2; &middot; {property.rooms} pi&egrave;ces
        &middot;{" "}
        {typeof property.price === "number"
          ? `${property.price.toLocaleString()} €`
          : "—"}
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <form
        className={styles.form}
        onSubmit={handleSave}
        style={{ maxWidth: 700 }}
      >
        <label>
          Statut
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUE">Loué</option>
            <option value="VENDU">Vendu</option>
          </select>
        </label>

        <label>
          Type d'annonce
          <select
            value={form.listingType}
            onChange={(e) => set("listingType", e.target.value)}
          >
            <option value="LOCATION">Location</option>
            <option value="ACHAT">Achat</option>
          </select>
        </label>

        <label>
          Type de bien
          <select
            value={form.propertyType}
            onChange={(e) => set("propertyType", e.target.value)}
          >
            <option value="APPARTEMENT">Appartement</option>
            <option value="MAISON">Maison</option>
          </select>
        </label>

        <label>
          Surface (m²){" "}
          <input
            type="number"
            value={form.surface}
            onChange={(e) => set("surface", e.target.value)}
            required
            min="1"
          />
        </label>
        <label>
          Pièces{" "}
          <input
            type="number"
            value={form.rooms}
            onChange={(e) => set("rooms", e.target.value)}
            required
            min="1"
          />
        </label>
        <label>
          Étage (optionnel){" "}
          <input
            type="number"
            value={form.floor}
            onChange={(e) => set("floor", e.target.value)}
          />
        </label>
        <label>
          Année de construction{" "}
          <input
            type="number"
            value={form.constructionYear}
            onChange={(e) => set("constructionYear", e.target.value)}
            required
          />
        </label>

        <label>
          Chauffage
          <select
            value={form.heatingType}
            onChange={(e) => set("heatingType", e.target.value)}
          >
            <option value="INDIVIDUEL_GAZ">Individuel gaz</option>
            <option value="INDIVIDUEL_ELECTRIQUE">Individuel électrique</option>
            <option value="COLLECTIF">Collectif</option>
            <option value="POMPE_A_CHALEUR">Pompe à chaleur</option>
            <option value="AUTRE">Autre</option>
          </select>
        </label>

        <label>
          Meublé
          <select
            value={form.furnished}
            onChange={(e) => set("furnished", e.target.value)}
          >
            <option value="NON_MEUBLE">Non meublé</option>
            <option value="MEUBLE">Meublé</option>
          </select>
        </label>

        <label>
          DPE
          <select
            value={form.dpe}
            onChange={(e) => set("dpe", e.target.value)}
          >
            {DPE_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label>
          GES
          <select
            value={form.ges}
            onChange={(e) => set("ges", e.target.value)}
          >
            {DPE_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label>
          Prix (€){" "}
          <input
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
            min="0"
          />
        </label>
        <label>
          Charges (€, optionnel){" "}
          <input
            type="number"
            value={form.charges}
            onChange={(e) => set("charges", e.target.value)}
            min="0"
          />
        </label>

        <label>
          Adresse{" "}
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            required
          />
        </label>
        <label>
          Rue{" "}
          <input
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
            required
          />
        </label>
        <label>
          Quartier{" "}
          <input
            value={form.quarter}
            onChange={(e) => set("quarter", e.target.value)}
            required
          />
        </label>
        <label>
          Ville{" "}
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            required
          />
        </label>
        <label>
          Code postal{" "}
          <input
            value={form.zipCode}
            onChange={(e) => set("zipCode", e.target.value)}
            required
          />
        </label>

        <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.nearTransport}
            onChange={(e) => set("nearTransport", e.target.checked)}
          />
          Proche transports
        </label>
        {form.nearTransport && (
          <label>
            Détails transports{" "}
            <input
              value={form.transportDetails}
              onChange={(e) => set("transportDetails", e.target.value)}
            />
          </label>
        )}

        <label>
          Disponible à partir de{" "}
          <input
            type="date"
            value={form.availableFrom}
            onChange={(e) => set("availableFrom", e.target.value)}
            required
          />
        </label>

        <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.accessiblePMR}
            onChange={(e) => set("accessiblePMR", e.target.checked)}
          />
          Accessible PMR
        </label>

        <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.hasElevator}
            onChange={(e) => set("hasElevator", e.target.checked)}
          />
          Ascenseur
        </label>

        <label>
          Contact (employé)
          <select
            value={form.contactId}
            onChange={(e) => set("contactId", e.target.value)}
            required
          >
            <option value="">— Sélectionner —</option>
            {staff.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </label>

        <label>
          Locataire / Acheteur
          <select
            value={form.tenantId}
            onChange={(e) => set("tenantId", e.target.value)}
          >
            <option value="">— Aucun —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={saving}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      <div className={styles.section}>
        <h2>Documents</h2>
        {docError && <p className={styles.error}>{docError}</p>}
        <form className={styles.inlineForm} onSubmit={handleAddDoc}>
          <label>
            Nom{" "}
            <input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              required
            />
          </label>
          <label>
            Type
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="CONTRAT">Contrat</option>
              <option value="QUITTANCE">Quittance</option>
              <option value="FACTURE">Facture</option>
              <option value="ETAT_DES_LIEUX">État des lieux</option>
              <option value="AUTRE">Autre</option>
            </select>
          </label>
          <label>
            URL{" "}
            <input
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
          >
            Ajouter
          </button>
        </form>

        {documents.length === 0 ? (
          <p className={styles.emptyText}>Aucun document</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td>
                    <a href={d.url} target="_blank" rel="noreferrer">
                      {d.name}
                    </a>
                  </td>
                  <td>{d.type}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteDoc(d.id)}
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
    </div>
  );
}
