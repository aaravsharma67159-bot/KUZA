import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { Product, getVariantKey } from '../data/products';
import { InventoryMap, StockMovementLog } from '../types';

interface ManualAdjustmentModalProps {
  products: Product[];
  inventory: InventoryMap;
  onClose: () => void;
  onSubmit: (log: StockMovementLog, newInventory: InventoryMap) => void;
  showNotice: (msg: string) => void;
}

const REASON_OPTIONS = [
  { value: 'PERTE_STOCK', label: 'Perte ou disparition de stock', defaultType: 'AJUSTEMENT_MANUEL' },
  { value: 'DÉFECTUEUX_REBUT', label: 'Pièce défectueuse / Rebut atelier', defaultType: 'AJUSTEMENT_MANUEL' },
  { value: 'INVENTAIRE_RÉEL', label: 'Correction après inventaire physique', defaultType: 'AJUSTEMENT_MANUEL' },
  { value: 'DON_PROTO_MODÈLE', label: 'Prêt ou don pour shooting / prototype', defaultType: 'AJUSTEMENT_MANUEL' },
  { value: 'RÉAPPRO_EXCEPTIONNEL', label: 'Arrivage direct hors bon de réception', defaultType: 'RÉAPPROVISIONNEMENT' },
];

export const ManualAdjustmentModal: React.FC<ManualAdjustmentModalProps> = ({
  products,
  inventory,
  onClose,
  onSubmit,
  showNotice,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedColor, setSelectedColor] = useState<string>(
    activeProduct?.colors[0]?.name || 'Noir'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    activeProduct?.sizes[0] || 'M'
  );

  const [deltaQty, setDeltaQty] = useState<number>(-1);
  const [reasonTag, setReasonTag] = useState<string>('DÉFECTUEUX_REBUT');
  const [operatorName, setOperatorName] = useState<string>('Admin (Mehdi)');
  const [customNote, setCustomNote] = useState<string>('');

  const variantKey = getVariantKey(
    activeProduct?.id || 'shelter-sweat',
    selectedColor,
    selectedSize
  );
  const currentStock = inventory[variantKey] || 0;
  const newStock = Math.max(0, currentStock + deltaQty);
  const actualDelta = newStock - currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (actualDelta === 0) {
      showNotice('Le delta spécifié ne modifie pas le stock actuel.');
      return;
    }

    const updatedInventory = {
      ...inventory,
      [variantKey]: newStock,
    };

    const isPositive = actualDelta > 0;
    const movementType = isPositive ? 'RÉAPPROVISIONNEMENT' : 'AJUSTEMENT_MANUEL';

    const newLog: StockMovementLog = {
      logId: `LOG-MAN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sku: variantKey,
      productName: activeProduct.name,
      color: selectedColor,
      size: selectedSize,
      type: movementType,
      changeQty: actualDelta,
      previousStock: currentStock,
      newStock,
      reference: customNote.trim() ? `Manuel: ${customNote.trim()}` : `Ajustement: ${reasonTag}`,
      operator: operatorName.trim() || 'Admin (Mehdi)',
      reason: reasonTag,
    };

    onSubmit(newLog, updatedInventory);
    showNotice(`Ajustement enregistré : ${activeProduct.name} (${selectedColor} · ${selectedSize}) → ${newStock} ex.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl overflow-hidden flex flex-col my-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#34312D] bg-[#141414]">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-[#B9A995]" />
            <div>
              <h3
                className="text-lg font-serif tracking-wider uppercase text-[#E8E4DD]"
                style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
              >
                Ajustement Manuel de Stock
              </h3>
              <p className="text-[11px] text-[#96918A] font-light">
                Journalisation traçable des pertes, défauts ou régularisations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Select Product Model */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#96918A] mb-1.5">
              1. Modèle de Pièce :
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                const prod = products.find((p) => p.id === e.target.value);
                setSelectedProductId(e.target.value);
                if (prod) {
                  setSelectedColor(prod.colors[0]?.name || 'Noir');
                  setSelectedSize(prod.sizes[0] || 'M');
                }
              }}
              className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] text-xs font-mono text-[#E8E4DD] p-2.5 focus:outline-none cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Color & Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#96918A] mb-1.5">
                Coloris :
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] text-xs font-mono text-[#E8E4DD] p-2.5 focus:outline-none cursor-pointer"
              >
                {activeProduct.colors.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#96918A] mb-1.5">
                Taille :
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] text-xs font-mono text-[#E8E4DD] p-2.5 focus:outline-none cursor-pointer"
              >
                {activeProduct.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Stock Preview Card */}
          <div className="p-3.5 bg-[#181818] border border-[#34312D] flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#96918A] block">SKU MATRICE :</span>
              <span className="text-[#B9A995] font-bold">{variantKey}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-[#96918A] block">STOCK ACTUEL :</span>
              <span className="text-sm font-bold text-[#E8E4DD]">{currentStock} ex.</span>
            </div>
          </div>

          {/* 3. Delta Quantity Adjustment */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#96918A] mb-1.5">
              3. Variation de Quantité (Delta) :
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeltaQty((prev) => prev - 1)}
                  className="w-9 h-9 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] font-mono text-base font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={deltaQty}
                  onChange={(e) => setDeltaQty(parseInt(e.target.value, 10) || 0)}
                  className="w-20 bg-[#141414] border border-[#34312D] focus:border-[#B9A995] text-center font-mono text-sm font-bold text-[#E8E4DD] py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setDeltaQty((prev) => prev + 1)}
                  className="w-9 h-9 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] font-mono text-base font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Quick Delta Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[-5, -1, +1, +5, +10].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setDeltaQty(quick)}
                    className={`px-2 py-1 text-[11px] font-mono border transition-colors cursor-pointer ${
                      deltaQty === quick
                        ? 'border-[#B9A995] text-[#B9A995] bg-[#B9A995]/10'
                        : 'border-[#34312D] text-[#96918A] hover:text-[#E8E4DD]'
                    }`}
                  >
                    {quick > 0 ? `+${quick}` : quick}
                  </button>
                ))}
              </div>
            </div>

            {/* Resulting Stock Indicator */}
            <div className="mt-2 text-[11px] font-mono flex items-center gap-2">
              <span className="text-[#96918A]">Nouveau stock calculé :</span>
              <span
                className={`font-bold ${
                  newStock === 0
                    ? 'text-rose-400'
                    : newStock <= 3
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {newStock} exemplaire(s)
              </span>
            </div>
          </div>

          {/* 4. Compulsory Reason Tag */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#96918A] mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B9A995]" />
              <span>4. Motif Obligatoire de la Régularisation :</span>
            </label>
            <select
              value={reasonTag}
              onChange={(e) => setReasonTag(e.target.value)}
              className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] text-xs font-mono text-[#E8E4DD] p-2.5 focus:outline-none cursor-pointer"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  [{opt.value}] — {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Operator / Source & Reference Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#96918A] mb-1.5">
                Opérateur Autorisé :
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Admin (Mehdi)"
                className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] text-xs font-mono text-[#E8E4DD] p-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#96918A] mb-1.5">
                Note de Référence (Optionnel) :
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ex: Pièce déchirée au repassage"
                className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] text-xs font-mono text-[#E8E4DD] p-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-[#34312D] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-transparent border border-[#34312D] text-xs font-mono uppercase text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E8E4DD] hover:bg-white text-[#101010] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-[#101010]" />
              <span>Valider l'Ajustement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
