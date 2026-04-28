import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ClientLayout.module.css';

const links = [
  { to: '/espace-client', label: 'Mes biens', end: true },
  { to: '/espace-client/documents', label: 'Documents' },
  { to: '/espace-client/tickets', label: 'Support' },
];

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <strong>{user?.name}</strong>
          <button onClick={handleLogout} className={styles.logoutBtn}>Déconnexion</button>
        </div>
        <nav>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/" className={styles.link}>Retour au site</NavLink>
        </nav>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
