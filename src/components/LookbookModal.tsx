import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../data/products';
import campaignHero from '../assets/images/kuza_brutalist_studio_1791897575205.jpg';
import atelierImg from '../assets/images/kuza_atelier_tunisia_1791199887567.jpg';
import textileMacro from '../assets/images/kuza_textile_macro_1791199876246.jpg';
import shelterSweatBeige from '../assets/images/shelter_sweat_beige_1791729629495.jpg';
import restWideBeige from '../assets/images/rest_wide_beige_1791729647894.jpg';

interface LookbookItem {
  id: string;
  lookNumber: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  productId?: string;
  productName?: string;
}

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  products?: Product[];
  onScrollToEditorial?: () => void;
}

const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'look-01',
    lookNumber: 'LOOK 01',
    title: 'ENSEMBLE FULL KŪZA',
    subtitle: 'ARCHIVE 01 // NOIR & SABLE',
    imageUrl: campaignHero,
    productId: 'shelter-sweat',
    productName: 'SHELTER SWEAT',
  },
  {
    id: 'look-02',
    lookNumber: 'LOOK 02',
    title: 'MATIÈRE TEXTILE 290 GSM',
    subtitle: 'COTON GRATTÉ · FILAGE LOURD',
    imageUrl: textileMacro,
    productId: 'shelter-sweat',
    productName: 'SHELTER SWEAT',
  },
  {
    id: 'look-03',
    lookNumber: 'LOOK 03',
    title: 'ATELIER TUNIS SUD',
    subtitle: 'CONFECTION & CONTRÔLE QUALITÉ',
    imageUrl: atelierImg,
  },
  {
    id: 'look-04',
    lookNumber: 'LOOK 04',
    title: 'SABLE & SILHOUETTE',
    subtitle: 'SHELTER SWEAT // BEIGE SABLE (290 GSM)',
    imageUrl: shelterSweatBeige,
    productId: 'shelter-sweat',
    productName: 'SHELTER SWEAT',
  },
  {
    id: 'look-05',
    lookNumber: 'LOOK 05',
    title: 'REST WIDE DÉTENTE',
    subtitle: 'PANTALON LARGE // BEIGE SABLE (290 GSM)',
    imageUrl: restWideBeige,
    productId: 'rest-wide',
    productName: 'REST WIDE',
  },
];

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products = [],
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : LOOKBOOK_ITEMS.length - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < LOOKBOOK_ITEMS.length - 1 ? prev + 1 : 0));
  }, []);

  // Keyboard navigation & touch swipe
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentItem = LOOKBOOK_ITEMS[activeIndex];
  const linkedProduct = currentItem.productId
    ? products.find((p) => p.id === currentItem.productId)
    : undefined;

  const padNum = (n: number) => String(n + 1).padStart(2, '0');
  const totalNum = String(LOOKBOOK_ITEMS.length).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lookbook-title"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#101010] text-[#E8E4DD] select-none animate-fadeIn overflow-hidden"
    >
      {/* 1. HEADER BAR */}
      <div className="w-full h-14 sm:h-16 px-6 sm:px-12 border-b border-[#34312D] flex items-center justify-between bg-[#101010]/95 z-20">
        <span
          id="lookbook-title"
          className="text-xs font-mono tracking-widest text-[#8C8275] uppercase truncate pr-4"
        >
          KŪZA // CAMPAGNE ÉDITORIALE · ARCHIVE 01
        </span>

        <div className="flex items-center gap-6 shrink-0 font-mono text-xs text-[#E8E4DD]">
          <span className="tracking-widest">
            {padNum(activeIndex)} / {totalNum}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer border border-[#34312D] hover:border-[#B9A995]"
            aria-label="Fermer la campagne"
          >
            <X className="w-4 h-4 stroke-[1.25]" />
          </button>
        </div>
      </div>

      {/* 2. MAIN FULL-BLEED VISUAL AREA (80vh) */}
      <div className="relative flex-1 w-full h-[80vh] flex items-center justify-center bg-[#101010] overflow-hidden px-4 sm:px-16 py-6">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className="w-full h-full object-contain max-h-[78vh] transition-all duration-700 ease-out transform-gpu will-change-transform"
            style={{ filter: 'none' }}
          />
        </div>

        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-[#101010]/80 border border-[#34312D] text-[#E8E4DD] hover:text-[#B9A995] hover:border-[#B9A995] transition-all cursor-pointer z-20 backdrop-blur-sm"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.25]" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-[#101010]/80 border border-[#34312D] text-[#E8E4DD] hover:text-[#B9A995] hover:border-[#B9A995] transition-all cursor-pointer z-20 backdrop-blur-sm"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.25]" />
        </button>
      </div>

      {/* 3. BOTTOM MINIMALIST CAPTION BAR */}
      <div className="w-full h-16 sm:h-20 px-6 sm:px-12 border-t border-[#34312D] bg-[#141414] flex items-center justify-between z-20 font-mono text-xs">
        <div className="space-y-0.5 truncate pr-4">
          <span className="text-[#E8E4DD] font-semibold tracking-wider block uppercase">
            {currentItem.lookNumber} — {currentItem.title}
          </span>
          <span className="text-[10px] text-[#B9A995] tracking-widest block uppercase">
            {currentItem.subtitle}
          </span>
        </div>

        {linkedProduct && (
          <button
            onClick={() => {
              onClose();
              if (onSelectProduct) {
                onSelectProduct(linkedProduct);
              }
            }}
            className="flex items-center gap-2 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer shrink-0 uppercase tracking-widest text-[11px] font-bold group"
          >
            <span>VOIR LA PIÈCE</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.25] text-[#B9A995] group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
