import { Link } from 'react-router-dom';
import { MapPin, Maximize2, Heart } from 'lucide-react';
import Badge from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import type { Property } from '../../data/properties';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const isFavorited = isFavorite(property.id);

  return (
    <Link to={`/bien/${property.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={property.images[0]}
          alt={property.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.tags}>
          <Badge>{property.type === 'achat' ? 'Achat' : 'Location'}</Badge>
          {property.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <button
          className={`${styles.favBtn} ${isFavorited ? styles.favActive : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(property.id);
          }}
          aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.location}>
          <MapPin size={14} />
          {property.location}
        </div>
        <h3 className={styles.title}>{property.title}</h3>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Maximize2 size={14} />
            {property.surface} m²
          </span>
          <span className={styles.metaItem}>
            {property.rooms} p.
          </span>
          <span className={styles.metaItem}>
            DPE {property.dpe}
          </span>
        </div>
        <p className={styles.price}>{property.priceLabel}</p>
      </div>
    </Link>
  );
}
