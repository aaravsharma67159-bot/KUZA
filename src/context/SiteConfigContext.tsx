import React, { createContext, useContext, useState, useEffect } from 'react';
import heroDefaultBg from '../assets/images/kuza_brutalist_studio_1791897575205.jpg';
import atelierDefaultImg from '../assets/images/kuza_atelier_tunisia_1791199887567.jpg';

export type SectionKey =
  | 'announcement'
  | 'hero'
  | 'bundle'
  | 'collection'
  | 'philosophie'
  | 'atelier'
  | 'footer';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'announcement',
  'hero',
  'bundle',
  'collection',
  'philosophie',
  'atelier',
  'footer',
];

export interface SiteConfig {
  // 1. Hero Section CMS
  hero: {
    visible: boolean;
    bgImageUrl: string;
    coordinatesText: string;
    tagline: string;
    subTagline: string;
    originBadge: string;
    buttonText: string;
  };

  // 2. Featured Bundle (Offre Ensemble)
  bundle: {
    visible: boolean;
    title: string;
    subTagline: string;
    description: string;
    specialPrice: string;
    originalPrice: string;
    discountBadge: string;
    buttonText: string;
  };

  // 3. Announcement Top Bar
  announcement: {
    visible: boolean;
    text: string;
  };

  // 4. Philosophie Section CMS (Form Needs Space)
  philosophie: {
    visible: boolean;
    headline: string;
    subTitle: string;
    quote: string;
    paragraph: string;
    originBadge: string;
  };

  // 5. Manufacture & Atelier Section CMS
  atelier: {
    visible: boolean;
    title: string;
    subTitle: string;
    narrative: string;
    photoUrl: string;
    badge: string;
  };

  // 6. Official Contact & Store Info
  contact: {
    phone: string;
    phoneDisplay: string;
    instagramHandle: string;
    instagramUrl: string;
    flatShippingFee: string;
  };

  // 7. Sections Visibility Toggles
  sections: {
    hero: boolean;
    announcement: boolean;
    bundle: boolean;
    collection: boolean;
    philosophie: boolean;
    atelier: boolean;
    footer: boolean;
  };

  // 8. Custom dynamic order of sections on homepage
  sectionOrder: SectionKey[];
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  hero: {
    visible: true,
    bgImageUrl: heroDefaultBg,
    coordinatesText: 'LOC: 36.8065° N, 10.1815° E / TUNIS',
    tagline: 'FORM NEEDS SPACE.',
    subTagline: "MARQUE CONTEMPORAINE TUNISIENNE · DESIGN ARCHITECTURAL & COUTURE D'EXCEPTION",
    originBadge: 'CONÇU À TUNIS · FAÇONNÉ DANS NOS ATELIERS PARTENAIRES EN TUNISIE 🇹🇳',
    buttonText: 'EXPLORER LA COLLECTION ↓',
  },
  bundle: {
    visible: true,
    title: "L'ENSEMBLE STRUCTURÉ KŪZA",
    subTagline: 'SHELTER SWEAT (290 GSM) + REST WIDE (290 GSM)',
    description: "L'association architecturale complète de l'Archive 01. Deux pièces taillées dans le même molleton dense 290 GSM pour une silhouette homogène au tombé lourd et structuré.",
    specialPrice: '135,000 DT',
    originalPrice: '164,000 DT',
    discountBadge: '-29,000 DT ÉCONOMISÉS',
    buttonText: "AJOUTER L'ENSEMBLE AU PANIER",
  },
  announcement: {
    visible: true,
    text: "✨ OFFRE EXCLUSIVE ATELIER : L'ENSEMBLE FULL KŪZA À 135,000 DT · LIVRAISON 24/48H PARTOUT EN TUNISIE",
  },
  philosophie: {
    visible: true,
    headline: 'FORM NEEDS SPACE.',
    subTitle: 'PHILOSOPHIE // IDENTITÉ',
    quote: "« Le vêtement ne doit pas contraindre la silhouette. Il accompagne le corps, lui offre du confort et laisse à la forme l'espace nécessaire. »",
    paragraph: "Marque tunisienne contemporaine, KŪZA explore un vestiaire pensé autour du confort et de la simplicité. Nos pièces privilégient des volumes équilibrés qui laissent de l'espace au corps, façonnés dans un coton gratté de 290 GSM.",
    originBadge: 'KŪZA · Tunisie 🇹🇳',
  },
  atelier: {
    visible: true,
    title: 'Philosophie & Confection Tunisienne',
    subTitle: 'MANUFACTURE ARCHITECTURALE // ÉDITORIAL',
    narrative: "Chaque vêtement KŪZA défie l'obsolescence de l'industrie textile standard. Nous refusons les matières plastiques synthétiques et les coupes réductrices. Nos pièces sont développées à échelle 1:1 sur mannequin vivant dans nos ateliers historiques de Tunis.\n\nDe la découpe des patrons aux derniers points de broderie, chaque étape est exécutée dans un rayon resserré, sans sous-traitance opaque ni surproduction.",
    photoUrl: atelierDefaultImg,
    badge: 'ATELIER 01 — TUNIS SUD · CONTRÔLE QUALITÉ',
  },
  contact: {
    phone: '+216 92 929 276',
    phoneDisplay: '92 929 276',
    instagramHandle: '@kuza.tn',
    instagramUrl: 'https://www.instagram.com/kuza.tn/',
    flatShippingFee: '8,000 DT',
  },
  sections: {
    hero: true,
    announcement: true,
    bundle: true,
    collection: true,
    philosophie: true,
    atelier: true,
    footer: true,
  },
  sectionOrder: DEFAULT_SECTION_ORDER,
};

