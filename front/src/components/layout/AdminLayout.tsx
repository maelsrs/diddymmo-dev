import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/properties', label: 'Biens' },
  { to: '/admin/documents', label: 'Documents' },
  { to: '/admin/tickets', label: 'Tickets' },
];

export default function AdminLayout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Admin</h2>
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
        </nav>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
