export interface ProductBranding {
  embroidery: string;
  label: string;
}

export interface ProductColor {
  name: string;
  hex: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
  currency: string;
  spec: string;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  branding: ProductBranding;
  images: string[];
  colorImages?: Record<string, string[]>;
  composition?: string;
  origin?: string;
  care?: string[];
  fit?: string;
  visible?: boolean;
  showSavoirFaire?: boolean;
  savoirFaireTitle1?: string;
  savoirFaireText1?: string;
  savoirFaireTitle2?: string;
  savoirFaireText2?: string;
}

export function getVariantKey(productId: string, colorName: string, size: string): string {
  return `${productId}:${colorName}:${size}`;
}

export const INITIAL_INVENTORY: Record<string, number> = {
  // SHELTER SWEAT Noir
  'shelter-sweat:Noir:XS': 4,
  'shelter-sweat:Noir:S': 8,
  'shelter-sweat:Noir:M': 12,
  'shelter-sweat:Noir:L': 6,
  'shelter-sweat:Noir:XL': 2,
  'shelter-sweat:Noir:XXL': 2,
  // SHELTER SWEAT Beige
  'shelter-sweat:Beige:XS': 3,
  'shelter-sweat:Beige:S': 7,
  'shelter-sweat:Beige:M': 9,
  'shelter-sweat:Beige:L': 0, // Out of stock example for PDP testing
  'shelter-sweat:Beige:XL': 4,
  'shelter-sweat:Beige:XXL': 1,

  // REST WIDE Noir
  'rest-wide:Noir:XS': 5,
  'rest-wide:Noir:S': 9,
  'rest-wide:Noir:M': 11,
  'rest-wide:Noir:L': 7,
  'rest-wide:Noir:XL': 3,
  'rest-wide:Noir:XXL': 2,
  // REST WIDE Beige
  'rest-wide:Beige:XS': 0, // Out of stock example
  'rest-wide:Beige:S': 6,
  'rest-wide:Beige:M': 8,
  'rest-wide:Beige:L': 5,
  'rest-wide:Beige:XL': 2,
  'rest-wide:Beige:XXL': 1,
};

import shelterSweatNoir from '../assets/images/shelter_sweat_noir_1791729594321.jpg';
import shelterSweatBeige from '../assets/images/shelter_sweat_beige_1791729629495.jpg';
import restWideNoir from '../assets/images/rest_wide_noir_1791729608671.jpg';
import restWideBeige from '../assets/images/rest_wide_beige_1791729647894.jpg';

export const PRODUCTS: Product[] = [
  {
    id: "shelter-sweat",
    name: "SHELTER SWEAT",
    category: "Hauts",
    price: 79,
    currency: "TND",
    spec: "Matière premium · 290 GSM",
    description: "Sweatshirt oversize structuré, pensé pour un tombé irréprochable. Coton peigné lourd (290 GSM) offrant chaleur et durabilité. Finitions soignées réalisées dans nos ateliers partenaires.",
    colors: [
      {
        name: "Noir",
        hex: "#101010",
        images: [
          shelterSweatNoir
        ]
      },
      {
        name: "Beige",
        hex: "#B9A995",
        images: [
          shelterSweatBeige
        ]
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    branding: {
      embroidery: "Monogramme KŪ brodé (30x27mm) en beige #B9A995 sous le col arrière",
      label: "Étiquette tissée noire (25x12mm) sur la couture latérale gauche"
    },
    images: [
      shelterSweatNoir,
      shelterSweatBeige
    ],
    colorImages: {
      "Noir": [
        shelterSweatNoir
      ],
      "Beige": [
        shelterSweatBeige
      ]
    },
    composition: "Matière premium · 290 GSM",
    origin: "Made in Tunisia 🇹🇳",
    care: [
      "Lavage en machine à 30°C sur l'envers",
      "Essorage modéré (800 tr/min)",
      "Séchage naturel à plat à l'ombre",
      "Repassage doux à basse température"
    ],
    fit: "Coupe ample sculptée, emmanchures tombantes et bord-côtes renforcés."
  },
  {
    id: "rest-wide",
    name: "REST WIDE",
    category: "Bas",
    price: 85,
    currency: "TND",
    spec: "Matière premium · 290 GSM",
    description: "Pantalon de détente à coupe large et décontractée. Taille élastique ajustable et cordon de serrage au bas de jambe pour façonner la silhouette. Matière 290 GSM confortable au quotidien.",
    colors: [
      {
        name: "Noir",
        hex: "#101010",
        images: [
          restWideNoir
        ]
      },
      {
        name: "Beige",
        hex: "#B9A995",
        images: [
          restWideBeige
        ]
      }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    branding: {
      embroidery: "Monogramme KŪ brodé (30x27mm) sur la cuisse haute gauche",
      label: "Étiquette tissée noire (25x12mm) sur la couture latérale droite"
    },
    images: [
      restWideNoir,
      restWideBeige
    ],
    colorImages: {
      "Noir": [
        restWideNoir
      ],
      "Beige": [
        restWideBeige
      ]
    },
    composition: "Matière premium · 290 GSM",
    origin: "Made in Tunisia 🇹🇳",
    care: [
      "Lavage en machine à 30°C sur l'envers",
      "Essorage modéré (800 tr/min)",
      "Séchage naturel à plat à l'ombre",
      "Repassage doux à basse température"
    ],
    fit: "Jambe large fluide avec cordon de serrage dissimulé au bas pour deux portés distincts."
  }
];

export const SIZE_TABLE = {
  "shelter-sweat": [
    { size: "XS", chest: "114 cm", length: "66 cm", shoulder: "54 cm" },
    { size: "S", chest: "118 cm", length: "68 cm", shoulder: "56 cm" },
    { size: "M", chest: "124 cm", length: "70 cm", shoulder: "58 cm" },
    { size: "L", chest: "130 cm", length: "72 cm", shoulder: "60 cm" },
    { size: "XL", chest: "136 cm", length: "74 cm", shoulder: "62 cm" }
  ],
  "rest-wide": [
    { size: "XS", waist: "68-76 cm", hips: "104 cm", outseam: "102 cm" },
    { size: "S", waist: "74-82 cm", hips: "110 cm", outseam: "104 cm" },
    { size: "M", waist: "80-88 cm", hips: "116 cm", outseam: "106 cm" },
    { size: "L", waist: "86-94 cm", hips: "122 cm", outseam: "108 cm" },
    { size: "XL", waist: "92-102 cm", hips: "128 cm", outseam: "110 cm" }
  ]
};

export const TUNISIAN_GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili"
];
