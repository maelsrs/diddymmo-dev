import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./Client.module.css";

export default function ClientTicketNew() {
  const api = useApi();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/real-estate/my/tenancies")
      .then((r) => r.ok && setProperties(r.data));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await api.post("/tickets", {
      subject,
      propertyId: propertyId || undefined,
      message: message || undefined,
    });
    if (!res.ok) setError(res.data.error);
    else navigate(`/espace-client/tickets/${res.data.id}`);
  };

  return (
    <div className={styles.page}>
      <h1>Nouveau ticket</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && (
          <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>{error}</p>
        )}
        <label>
          Sujet
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </label>
        <label>
          Bien concerné (optionnel)
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          >
            <option value="">— Aucun —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}, {p.city}
              </option>
            ))}
          </select>
        </label>
        <label>
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez votre demande..."
          />
        </label>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
