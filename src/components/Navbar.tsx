import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, User, Search, Lock, Menu, ArrowRight, X } from 'lucide-react';
import { CustomerUser } from '../types';
import { Product } from '../data/products';
import { MobileDrawer } from './MobileDrawer';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  onOpenAccount?: () => void;
  onOpenLookbook?: () => void;
  currentUser?: CustomerUser | null;
  customerName?: string;
  activeSection?: string;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  onOpenAdmin,
  onOpenAccount,
  onOpenLookbook,
  currentUser,
  customerName,
  activeSection: propActiveSection,
  products = [],
  onSelectProduct,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSection, setCurrentSection] = useState<string>(propActiveSection || 'hero');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync propActiveSection if passed
  useEffect(() => {
    if (propActiveSection) {
      setCurrentSection(propActiveSection);
    }
  }, [propActiveSection]);

  // Track active section on scroll if not controlled
  useEffect(() => {
    if (propActiveSection) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportMid = scrollY + window.innerHeight * 0.35;

      const lookbookEl = document.getElementById('lookbook') || document.getElementById('editorial');
      const philosophieEl = document.getElementById('philosophie');
      const collectionEl =
        document.getElementById('pieces') ||
        document.getElementById('collection') ||
        document.getElementById('catalogue');

      if (lookbookEl && viewportMid >= lookbookEl.offsetTop) {
        setCurrentSection('lookbook');
      } else if (philosophieEl && viewportMid >= philosophieEl.offsetTop) {
        setCurrentSection('philosophie');
      } else if (collectionEl && viewportMid >= collectionEl.offsetTop) {
        setCurrentSection('collection');
      } else {
        setCurrentSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [propActiveSection]);

  // Focus search input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Filter products by search query
  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.colors.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleLinkClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setCurrentSection(sectionId);

    if (sectionId === 'lookbook') {
      if (onOpenLookbook) {
        onOpenLookbook();
      } else {
        onNavigate('lookbook');
      }
      return;
    }

    onNavigate(sectionId);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full max-w-full h-14 lg:h-16 bg-[#101010]/95 backdrop-blur-md border-b border-[#34312D] overflow-hidden">
        {/* 1. COMPACT MOBILE HEADER: 3-ZONE HORIZONTAL BAR (< lg: h-14 px-4) */}
        <div className="lg:hidden w-full max-w-full h-14 px-4 flex items-center justify-between">
          {/* Left Zone: Hamburger Menu Icon */}
          <div className="flex items-center justify-start w-16">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer touch-manipulation"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5 text-[#E8E4DD]" />
            </button>
          </div>

          {/* Center Zone: Brand Logo KŪZA with Official Monogram */}
          <div className="flex items-center justify-center flex-1 text-center">
            <button
              onClick={() => handleLinkClick('hero')}
              className="flex items-center justify-center group text-center cursor-pointer transition-colors touch-manipulation"
              aria-label="KŪZA Accueil"
            >
              <KuzaMonogram className="w-5 h-5 text-[#B9A995] mr-2 shrink-0" />
              <KuzaLogo className="h-6 w-auto text-[#B9A995]" />
            </button>
          </div>

          {/* Right Zone: Search Icon + Shopping Bag Icon (0) */}
          <div className="flex items-center justify-end space-x-3 w-16 cursor-pointer">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer touch-manipulation"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5 stroke-[1.25]" />
            </button>

            <button
              onClick={onOpenCart}
              className="flex items-center gap-1 py-1 px-1 text-xs font-mono tracking-widest text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer touch-manipulation"
              aria-label={`Panier (${cartCount})`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.25] text-[#E8E4DD]" />
              <span className="text-[#B9A995] font-mono text-xs font-semibold">
                ({cartCount})
              </span>
            </button>
          </div>
        </div>

        {/* 2. DESKTOP 3-ZONE HEADER (>= lg: h-16 px-4 lg:px-8 max-w-[1920px]) */}
        <div className="hidden lg:flex w-full h-16 px-4 lg:px-8 items-center justify-between max-w-[1920px] mx-auto">
          {/* Zone 1 (Left Brand / Monogram): Primary Monogram placement */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => handleLinkClick('hero')}
              className="flex items-center group text-left cursor-pointer transition-colors duration-200"
              aria-label="KŪZA Accueil"
            >
              <KuzaMonogram className="w-6 h-6 text-[#B9A995] mr-2 shrink-0" />
              <KuzaLogo className="h-6 md:h-7 w-auto text-[#B9A995]" />
            </button>

            <div className="h-4 w-[1px] bg-[#34312D]" />

            <span className="inline-flex items-center text-[10px] text-[#8C8275] uppercase tracking-widest font-mono whitespace-nowrap">
              TUNIS 🇹🇳
            </span>
          </div>

          {/* Zone 2 (Center Nav Links - hidden lg:flex): mx-auto, whitespace-nowrap, responsive text & tracking */}
          <nav className="flex items-center space-x-6 xl:space-x-10 mx-auto text-[10px] xl:text-[11px] tracking-[0.15em] xl:tracking-[0.2em] uppercase font-mono text-[#E8E4DD]">
            {/* 1. COLLECTION */}
            <button
              onClick={() => handleLinkClick('collection')}
              className={`group relative py-1 uppercase whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                currentSection === 'collection' ? 'text-[#B9A995]' : 'text-[#E8E4DD] hover:text-[#B9A995]'
              }`}
            >
              COLLECTION
              <span
                className={`absolute bottom-[-4px] left-0 right-0 h-[1px] bg-[#B9A995] transition-transform duration-300 origin-left ${
                  currentSection === 'collection' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>

            {/* 2. PHILOSOPHIE */}
            <button
              onClick={() => handleLinkClick('philosophie')}
              className={`group relative py-1 uppercase whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                currentSection === 'philosophie' ? 'text-[#B9A995]' : 'text-[#E8E4DD] hover:text-[#B9A995]'
              }`}
            >
              PHILOSOPHIE
              <span
                className={`absolute bottom-[-4px] left-0 right-0 h-[1px] bg-[#B9A995] transition-transform duration-300 origin-left ${
                  currentSection === 'philosophie' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>

            {/* 3. CAMPAGNE */}
            <button
              onClick={() => handleLinkClick('lookbook')}
              className={`group relative py-1 uppercase whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer ${
                currentSection === 'lookbook' ? 'text-[#B9A995]' : 'text-[#E8E4DD] hover:text-[#B9A995]'
              }`}
            >
              CAMPAGNE
              <span
                className={`absolute bottom-[-4px] left-0 right-0 h-[1px] bg-[#B9A995] transition-transform duration-300 origin-left ${
                  currentSection === 'lookbook' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>
          </nav>

          {/* Zone 3 (Right Actions): shrink-0 */}
          <div className="flex items-center space-x-4 lg:space-x-6 shrink-0">
            {/* Subtle Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer shrink-0"
              aria-label="Rechercher une pièce"
              title="Rechercher"
            >
              <Search className="w-4 h-4 stroke-[1.25]" />
            </button>

            {/* Account / Atelier Link */}
            {onOpenAccount && (
              <button
                onClick={onOpenAccount}
                className="flex items-center gap-1.5 py-1 text-xs font-mono tracking-widest uppercase text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Espace Client & Commandes"
              >
                <User className="w-4 h-4 stroke-[1.25]" />
                <span className="text-[11px]">
                  {currentUser?.role === 'admin' ? 'ATELIER' : (customerName || 'COMPTE')}
                </span>
              </button>
            )}

            {/* Cart / Panier Button with numeric badge and borderless transparent style */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono tracking-widest uppercase text-[#E8E4DD] hover:text-[#B9A995] bg-transparent border border-transparent hover:border-[#34312D] transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
              aria-label={`Panier contenant ${cartCount} article${cartCount > 1 ? 's' : ''}`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.25]" />
              <span>PANIER</span>
              <span className="text-[#B9A995] font-mono font-semibold">({cartCount})</span>
            </button>

            {/* Discrete Admin Portal Link (small lock icon when logged in as admin) */}
            {currentUser?.role === 'admin' && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="p-1.5 text-[#8C8275] hover:text-[#B9A995] transition-colors cursor-pointer shrink-0"
                title="Accès Espace Gestion Stock & Logistique"
                aria-label="Administration Stock & Logistique"
              >
                <Lock className="w-3.5 h-3.5 stroke-[1.25]" />
              </button>
            )}
          </div>
        </div>

      {/* Sleek Search Dropdown Overlay */}
      {isSearchOpen && (
        <div className="border-t border-[#34312D] bg-[#101010]/95 backdrop-blur-md px-4 sm:px-6 lg:px-16 py-3 sm:py-4 animate-fadeIn">
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 stroke-[1.25] text-[#8C8275] absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="RECHERCHER UNE PIÈCE, UN MODÈLE, UN COLORIS..."
                className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] placeholder-[#8C8275] text-xs font-mono tracking-widest pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#B9A995] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSearchOpen(false);
                  if (e.key === 'Enter') handleLinkClick('collection');
                }}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 text-[#8C8275] hover:text-[#E8E4DD] transition-colors cursor-pointer"
                aria-label="Fermer la recherche"
              >
                <X className="w-4 h-4 stroke-[1.25]" />
              </button>
            </div>

            {/* Live Search Results */}
            {searchQuery.trim() && (
              <div className="mt-3 bg-[#181818] border border-[#34312D] max-h-80 overflow-y-auto no-scrollbar divide-y divide-[#34312D]">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (onSelectProduct) {
                          onSelectProduct(product);
                        } else {
                          handleLinkClick('collection');
                        }
                      }}
                      className="w-full p-3 flex items-center justify-between hover:bg-[#202020] transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-12 object-cover border border-[#34312D]/60"
                          />
                        )}
                        <div>
                          <p className="text-xs font-serif text-[#E8E4DD] group-hover:text-[#B9A995] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[10px] font-mono text-[#8C8275] tracking-wider mt-0.5">
                            {product.colors.map((c) => c.name).join(' · ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#E8E4DD]">
                          {product.price.toFixed(3)} DT
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[1.25] text-[#8C8275] group-hover:text-[#B9A995] group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-mono text-[#8C8275] tracking-wider">
                    AUCUN MODÈLE CORRESPONDANT POUR &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      </header>

      {/* 3. DECOUPLED MOBILE NAVIGATION DRAWER */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentSection={currentSection}
        onNavigate={handleLinkClick}
        onOpenAccount={onOpenAccount}
        onOpenAdmin={onOpenAdmin}
        currentUser={currentUser}
        customerName={customerName}
      />
    </>
  );
};
