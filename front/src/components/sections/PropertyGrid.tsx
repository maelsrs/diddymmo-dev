import { useEffect, useState } from "react";
import PropertyCard from "../property/PropertyCard";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useApi } from "../../hooks/useApi";
import { mapProperty } from "../../lib/propertyMapper";
import type { Property } from "../../types/property";
import styles from "./PropertyGrid.module.css";

interface PropertyGridProps {
  filter?: "achat" | "location";
  showFilters?: boolean;
  title?: string;
}

const filterOptions = [
  { key: "tous", label: "Tous" },
  { key: "achat", label: "Acheter" },
  { key: "location", label: "Louer" },
];

export default function PropertyGrid({
  filter,
  showFilters = true,
  title = "Biens disponibles",
}: PropertyGridProps) {
  const api = useApi();
  const [activeFilter, setActiveFilter] = useState<string>(filter || "tous");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ref = useScrollAnimation();

  useEffect(() => {
    api
      .get("/real-estate")
      .then((r) => {
        if (r.ok) {
          setProperties((r.data as any[]).map(mapProperty));
          setError("");
        } else {
          setError("Impossible de charger les biens");
        }
      })
      .catch(() => setError("Erreur réseau"))
      .finally(() => setLoading(false));
  }, []);

  const visibleFilters = showFilters ? filterOptions : [];

  const filteredProperties =
    activeFilter === "tous"
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
                  className={`${styles.filterBtn} ${activeFilter === option.key ? styles.filterActive : ""}`}
                  onClick={() => setActiveFilter(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <p className="fade-up">Chargement…</p>
        ) : error ? (
          <p className="fade-up">{error}</p>
        ) : filteredProperties.length === 0 ? (
          <p className="fade-up">Aucun bien disponible pour le moment.</p>
        ) : (
          <div className={styles.grid}>
            {filteredProperties.map((property) => (
              <div key={property.id} className="fade-up">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
