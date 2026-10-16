import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  RotateCcw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Layers,
  Sliders,
  Tag,
  Maximize2,
  ExternalLink,
  Save,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import { Product, ProductColor, getVariantKey } from '../data/products';
import { InventoryMap, OrderDetails, SalesTransaction } from '../types';
import { formatTND } from '../utils/currency';
import { fileToOptimizedDataUrl } from '../utils/imageUpload';
import { PhotoLightbox } from './PhotoLightbox';

import shelterSweatNoir from '../assets/images/shelter_sweat_noir_1791729594321.jpg';
import shelterSweatBeige from '../assets/images/shelter_sweat_beige_1791729629495.jpg';
import restWideNoir from '../assets/images/rest_wide_noir_1791729608671.jpg';
import restWideBeige from '../assets/images/rest_wide_beige_1791729647894.jpg';

interface PieceManagementProps {
  products: Product[];
  inventory: InventoryMap;
  orders?: OrderDetails[];
  salesHistory?: SalesTransaction[];
  onUpdateProducts: (newProducts: Product[]) => void;
  onUpdateInventory: (newInventory: InventoryMap) => void;
  onResetDefaults: () => void;
  showNotice: (msg: string) => void;
}

const ALL_AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const PieceManagement: React.FC<PieceManagementProps> = ({
  products,
  inventory,
  orders = [],
  salesHistory = [],
  onUpdateProducts,
  onUpdateInventory,
  onResetDefaults,
  showNotice,
}) => {
  // Toolbar state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'Hauts' | 'Bas' | 'visible' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'sales' | 'stock' | 'price-asc' | 'price-desc' | 'order'>('sales');

  // Interactive swatch preview per card (stores [productId]: activeColorName)
  const [activeCardColor, setActiveCardColor] = useState<Record<string, string>>({});

  // Product CRUD modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Full-screen image preview lightbox
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    index: number;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Calculate sales metrics per product
  const getProductSalesPerformance = (product: Product) => {
    // 1. Try calculating from orders
    let count = 0;
    let revenue = 0;

    orders.forEach((ord) => {
      ord.items?.forEach((item) => {
        if (item.product?.id === product.id || item.id?.startsWith(product.id)) {
          count += item.quantity || 1;
          revenue += (item.product?.price || product.price) * (item.quantity || 1);
        }
      });
    });

    // 2. Try calculating from sales history if order items are empty
    if (count === 0 && salesHistory.length > 0) {
      salesHistory.forEach((tx) => {
        tx.items?.forEach((it) => {
          if (it.productId === product.id || it.name === product.name) {
            count += it.qty || 1;
            revenue += (it.unitPrice || product.price) * (it.qty || 1);
          }
        });
      });
    }

    // 3. Fallback to realistic atelier figures requested by specifications
    if (count === 0) {
      if (product.id === 'shelter-sweat') {
        count = 24;
        revenue = 1896;
      } else if (product.id === 'rest-wide') {
        count = 18;
        revenue = 1530;
      } else {
        count = 12;
        revenue = count * product.price;
      }
    }

    return {
      count,
      revenue,
      formattedRevenue: formatTND(revenue),
    };
  };

  // Reorder positions in catalog (affects storefront presentation)
  const handleMoveProduct = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    onUpdateProducts(newProducts);
    showNotice(`Ordre du catalogue actualisé (${temp.name})`);
  };

  // Toggle storefront visibility
  const handleToggleVisibility = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const nextState = p.visible !== false ? false : true;
        showNotice(`Pièce "${p.name}" ${nextState ? 'publiée' : 'masquée'}`);
        return { ...p, visible: nextState };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    const updated = products.filter((x) => x.id !== productId);
    onUpdateProducts(updated);
    setConfirmDeleteId(null);
    showNotice(`Pièce "${p?.name || productId}" supprimée du catalogue`);
  };

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchId = p.id.toLowerCase().includes(q);
          const matchCategory = p.category?.toLowerCase().includes(q);
          const matchSpec = p.spec?.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchCategory && !matchSpec && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (filterCategory === 'Hauts') {
          return p.category === 'Hauts' || p.id.includes('sweat') || p.name.includes('SWEAT');
        }
        if (filterCategory === 'Bas') {
          return p.category === 'Bas' || p.id.includes('pantalon') || p.name.includes('REST') || p.name.includes('WIDE');
        }
        if (filterCategory === 'visible') {
          return p.visible !== false;
        }
        if (filterCategory === 'hidden') {
          return p.visible === false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'sales') {
          const salesA = getProductSalesPerformance(a).count;
          const salesB = getProductSalesPerformance(b).count;
          return salesB - salesA;
        }
        if (sortBy === 'stock') {
          const stockA = a.colors.reduce((sum, c) => {
            return sum + a.sizes.reduce((sSum, s) => sSum + (inventory[getVariantKey(a.id, c.name, s)] || 0), 0);
          }, 0);
          const stockB = b.colors.reduce((sum, c) => {
            return sum + b.sizes.reduce((sSum, s) => sSum + (inventory[getVariantKey(b.id, c.name, s)] || 0), 0);
          }, 0);
          return stockB - stockA;
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        return 0; // default original order
      });
  }, [products, searchQuery, filterCategory, sortBy, inventory, orders, salesHistory]);

  // Counts for pills
  const counts = useMemo(() => {
    return {
      all: products.length,
      hauts: products.filter((p) => p.category === 'Hauts' || p.name.includes('SWEAT')).length,
      bas: products.filter((p) => p.category === 'Bas' || p.name.includes('WIDE')).length,
      visible: products.filter((p) => p.visible !== false).length,
      hidden: products.filter((p) => p.visible === false).length,
    };
  }, [products]);

  // Handle open modal for creation
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. SECTION TITLE & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#34312D] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B9A995] bg-[#141414] border border-[#34312D] px-2 py-0.5">
              ATELIER GESTIONNAIRE
            </span>
            <span className="text-xs font-mono text-[#96918A]">
              · {products.length} référence{products.length > 1 ? 's' : ''} active{products.length > 1 ? 's' : ''}
            </span>
          </div>
          <h2
            className="text-2xl font-serif text-[#E8E4DD] mt-1"
            style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
          >
            Gestion du Catalogue KŪZA
          </h2>
          <p className="text-xs text-[#96918A] font-light mt-0.5">
            Créez de nouvelles silhouettes, paramétrez les stocks par taille (XS à XXL) et ordonnez la collection.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ NOUVELLE PIÈCE</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Restaurer le catalogue original KŪZA avec les visuels et spécifications de base ?')) {
                onResetDefaults();
                showNotice('Catalogue initial restauré avec succès');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-[#181818] border border-[#34312D] hover:border-amber-400 text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            title="Restaurer le catalogue original KŪZA"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Restaurer catalogue initial</span>
          </button>
        </div>
      </div>

      {/* 2. CATALOGUE SEARCH & FILTER TOOLBAR */}
      <div className="p-4 bg-[#141414] border border-[#34312D] space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#96918A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une pièce, SKU, matière, coupe..."
              className="w-full pl-10 pr-9 py-2 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] text-xs text-[#E8E4DD] placeholder-[#96918A]/60 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#96918A] hover:text-[#E8E4DD] p-0.5"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-[#96918A] uppercase tracking-wider shrink-0 hidden sm:inline">
              Trier par :
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-[#181818] border border-[#34312D] text-xs font-mono text-[#E8E4DD] px-3 py-2 focus:border-[#B9A995] focus:outline-none cursor-pointer"
            >
              <option value="sales">🔥 Plus vendus</option>
              <option value="stock">📦 Stock disponible</option>
              <option value="price-asc">💵 Prix : Croissant</option>
              <option value="price-desc">💎 Prix : Décroissant</option>
              <option value="order">🗂️ Ordre boutique</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-[#34312D]/60">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#96918A] mr-1 shrink-0">
            Filtres :
          </span>

          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
              filterCategory === 'all'
                ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:border-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            Tous ({counts.all})
          </button>

          <button
            onClick={() => setFilterCategory('Hauts')}
            className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
              filterCategory === 'Hauts'
                ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:border-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            Hauts ({counts.hauts})
          </button>

          <button
            onClick={() => setFilterCategory('Bas')}
            className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border ${
              filterCategory === 'Bas'
                ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:border-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            Bas ({counts.bas})
          </button>

          <button
            onClick={() => setFilterCategory('visible')}
            className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
              filterCategory === 'visible'
                ? 'bg-emerald-400 text-[#101010] border-emerald-400 font-semibold'
                : 'bg-[#181818] text-emerald-400/80 border-[#34312D] hover:border-emerald-500/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Visibles ({counts.visible})</span>
          </button>

          <button
            onClick={() => setFilterCategory('hidden')}
            className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer shrink-0 border flex items-center gap-1.5 ${
              filterCategory === 'hidden'
                ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-semibold'
                : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:border-[#96918A]'
            }`}
          >
            <span>Masqués ({counts.hidden})</span>
          </button>

          {(searchQuery || filterCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
              }}
              className="ml-auto text-[11px] font-mono text-[#B9A995] hover:underline cursor-pointer shrink-0"
            >
              Réinitialiser filtres
            </button>
          )}
        </div>
      </div>

      {/* 3. PRODUCT CARDS GRID */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-[#181818] border border-[#34312D] space-y-3">
          <p className="text-sm font-mono text-[#96918A]">
            Aucune pièce ne correspond à vos critères de recherche.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
            }}
            className="px-4 py-2 bg-[#141414] border border-[#34312D] text-xs font-mono text-[#E8E4DD] hover:border-[#B9A995]"
          >
            Afficher toutes les pièces ({products.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((p, index) => {
            const isVisible = p.visible !== false;

            // Total stock in inventory
            const totalStockForProduct = p.colors.reduce((sum, c) => {
              return (
                sum +
                p.sizes.reduce((sSum, s) => {
                  const key = getVariantKey(p.id, c.name, s);
                  return sSum + (inventory[key] || 0);
                }, 0)
              );
            }, 0);

            // Active preview color for this card
            const selectedColorName = activeCardColor[p.id] || p.colors[0]?.name || 'Noir';
            const selectedColorObj = p.colors.find((c) => c.name === selectedColorName) || p.colors[0];

            // Resolve thumbnail image for currently selected color
            let cardImage = '';
            if (p.colorImages?.[selectedColorName]?.[0]) {
              cardImage = p.colorImages[selectedColorName][0];
            } else if (selectedColorObj?.images?.[0]) {
              cardImage = selectedColorObj.images[0];
            } else if (p.images?.[0]) {
              cardImage = p.images[0];
            } else {
              cardImage = p.id.includes('sweat') ? shelterSweatNoir : restWideNoir;
            }

            // Sales performance metrics
            const salesMetrics = getProductSalesPerformance(p);

            // Bundle inclusion condition
            const isInBundle =
              p.id === 'shelter-sweat' ||
              p.id === 'rest-wide' ||
              p.name.toLowerCase().includes('sweat') ||
              p.name.toLowerCase().includes('rest');

            return (
              <div
                key={p.id}
                className={`p-5 sm:p-6 bg-[#181818] border transition-all flex flex-col justify-between ${
                  isVisible ? 'border-[#34312D]' : 'border-[#34312D]/40 opacity-80'
                }`}
              >
                <div>
                  {/* Top Header: Category / Spec / Visibility / Position Reorder */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#34312D]/70">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#B9A995] bg-[#141414] border border-[#34312D] px-2 py-0.5 font-bold">
                        {p.category || (p.id.includes('sweat') ? 'Hauts' : 'Bas')}
                      </span>
                      <span className="text-[10px] font-mono text-[#96918A]">
                        {p.spec || '290 GSM'}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 border ${
                          isVisible
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5'
                            : 'border-[#34312D] text-[#96918A] bg-[#141414]'
                        }`}
                      >
                        {isVisible ? 'Visible en boutique' : 'Masqué (Brouillon)'}
                      </span>
                    </div>

                    {/* Position Reorder Controls */}
                    <div className="flex items-center gap-1 bg-[#141414] border border-[#34312D] p-0.5 shrink-0">
                      <button
                        onClick={() => handleMoveProduct(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-[#96918A] hover:text-[#E8E4DD] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Monter d'une position dans l'ordre d'affichage"
                        aria-label="Monter la pièce"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-[#96918A] px-1 select-none">
                        #{index + 1}
                      </span>
                      <button
                        onClick={() => handleMoveProduct(index, 1)}
                        disabled={index === products.length - 1}
                        className="p-1 text-[#96918A] hover:text-[#E8E4DD] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Descendre d'une position dans l'ordre d'affichage"
                        aria-label="Descendre la pièce"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Card Content Row */}
                  <div className="flex gap-4 sm:gap-5">
                    {/* Natural RGB Thumbnail with zoom */}
                    <div className="relative w-28 sm:w-32 aspect-[3/4] bg-[#141414] border border-[#34312D] overflow-hidden shrink-0 group">
                      <img
                        src={cardImage}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ filter: 'none' }}
                      />

                      {/* Zoom trigger */}
                      <button
                        onClick={() =>
                          setLightboxData({
                            images: [cardImage],
                            index: 0,
                            title: p.name,
                            subtitle: `${selectedColorName} · ${p.spec}`,
                          })
                        }
                        className="absolute bottom-1.5 right-1.5 p-1 bg-[#101010]/85 border border-[#34312D] text-[#E8E4DD] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Agrandir la photo"
                      >
                        <Maximize2 className="w-3 h-3 text-[#B9A995]" />
                      </button>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#E8E4DD] tracking-wide">
                          {p.name}
                        </h3>

                        <div className="text-base font-mono font-bold text-[#E8E4DD] mt-1 tabular-nums">
                          {formatTND(p.price)}
                        </div>

                        <p className="text-xs text-[#96918A] line-clamp-2 mt-1.5 font-light leading-relaxed">
                          {p.description}
                        </p>

                        {/* Interactive Color Swatch Dots */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase font-mono text-[#96918A]">
                            Coloris :
                          </span>
                          <div className="flex items-center gap-1.5">
                            {p.colors.map((c) => {
                              const isSelected = selectedColorName === c.name;
                              return (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() =>
                                    setActiveCardColor((prev) => ({
                                      ...prev,
                                      [p.id]: c.name,
                                    }))
                                  }
                                  onMouseEnter={() =>
                                    setActiveCardColor((prev) => ({
                                      ...prev,
                                      [p.id]: c.name,
                                    }))
                                  }
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-[#E8E4DD] bg-[#222222] text-[#E8E4DD]'
                                      : 'border-[#34312D] bg-[#141414] text-[#96918A] hover:border-[#96918A]'
                                  }`}
                                  title={`Voir la photo ${c.name}`}
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                  <span>{c.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Sizes list */}
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-mono text-[#96918A]">
                          Tailles :
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {p.sizes.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-mono px-1.5 py-0.5 bg-[#141414] border border-[#34312D] text-[#E8E4DD]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bundle Promo Badge */}
                  {isInBundle && (
                    <div className="mt-3.5 px-3 py-1.5 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] flex items-center gap-2 text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>✨ Inclus dans l'Offre Ensemble (135,000 DT)</span>
                    </div>
                  )}

                  {/* Sales Performance Row */}
                  <div className="mt-2.5 px-3 py-2 bg-[#141414] border border-[#34312D] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#E8E4DD]">
                      <TrendingUp className="w-3.5 h-3.5 text-[#B9A995] shrink-0" />
                      <span>
                        Période : <strong className="text-[#E8E4DD]">{salesMetrics.count} ventes</strong> ce mois
                      </span>
                    </div>
                    <div className="text-[#96918A]">
                      Chiffre d'affaires : <strong className="text-[#B9A995]">{salesMetrics.formattedRevenue}</strong>
                    </div>
                  </div>

                  {/* Stock Total Summary */}
                  <div className="mt-2 flex items-center justify-between text-xs font-mono px-1 text-[#96918A]">
                    <span>
                      {p.colors.length} coloris · {p.sizes.length} tailles
                    </span>
                    <span className="text-[#E8E4DD]">
                      Stock total disponible : <strong>{totalStockForProduct} pcs</strong>
                    </span>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-4 mt-4 border-t border-[#34312D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisibility(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#34312D] hover:border-[#E8E4DD] text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
                    >
                      {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isVisible ? 'Masquer' : 'Publier'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#B9A995]" />
                      <span>Modifier</span>
                    </button>
                  </div>

                  {confirmDeleteId === p.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-400 font-mono">Confirmer ?</span>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="px-2.5 py-1 bg-rose-600 text-white text-xs font-mono cursor-pointer"
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 bg-[#141414] border border-[#34312D] text-xs font-mono text-[#96918A] cursor-pointer"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="p-2 text-[#96918A] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer la pièce"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. ENHANCED 4-STEP PRODUCT CREATION & EDIT MODAL */}
      {isModalOpen && (
        <FourStepProductModal
          initialProduct={editingProduct}
          existingInventory={inventory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={(savedProduct, sizeStockMatrix) => {
            let updatedList: Product[];
            if (editingProduct) {
              updatedList = products.map((x) => (x.id === savedProduct.id ? savedProduct : x));
              showNotice(`Pièce "${savedProduct.name}" modifiée avec succès`);
            } else {
              updatedList = [...products, savedProduct];
              showNotice(`Nouvelle pièce "${savedProduct.name}" créée`);
            }

            // Save product list
            onUpdateProducts(updatedList);

            // Update inventory with allocations
            const nextInv = { ...inventory };
            Object.entries(sizeStockMatrix).forEach(([key, qty]) => {
              nextInv[key] = qty;
            });
            onUpdateInventory(nextInv);

            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Lightbox for zooming photos */}
      {lightboxData && (
        <PhotoLightbox
          isOpen={true}
          images={lightboxData.images}
          initialIndex={lightboxData.index}
          productName={lightboxData.title}
          subtitle={lightboxData.subtitle}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
};

// ========================================================
// 4-STEP PRODUCT MODAL SUB-COMPONENT
// ========================================================

interface FourStepProductModalProps {
  initialProduct: Product | null;
  existingInventory: InventoryMap;
  onClose: () => void;
  onSave: (product: Product, sizeStockMatrix: Record<string, number>) => void;
}

const FourStepProductModal: React.FC<FourStepProductModalProps> = ({
  initialProduct,
  existingInventory,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialProduct;
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // STEP 1 STATE: Basic Info
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState<string>(
    initialProduct?.category || (initialProduct?.id?.includes('sweat') ? 'Hauts' : 'Bas')
  );
  const [price, setPrice] = useState<string>(initialProduct?.price !== undefined ? initialProduct.price.toString() : '79');
  const [spec, setSpec] = useState(initialProduct?.spec || 'Matière premium · 290 GSM');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [origin, setOrigin] = useState(initialProduct?.origin || 'Made in Tunisia 🇹🇳');
  const [fit, setFit] = useState(initialProduct?.fit || 'Coupe ample sculptée, tombé fluide.');

  // STEP 2 STATE: Sizes & Stock Matrix
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    initialProduct?.sizes && initialProduct.sizes.length > 0
      ? initialProduct.sizes
      : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  );

  // STEP 3 STATE: Colors & Images
  const [colors, setColors] = useState<ProductColor[]>(
    initialProduct?.colors && initialProduct.colors.length > 0
      ? initialProduct.colors
      : [
          { name: 'Noir', hex: '#101010' },
          { name: 'Beige', hex: '#B9A995' },
        ]
  );

  const [colorImages, setColorImages] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    const cols =
      initialProduct?.colors && initialProduct.colors.length > 0
        ? initialProduct.colors
        : [
            { name: 'Noir', hex: '#101010' },
            { name: 'Beige', hex: '#B9A995' },
          ];

    cols.forEach((c) => {
      if (initialProduct?.colorImages?.[c.name] && initialProduct.colorImages[c.name].length > 0) {
        map[c.name] = [...initialProduct.colorImages[c.name]];
      } else if (c.images && c.images.length > 0) {
        map[c.name] = [...c.images];
      } else {
        // Natural garment photography default
        map[c.name] = [c.name === 'Noir' ? shelterSweatNoir : shelterSweatBeige];
      }
    });
    return map;
  });

  // Stock allocation matrix state: [variantKey: string]: number
  const [stockMatrix, setStockMatrix] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    const prodId = initialProduct?.id || 'temp-product';
    const cols =
      initialProduct?.colors && initialProduct.colors.length > 0
        ? initialProduct.colors
        : [{ name: 'Noir', hex: '#101010' }, { name: 'Beige', hex: '#B9A995' }];
    const sizes =
      initialProduct?.sizes && initialProduct.sizes.length > 0
        ? initialProduct.sizes
        : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    cols.forEach((c) => {
      sizes.forEach((s) => {
        const key = getVariantKey(prodId, c.name, s);
        map[key] = existingInventory[key] !== undefined ? existingInventory[key] : 8;
      });
    });
    return map;
  });

  // STEP 4 STATE: Publication & Preview
  const [isVisible, setIsVisible] = useState(
    initialProduct?.visible !== undefined ? initialProduct.visible : true
  );

  // Dynamic preview state in Step 4
  const [previewColor, setPreviewColor] = useState<string>(colors[0]?.name || 'Noir');

  // New color chip inputs
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#101010');
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  // Toggle size inclusion
  const toggleSize = (s: string) => {
    if (selectedSizes.includes(s)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((x) => x !== s));
      }
    } else {
      setSelectedSizes([...selectedSizes, s]);
    }
  };

  // Quick fill stock matrix
  const handleQuickFill = (val: number) => {
    const prodId = initialProduct?.id || 'temp-product';
    const updated = { ...stockMatrix };
    colors.forEach((c) => {
      selectedSizes.forEach((s) => {
        const key = getVariantKey(prodId, c.name, s);
        updated[key] = val;
      });
    });
    setStockMatrix(updated);
  };

  // Add new color
  const handleAddColor = () => {
    const clean = newColorName.trim();
    if (!clean) return;
    if (colors.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      setErrorMsg('Ce coloris existe déjà');
      return;
    }
    const newCol: ProductColor = {
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      hex: newColorHex,
      images: [],
    };
    setColors([...colors, newCol]);
    setColorImages({
      ...colorImages,
      [newCol.name]: [shelterSweatNoir],
    });
    setNewColorName('');
    setErrorMsg('');
  };

  // Remove color
  const handleRemoveColor = (nameToRemove: string) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((c) => c.name !== nameToRemove));
    const nextMap = { ...colorImages };
    delete nextMap[nameToRemove];
    setColorImages(nextMap);
  };

  // Handle image files upload per color
  const handleImageFiles = async (colorName: string, files: FileList | File[]) => {
    const dataUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith('image/')) {
        try {
          const res = await fileToOptimizedDataUrl(f);
          dataUrls.push(res);
        } catch (e) {
          console.error('File conversion error', e);
        }
      }
    }
    if (dataUrls.length > 0) {
      setColorImages((prev) => ({
        ...prev,
        [colorName]: [...(prev[colorName] || []), ...dataUrls],
      }));
    }
  };

  // Add URL photo for color
  const handleAddUrl = (colorName: string) => {
    const url = (urlInputs[colorName] || '').trim();
    if (!url) return;
    setColorImages((prev) => ({
      ...prev,
      [colorName]: [...(prev[colorName] || []), url],
    }));
    setUrlInputs((prev) => ({ ...prev, [colorName]: '' }));
  };

  // Set primary cover photo
  const handleSetPrimary = (colorName: string, index: number) => {
    if (index === 0) return;
    setColorImages((prev) => {
      const arr = [...(prev[colorName] || [])];
      const selected = arr[index];
      const rest = arr.filter((_, i) => i !== index);
      return { ...prev, [colorName]: [selected, ...rest] };
    });
  };

  // Remove photo
  const handleRemovePhoto = (colorName: string, index: number) => {
    setColorImages((prev) => ({
      ...prev,
      [colorName]: (prev[colorName] || []).filter((_, i) => i !== index),
    }));
  };

  // Final submit
  const handleSaveAndFinish = () => {
    const cleanName = name.trim().toUpperCase();
    if (!cleanName) {
      setCurrentStep(1);
      setErrorMsg('Veuillez renseigner le nom de la pièce');
      return;
    }

    const prodId =
      initialProduct?.id ||
      cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const parsedPrice = parseFloat(price) || 79;

    // Build colors array
    const updatedColors = colors.map((c) => ({
      ...c,
      images: colorImages[c.name] || [],
    }));

    // Primary images
    const primaryImgs =
      colorImages[colors[0]?.name]?.length > 0
        ? colorImages[colors[0]?.name]
        : Object.values(colorImages).flat().filter(Boolean);

    const savedProduct: Product = {
      id: prodId,
      name: cleanName,
      category,
      price: parsedPrice,
      currency: 'TND',
      spec,
      description: description.trim(),
      colors: updatedColors,
      colorImages,
      sizes: selectedSizes,
      branding: {
        embroidery: '',
        label: '',
      },
      images: primaryImgs.length > 0 ? primaryImgs : [shelterSweatNoir],
      composition: spec,
      origin,
      fit,
      visible: isVisible,
    };

    // Re-map stock matrix keys to final prodId
    const finalStockMatrix: Record<string, number> = {};
    colors.forEach((c) => {
      selectedSizes.forEach((s) => {
        const oldKey = getVariantKey(initialProduct?.id || 'temp-product', c.name, s);
        const finalKey = getVariantKey(prodId, c.name, s);
        finalStockMatrix[finalKey] = stockMatrix[oldKey] !== undefined ? stockMatrix[oldKey] : 8;
      });
    });

    onSave(savedProduct, finalStockMatrix);
  };

  // Total allocated stock in matrix
  const totalAllocatedStock = useMemo(() => {
    let sum = 0;
    const prodId = initialProduct?.id || 'temp-product';
    colors.forEach((c) => {
      selectedSizes.forEach((s) => {
        const key = getVariantKey(prodId, c.name, s);
        sum += Number(stockMatrix[key] || 0);
      });
    });
    return sum;
  }, [stockMatrix, colors, selectedSizes, initialProduct]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#34312D] p-5 sm:p-6 bg-[#141414] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B9A995] block">
              Atelier KŪZA · Modèle & Fiche Technique
            </span>
            <h2
              className="text-xl font-serif text-[#E8E4DD] mt-0.5"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              {isEditing ? `Modifier : ${name || initialProduct?.name}` : 'Nouvelle Pièce KŪZA'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-STEP PROGRESS BAR TABS */}
        <div className="grid grid-cols-4 border-b border-[#34312D] bg-[#141414]/70 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-3 px-2 sm:px-4 text-center border-b-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              currentStep === 1
                ? 'border-[#B9A995] bg-[#181818] text-[#E8E4DD]'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current text-[10px] font-mono flex items-center justify-center">
              1
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium truncate">
              Infos Générales
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`py-3 px-2 sm:px-4 text-center border-b-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              currentStep === 2
                ? 'border-[#B9A995] bg-[#181818] text-[#E8E4DD]'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current text-[10px] font-mono flex items-center justify-center">
              2
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium truncate">
              Tailles & Stocks
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`py-3 px-2 sm:px-4 text-center border-b-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              currentStep === 3
                ? 'border-[#B9A995] bg-[#181818] text-[#E8E4DD]'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current text-[10px] font-mono flex items-center justify-center">
              3
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium truncate">
              Coloris & Visuels
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className={`py-3 px-2 sm:px-4 text-center border-b-2 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              currentStep === 4
                ? 'border-[#B9A995] bg-[#181818] text-[#E8E4DD]'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current text-[10px] font-mono flex items-center justify-center">
              4
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-medium truncate">
              Aperçu & Statut
            </span>
          </button>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: INFOS GÉNÉRALES */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#34312D] pb-3">
                <h3 className="text-sm font-mono uppercase tracking-widest text-[#B9A995] font-bold">
                  Étape 1 · Identité de la Silhouette & Tarification
                </h3>
                <p className="text-xs text-[#96918A] mt-0.5">
                  Renseignez le titre de la pièce, sa catégorie d'appartenance et son prix officiel en Dinars Tunisiens.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#E8E4DD] mb-2 font-medium">
                    Nom du modèle *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="ex: SHELTER SWEAT"
                    className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] px-4 py-3 focus:border-[#B9A995] focus:outline-none uppercase font-medium tracking-wide"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#E8E4DD] mb-2 font-medium">
                    Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] px-4 py-3 focus:border-[#B9A995] focus:outline-none font-mono cursor-pointer"
                  >
                    <option value="Hauts">Hauts (Sweatshirts, Hoodies, Vestes)</option>
                    <option value="Bas">Bas (Pantalons, Joggings, Shorts)</option>
                    <option value="Ensembles">Ensembles (Duos, Sets complets)</option>
                    <option value="Accessoires">Accessoires (Bonnets, Écharpes, Casquettes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#E8E4DD] mb-2 font-medium">
                    Prix officiel (DT) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="79"
                    className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] px-4 py-3 focus:border-[#B9A995] focus:outline-none font-mono tabular-nums text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-[#E8E4DD] mb-2 font-medium">
                    Spécification Textile / GSM
                  </label>
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => setSpec(e.target.value)}
                    placeholder="ex: Matière premium · 290 GSM"
                    className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] px-4 py-3 focus:border-[#B9A995] focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-[#E8E4DD] mb-2 font-medium">
                  Description de la silhouette
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez la texture, le grammage dense de 290 GSM, la coupe et les finitions atelier..."
                  className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] p-3 focus:border-[#B9A995] focus:outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#34312D]/60">
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-wider text-[#96918A] mb-1">
                    Origine & Confection
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] px-3 py-2 text-xs focus:border-[#B9A995] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-mono tracking-wider text-[#96918A] mb-1">
                    Coupe & Détails
                  </label>
                  <input
                    type="text"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] text-[#E8E4DD] px-3 py-2 text-xs focus:border-[#B9A995] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: TAILLES & ALLOCATIONS STOCKS (XS à XXL) */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#34312D] pb-3">
                <h3 className="text-sm font-mono uppercase tracking-widest text-[#B9A995] font-bold">
                  Étape 2 · Tailles Actives & Matrice d'Allocation de Stock
                </h3>
                <p className="text-xs text-[#96918A] mt-0.5">
                  Sélectionnez les tailles proposées (XS à XXL) et configurez les unités en stock par variante.
                </p>
              </div>

              {/* Sizes Selector */}
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-[#E8E4DD] mb-2 font-medium">
                  Tailles Disponibles ({selectedSizes.length} sélectionnées)
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {ALL_AVAILABLE_SIZES.map((s) => {
                    const isSelected = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`min-w-12 h-10 px-3.5 text-xs font-mono uppercase transition-colors cursor-pointer border flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#E8E4DD] text-[#101010] border-[#E8E4DD] font-bold shadow-sm'
                            : 'bg-[#181818] text-[#96918A] border-[#34312D] hover:border-[#96918A]'
                        }`}
                      >
                        <span>[ {s} ]</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Fill Actions Toolbar */}
              <div className="p-3 bg-[#141414] border border-[#34312D] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono text-[#96918A]">
                  Remplissage rapide :
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill(5)}
                    className="px-2.5 py-1 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer"
                  >
                    +5 partout
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill(10)}
                    className="px-2.5 py-1 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer"
                  >
                    +10 partout
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill(0)}
                    className="px-2.5 py-1 bg-[#181818] border border-[#34312D] hover:border-rose-400 text-xs font-mono text-rose-400 transition-colors cursor-pointer"
                  >
                    Vider (0)
                  </button>
                </div>
              </div>

              {/* Stock Matrix Table */}
              <div className="border border-[#34312D] overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[#141414] border-b border-[#34312D]">
                      <th className="p-3 text-[#96918A] uppercase tracking-wider font-medium">Coloris</th>
                      {selectedSizes.map((s) => (
                        <th key={s} className="p-3 text-center text-[#E8E4DD] font-bold">
                          {s}
                        </th>
                      ))}
                      <th className="p-3 text-right text-[#B9A995] font-bold">Total Coloris</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#34312D]/60">
                    {colors.map((c) => {
                      const prodId = initialProduct?.id || 'temp-product';
                      let rowTotal = 0;
                      return (
                        <tr key={c.name} className="hover:bg-[#141414]/50">
                          <td className="p-3 flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-black/50 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="font-semibold text-[#E8E4DD]">{c.name}</span>
                          </td>

                          {selectedSizes.map((s) => {
                            const key = getVariantKey(prodId, c.name, s);
                            const val = stockMatrix[key] !== undefined ? stockMatrix[key] : 8;
                            rowTotal += Number(val);
                            return (
                              <td key={s} className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={val}
                                  onChange={(e) => {
                                    const nextVal = Math.max(0, parseInt(e.target.value) || 0);
                                    setStockMatrix((prev) => ({
                                      ...prev,
                                      [key]: nextVal,
                                    }));
                                  }}
                                  className="w-16 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] text-center py-1.5 text-xs text-[#E8E4DD] focus:outline-none"
                                />
                              </td>
                            );
                          })}

                          <td className="p-3 text-right text-[#E8E4DD] font-bold">
                            {rowTotal} pcs
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#141414] border-t border-[#34312D] font-bold">
                      <td className="p-3 text-[#B9A995] uppercase">Total Général</td>
                      {selectedSizes.map((s) => {
                        const prodId = initialProduct?.id || 'temp-product';
                        const colTotal = colors.reduce((acc, c) => {
                          const key = getVariantKey(prodId, c.name, s);
                          return acc + (Number(stockMatrix[key]) || 0);
                        }, 0);
                        return (
                          <td key={s} className="p-3 text-center text-[#96918A]">
                            {colTotal}
                          </td>
                        );
                      })}
                      <td className="p-3 text-right text-[#34D399] font-bold">
                        {totalAllocatedStock} pcs
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: COLORIS & VISUELS DÉDIÉS */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#34312D] pb-3">
                <h3 className="text-sm font-mono uppercase tracking-widest text-[#B9A995] font-bold">
                  Étape 3 · Variantes Couleurs & Visuels Dédiés
                </h3>
                <p className="text-xs text-[#96918A] mt-0.5">
                  Associez des photographies haute définition pour chaque déclinaison. Les photos s'affichent en plein rendu naturel RGB.
                </p>
              </div>

              {/* Color chips manager */}
              <div className="p-4 bg-[#141414] border border-[#34312D] space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#E8E4DD] block font-medium">
                  Pastilles de couleurs actives ({colors.length})
                </span>

                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#181818] border border-[#34312D]"
                    >
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) => {
                          const newHex = e.target.value;
                          setColors(colors.map((x) => (x.name === c.name ? { ...x, hex: newHex } : x)));
                        }}
                        className="w-4 h-4 rounded-full border border-black/40 bg-transparent cursor-pointer p-0 shrink-0"
                      />
                      <span className="text-xs font-mono text-[#E8E4DD] font-semibold">{c.name}</span>
                      <span className="text-[10px] font-mono text-[#96918A] uppercase">{c.hex}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(c.name)}
                        disabled={colors.length <= 1}
                        className="p-1 text-[#96918A] hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                        title="Supprimer ce coloris"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new color inline form */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#34312D]/60">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Nouveau coloris (ex: Anthracite, Sable...)"
                    className="flex-1 min-w-44 bg-[#181818] border border-[#34312D] text-xs text-[#E8E4DD] px-3 py-2 focus:border-[#B9A995] focus:outline-none font-mono"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 rounded border border-[#34312D] bg-transparent cursor-pointer p-0 shrink-0"
                    title="Choisir la couleur"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3.5 py-2 bg-[#B9A995] hover:bg-[#c8b9a6] text-[#101010] text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                  >
                    + Ajouter Coloris
                  </button>
                </div>
              </div>

              {/* Dedicated photo galleries per color */}
              <div className="space-y-6">
                {colors.map((color) => {
                  const colorKey = color.name;
                  const currentImgs = colorImages[colorKey] || [];
                  const urlVal = urlInputs[colorKey] || '';

                  return (
                    <div
                      key={colorKey}
                      className="p-5 bg-[#141414] border border-[#34312D] space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#34312D]/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40"
                            style={{ backgroundColor: color.hex }}
                          />
                          <h4 className="text-sm font-mono font-bold text-[#E8E4DD] uppercase">
                            Visuels pour « {colorKey} »
                          </h4>
                          <span className="text-xs font-mono text-[#96918A]">
                            ({currentImgs.length} photo{currentImgs.length > 1 ? 's' : ''})
                          </span>
                        </div>
                      </div>

                      {/* Photo thumbnails row */}
                      {currentImgs.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {currentImgs.map((imgSrc, imgIdx) => (
                            <div
                              key={imgIdx}
                              className={`relative aspect-[3/4] bg-[#181818] border overflow-hidden group ${
                                imgIdx === 0 ? 'border-[#B9A995] ring-1 ring-[#B9A995]' : 'border-[#34312D]'
                              }`}
                            >
                              <img
                                src={imgSrc}
                                alt={`${colorKey} photo ${imgIdx + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                style={{ filter: 'none' }}
                              />

                              {/* Primary badge */}
                              {imgIdx === 0 && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#B9A995] text-[#101010] text-[9px] font-mono font-bold uppercase select-none">
                                  Couverture
                                </span>
                              )}

                              {/* Hover controls */}
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(colorKey, imgIdx)}
                                    className="p-1 text-rose-400 hover:text-rose-300"
                                    title="Supprimer la photo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="space-y-1">
                                  {imgIdx !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimary(colorKey, imgIdx)}
                                      className="w-full text-center py-0.5 bg-[#B9A995] text-[#101010] text-[9px] font-mono uppercase font-bold"
                                    >
                                      Couverture
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-[#96918A]">
                          Aucun visuel pour ce coloris. Ajoutez une photo via téléversement ou URL.
                        </p>
                      )}

                      {/* Dropzone & URL row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* File Upload Dropzone */}
                        <label className="border border-dashed border-[#34312D] hover:border-[#B9A995] p-3 text-center cursor-pointer bg-[#181818]/60 transition-colors flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4 text-[#B9A995]" />
                          <span className="text-xs font-mono text-[#E8E4DD]">
                            Téléverser photo(s) locale(s)
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleImageFiles(colorKey, e.target.files);
                              }
                            }}
                          />
                        </label>

                        {/* URL Input */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={urlVal}
                            onChange={(e) =>
                              setUrlInputs((prev) => ({ ...prev, [colorKey]: e.target.value }))
                            }
                            placeholder="Ou coller une URL d'image..."
                            className="flex-1 bg-[#181818] border border-[#34312D] text-xs font-mono text-[#E8E4DD] px-3 py-2 focus:border-[#B9A995] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddUrl(colorKey)}
                            className="px-3 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD]"
                          >
                            + URL
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: APERÇU BOUTIQUE & STATUT DE PUBLICATION */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#34312D] pb-3">
                <h3 className="text-sm font-mono uppercase tracking-widest text-[#B9A995] font-bold">
                  Étape 4 · Aperçu Réel en Boutique & Statut de Publication
                </h3>
                <p className="text-xs text-[#96918A] mt-0.5">
                  Vérifiez la restitution visuelle de la carte produit avant son enregistrement dans le catalogue public.
                </p>
              </div>

              {/* Publication Status Toggle */}
              <div className="p-4 bg-[#141414] border border-[#34312D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#E8E4DD] font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isVisible ? 'bg-emerald-400' : 'bg-[#96918A]'}`} />
                    <span>Statut : {isVisible ? 'Visible immédiatement sur la boutique' : 'Brouillon masqué'}</span>
                  </div>
                  <p className="text-xs text-[#96918A] mt-0.5">
                    {isVisible
                      ? 'La pièce sera immédiatement affichée dans le catalogue et achetable.'
                      : 'La pièce restera masquée aux visiteurs mais modifiable dans le tableau de bord.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`px-4 py-2 border text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer shrink-0 ${
                    isVisible
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-[#181818] border-[#34312D] text-[#96918A] hover:text-[#E8E4DD]'
                  }`}
                >
                  {isVisible ? 'Désactiver (Masquer)' : 'Activer (Publier)'}
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="p-5 bg-[#141414] border border-[#34312D] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#B9A995]">
                    Simulation d'Affichage Front-Store :
                  </span>
                  <span className="text-[11px] font-mono text-[#96918A]">
                    Total stock : {totalAllocatedStock} pièces
                  </span>
                </div>

                <div className="max-w-sm mx-auto bg-[#181818] border border-[#34312D] p-5 shadow-2xl">
                  {/* Card Thumbnail */}
                  <div className="aspect-[3/4] bg-[#141414] border border-[#34312D] overflow-hidden relative">
                    <img
                      src={
                        colorImages[previewColor]?.[0] ||
                        Object.values(colorImages).flat()[0] ||
                        shelterSweatNoir
                      }
                      alt={name || 'Modèle KŪZA'}
                      className="w-full h-full object-cover"
                      style={{ filter: 'none' }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#101010]/85 px-2 py-0.5 font-mono text-[9px] text-[#B9A995] uppercase tracking-widest border border-[#34312D]">
                      RÉF. KZ-{(name || 'MODEL').replace(/\s+/g, '-')}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-[#101010]/85 px-2 py-0.5 font-mono text-[9px] text-[#E8E4DD] uppercase tracking-widest border border-[#34312D]">
                      {spec}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#B9A995] uppercase tracking-wider">
                        {category}
                      </span>
                      <span className="text-sm font-mono font-bold text-[#E8E4DD]">
                        {formatTND(parseFloat(price) || 79)}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-[#E8E4DD] tracking-wide">
                      {name || 'TITRE DE LA PIÈCE'}
                    </h4>

                    <p className="text-xs text-[#96918A] line-clamp-2 leading-relaxed">
                      {description || 'Description sobre de la silhouette, matière et coupe...'}
                    </p>

                    {/* Color Swatches Switcher inside preview */}
                    <div className="pt-2 flex items-center justify-between border-t border-[#34312D]/60">
                      <span className="text-[10px] font-mono text-[#96918A]">Coloris :</span>
                      <div className="flex items-center gap-1.5">
                        {colors.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setPreviewColor(c.name)}
                            className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                              previewColor === c.name ? 'ring-2 ring-[#B9A995]' : 'border-black/50'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Sizes row */}
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-[#96918A]">Tailles :</span>
                      <span className="text-[#E8E4DD]">{selectedSizes.join(' · ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STICKY FOOTER ACTION BUTTONS */}
        <div className="p-4 sm:px-6 border-t border-[#34312D] bg-[#141414] flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#181818] border border-[#34312D] hover:border-[#96918A] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Précédent</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#181818] border border-[#34312D] text-xs font-mono text-[#96918A] hover:text-[#E8E4DD] cursor-pointer"
              >
                Annuler
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !name.trim()) {
                    setErrorMsg('Veuillez renseigner le nom de la pièce avant de continuer');
                    return;
                  }
                  setErrorMsg('');
                  setCurrentStep((prev) => (prev + 1) as any);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B9A995] hover:bg-[#c9baa7] text-[#101010] text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>Étape Suivante</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndFinish}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Enregistrer les Modifications' : 'Créer et Publier la Pièce'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
