import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import styles from './Admin.module.css';

export default function AdminPropertyEdit() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [status, setStatus] = useState('DISPONIBLE');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');

  // Doc form
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('CONTRAT');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    api.get(`/real-estate/${id}`).then(r => {
      if (r.ok) {
        setProperty(r.data);
        setStatus(r.data.status);
        setTenantId(r.data.tenantId ?? '');
      }
    });
    api.get('/users').then(r => r.ok && setUsers(r.data));
    api.get(`/documents?propertyId=${id}`).then(r => r.ok && setDocuments(r.data));
  }, [id]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await api.put(`/real-estate/${id}`, {
      status,
      tenantId: tenantId || null,
    });
    if (!res.ok) setError(res.data.error);
    else navigate('/admin/properties');
  };

  const handleAddDoc = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenantId) { setError('Assignez un locataire avant d\'ajouter des documents'); return; }
    const res = await api.post('/documents', {
      name: docName,
      type: docType,
      url: docUrl,
      propertyId: id,
      tenantId,
    });
    if (res.ok) {
      setDocuments(d => [res.data, ...d]);
      setDocName('');
      setDocUrl('');
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    await api.del(`/documents/${docId}`);
    setDocuments(d => d.filter(x => x.id !== docId));
  };

  if (!property) return <p>Chargement...</p>;

  return (
    <div className={styles.page}>
      <h1>{property.address}, {property.city}</h1>
      <p className={styles.subtitle}>
        {property.listingType} &middot; {property.propertyType} &middot; {property.surface}m&sup2; &middot; {property.rooms} pi&egrave;ces &middot; {property.price.toLocaleString()} &euro;
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={handleSave}>
        <label>Statut
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUE">Loué</option>
            <option value="VENDU">Vendu</option>
          </select>
        </label>
        <label>Locataire / Acheteur
          <select value={tenantId} onChange={e => setTenantId(e.target.value)}>
            <option value="">— Aucun —</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </label>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Enregistrer</button>
      </form>

      <div className={styles.section}>
        <h2>Documents</h2>
        <form className={styles.inlineForm} onSubmit={handleAddDoc}>
          <label>Nom <input value={docName} onChange={e => setDocName(e.target.value)} required /></label>
          <label>Type
            <select value={docType} onChange={e => setDocType(e.target.value)}>
              <option value="CONTRAT">Contrat</option>
              <option value="QUITTANCE">Quittance</option>
              <option value="FACTURE">Facture</option>
              <option value="ETAT_DES_LIEUX">État des lieux</option>
              <option value="AUTRE">Autre</option>
            </select>
          </label>
          <label>URL <input value={docUrl} onChange={e => setDocUrl(e.target.value)} required /></label>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>Ajouter</button>
        </form>

        {documents.length === 0 ? <p className={styles.emptyText}>Aucun document</p> : (
          <table className={styles.table}>
            <thead><tr><th>Nom</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {documents.map(d => (
                <tr key={d.id}>
                  <td><a href={d.url} target="_blank" rel="noreferrer">{d.name}</a></td>
                  <td>{d.type}</td>
                  <td>
                    <button onClick={() => handleDeleteDoc(d.id)} className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}>Supprimer</button>
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
