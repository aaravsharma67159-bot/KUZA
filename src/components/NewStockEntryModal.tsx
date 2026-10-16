import React, { useState } from 'react';
import { X, Plus, Trash2, PackageCheck, AlertCircle, DollarSign, Calculator, Layers } from 'lucide-react';
import { Product, ProductColor } from '../data/products';
import { StockEntryNote, StockEntryItem } from '../types';
import { formatTND } from '../utils/currency';

interface NewStockEntryModalProps {
  products: Product[];
  onClose: () => void;
  onSave: (entry: StockEntryNote) => void;
}

const PARTNER_ATELIERS = [
  'Atelier Confection Tunis',
  'Atelier Monastir',
  'Atelier Ksar Hellal',
  'Atelier Nabeul',
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const NewStockEntryModal: React.FC<NewStockEntryModalProps> = ({
  products,
  onClose,
  onSave,
}) => {
  const [supplierAtelier, setSupplierAtelier] = useState('Atelier Confection Tunis');
  const [referenceBatch, setReferenceBatch] = useState('LOT-290GSM-04');
  const [createdByName, setCreatedByName] = useState('Maître Mehdi - Atelier 01');
  const [unitCostDefault, setUnitCostDefault] = useState<number>(22);
  const [notes, setNotes] = useState('Molleton lourd 290 GSM conforme. Contrôle qualité 100% validé.');
  const [status, setStatus] = useState<'VALIDATED' | 'DRAFT'>('VALIDATED');

  // Multi-item rows in the entry note
  const [items, setItems] = useState<StockEntryItem[]>([
    {
      productId: products[0]?.id || 'shelter-sweat',
      productName: products[0]?.name || 'SHELTER SWEAT',
      color: products[0]?.colors[0]?.name || 'Noir',
      size: 'M',
      quantityAdded: 20,
      unitCost: 22,
      totalCost: 440,
    },
    {
      productId: products[0]?.id || 'shelter-sweat',
      productName: products[0]?.name || 'SHELTER SWEAT',
      color: products[0]?.colors[0]?.name || 'Noir',
      size: 'L',
      quantityAdded: 15,
      unitCost: 22,
      totalCost: 330,
    },
  ]);

  const [error, setError] = useState<string | null>(null);

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd?.id || 'shelter-sweat',
        productName: firstProd?.name || 'SHELTER SWEAT',
        color: firstProd?.colors[0]?.name || 'Noir',
        size: 'M',
        quantityAdded: 10,
        unitCost: unitCostDefault,
        totalCost: 10 * unitCostDefault,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) {
      setError('Un bon d’entrée doit contenir au moins un article');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
    setError(null);
  };

  const handleProductChange = (index: number, newProdId: string) => {
    const foundProd = products.find((p) => p.id === newProdId);
    if (!foundProd) return;
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const uCost = item.unitCost ?? unitCostDefault;
        return {
          ...item,
          productId: foundProd.id,
          productName: foundProd.name,
          color: foundProd.colors[0]?.name || 'Noir',
          size: foundProd.sizes[0] || 'M',
          unitCost: uCost,
          totalCost: item.quantityAdded * uCost,
        };
      })
    );
  };

  const handleColorChange = (index: number, newColor: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, color: newColor } : item))
    );
  };

  const handleSizeChange = (index: number, newSize: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, size: newSize } : item))
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const uCost = item.unitCost ?? unitCostDefault;
        return {
          ...item,
          quantityAdded: safeQty,
          totalCost: safeQty * uCost,
        };
      })
    );
  };

  const handleUnitCostChange = (index: number, cost: number) => {
    const safeCost = Math.max(0, Number(cost) || 0);
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return {
          ...item,
          unitCost: safeCost,
          totalCost: item.quantityAdded * safeCost,
        };
      })
    );
  };

  // Matrix Quick Fill Helper
  const handleMatrixFill = (prodId: string, color: string, qtyPerSize: number) => {
    const foundProd = products.find((p) => p.id === prodId) || products[0];
    const newRows: StockEntryItem[] = STANDARD_SIZES.map((size) => ({
      productId: foundProd.id,
      productName: foundProd.name,
      color,
      size,
      quantityAdded: qtyPerSize,
      unitCost: unitCostDefault,
      totalCost: qtyPerSize * unitCostDefault,
    }));
    setItems((prev) => [...prev, ...newRows]);
  };

  const totalPieces = items.reduce((sum, it) => sum + (Number(it.quantityAdded) || 0), 0);
  const totalValuation = items.reduce(
    (sum, it) => sum + (it.totalCost ?? it.quantityAdded * (it.unitCost ?? unitCostDefault)),
    0
  );

  const handleSubmit = (actionStatus: 'VALIDATED' | 'DRAFT') => {
    if (!supplierAtelier.trim()) {
      setError('Veuillez sélectionner ou renseigner un atelier confection');
      return;
    }
    if (!referenceBatch.trim()) {
      setError('Veuillez saisir une référence de lot ou coupon');
      return;
    }
    if (items.length === 0 || totalPieces === 0) {
      setError('Veuillez ajouter au moins un article avec une quantité supérieure à 0');
      return;
    }

    const newEntryId = `BE-${new Date().getFullYear()}-${String(
      Math.floor(100 + Math.random() * 900)
    ).padStart(3, '0')}`;

    const newEntry: StockEntryNote = {
      id: newEntryId,
      date: new Date().toISOString(),
      supplierAtelier: supplierAtelier.trim(),
      referenceBatch: referenceBatch.trim().toUpperCase(),
      createdByName: createdByName.trim() || 'Maître Mehdi - Atelier 01',
      items: items.map((it) => ({
        ...it,
        unitCost: it.unitCost ?? unitCostDefault,
        totalCost: it.totalCost ?? it.quantityAdded * (it.unitCost ?? unitCostDefault),
      })),
      totalPieces,
      unitCostDefault,
      totalCost: totalValuation,
      status: actionStatus,
      notes: notes.trim() || undefined,
    };

    onSave(newEntry);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-fade-in">
        {/* Header toolbar */}
        <div className="p-5 bg-[#141414] border-b border-[#34312D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <PackageCheck className="w-5 h-5 text-[#B9A995]" />
            <div>
              <h3
                className="text-lg font-serif tracking-wider uppercase text-[#E8E4DD]"
                style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
              >
                Nouveau Bon d'Entrée & Réception Atelier
              </h3>
              <p className="text-[11px] text-[#96918A] font-light">
                Contrôle de conformité de confection et incrémentation de stock
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Supplier, Batch, Creator, Default Cost Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Partner Atelier Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#96918A] font-mono block">
                Atelier Partenaire *
              </label>
              <select
                value={supplierAtelier}
                onChange={(e) => setSupplierAtelier(e.target.value)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs font-mono text-[#E8E4DD] focus:outline-none cursor-pointer"
              >
                {PARTNER_ATELIERS.map((atelier) => (
                  <option key={atelier} value={atelier}>
                    {atelier}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Fabric Batch Lot reference text */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#96918A] font-mono block">
                Lot / Référence Tissu *
              </label>
              <input
                type="text"
                required
                value={referenceBatch}
                onChange={(e) => setReferenceBatch(e.target.value)}
                placeholder="ex: LOT-290GSM-04"
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs font-mono text-[#B9A995] font-bold uppercase focus:outline-none"
              />
            </div>

            {/* 3. Quality Inspector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#96918A] font-mono block">
                Responsable Réception *
              </label>
              <input
                type="text"
                required
                value={createdByName}
                onChange={(e) => setCreatedByName(e.target.value)}
                placeholder="Maître Mehdi - Atelier 01"
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs font-mono text-[#E8E4DD] focus:outline-none"
              />
            </div>

            {/* 4. Default Cost / Unit */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#96918A] font-mono block flex items-center justify-between">
                <span>Coût Défaut / Unité</span>
                <span className="text-[#B9A995]">TND</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={unitCostDefault}
                onChange={(e) => setUnitCostDefault(parseFloat(e.target.value) || 0)}
                className="w-full h-10 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs font-mono text-[#E8E4DD] font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Matrix Fill Bar (XS-XXL) */}
          <div className="p-3 bg-[#181818] border border-[#34312D] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#B9A995]" />
              <span className="text-[#E8E4DD] font-semibold">
                Remplissage rapide par matrice de tailles :
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleMatrixFill('shelter-sweat', 'Noir', 5)}
                className="px-2.5 py-1 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] text-[11px] transition-colors cursor-pointer"
              >
                + Sweat Noir (5 pcs / taille XS-XXL)
              </button>
              <button
                type="button"
                onClick={() => handleMatrixFill('rest-wide', 'Beige', 5)}
                className="px-2.5 py-1 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] text-[11px] transition-colors cursor-pointer"
              >
                + Pantalon Beige (5 pcs / taille XS-XXL)
              </button>
            </div>
          </div>

          {/* Items List Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#34312D] pb-2">
              <label className="text-xs uppercase tracking-wider text-[#B9A995] font-mono font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#B9A995]" />
                Articles Réceptionnés ({items.length} lignes · {totalPieces} pièces)
              </label>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#B9A995]" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const currentProd = products.find((p) => p.id === item.productId) || products[0];
                const isNoir = item.color.toLowerCase().includes('noir');
                const lineTotal = item.quantityAdded * (item.unitCost ?? unitCostDefault);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#141414] border border-[#34312D] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs font-mono"
                  >
                    {/* Product */}
                    <div className="sm:col-span-4">
                      <label className="text-[9px] text-[#96918A] uppercase block mb-1">
                        Silhouette Catalogue
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full h-9 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-2 text-xs font-mono text-[#E8E4DD] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color with Swatch Chip */}
                    <div className="sm:col-span-3">
                      <label className="text-[9px] text-[#96918A] uppercase block mb-1 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full border ${
                            isNoir ? 'bg-black border-zinc-600' : 'bg-[#D4C7B8] border-[#A89F91]'
                          }`}
                        />
                        <span>Coloris</span>
                      </label>
                      <select
                        value={item.color}
                        onChange={(e) => handleColorChange(idx, e.target.value)}
                        className="w-full h-9 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-2 text-xs font-mono text-[#E8E4DD] focus:outline-none"
                      >
                        {currentProd?.colors.map((c: ProductColor) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size (XS-XXL) */}
                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-[#96918A] uppercase block mb-1">
                        Taille
                      </label>
                      <select
                        value={item.size}
                        onChange={(e) => handleSizeChange(idx, e.target.value)}
                        className="w-full h-9 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-2 text-xs font-mono text-[#E8E4DD] text-center font-bold focus:outline-none"
                      >
                        {STANDARD_SIZES.map((s: string) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-1">
                      <label className="text-[9px] text-[#96918A] uppercase block mb-1">
                        Qté
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantityAdded}
                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                        className="w-full h-9 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-1 text-xs font-mono text-emerald-400 text-center font-bold focus:outline-none"
                      />
                    </div>

                    {/* Unit Cost & Total */}
                    <div className="sm:col-span-1">
                      <label className="text-[9px] text-[#96918A] uppercase block mb-1">
                        Coût (DT)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.unitCost ?? unitCostDefault}
                        onChange={(e) => handleUnitCostChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full h-9 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-1 text-xs font-mono text-[#E8E4DD] text-center focus:outline-none"
                      />
                    </div>

                    {/* Delete action & Line Value */}
                    <div className="sm:col-span-1 flex items-center justify-end gap-1.5 pt-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={items.length <= 1}
                        className="p-1.5 text-[#96918A] hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[#96918A] font-mono block">
              Remarques Contrôle Qualité / Certificat Confection
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Molleton 290 GSM conforme. Assemblage certifié, étiquetage KŪZA OK."
              className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] p-3 text-xs font-mono text-[#E8E4DD] focus:outline-none"
            />
          </div>

          {/* Summary valuation card */}
          <div className="p-4 bg-[#181818] border border-[#34312D] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#96918A] block">VOLUME TOTAL RÉCEPTIONNÉ</span>
              <span className="text-base font-bold text-emerald-400">+{totalPieces} pièces</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-[#96918A] block">VALEUR CONFECTION DU BON</span>
              <span className="text-base font-bold text-[#E8E4DD]">{formatTND(totalValuation)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons footer */}
        <div className="p-4 border-t border-[#34312D] bg-[#141414] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-[#34312D] text-xs font-mono uppercase text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center gap-3">
            {/* Button 1: ENREGISTRER EN BROUILLON */}
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              className="px-4 py-2 bg-[#181818] hover:bg-[#202020] text-[#B9A995] border border-[#B9A995]/50 font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ENREGISTRER EN BROUILLON
            </button>

            {/* Button 2: VALIDER & INJECTER EN STOCK */}
            <button
              type="button"
              onClick={() => handleSubmit('VALIDATED')}
              className="px-5 py-2 bg-[#E8E4DD] hover:bg-white text-[#101010] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              VALIDER & INJECTER EN STOCK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewStockEntryModal;
