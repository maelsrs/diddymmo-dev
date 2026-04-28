import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import styles from './Client.module.css';

const STATUS_LABELS: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', CLOSED: 'Fermé' };
const STATUS_BADGE: Record<string, string> = { OPEN: styles.badgeYellow, IN_PROGRESS: styles.badgeBlue, CLOSED: styles.badgeGray };

export default function ClientTickets() {
  const api = useApi();
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    api.get('/tickets/my').then(r => r.ok && setTickets(r.data));
  }, []);

  return (
    <div className={styles.page}>
      <h1>Support</h1>
      <div style={{ marginBottom: 16 }}>
        <Link to="/espace-client/tickets/nouveau" className={`${styles.btn} ${styles.btnPrimary}`}>Nouveau ticket</Link>
      </div>
      {tickets.length === 0 ? (
        <p className={styles.empty}>Aucun ticket.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Sujet</th><th>Bien</th><th>Statut</th><th>Messages</th><th>Mis à jour</th></tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id}>
                <td><Link to={`/espace-client/tickets/${t.id}`} className={styles.link}>{t.subject}</Link></td>
                <td>{t.property ? `${t.property.address}, ${t.property.city}` : '—'}</td>
                <td><span className={`${styles.badge} ${STATUS_BADGE[t.status] ?? styles.badgeGray}`}>{STATUS_LABELS[t.status] ?? t.status}</span></td>
                <td>{t._count?.messages ?? 0}</td>
                <td>{new Date(t.updatedAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
