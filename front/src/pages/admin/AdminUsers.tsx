import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import styles from './Admin.module.css';

export default function AdminUsers() {
  const api = useApi();
  const [users, setUsers] = useState<any[]>([]);

  const load = () => api.get('/users').then(r => r.ok && setUsers(r.data));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await api.del(`/users/${id}`);
    load();
  };

  const rankBadge = (rank: string) => {
    const cls = rank === 'ADMINISTRATOR' ? styles.badgeRed : rank === 'EMPLOYEE' ? styles.badgeBlue : styles.badgeGray;
    return <span className={`${styles.badge} ${cls}`}>{rank}</span>;
  };

  return (
    <div className={styles.page}>
      <h1>Utilisateurs</h1>
      <table className={styles.table}>
        <thead>
          <tr><th>Nom</th><th>Email</th><th>Rang</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{rankBadge(u.rank)}</td>
              <td className={styles.actions}>
                <Link to={`/admin/users/${u.id}`} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>Modifier</Link>
                <button onClick={() => handleDelete(u.id)} className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
