import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.col}>
          <Link to="/" className={styles.logo}>
            Diddymo
          </Link>
          <p className={styles.desc}>
            Agence immobilière présente à Paris et dans les grandes villes de France. On accompagne les particuliers dans leurs projets d'achat, de vente et de location depuis 2014.
          </p>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Navigation</h4>
          <ul className={styles.list}>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/acheter">Acheter</Link></li>
            <li><Link to="/louer">Louer</Link></li>
            <li><Link to="/vendre">Vendre</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Services</h4>
          <ul className={styles.list}>
            <li>Estimation gratuite</li>
            <li>Gestion locative</li>
            <li>Conseil en investissement</li>
            <li>Accompagnement notarial</li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact</h4>
          <ul className={styles.list}>
            <li className={styles.contactItem}>
              <MapPin size={16} />
              12 Rue de la Paix, 75002 Paris
            </li>
            <li className={styles.contactItem}>
              <Phone size={16} />
              01 23 45 67 89
            </li>
            <li className={styles.contactItem}>
              <Mail size={16} />
              contact@diddymo.fr
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© 2026 Diddymo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
