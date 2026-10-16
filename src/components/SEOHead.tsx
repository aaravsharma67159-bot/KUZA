import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'KŪZA | Marque Contemporaine & Streetwear Oversized Tunisie',
  description = 'Découvrez KŪZA, brand de vêtements contemporain en Tunisie. Coupes oversized architecturales en coton lourd 290 GSM, sweats et joggings façonnés dans nos ateliers tunisiens. Paiement à la livraison.',
  keywords = 'vetement tunisie, brand tunisie, jogging tunisie, oversized tunisie, sweat oversized tunisie, streetwear tunisie, mode tunisie, kuza, ensemble jogging tunisie, coton 290 GSM',
  canonicalUrl = 'https://kuza.tn/',
  ogImage = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${nameOrProperty}"]`
        : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', nameOrProperty);
        } else {
          el.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('description', description);
    setMeta('keywords', keywords);

    // 3. Local Geographic SEO Tunis
    setMeta('geo.region', 'TN-11');
    setMeta('geo.placename', 'Tunis');
    setMeta('geo.position', '36.8065;10.1815');
    setMeta('ICBM', '36.8065, 10.1815');

    // 4. OpenGraph
    setMeta('og:site_name', 'KŪZA', true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:locale', 'fr_TN', true);
    setMeta('og:type', 'website', true);

    // 5. Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // 6. Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);
  }, [title, description, keywords, canonicalUrl, ogImage]);

  return null;
};
