import { useState } from 'react';
import PropertyCard from '../property/PropertyCard';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { properties } from '../../data/properties';
import styles from './PropertyGrid.module.css';

interface PropertyGridProps {
  filter?: 'achat' | 'location';
  showFilters?: boolean;
  title?: string;
}

const filterOptions = [
  { key: 'tous', label: 'Tous' },
  { key: 'achat', label: 'Acheter' },
  { key: 'location', label: 'Louer' },
];

export default function PropertyGrid({
  filter,
  showFilters = true,
  title = 'Biens disponibles',
}: PropertyGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>(filter || 'tous');
  const ref = useScrollAnimation();

  const visibleFilters = showFilters ? filterOptions : [];

  const filteredProperties =
    activeFilter === 'tous'
      ? properties
      : properties.filter((property) => property.type === activeFilter);

  return (
    <section className="section" ref={ref}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={`${styles.title} fade-up`}>{title}</h2>
          {visibleFilters.length > 0 && (
            <div className={`${styles.filters} fade-up`}>
              {visibleFilters.map((option) => (
                <button
                  key={option.key}
                  className={`${styles.filterBtn} ${activeFilter === option.key ? styles.filterActive : ''}`}
                  onClick={() => setActiveFilter(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.grid}>
          {filteredProperties.map((property) => (
            <div key={property.id} className="fade-up">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