const STORAGE_KEY = 'kuza_site_config_v1';

interface SiteConfigContextType {
  siteConfig: SiteConfig;
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;
  resetSiteConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitize bundle title encoding strictly to "L'ENSEMBLE STRUCTURÉ KŪZA"
        if (parsed.bundle && parsed.bundle.title) {
          parsed.bundle.title = parsed.bundle.title
            .replace(/STRUCTUR[\u0000-\uFFFF]?/gi, 'STRUCTURÉ')
            .replace(/STRUCTUR[^\s]*/gi, 'STRUCTURÉ')
            .replace("L'ENSEMBLE STRUCTURÉ KŪZA KŪZA", "L'ENSEMBLE STRUCTURÉ KŪZA");
        }
        // Upgrade legacy default hero backdrop
        if (
          !parsed.hero?.bgImageUrl ||
          parsed.hero.bgImageUrl.includes('kuza_campaign_hero')
        ) {
          if (parsed.hero) {
            parsed.hero.bgImageUrl = heroDefaultBg;
          }
        }
        return {
          ...DEFAULT_SITE_CONFIG,
          ...parsed,
          hero: { ...DEFAULT_SITE_CONFIG.hero, ...(parsed.hero || {}) },
          bundle: { ...DEFAULT_SITE_CONFIG.bundle, ...(parsed.bundle || {}) },
          announcement: { ...DEFAULT_SITE_CONFIG.announcement, ...(parsed.announcement || {}) },
          philosophie: { ...DEFAULT_SITE_CONFIG.philosophie, ...(parsed.philosophie || {}) },
          atelier: { ...DEFAULT_SITE_CONFIG.atelier, ...(parsed.atelier || {}) },
          contact: { ...DEFAULT_SITE_CONFIG.contact, ...(parsed.contact || {}) },
          sections: { ...DEFAULT_SITE_CONFIG.sections, ...(parsed.sections || {}) },
          sectionOrder: Array.isArray(parsed.sectionOrder) && parsed.sectionOrder.length > 0
            ? parsed.sectionOrder
            : DEFAULT_SITE_CONFIG.sectionOrder,
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved site config from localStorage', e);
    }
    return DEFAULT_SITE_CONFIG;
  });

  const updateSiteConfig = (updates: Partial<SiteConfig>) => {
    setSiteConfig((prev) => {
      const merged: SiteConfig = {
        ...prev,
        ...updates,
        hero: updates.hero ? { ...prev.hero, ...updates.hero } : prev.hero,
        bundle: updates.bundle ? { ...prev.bundle, ...updates.bundle } : prev.bundle,
        announcement: updates.announcement ? { ...prev.announcement, ...updates.announcement } : prev.announcement,
        philosophie: updates.philosophie ? { ...prev.philosophie, ...updates.philosophie } : prev.philosophie,
        atelier: updates.atelier ? { ...prev.atelier, ...updates.atelier } : prev.atelier,
        contact: updates.contact ? { ...prev.contact, ...updates.contact } : prev.contact,
        sections: updates.sections ? { ...prev.sections, ...updates.sections } : prev.sections,
        sectionOrder: updates.sectionOrder ? updates.sectionOrder : prev.sectionOrder,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.error('Failed to save site config to localStorage', err);
      }
      return merged;
    });
  };

  const resetSiteConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear site config storage', e);
    }
    setSiteConfig(DEFAULT_SITE_CONFIG);
  };

  return (
    <SiteConfigContext.Provider value={{ siteConfig, updateSiteConfig, resetSiteConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = (): SiteConfigContextType => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};
