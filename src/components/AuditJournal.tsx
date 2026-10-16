import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  ExternalLink,
  ShieldAlert,
  User,
} from 'lucide-react';
import { StockMovementLog, OrderDetails, InventoryMap } from '../types';
import { Product } from '../data/products';
import shelterSweatNoir from '../assets/images/shelter_sweat_noir_1791729594321.jpg';
import shelterSweatBeige from '../assets/images/shelter_sweat_beige_1791729629495.jpg';
import restWideNoir from '../assets/images/rest_wide_noir_1791729608671.jpg';
import restWideBeige from '../assets/images/rest_wide_beige_1791729647894.jpg';
import { OrderDetailModal } from './OrderDetailModal';
import { ManualAdjustmentModal } from './ManualAdjustmentModal';
import { PrintableOrderModel } from './PrintableBordereauModal';

interface AuditJournalProps {
  stockLogs: StockMovementLog[];
  products: Product[];
  orders?: OrderDetails[];
  inventory: InventoryMap;
  onUpdateInventory: (newInventory: InventoryMap) => void;
  onUpdateStockLogs?: (newLogs: StockMovementLog[]) => void;
  onOpenSlipModal?: (orderModel: PrintableOrderModel) => void;
  showNotice: (msg: string) => void;
}

export const AuditJournal: React.FC<AuditJournalProps> = ({
  stockLogs,
  products,
  orders = [],
  inventory,
  onUpdateInventory,
  onUpdateStockLogs,
  onOpenSlipModal,
  showNotice,
}) => {
  // Filters state
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>('all');
  const [auditModelFilter, setAuditModelFilter] = useState<string>('all');
  const [auditDateFilter, setAuditDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');

  // Modals state
  const [selectedOrderForView, setSelectedOrderForView] = useState<OrderDetails | null>(null);
  const [isManualAdjustmentOpen, setIsManualAdjustmentOpen] = useState(false);

  // Helper to resolve product variant thumbnail
  const getVariantThumbnail = (log: StockMovementLog): string | null => {
    const skuLower = log.sku.toLowerCase();
    const colorLower = (log.color || '').toLowerCase();
    const isShelter = skuLower.includes('shelter') || log.productName.toLowerCase().includes('shelter');
    const isRest = skuLower.includes('rest') || log.productName.toLowerCase().includes('rest');

    if (isShelter) {
      if (colorLower.includes('noir') || colorLower.includes('black')) return shelterSweatNoir;
      return shelterSweatBeige;
    }
    if (isRest) {
      if (colorLower.includes('noir') || colorLower.includes('black')) return restWideNoir;
      return restWideBeige;
    }

    // Fallback: check product object
    const prod = products.find((p) => p.name.toLowerCase() === log.productName.toLowerCase() || p.id === log.sku.split(':')[0]);
    if (prod && prod.colorImages && prod.colorImages[log.color]) {
      const imgVal = prod.colorImages[log.color];
      return Array.isArray(imgVal) ? imgVal[0] || null : imgVal;
    }
    if (prod && prod.images && prod.images[0]) {
      return prod.images[0];
    }
    return null;
  };

  // Helper to extract or resolve operator / source
  const getLogOperator = (log: StockMovementLog): string => {
    if (log.operator) {
      if (log.operator.includes('Admin Atelier') || log.operator.includes('Atelier (Main Propre)')) {
        return 'Source: Responsable المخزن';
      }
      return log.operator;
    }
    if (log.type === 'VENTE_DIRECTE') return 'Source: Responsable المخزن';
    if (log.type === 'VENTE') return 'Automatique (Boutique COD)';
    if (log.type === 'RÉAPPROVISIONNEMENT' && (log.reference.includes('BE-') || log.reference.toLowerCase().includes('réception'))) {
      return 'Réception Stock (BE-2026-001)';
    }
    if (log.reference.startsWith('KZ-')) return 'Automatique (Boutique COD)';
    return 'Source: Responsable المخزن';
  };

  // Filtered stock logs
  const filteredStockLogs = useMemo(() => {
    return stockLogs.filter((log) => {
      // 1. Search Query
      const q = auditSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        log.sku.toLowerCase().includes(q) ||
        log.productName.toLowerCase().includes(q) ||
        log.reference.toLowerCase().includes(q) ||
        (log.operator || '').toLowerCase().includes(q) ||
        (log.reason || '').toLowerCase().includes(q) ||
        log.color.toLowerCase().includes(q) ||
        log.size.toLowerCase().includes(q);

      // 2. Movement Type Filter
      const matchesType = auditTypeFilter === 'all' || log.type === auditTypeFilter;

      // 3. Product Model Filter
      const matchesModel =
        auditModelFilter === 'all' ||
        log.productName.toLowerCase() === auditModelFilter.toLowerCase();

      // 4. Date Range Filter: 'all' | 'today' | '7days' | 'month'
      let matchesDate = true;
      if (auditDateFilter !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        if (auditDateFilter === 'today') {
          matchesDate = logDate.toDateString() === now.toDateString();
        } else if (auditDateFilter === '7days') {
          const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
          matchesDate = diffDays <= 7;
        } else if (auditDateFilter === 'month') {
          matchesDate =
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesType && matchesModel && matchesDate;
    });
  }, [stockLogs, auditSearch, auditTypeFilter, auditModelFilter, auditDateFilter]);

  // Handle clickable order reference
  const handleReferenceClick = (ref: string) => {
    const match = ref.match(/KZ-\d+/i);
    const orderId = match ? match[0].toUpperCase() : ref.trim().toUpperCase();

    const foundOrder = orders.find(
      (o) => (o.orderId || o.id || '').toUpperCase() === orderId
    );

    if (foundOrder) {
      setSelectedOrderForView(foundOrder);
    } else {
      showNotice(`Référence ${orderId} : Aucune commande associée trouvée dans le registre.`);
    }
  };

  // Enhanced CSV Export
  const exportAuditCSV = () => {
    const listToExport = filteredStockLogs;
    if (listToExport.length === 0) {
      showNotice('Aucun mouvement à exporter');
      return;
    }

    const headers = [
      'Horodatage',
      'SKU Matrice',
      'Pièce',
      'Coloris',
      'Taille',
      'Type de Mouvement',
      'Variation (Delta)',
      'Ancien Stock',
      'Nouveau Stock',
      'Opérateur / Source',
      'Motif Régularisation',
      'Référence & Notes',
    ];

    const rows = listToExport.map((log) => [
      new Date(log.timestamp).toLocaleString('fr-FR'),
      log.sku,
      `"${log.productName.replace(/"/g, '""')}"`,
      log.color,
      log.size,
      log.type,
      log.changeQty > 0 ? `+${log.changeQty}` : `${log.changeQty}`,
      log.previousStock,
      log.newStock,
      `"${getLogOperator(log).replace(/"/g, '""')}"`,
      `"${(log.reason || '-').replace(/"/g, '""')}"`,
      `"${log.reference.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kuza_journal_audit_stocks_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`Journal d'audit (${listToExport.length} lignes) exporté en CSV`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header with Title & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#34312D] pb-5 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B9A995] block">
            TRAÇABILITÉ & GESTION D'INVENTAIRE · KŪZA
          </span>
          <h2
            className="text-2xl md:text-3xl font-serif text-[#E8E4DD] mt-1"
            style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
          >
            Journal d'Audit des Mouvements de Stock
          </h2>
          <p className="text-xs text-[#96918A] font-light mt-1">
            Piste d'audit continue : sorties boutique COD, réceptions ateliers, réintégrations et ajustements manuels horodatés.
          </p>
        </div>

        {/* Top Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Button 1: Solid Ivory + AJUSTEMENT MANUEL */}
          <button
            type="button"
            onClick={() => setIsManualAdjustmentOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E8E4DD] hover:bg-white text-[#101010] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5 text-[#101010]" />
            <span>+ AJUSTEMENT MANUEL</span>
          </button>

          {/* Button 2: Outlined Beige EXPORTER JOURNAL (CSV) */}
          <button
            type="button"
            onClick={exportAuditCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B9A995]" />
            <span>EXPORTER JOURNAL (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-widest text-[#96918A] block">TOTAL MOUVEMENTS</span>
          <span className="text-2xl font-bold text-[#E8E4DD] tabular-nums mt-1 block">
            {stockLogs.length}
          </span>
          <span className="text-[10px] text-[#96918A] mt-0.5 block">Logs enregistrés</span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-widest text-[#96918A] block">SORTIES VENTES</span>
          <span className="text-2xl font-bold text-rose-400 tabular-nums mt-1 block">
            {stockLogs.filter((l) => l.type === 'VENTE').length}
          </span>
          <span className="text-[10px] text-[#96918A] mt-0.5 block">Décomptes boutique</span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-widest text-[#96918A] block">RÉAPPROVISIONNEMENTS</span>
          <span className="text-2xl font-bold text-emerald-400 tabular-nums mt-1 block">
            {stockLogs.filter((l) => l.type === 'RÉAPPROVISIONNEMENT').length}
          </span>
          <span className="text-[10px] text-[#96918A] mt-0.5 block">Entrées atelier</span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-widest text-[#96918A] block">RESTOCKS & AJUSTEMENTS</span>
          <span className="text-2xl font-bold text-amber-400 tabular-nums mt-1 block">
            {stockLogs.filter((l) => l.type === 'ANNULATION_RESTOCK' || l.type === 'AJUSTEMENT_MANUEL').length}
          </span>
          <span className="text-[10px] text-[#96918A] mt-0.5 block">Réintégrations / pertes</span>
        </div>
      </div>

      {/* 3. Search & Dual Filters Bar (Date Filters + Movement Filters) */}
      <div className="p-4 bg-[#181818] border border-[#34312D] flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96918A]" />
          <input
            type="text"
            placeholder="Filtrer SKU, modèle, réf (ex: KZ-8682, BE-2026, Mehdi)..."
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] pl-10 pr-4 py-2 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none font-mono"
          />
        </div>

        {/* Filters Controls Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Quick Time Range Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 border border-[#34312D]">
            <button
              type="button"
              onClick={() => setAuditDateFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditDateFilter === 'all'
                  ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Tout
            </button>
            <button
              type="button"
              onClick={() => setAuditDateFilter('today')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditDateFilter === 'today'
                  ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setAuditDateFilter('7days')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditDateFilter === '7days'
                  ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              7 Derniers Jours
            </button>
            <button
              type="button"
              onClick={() => setAuditDateFilter('month')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditDateFilter === 'month'
                  ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Ce Mois
            </button>
          </div>

          {/* Movement Type Filter Pills */}
          <div className="flex items-center gap-1 bg-[#141414] p-1 border border-[#34312D]">
            <button
              type="button"
              onClick={() => setAuditTypeFilter('all')}
              className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditTypeFilter === 'all'
                  ? 'bg-[#B9A995] text-[#101010] font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Tous Types
            </button>
            <button
              type="button"
              onClick={() => setAuditTypeFilter('VENTE')}
              className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditTypeFilter === 'VENTE'
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Ventes
            </button>
            <button
              type="button"
              onClick={() => setAuditTypeFilter('RÉAPPROVISIONNEMENT')}
              className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditTypeFilter === 'RÉAPPROVISIONNEMENT'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Réappro
            </button>
            <button
              type="button"
              onClick={() => setAuditTypeFilter('AJUSTEMENT_MANUEL')}
              className={`px-2 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                auditTypeFilter === 'AJUSTEMENT_MANUEL'
                  ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Ajustements
            </button>
          </div>

          {/* Model Filter Dropdown */}
          <select
            value={auditModelFilter}
            onChange={(e) => setAuditModelFilter(e.target.value)}
            className="bg-[#141414] border border-[#34312D] text-[#E8E4DD] text-xs px-3 py-2 rounded-none focus:border-[#B9A995] focus:outline-none cursor-pointer font-mono"
          >
            <option value="all">Toutes les pièces</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Audit Trail Table & Cards */}
      {filteredStockLogs.length === 0 ? (
        <div className="p-12 bg-[#181818] border border-[#34312D] text-center space-y-3">
          <History className="w-8 h-8 text-[#96918A] mx-auto opacity-40" />
          <p className="text-xs uppercase tracking-widest text-[#96918A] font-mono">
            Aucun mouvement de stock correspondant
          </p>
          <p className="text-xs text-[#96918A] font-light max-w-sm mx-auto">
            Modifiez vos filtres ou effectuez un ajustement manuel pour observer la journalisation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop View Table */}
          <div className="hidden md:block overflow-x-auto no-scrollbar bg-[#181818] border border-[#34312D]">
            <table className="w-full min-w-[1100px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#34312D] bg-[#141414] font-mono text-[11px] uppercase tracking-wider text-[#96918A]">
                  <th className="py-3.5 px-4 font-normal">Horodatage</th>
                  <th className="py-3.5 px-4 font-normal">Pièce & Variante</th>
                  <th className="py-3.5 px-4 font-normal">SKU Matrice</th>
                  <th className="py-3.5 px-4 font-normal">Opérateur / Source</th>
                  <th className="py-3.5 px-4 font-normal text-center">Type Mouvement</th>
                  <th className="py-3.5 px-4 font-normal text-center">Variation</th>
                  <th className="py-3.5 px-4 font-normal text-center">Évolution Stock</th>
                  <th className="py-3.5 px-4 font-normal text-right">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34312D]/60 font-light font-mono">
                {filteredStockLogs.map((log) => {
                  const isVente = log.type === 'VENTE';
                  const isReappro = log.type === 'RÉAPPROVISIONNEMENT';
                  const isRestock = log.type === 'ANNULATION_RESTOCK';
                  const thumbnail = getVariantThumbnail(log);
                  const operator = getLogOperator(log);

                  const isOrderRef = /KZ-\d+/i.test(log.reference);

                  return (
                    <tr key={log.logId} className="hover:bg-[#151515] transition-colors">
                      {/* Horodatage */}
                      <td className="py-3.5 px-4 text-[#96918A] whitespace-nowrap">
                        <span className="text-[#E8E4DD] block font-mono">
                          {new Date(log.timestamp).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-[#96918A] block">
                          {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Pièce & Variante with 32x32 Thumbnail */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={log.productName}
                              className="w-8 h-8 rounded-none object-cover border border-[#34312D] shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-[#141414] border border-[#34312D] flex items-center justify-center shrink-0">
                              <Layers className="w-4 h-4 text-[#96918A]" />
                            </div>
                          )}

                          <div>
                            <div className="font-sans font-medium text-[#E8E4DD]">
                              {log.productName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#96918A] mt-0.5">
                              <span>{log.color}</span>
                              <span>·</span>
                              <span className="px-1.5 py-0.2 bg-[#141414] border border-[#34312D] text-[#E8E4DD] text-[10px] font-bold">
                                {log.size}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU Matrice */}
                      <td className="py-3.5 px-4 text-[#96918A] text-[11px] whitespace-nowrap">
                        <code className="text-[#B9A995] bg-[#141414] px-1.5 py-0.5 border border-[#34312D]">
                          {log.sku}
                        </code>
                      </td>

                      {/* Dedicated OPÉRATEUR / SOURCE Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 border ${
                            operator.includes('Boutique COD')
                              ? 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10'
                              : operator.includes('المخزن') || operator.includes('Stock')
                              ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                              : operator.includes('Atelier Confection')
                              ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                              : 'border-[#B9A995]/40 text-[#B9A995] bg-[#B9A995]/10'
                          }`}
                        >
                          <User className="w-3 h-3 shrink-0" />
                          <span>{operator}</span>
                        </span>
                        {log.reason && (
                          <div className="text-[10px] text-[#96918A] mt-0.5 font-light">
                            Motif : {log.reason}
                          </div>
                        )}
                      </td>

                      {/* Type de Mouvement */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider border ${
                            isVente
                              ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                              : isReappro
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : isRestock
                              ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                              : 'border-[#B9A995]/40 text-[#B9A995] bg-[#B9A995]/10'
                          }`}
                        >
                          {isVente ? (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-rose-400" />
                              <span>VENTE</span>
                            </>
                          ) : isReappro ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                              <span>RÉAPPRO</span>
                            </>
                          ) : isRestock ? (
                            <>
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>RESTOCK ANNUL.</span>
                            </>
                          ) : (
                            <>
                              <SlidersHorizontal className="w-3 h-3 text-[#B9A995]" />
                              <span>AJUSTEMENT</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Variation */}
                      <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">
                        <span
                          className={`text-xs px-2 py-0.5 border ${
                            log.changeQty > 0
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                              : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                          }`}
                        >
                          {log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty}
                        </span>
                      </td>

                      {/* Évolution Stock */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 text-xs text-[#96918A]">
                          <span className="tabular-nums">{log.previousStock}</span>
                          <span className="text-[#34312D]">→</span>
                          <span
                            className={`font-bold tabular-nums ${
                              log.newStock === 0
                                ? 'text-rose-400'
                                : log.newStock <= 3
                                ? 'text-amber-400'
                                : 'text-[#E8E4DD]'
                            }`}
                          >
                            {log.newStock} ex.
                          </span>
                        </div>
                      </td>

                      {/* Clickable Reference Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isOrderRef ? (
                          <button
                            type="button"
                            onClick={() => handleReferenceClick(log.reference)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#B9A995] hover:text-[#E8E4DD] hover:underline font-bold transition-colors cursor-pointer group"
                            title={`Consulter le détail de la commande ${log.reference}`}
                          >
                            <span>{log.reference}</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          <span className="text-xs text-[#96918A]">
                            {log.reference}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Cards */}
          <div className="block md:hidden space-y-4 font-mono text-xs">
            {filteredStockLogs.map((log) => {
              const isVente = log.type === 'VENTE';
              const isReappro = log.type === 'RÉAPPROVISIONNEMENT';
              const isRestock = log.type === 'ANNULATION_RESTOCK';
              const thumbnail = getVariantThumbnail(log);
              const operator = getLogOperator(log);
              const isOrderRef = /KZ-\d+/i.test(log.reference);

              return (
                <div
                  key={log.logId}
                  className="bg-[#181818] border border-[#34312D] p-4 space-y-3"
                >
                  {/* Header: Date, SKU & Movement badge */}
                  <div className="flex justify-between items-start border-b border-[#34312D] pb-2">
                    <div>
                      <span className="text-[#E8E4DD] font-semibold text-[11px] block">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </span>
                      <span className="text-[10px] text-[#B9A995] bg-[#141414] px-1.5 py-0.5 border border-[#34312D] inline-block mt-1">
                        {log.sku}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] uppercase tracking-wider border ${
                        isVente
                          ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                          : isReappro
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : isRestock
                          ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                          : 'border-[#B9A995]/40 text-[#B9A995] bg-[#B9A995]/10'
                      }`}
                    >
                      {log.type}
                    </span>
                  </div>

                  {/* Product Detail with 32x32 Thumbnail */}
                  <div className="flex items-center gap-3">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={log.productName}
                        className="w-8 h-8 object-cover border border-[#34312D] shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#141414] border border-[#34312D] flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-[#96918A]" />
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="font-sans font-medium text-[#E8E4DD] text-xs">
                        {log.productName}
                      </div>
                      <div className="text-[11px] text-[#96918A]">
                        {log.color} · Taille :{' '}
                        <span className="px-1 py-0.2 bg-[#141414] border border-[#34312D] text-[#E8E4DD] text-[10px] font-bold">
                          {log.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operator & Reference Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#34312D]/60 text-[11px]">
                    <div className="text-[#96918A]">
                      <span className="text-[9px] uppercase block text-[#96918A]/80">Opérateur :</span>
                      <span className="text-[#E8E4DD]">{operator}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase block text-[#96918A]/80">Référence :</span>
                      {isOrderRef ? (
                        <button
                          type="button"
                          onClick={() => handleReferenceClick(log.reference)}
                          className="text-[#B9A995] font-bold underline cursor-pointer"
                        >
                          {log.reference}
                        </button>
                      ) : (
                        <span className="text-[#E8E4DD]">{log.reference}</span>
                      )}
                    </div>
                  </div>

                  {/* Evolution */}
                  <div className="flex justify-between items-center bg-[#141414] p-2 border border-[#34312D]/60 text-[11px]">
                    <div>
                      <span className="text-[9px] text-[#96918A] uppercase block mb-0.5">Variation</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 border text-[10px] ${
                          log.changeQty > 0
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                        }`}
                      >
                        {log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-[#96918A] uppercase block mb-0.5">Stock Évolution</span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="tabular-nums text-[#96918A]">{log.previousStock}</span>
                        <span className="text-[#34312D]">→</span>
                        <span
                          className={`font-bold tabular-nums ${
                            log.newStock === 0
                              ? 'text-rose-400'
                              : log.newStock <= 3
                              ? 'text-amber-400'
                              : 'text-[#E8E4DD]'
                          }`}
                        >
                          {log.newStock} ex.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Clickable Order Detail Modal */}
      {selectedOrderForView && (
        <OrderDetailModal
          order={selectedOrderForView}
          onClose={() => setSelectedOrderForView(null)}
          onOpenSlip={onOpenSlipModal}
        />
      )}

      {/* 6. Manual Adjustment Modal */}
      {isManualAdjustmentOpen && (
        <ManualAdjustmentModal
          products={products}
          inventory={inventory}
          onClose={() => setIsManualAdjustmentOpen(false)}
          onSubmit={(newLog, updatedInventory) => {
            onUpdateInventory(updatedInventory);
            if (onUpdateStockLogs) {
              onUpdateStockLogs([newLog, ...stockLogs]);
            }
          }}
          showNotice={showNotice}
        />
      )}
    </div>
  );
};

export default AuditJournal;
