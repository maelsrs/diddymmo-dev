import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PropertyDetail from "../components/property/PropertyDetail";
import { useApi } from "../hooks/useApi";
import { mapProperty } from "../lib/propertyMapper";
import type { Property } from "../types/property";
import styles from "./PropertyPage.module.css";

export default function PropertyPage() {
  const { id } = useParams();
  const api = useApi();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api
      .get(`/real-estate/${id}`)
      .then((r) => {
        if (r.ok) setProperty(mapProperty(r.data));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={styles.notFound}>
        <div className="container">
          <p>Chargement…</p>
        </div>
      </div>
    );
  }

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
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link to="/acheter" className={styles.backLink}>
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
      </div>
      <PropertyDetail property={property} />
    </div>
  );
}
