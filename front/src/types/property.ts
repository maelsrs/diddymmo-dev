export interface Agent {
  name: string;
  email: string;
  phone: string;
}

export interface Property {
  id: string;
  ref: string;
  title: string;
  type: "achat" | "location";
  kind: "appartement" | "maison";
  price: number;
  priceLabel: string;
  chargesIncluded?: number;
  chargesExcluded?: number;
  location: string;
  address: string;
  quartier: string;
  surface: number;
  rooms: number;
  bedrooms: number;
  floor?: number;
  dpe: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  ges: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  yearBuilt: number;
  heating: string;
  furnished: boolean;
  accessiblePMR: boolean;
  elevator: boolean;
  availableFrom: string;
  proximiteTransports: string;
  images: string[];
  tags: string[];
  description: string;
  agent: Agent;
}
