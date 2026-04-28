import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import styles from './Admin.module.css';

const STATUS_LABELS: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', CLOSED: 'Fermé' };
const STATUS_BADGE: Record<string, string> = { OPEN: styles.badgeYellow, IN_PROGRESS: styles.badgeBlue, CLOSED: styles.badgeGray };

export default function AdminTickets() {
  const api = useApi();
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const qs = filter ? `?status=${filter}` : '';
    api.get(`/tickets${qs}`).then(r => r.ok && setTickets(r.data));
  }, [filter]);

  return (
    <div className={styles.page}>
      <h1>Tickets</h1>
      <div className={styles.toolbar}>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Tous</option>
          <option value="OPEN">Ouvert</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="CLOSED">Fermé</option>
        </select>
      </div>
      <table className={styles.table}>
        <thead>
          <tr><th>Sujet</th><th>Utilisateur</th><th>Bien</th><th>Statut</th><th>Messages</th><th>Mis à jour</th></tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id}>
              <td><Link to={`/admin/tickets/${t.id}`} style={{ color: '#4a7fb5', fontWeight: 500 }}>{t.subject}</Link></td>
              <td>{t.user?.name}</td>
              <td>{t.property ? `${t.property.address}, ${t.property.city}` : '—'}</td>
              <td><span className={`${styles.badge} ${STATUS_BADGE[t.status] ?? styles.badgeGray}`}>{STATUS_LABELS[t.status] ?? t.status}</span></td>
              <td>{t._count?.messages ?? 0}</td>
              <td>{new Date(t.updatedAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
