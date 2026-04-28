import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

const STATUS_LABELS: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', CLOSED: 'Fermé' };

export default function AdminTicketDetail() {
  const { id } = useParams();
  const api = useApi();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('');

  const load = () => api.get(`/tickets/${id}`).then(r => {
    if (r.ok) { setTicket(r.data); setStatus(r.data.status); }
  });

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async () => {
    await api.put(`/tickets/${id}/status`, { status });
    load();
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await api.post(`/tickets/${id}/messages`, { content: newMessage });
    setNewMessage('');
    load();
  };

  if (!ticket) return <p>Chargement...</p>;

  return (
    <div className={styles.page}>
      <h1>{ticket.subject}</h1>
      <p className={styles.subtitle}>
        Par {ticket.user?.name} ({ticket.user?.email})
        {ticket.property && <> &middot; {ticket.property.address}, {ticket.property.city}</>}
      </p>

      <div className={styles.toolbar}>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="OPEN">Ouvert</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="CLOSED">Fermé</option>
        </select>
        <button onClick={handleStatusChange} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>
          Mettre à jour
        </button>
        <span className={`${styles.badge} ${styles.badgeGray}`}>{STATUS_LABELS[ticket.status]}</span>
      </div>

      <div className={styles.messages}>
        {ticket.messages?.map((m: any) => (
          <div key={m.id} className={`${styles.message} ${['EMPLOYEE', 'ADMINISTRATOR'].includes(m.author?.rank) ? styles.messageStaff : ''}`}>
            <div className={styles.messageMeta}>
              <strong>{m.author?.name}</strong>
              {['EMPLOYEE', 'ADMINISTRATOR'].includes(m.author?.rank) && ' (Staff)'}
              {' — '}
              {new Date(m.createdAt).toLocaleString('fr-FR')}
            </div>
            <div className={styles.messageContent}>{m.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className={styles.replyForm}>
        <textarea
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Répondre..."
          className={styles.replyInput}
        />
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Envoyer</button>
      </form>
    </div>
  );
}
