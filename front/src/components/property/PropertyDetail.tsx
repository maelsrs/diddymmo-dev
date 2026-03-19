import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Maximize2, BedDouble, Home, Heart, ChevronLeft, ChevronRight,
  Flame, Calendar, Building, Train, Accessibility, ArrowUpDown, Armchair, Mail, Phone,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useApp } from '../../context/AppContext';
import type { Property } from '../../data/properties';
import styles from './PropertyDetail.module.css';

interface PropertyDetailProps {
  property: Property;
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const isFavorited = isFavorite(property.id);
  const [currentImage, setCurrentImage] = useState(0);

  const showPrevImage = () =>
    setCurrentImage((current) => (current === 0 ? property.images.length - 1 : current - 1));
  const showNextImage = () =>
    setCurrentImage((current) => (current === property.images.length - 1 ? 0 : current + 1));

  return (
    <div className={styles.detail}>
      {/* Galerie */}
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <img
            src={property.images[currentImage]}
            alt={`${property.title} — photo ${currentImage + 1}`}
            className={styles.image}
          />
          {property.images.length > 1 && (
            <>
              <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={showPrevImage} aria-label="Image précédente">
                <ChevronLeft size={20} />
              </button>
              <button className={`${styles.navBtn} ${styles.navNext}`} onClick={showNextImage} aria-label="Image suivante">
                <ChevronRight size={20} />
              </button>
              <div className={styles.counter}>
                {currentImage + 1} / {property.images.length}
              </div>
            </>
          )}
        </div>
        {property.images.length > 1 && (
          <div className={styles.thumbs}>
            {property.images.map((imageUrl, index) => (
              <button
                key={index}
                className={`${styles.thumb} ${index === currentImage ? styles.thumbActive : ''}`}
                onClick={() => setCurrentImage(index)}
                aria-label={`Voir photo ${index + 1}`}
              >
                <img src={imageUrl} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.main}>
          {/* En-tête */}
          <div className={styles.tags}>
            <Badge variant="accent">{property.type === 'achat' ? 'Achat' : 'Location'}</Badge>
            <Badge variant="accent">{property.kind === 'appartement' ? 'Appartement' : 'Maison'}</Badge>
            {property.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <h1 className={styles.title}>{property.title}</h1>

          <div className={styles.location}>
            <MapPin size={16} />
            {property.address}, {property.location}
          </div>

          <div className={styles.quickMeta}>
            <span><Maximize2 size={15} /> {property.surface} m²</span>
            <span><Home size={15} /> {property.rooms} pièces</span>
            <span><BedDouble size={15} /> {property.bedrooms} ch.</span>
            {property.floor !== undefined && (
              <span><ArrowUpDown size={15} /> {property.floor === 0 ? 'RDC' : `${property.floor}e étage`}</span>
            )}
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.descText}>{property.description}</p>
          </div>

          {/* Caractéristiques */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Caractéristiques</h2>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>DPE</span>
                <span className={styles.specValue}>{property.dpe}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>GES</span>
                <span className={styles.specValue}>{property.ges}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}><Calendar size={14} /> Année</span>
                <span className={styles.specValue}>{property.yearBuilt}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}><Flame size={14} /> Chauffage</span>
                <span className={styles.specValue}>{property.heating}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}><Armchair size={14} /> Meublé</span>
                <span className={styles.specValue}>{property.furnished ? 'Oui' : 'Non'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}><Accessibility size={14} /> Accessible PMR</span>
                <span className={styles.specValue}>{property.accessiblePMR ? 'Oui' : 'Non'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}><Building size={14} /> Ascenseur</span>
                <span className={styles.specValue}>{property.elevator ? 'Oui' : 'Non'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}><Train size={14} /> Transports</span>
                <span className={styles.specValue}>{property.proximiteTransports}</span>
              </div>
            </div>
          </div>

          {/* Loyer détaillé si location */}
          {property.type === 'location' && property.chargesIncluded && property.chargesExcluded && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Loyer</h2>
              <div className={styles.specGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Charges comprises</span>
                  <span className={styles.specValue}>{property.chargesIncluded} €/mois</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Hors charges</span>
                  <span className={styles.specValue}>{property.chargesExcluded} €/mois</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.priceCard}>
            <span className={styles.priceLabel}>
              {property.type === 'achat' ? 'Prix' : 'Loyer CC'}
            </span>
            <span className={styles.price}>{property.priceLabel}</span>

            <div className={styles.availability}>
              Disponible : {property.availableFrom}
            </div>

            <button
              className={`${styles.favButton} ${isFavorited ? styles.favActive : ''}`}
              onClick={() => toggleFavorite(property.id)}
            >
              <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              {isFavorited ? 'Dans vos favoris' : 'Ajouter aux favoris'}
            </button>
          </div>

          <div className={styles.agentCard}>
            <span className={styles.agentLabel}>Votre contact</span>
            <span className={styles.agentName}>{property.agent.name}</span>
            <a href={`tel:${property.agent.phone}`} className={styles.agentLink}>
              <Phone size={14} /> {property.agent.phone}
            </a>
            <a href={`mailto:${property.agent.email}`} className={styles.agentLink}>
              <Mail size={14} /> {property.agent.email}
            </a>
            <Link to="/contact">
              <Button variant="primary" size="md" style={{ width: '100%' }}>
                Contacter
              </Button>
            </Link>
          </div>

          <div className={styles.refBlock}>
            Réf. {property.ref}
          </div>
        </div>
      </div>
    </div>
  );
}
