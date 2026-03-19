import PropertyGrid from '../components/sections/PropertyGrid';
import styles from './Buy.module.css';

export default function Buy() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Biens à acheter</h1>
          <p className={styles.subtitle}>
            Tous nos biens disponibles à la vente en ce moment.
          </p>
        </div>
      </div>
      <PropertyGrid filter="achat" showFilters={false} title="Nos biens en vente" />
    </div>
  );
}
