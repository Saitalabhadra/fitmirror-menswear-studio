import whiteOxford from "@/assets/garments/white-oxford-shirt.webp";
import navyTee from "@/assets/garments/navy-tee.webp";
import denimJacket from "@/assets/garments/denim-jacket.webp";
import leatherJacket from "@/assets/garments/leather-jacket.webp";
import greyHoodie from "@/assets/garments/grey-hoodie.webp";
import maroonKurta from "@/assets/garments/maroon-kurta.webp";
import ivorySherwani from "@/assets/garments/ivory-sherwani.webp";
import beigeChinos from "@/assets/garments/beige-chinos.webp";
import darkJeans from "@/assets/garments/dark-jeans.webp";
import floralDress from "@/assets/garments/floral-dress.webp";

/**
 * How a garment sits on the body:
 * - top:    shoulders → hips (shirts, tees, jackets, hoodies)
 * - long:   shoulders → below hips, continues straight down (kurtas, sherwanis, dresses, sarees)
 * - bottom: waist → ankles or knees (jeans, trousers, skirts)
 */
export type GarmentKind = "top" | "long" | "bottom";

export const CATEGORIES = [
  "T-shirts",
  "Shirts",
  "Tops",
  "Jackets",
  "Hoodies",
  "Kurtas",
  "Traditional wear",
  "Dresses",
  "Sarees",
  "Kurtis",
  "Jeans",
  "Trousers",
  "Skirts",
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Anchors are fractions of the (trimmed) garment image.
 * For top/long: left/right = shoulder seams (u), topV = shoulder line, midV = hip line.
 * For bottom:   left/right = waistband edges (u), topV = waistband, midV = hem.
 */
export interface GarmentAnchors {
  left: number;
  right: number;
  topV: number;
  midV: number;
}

export interface Garment {
  id: string;
  name: string;
  category: Category;
  gender: "men" | "women" | "unisex";
  kind: GarmentKind;
  hemAt?: "ankle" | "knee";
  anchors: GarmentAnchors;
  src: string;
  uploaded?: boolean;
}

export function kindForCategory(category: Category): GarmentKind {
  switch (category) {
    case "Jeans":
    case "Trousers":
    case "Skirts":
      return "bottom";
    case "Kurtas":
    case "Traditional wear":
    case "Dresses":
    case "Sarees":
    case "Kurtis":
      return "long";
    default:
      return "top";
  }
}

export function defaultAnchors(kind: GarmentKind): GarmentAnchors {
  if (kind === "bottom") return { left: 0.07, right: 0.93, topV: 0, midV: 1 };
  if (kind === "long") return { left: 0.28, right: 0.72, topV: 0.07, midV: 0.45 };
  return { left: 0.24, right: 0.76, topV: 0.12, midV: 0.92 };
}

export const CATALOG: Garment[] = [
  {
    id: "white-oxford",
    name: "White Oxford Shirt",
    category: "Shirts",
    gender: "men",
    kind: "top",
    anchors: { left: 0.23, right: 0.77, topV: 0.13, midV: 0.86 },
    src: whiteOxford,
  },
  {
    id: "navy-tee",
    name: "Navy Crew Tee",
    category: "T-shirts",
    gender: "men",
    kind: "top",
    anchors: { left: 0.215, right: 0.785, topV: 0.09, midV: 0.9 },
    src: navyTee,
  },
  {
    id: "denim-jacket",
    name: "Denim Trucker Jacket",
    category: "Jackets",
    gender: "men",
    kind: "top",
    anchors: { left: 0.236, right: 0.762, topV: 0.145, midV: 0.95 },
    src: denimJacket,
  },
  {
    id: "leather-jacket",
    name: "Black Biker Jacket",
    category: "Jackets",
    gender: "men",
    kind: "top",
    anchors: { left: 0.227, right: 0.775, topV: 0.13, midV: 0.93 },
    src: leatherJacket,
  },
  {
    id: "grey-hoodie",
    name: "Heather Grey Hoodie",
    category: "Hoodies",
    gender: "men",
    kind: "top",
    anchors: { left: 0.24, right: 0.765, topV: 0.29, midV: 0.97 },
    src: greyHoodie,
  },
  {
    id: "maroon-kurta",
    name: "Maroon Silk Kurta",
    category: "Kurtas",
    gender: "men",
    kind: "long",
    anchors: { left: 0.28, right: 0.727, topV: 0.09, midV: 0.49 },
    src: maroonKurta,
  },
  {
    id: "ivory-sherwani",
    name: "Ivory Sherwani",
    category: "Traditional wear",
    gender: "men",
    kind: "long",
    anchors: { left: 0.266, right: 0.76, topV: 0.075, midV: 0.51 },
    src: ivorySherwani,
  },
  {
    id: "dark-jeans",
    name: "Dark Indigo Jeans",
    category: "Jeans",
    gender: "men",
    kind: "bottom",
    hemAt: "ankle",
    anchors: { left: 0.085, right: 0.92, topV: 0.01, midV: 1 },
    src: darkJeans,
  },
  {
    id: "beige-chinos",
    name: "Beige Slim Chinos",
    category: "Trousers",
    gender: "men",
    kind: "bottom",
    hemAt: "ankle",
    anchors: { left: 0.065, right: 0.94, topV: 0.01, midV: 1 },
    src: beigeChinos,
  },
  {
    id: "floral-dress",
    name: "Lavender Floral Midi",
    category: "Dresses",
    gender: "women",
    kind: "long",
    anchors: { left: 0.293, right: 0.71, topV: 0.03, midV: 0.4 },
    src: floralDress,
  },
];

export function findGarment(id: string | undefined): Garment | undefined {
  if (!id) return undefined;
  return CATALOG.find((g) => g.id === id);
}
