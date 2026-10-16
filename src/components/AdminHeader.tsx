import React from 'react';
import {
  Boxes,
  Tag,
  ShoppingBag,
  TrendingUp,
  History,
  PackageCheck,
  Layout,
  BarChart3,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

export type AdminTabType =
  | 'inventory'
  | 'products'
  | 'orders'
  | 'sales'
  | 'analytics'
  | 'audit'
  | 'entries'
  | 'promotions'
  | 'cms';

export interface AdminHeaderProps {
  activeTab: AdminTabType;
  onSelectTab: (tab: AdminTabType) => void;
  onClose: () => void;
  onLogout: () => void;
  totalUnitsInStock?: number;
  totalCatalogCount?: number;
  ordersCount?: number;
  salesCount?: number;
  stockLogsCount?: number;
  stockEntriesCount?: number;
  promotionsCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onSelectTab,
  onClose,
  onLogout,
  totalUnitsInStock = 0,
  totalCatalogCount = 0,
  ordersCount = 0,
  salesCount = 0,
  stockLogsCount = 0,
  stockEntriesCount = 0,
  promotionsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#101010] border-b border-[#34312D] shadow-lg">
      {/* ROW 1: TOP BRAND & CONTROL BAR */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-[#34312D]/60 bg-[#141414]">
        {/* Left: Retour Boutique */}
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono uppercase tracking-wider text-[#E8E4DD] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 text-[#B9A995]" />
            <span className="hidden sm:inline">RETOUR BOUTIQUE</span>
            <span className="sm:hidden">RETOUR</span>
          </button>
        </div>

        {/* Center: Brand Title with Monogram & Logo */}
        <div className="flex items-center justify-center gap-2">
          <KuzaMonogram className="w-5 h-5 text-[#B9A995] shrink-0" />
          <KuzaLogo className="h-5 w-auto text-[#E8E4DD] mr-2" />
          <span className="text-[#8C8275] font-mono text-xs hidden sm:inline">·</span>
          <span
            className="font-serif text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase text-[#B9A995] text-center hidden sm:inline"
            style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
          >
            DIRECTOIRE STOCK & LOGISTIQUE
          </span>
        </div>

        {/* Right: Verrouiller Stock */}
        <div className="flex items-center">
          <button
            onClick={onLogout}
            title="Verrouiller le Directoire Stock et retourner à la boutique"
            className="flex items-center px-3 py-1.5 text-xs font-mono text-[#E8E4DD] hover:text-amber-400 bg-[#181818] border border-[#34312D] hover:border-amber-400 transition-colors cursor-pointer shrink-0"
            aria-label="Verrouiller Stock & Logistique"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            <span className="hidden sm:inline">Verrouiller Stock</span>
            <span className="sm:hidden">Verrouiller</span>
          </button>
        </div>
      </div>

      {/* ROW 2: MODERN RESPONSIVE & MOBILE-FRIENDLY ADMIN TAB NAVIGATION BAR WITH GRADIENT MASKS */}
      <div className="relative w-full bg-[#181818] border-b border-[#34312D] py-2.5 px-2 md:px-6 flex items-center overflow-hidden z-40">
        {/* Left Fade Mask */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#181818] to-transparent z-10 pointer-events-none" />

        {/* Right Fade Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#181818] to-transparent z-10 pointer-events-none" />

        {/* Tab Scroll Track */}
        <nav
          className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory touch-pan-x px-4 w-full scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* 1. STOCKS */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('inventory');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <Boxes className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'inventory' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
            <span>STOCKS <span className="font-mono tabular-nums">({totalUnitsInStock})</span></span>
          </button>

          {/* 2. PIÈCES */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('products');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <Tag className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'products' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
            <span>PIÈCES <span className="font-mono tabular-nums">({totalCatalogCount})</span></span>
          </button>

          {/* 3. COMMANDES */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('orders');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <ShoppingBag className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'orders' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
            <span>COMMANDES <span className="font-mono tabular-nums">({ordersCount})</span></span>
          </button>

          {/* 4. VENTES */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('sales');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'sales'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <TrendingUp className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'sales' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
            <span>VENTES <span className="font-mono tabular-nums">({salesCount})</span></span>
          </button>

          {/* 5. STATISTIQUES & ANALYTICS */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('analytics');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'analytics' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
            <span>STATISTIQUES & ANALYTICS</span>
          </button>

          {/* 6. TRAÇABILITÉ */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('audit');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <History className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'audit' ? 'text-[#101010]' : 'text-[#96918A]'}`} />
            <span>TRAÇABILITÉ <span className="font-mono tabular-nums">({stockLogsCount})</span></span>
          </button>

          {/* 7. BONS D'ENTRÉE */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('entries');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'entries'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <PackageCheck className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'entries' ? 'text-[#101010]' : 'text-emerald-400'}`} />
            <span>BONS D'ENTRÉE (RÉCEPTION STOCK) <span className="font-mono tabular-nums">({stockEntriesCount})</span></span>
          </button>

          {/* 8. PROMOTIONS */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('promotions');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'promotions'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <Tag className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'promotions' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
            <span>PROMOTIONS <span className="font-mono tabular-nums">({promotionsCount})</span></span>
          </button>

          {/* 9. PERSONNALISATION SITE (CMS) */}
          <button
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              onSelectTab('cms');
            }}
            className={`shrink-0 snap-center flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'cms'
                ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-md ring-1 ring-[#E8E4DD]'
                : 'bg-[#101010]/60 text-[#A0988E] hover:text-[#E8E4DD] hover:bg-[#101010] border border-[#34312D]/60'
            }`}
          >
            <Layout className={`w-3.5 h-3.5 md:w-4 md:h-4 ${activeTab === 'cms' ? 'text-[#101010]' : 'text-[#B9A995]'}`} />
            <span>PERSONNALISATION SITE (CMS)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
