import PropertyGrid from '../components/sections/PropertyGrid';
import styles from './Rent.module.css';

export default function Rent() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Biens à louer</h1>
          <p className={styles.subtitle}>
            Nos locations disponibles, mises à jour chaque semaine.
          </p>
        </div>
      </div>
      <PropertyGrid filter="location" showFilters={false} title="Nos biens en location" />
    </div>
  );
}
