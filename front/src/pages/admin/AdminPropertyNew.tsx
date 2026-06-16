import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import styles from "./Admin.module.css";

export default function AdminPropertyNew() {
  const api = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    listingType: "LOCATION",
    propertyType: "APPARTEMENT",
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
  });

  useEffect(() => {
    api.get("/users").then((r) => {
      if (r.ok) {
        const staff = r.data.filter((u: any) => u.rank !== "USER");
        setEmployees(staff);
        if (user && staff.find((s: any) => s.id === user.id)) {
          setForm((f) => ({ ...f, contactId: user.id }));
        }
      }
    });
  }, []);

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const setImage = (i: number, val: string) =>
    setImages((arr) => arr.map((x, idx) => (idx === i ? val : x)));
  const addImage = () => setImages((arr) => [...arr, ""]);
  const removeImage = (i: number) =>
    setImages((arr) => arr.filter((_, idx) => idx !== i));

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    const res = await api.upload("/uploads", file);
    setUploading(false);
    if (!res.ok || !res.data?.url) {
      setError(res.data?.error || "Échec de l'upload de l'image");
      return;
    }
    setImages((arr) => [...arr, res.data.url]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const body = {
      ...form,
      surface: Number(form.surface),
      rooms: Number(form.rooms),
      floor: form.floor ? Number(form.floor) : undefined,
      constructionYear: Number(form.constructionYear),
      price: Number(form.price),
      charges: form.charges ? Number(form.charges) : undefined,
      transportDetails: form.transportDetails || undefined,
      images: images.map((s) => s.trim()).filter(Boolean),
    };

    const res = await api.post("/real-estate", body);
    if (!res.ok) setError(res.data.error || "Erreur lors de la création");
    else navigate("/admin/properties");
  };

  return (
    <div className={styles.page}>
      <h1>Ajouter un bien</h1>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        style={{ maxWidth: 700 }}
      >
        {error && <p className={styles.error}>{error}</p>}

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
          <select value={form.dpe} onChange={(e) => set("dpe", e.target.value)}>
            {["A", "B", "C", "D", "E", "F", "G"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label>
          GES
          <select value={form.ges} onChange={(e) => set("ges", e.target.value)}>
            {["A", "B", "C", "D", "E", "F", "G"].map((g) => (
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
            {employees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span>Photos (URL)</span>
          {images.length === 0 && (
            <p className={styles.emptyText}>Aucune photo pour le moment</p>
          )}
          {images.map((url, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {url.trim() && (
                <img
                  src={url}
                  alt=""
                  style={{
                    width: 56,
                    height: 42,
                    objectFit: "cover",
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.visibility = "visible";
                  }}
                />
              )}
              <input
                style={{ flex: 1 }}
                value={url}
                placeholder="https://…"
                onChange={(e) => setImage(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
              >
                Retirer
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label
              className={`${styles.btn} ${styles.btnSmall}`}
              style={{ cursor: "pointer", margin: 0 }}
            >
              {uploading ? "Envoi…" : "⬆ Téléverser une photo"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={uploading}
                onChange={(e) => {
                  handleUpload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={addImage}
              className={`${styles.btn} ${styles.btnSmall}`}
            >
              + Ajouter par URL
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={uploading}
        >
          Créer le bien
        </button>
      </form>
    </div>
  );
}
