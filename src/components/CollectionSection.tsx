import React, { useState } from 'react';
import { Product, ProductColor } from '../data/products';
import { InventoryMap } from '../types';
import { ProductCard } from './ProductCard';

interface CollectionSectionProps {
  products: Product[];
  inventory?: InventoryMap;
  onSelectProduct: (product: Product, initialColor?: ProductColor) => void;
  onQuickAdd: (product: Product, color: ProductColor, size: string) => void;
  onNavigateToBundle?: () => void;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  products,
  inventory,
  onSelectProduct,
  onQuickAdd,
  onNavigateToBundle,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('all');

  // Filter only visible products for the public storefront
  const visibleProducts = products.filter((p) => p.visible !== false);

  const filteredProducts = visibleProducts.filter((p) => {
    if (selectedProductId === 'all') return true;
    return p.id === selectedProductId;
  });

  return (
    <section id="collection" className="relative w-full border-b border-[#34312D] bg-[#101010] py-16 sm:py-24">
      <div id="pieces" className="absolute -top-16 sm:-top-20" />
      <div id="catalogue" className="absolute -top-16 sm:-top-20" />
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header & Interactive Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#34312D] pb-6 mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <span className="font-mono text-[10px] sm:text-xs text-[#B9A995] uppercase tracking-[0.3em] block">
              ARCHIVE 01 // ESSENTIELS D'ATELIER
            </span>
            <h2
              className="text-2xl sm:text-4xl lg:text-5xl font-serif text-[#E8E4DD] uppercase tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', 'Optima', serif" }}
            >
              PIÈCES D'ATELIER
            </h2>
          </div>

          <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
            <p className="text-xs text-[#96918A] max-w-md font-light leading-relaxed hidden sm:block">
              Une collection permanente pensée autour du confort, du volume et de la pérennité. Textiles lourds 290 GSM pré-rétrécis.
            </p>

            {/* Interactive Filter Controls - Scrollable with no scrollbar on mobile */}
            <div className="flex items-center gap-1 p-1 bg-[#181818] border border-[#34312D] overflow-x-auto no-scrollbar max-w-full">
              <button
                onClick={() => setSelectedProductId('all')}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono transition-colors cursor-pointer shrink-0 touch-manipulation ${
                  selectedProductId === 'all'
                    ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                    : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                TOUTES ({visibleProducts.length})
              </button>
              {visibleProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-mono transition-colors cursor-pointer shrink-0 touch-manipulation ${
                    selectedProductId === p.id
                      ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                      : 'text-[#96918A] hover:text-[#E8E4DD]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid: 1 column on mobile, 2 columns on sm/lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              inventory={inventory}
              onSelectProduct={onSelectProduct}
              onQuickAdd={onQuickAdd}
              onNavigateToBundle={onNavigateToBundle}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
