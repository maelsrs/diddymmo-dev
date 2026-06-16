import type { Property } from "../types/property";

const HEATING_LABELS: Record<string, string> = {
  INDIVIDUEL_GAZ: "Gaz individuel",
  INDIVIDUEL_ELECTRIQUE: "Électrique individuel",
  COLLECTIF: "Chauffage collectif",
  POMPE_A_CHALEUR: "Pompe à chaleur",
  AUTRE: "Autre",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop";

const formatPrice = (price: number, listingType: string) => {
  const base = `${price.toLocaleString("fr-FR")} €`;
  return listingType === "LOCATION" ? `${base}/mois` : base;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
};

const buildTags = (p: any): string[] => {
  const tags: string[] = [];
  if (p.status === "LOUE") tags.push("Loué");
  if (p.status === "VENDU") tags.push("Vendu");
  if (p.furnished === "MEUBLE") tags.push("Meublé");
  if (p.hasElevator) tags.push("Ascenseur");
  if (p.accessiblePMR) tags.push("PMR");
  if (p.nearTransport) tags.push("Transports");
  return tags;
};

export function mapProperty(p: any): Property {
  const kind = p.propertyType === "MAISON" ? "maison" : "appartement";
  const type = p.listingType === "LOCATION" ? "location" : "achat";
  const kindLabel = kind === "maison" ? "Maison" : "Appartement";
  const images =
    Array.isArray(p.images) && p.images.length > 0 ? p.images : [FALLBACK_IMAGE];

  return {
    id: p.id,
    ref: `DID-${String(p.id).slice(0, 8).toUpperCase()}`,
    title: `${kindLabel} T${p.rooms ?? "?"} · ${p.surface ?? "?"} m²`,
    type,
    kind,
    price: p.price ?? 0,
    priceLabel: formatPrice(p.price ?? 0, p.listingType),
    chargesIncluded: p.charges ? (p.price ?? 0) + p.charges : undefined,
    chargesExcluded: p.charges ? p.price ?? 0 : undefined,
    location: [p.city, p.quarter].filter(Boolean).join(", "),
    address: p.address ?? "",
    quartier: p.quarter ?? "",
    surface: p.surface ?? 0,
    rooms: p.rooms ?? 0,
    bedrooms: Math.max(0, (p.rooms ?? 1) - 1),
    floor: p.floor ?? undefined,
    dpe: (p.dpe ?? "D") as Property["dpe"],
    ges: (p.ges ?? "D") as Property["ges"],
    yearBuilt: p.constructionYear ?? 0,
    heating: HEATING_LABELS[p.heatingType] ?? "—",
    furnished: p.furnished === "MEUBLE",
    accessiblePMR: !!p.accessiblePMR,
    elevator: !!p.hasElevator,
    availableFrom: formatDate(p.availableFrom),
    proximiteTransports: p.transportDetails ?? "—",
    images,
    tags: buildTags(p),
    description: "",
    agent: {
      name: p.contact?.name ?? "—",
      email: p.contact?.email ?? "",
      phone: p.contact?.phone ?? "",
    },
  };
}
