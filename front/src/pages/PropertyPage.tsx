import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropertyDetail from '../components/property/PropertyDetail';
import { properties } from '../data/properties';
import styles from './PropertyPage.module.css';

export default function PropertyPage() {
  const { id } = useParams();
  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className={styles.notFound}>
        <div className="container">
          <h1>Bien introuvable</h1>
          <p>Ce bien n'existe pas ou a été retiré.</p>
          <Link to="/acheter" className={styles.backLink}>
            <ArrowLeft size={16} />
            Retour aux biens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`container ${styles.breadcrumb}`}>
        <Link to="/acheter" className={styles.backLink}>
          <ArrowLeft size={16} />
          Retour
        </Link>
      </div>
      <PropertyDetail property={property} />
    </div>
  );
}
