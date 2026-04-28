import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import styles from './Client.module.css';

const STATUS_LABELS: Record<string, string> = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', CLOSED: 'Fermé' };
const STATUS_BADGE: Record<string, string> = { OPEN: styles.badgeYellow, IN_PROGRESS: styles.badgeBlue, CLOSED: styles.badgeGray };

export default function ClientTicketDetail() {
  const { id } = useParams();
  const api = useApi();
  const [ticket, setTicket] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  const load = () => api.get(`/tickets/${id}`).then(r => r.ok && setTicket(r.data));
  useEffect(() => { load(); }, [id]);

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
      <p style={{ color: '#6b7280', marginBottom: 8 }}>
        <span className={`${styles.badge} ${STATUS_BADGE[ticket.status] ?? styles.badgeGray}`}>
          {STATUS_LABELS[ticket.status] ?? ticket.status}
        </span>
        {ticket.property && <>{' '}&middot; {ticket.property.address}, {ticket.property.city}</>}
      </p>

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

      {ticket.status !== 'CLOSED' ? (
        <form onSubmit={handleSend} className={styles.replyForm}>
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            className={styles.replyInput}
          />
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Envoyer</button>
        </form>
      ) : (
        <p className={styles.empty}>Ce ticket est fermé.</p>
      )}
    </div>
  );
}
