import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/acheter', label: 'Acheter' },
  { to: '/louer', label: 'Louer' },
  { to: '/vendre', label: 'Vendre' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          Diddymo
        </Link>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`${styles.link} ${location.pathname === link.to ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className={styles.mobileLogin}>
            {user ? (
              <div className={styles.mobileUser}>
                <span className={styles.userName}>{user.name}</span>
                <button onClick={handleLogout} className={styles.logoutBtnMobile}>
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn}>
                <User size={16} />
                Connexion
              </Link>
            )}
          </li>
        </ul>

        {user ? (
          <div className={styles.userMenu}>
            <span className={styles.userName}>{user.name}</span>
            <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/login" className={styles.loginBtn} aria-label="Connexion">
            <User size={16} />
            Connexion
          </Link>
        )}

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
