import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

export default function AdminUserEdit() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    rank: "USER",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then((r) => {
      if (r.ok) {
        setForm({
          name: r.data.name,
          email: r.data.email,
          rank: r.data.rank,
          password: "",
        });
      } else {
        setError(r.data?.error || "Impossible de charger l'utilisateur");
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const { password, ...rest } = form;
    const body: Record<string, unknown> = { ...rest };
    if (password) body.password = password;

    const res = await api.put(`/users/${id}`, body);
    if (!res.ok) setError(res.data?.error || "Erreur lors de la mise à jour");
    else navigate("/admin/users");
  };

  if (loading) return <div className={styles.page}>Chargement…</div>;

  return (
    <div className={styles.page}>
      <h1>Modifier utilisateur</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <label>
          Nom{" "}
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label>
          Email{" "}
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </label>
        <label>
          Rang
          <select
            value={form.rank}
            onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value }))}
          >
            <option value="USER">USER</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="ADMINISTRATOR">ADMINISTRATOR</option>
          </select>
        </label>
        <label>
          Nouveau mot de passe (laisser vide pour conserver)
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            placeholder="••••••"
            minLength={6}
          />
        </label>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Enregistrer
        </button>
      </form>
    </div>
  );
}
