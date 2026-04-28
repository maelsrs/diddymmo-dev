import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import styles from "./Admin.module.css";

export default function AdminUserEdit() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", rank: "USER" });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/users/${id}`).then((r) => {
      if (r.ok)
        setForm({ name: r.data.name, email: r.data.email, rank: r.data.rank });
    });
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await api.put(`/users/${id}`, form);
    if (!res.ok) setError(res.data.error);
    else navigate("/admin/users");
  };

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
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Enregistrer
        </button>
      </form>
    </div>
  );
}
