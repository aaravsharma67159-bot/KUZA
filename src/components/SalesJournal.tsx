import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  Ban,
  CheckSquare,
  Square,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  XCircle,
} from 'lucide-react';
import { SalesTransaction, OrderDetails } from '../types';
import { formatTND } from '../utils/currency';
import { PrintableOrderModel } from './PrintableBordereauModal';
import { generatePdfInvoice } from '../utils/pdfInvoice';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { InvoiceModal } from './InvoiceModal';
import { SalesRegistry } from './SalesRegistry';

interface SalesJournalProps {
  salesHistory: SalesTransaction[];
  orders?: OrderDetails[];
  onUpdateOrderStatus: (orderId: string, newStatus: string) => void;
  onUpdateSalesPaymentStatus?: (orderId: string, newPaymentStatus: string) => void;
  onOpenSlipModal: (order: PrintableOrderModel) => void;
  onOpenDirectSaleModal?: () => void;
  showNotice: (msg: string) => void;
}

export const SalesJournal: React.FC<SalesJournalProps> = ({
  salesHistory,
  orders = [],
  onUpdateOrderStatus,
  onUpdateSalesPaymentStatus,
  onOpenSlipModal,
  onOpenDirectSaleModal,
  showNotice,
}) => {
  // Search & Filter state
  const [salesSearch, setSalesSearch] = useState('');
  const [salesDateFilter, setSalesDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [salesStatusFilter, setSalesStatusFilter] = useState<string>('all');
  
  // Multi-selection state for sales rows
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // View toggle: standard sales journal vs certified fiscal sales registry
  const [activeView, setActiveView] = useState<'journal' | 'registry'>('journal');

  // 80mm Thermal Receipt state (Single or Batch Queue)
  const [thermalSlipTx, setThermalSlipTx] = useState<SalesTransaction | null>(null);
  const [batchThermalTxs, setBatchThermalTxs] = useState<SalesTransaction[] | null>(null);

  // Active filters detection & reset
  const hasActiveFilters = salesSearch.trim() !== '' || salesDateFilter !== 'all' || salesStatusFilter !== 'all';

  const handleResetFilters = () => {
    setSalesSearch('');
    setSalesDateFilter('all');
    setSalesStatusFilter('all');
    showNotice('Filtres réinitialisés');
  };

  const handleBatchPrintSelected = () => {
    const selected = salesHistory.filter((tx) => selectedTxIds.includes(tx.transactionId));
    if (selected.length === 0) {
      showNotice('Sélectionnez au moins une transaction');
      return;
    }
    setBatchThermalTxs(selected);
  };

  // A4 Certified Invoice state
  const [selectedA4InvoiceOrder, setSelectedA4InvoiceOrder] = useState<PrintableOrderModel | null>(null);

  // Key Financial Metrics Calculation
  const nonCancelledTransactions = useMemo(
    () => salesHistory.filter((t) => t.paymentStatus !== 'ANNULÉE' && t.orderStatus !== 'Annulée'),
    [salesHistory]
  );

  const totalRevenueLedger = useMemo(
    () => nonCancelledTransactions.reduce((acc, t) => acc + t.totalAmount, 0),
    [nonCancelledTransactions]
  );

  const totalCashCollected = useMemo(
    () =>
      salesHistory
        .filter((t) => t.paymentStatus === 'ENCAISSÉ' || t.orderStatus === 'Livrée')
        .reduce((acc, t) => acc + t.totalAmount, 0),
    [salesHistory]
  );

  const inTransitAmount = useMemo(
    () =>
      salesHistory
        .filter(
          (t) =>
            t.paymentStatus !== 'ENCAISSÉ' &&
            t.paymentStatus !== 'ANNULÉE' &&
            t.orderStatus !== 'Livrée' &&
            t.orderStatus !== 'Annulée'
        )
        .reduce((acc, t) => acc + t.totalAmount, 0),
    [salesHistory]
  );

  const inTransitCount = useMemo(
    () =>
      salesHistory.filter(
        (t) =>
          t.paymentStatus !== 'ENCAISSÉ' &&
          t.paymentStatus !== 'ANNULÉE' &&
          t.orderStatus !== 'Livrée' &&
          t.orderStatus !== 'Annulée'
      ).length,
    [salesHistory]
  );

  const totalUnitsSold = useMemo(
    () =>
      nonCancelledTransactions.reduce(
        (acc, t) => acc + t.items.reduce((sum, item) => sum + item.qty, 0),
        0
      ),
    [nonCancelledTransactions]
  );

  // Dynamic Filtering Logic
  const filteredSalesTransactions = useMemo(() => {
    return salesHistory.filter((t) => {
      // 1. Search Query
      const q = salesSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.orderId.toLowerCase().includes(q) ||
        t.transactionId.toLowerCase().includes(q) ||
        t.client.name.toLowerCase().includes(q) ||
        t.client.phone.toLowerCase().includes(q) ||
        t.client.governorate.toLowerCase().includes(q) ||
        (t.items || []).some((it) => it.name.toLowerCase().includes(q));

      // 2. Payment Status Filter: 'Tous' | 'Encaissé' | 'En attente livreur' | 'Annulé'
      let matchesStatus = true;
      if (salesStatusFilter === 'ENCAISSÉ') {
        matchesStatus = t.paymentStatus === 'ENCAISSÉ' || t.orderStatus === 'Livrée';
      } else if (salesStatusFilter === 'EN_ATTENTE_LIVRAISON' || salesStatusFilter === 'EN_ATTENTE') {
        const rawStatus = String(t.paymentStatus || '');
        matchesStatus =
          (rawStatus === 'EN_ATTENTE_LIVRAISON' || rawStatus === 'EN ATTENTE' || !t.paymentStatus) &&
          t.orderStatus !== 'Livrée' &&
          t.orderStatus !== 'Annulée';
      } else if (salesStatusFilter === 'ANNULÉE') {
        matchesStatus = t.paymentStatus === 'ANNULÉE' || t.orderStatus === 'Annulée';
      }

      // 3. Time Period Filter: 'all' | 'today' | '7days' | '30days'
      let matchesDate = true;
      if (salesDateFilter !== 'all') {
        const txDate = new Date(t.timestamp);
        const now = new Date();
        if (salesDateFilter === 'today') {
          matchesDate = txDate.toDateString() === now.toDateString();
        } else if (salesDateFilter === '7days') {
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          matchesDate = diffDays <= 7;
        } else if (salesDateFilter === '30days') {
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [salesHistory, salesSearch, salesStatusFilter, salesDateFilter]);

  // Selection toggle handlers
  const handleToggleSelect = (txId: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]
    );
  };

  const allFilteredSelected =
    filteredSalesTransactions.length > 0 &&
    filteredSalesTransactions.every((tx) => selectedTxIds.includes(tx.transactionId));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedTxIds((prev) =>
        prev.filter((id) => !filteredSalesTransactions.some((tx) => tx.transactionId === id))
      );
    } else {
      const currentFilteredIds = filteredSalesTransactions.map((tx) => tx.transactionId);
      setSelectedTxIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  // Bulk action: Mark selected as "ENCAISSÉ"
  const handleBulkMarkEncaissé = () => {
    if (selectedTxIds.length === 0) return;
    
    selectedTxIds.forEach((txId) => {
      const tx = salesHistory.find((t) => t.transactionId === txId);
      if (tx) {
        if (onUpdateSalesPaymentStatus) {
          onUpdateSalesPaymentStatus(tx.orderId, 'ENCAISSÉ');
        } else {
          onUpdateOrderStatus(tx.orderId, 'Livrée');
        }
      }
    });

    showNotice(`${selectedTxIds.length} transaction(s) marquée(s) comme "ENCAISSÉ"`);
    setSelectedTxIds([]);
  };

  // Itemized financial statement export (CSV)
  const exportFinancialStatementCSV = () => {
    const listToExport = filteredSalesTransactions;
    if (listToExport.length === 0) {
      showNotice('Aucune transaction à exporter');
      return;
    }

    const headers = [
      'Date & Heure',
      'ID Transaction',
      'N° Commande',
      'Client',
      'Téléphone',
      'Gouvernorat',
      'Adresse',
      'Détail Articles',
      'Sous-total Atelier (TND)',
      'Port Livraison (TND)',
      'Total Net à Percevoir (TND)',
      'Statut Commande',
      'Statut Paiement COD',
    ];

    const rows = listToExport.map((tx) => {
      const isDelivered = tx.paymentStatus === 'ENCAISSÉ' || tx.orderStatus === 'Livrée';
      const isCancelled = tx.paymentStatus === 'ANNULÉE' || tx.orderStatus === 'Annulée';
      const paymentStatusDisplay = isDelivered ? 'ENCAISSÉ' : isCancelled ? 'ANNULÉ' : 'EN ATTENTE LIVREUR';

      return [
        new Date(tx.timestamp).toLocaleString('fr-FR'),
        tx.transactionId,
        tx.orderId,
        `"${(tx.client.name || '').replace(/"/g, '""')}"`,
        tx.client.phone,
        `"${(tx.client.governorate || '').replace(/"/g, '""')}"`,
        `"${(tx.client.address || '').replace(/"/g, '""')}"`,
        `"${tx.items.map((it) => `${it.name} (${it.color} · ${it.size}) ×${it.qty}`).join(' | ')}"`,
        tx.subtotal.toFixed(3),
        tx.shippingFee.toFixed(3),
        tx.totalAmount.toFixed(3),
        tx.orderStatus,
        paymentStatusDisplay,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `kuza_bordereau_financier_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`Bordereau financier (${listToExport.length} lignes) exporté en CSV`);
  };

  // Build PrintableOrderModel helper
  const createOrderModel = (tx: SalesTransaction): PrintableOrderModel => {
    return {
      id: tx.orderId,
      orderId: tx.orderId,
      date: tx.timestamp,
      createdAt: tx.timestamp,
      timestamp: tx.timestamp,
      client: {
        name: tx.client.name,
        phone: tx.client.phone,
        governorate: tx.client.governorate,
        address: tx.client.address,
      },
      customerName: tx.client.name,
      phone: tx.client.phone,
      governorate: tx.client.governorate,
      address: tx.client.address,
      items: tx.items.map((it, iIdx) => ({
        id: `${tx.orderId}-${it.productId}-${iIdx}`,
        name: it.name,
        product: {
          name: it.name,
          price: it.unitPrice,
        },
        color: it.color,
        selectedColor: { name: it.color },
        size: it.size,
        selectedSize: it.size,
        qty: it.qty,
        quantity: it.qty,
        unitPrice: it.unitPrice,
      })),
      subtotal: tx.subtotal,
      shipping: tx.shippingFee,
      shippingFee: tx.shippingFee,
      total: tx.totalAmount,
      totalAmount: tx.totalAmount,
    };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header with Correct Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#34312D] pb-5 gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B9A995] block">
            REGISTRE FINANCIER & LOGISTIQUE · KŪZA
          </span>
          <h2
            className="text-2xl md:text-3xl font-serif text-[#E8E4DD] mt-1"
            style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
          >
            Historique des Ventes & Règlements COD
          </h2>
          <p className="text-xs text-[#96918A] font-light mt-1">
            Chaque commande passée génère un bordereau de vente avec suivi automatique de l'encaissement et décompte des stocks.
          </p>
        </div>

        {/* Global Controls & View Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-[#141414] border border-[#34312D]">
            <button
              type="button"
              onClick={() => setActiveView('journal')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                activeView === 'journal'
                  ? 'bg-[#E8E4DD] text-[#101010] font-bold shadow-sm'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              Journal Ventes
            </button>
            <button
              type="button"
              onClick={() => setActiveView('registry')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === 'registry'
                  ? 'bg-[#B9A995] text-[#101010] font-bold shadow-sm'
                  : 'text-[#96918A] hover:text-[#E8E4DD]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Registre Fiscal A4</span>
            </button>
          </div>

          {onOpenDirectSaleModal && (
            <button
              type="button"
              onClick={onOpenDirectSaleModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm whitespace-nowrap"
              title="Enregistrer un retrait direct ou une vente en main propre à l'atelier"
            >
              <span>+ NOUVELLE VENTE DIRECTE (MAIN PROPRE)</span>
            </button>
          )}

          <button
            type="button"
            onClick={exportFinancialStatementCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B9A995]" />
            <span className="hidden sm:inline">Exporter Bordereau (CSV)</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </div>

      {/* Render Fiscal Registry View if active */}
      {activeView === 'registry' && (
        <SalesRegistry
          orders={orders}
          salesHistory={salesHistory}
          onOpenSlipModal={(ord) => setThermalSlipTx(ord)}
          onOpenInvoiceModal={(ord) => setSelectedA4InvoiceOrder(ord)}
          onOpenDirectSaleModal={onOpenDirectSaleModal}
          showNotice={showNotice}
        />
      )}

      {/* Render Standard Sales Journal View */}
      {activeView === 'journal' && (
        <div className="space-y-8">

      {/* 2. Key Metric Cards (Top Grid - 4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Chiffre d'Affaires Total */}
        <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-[#B9A995]/60 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#96918A]">
                Chiffre d'Affaires Total
              </span>
              <span className="text-[10px] font-mono text-[#B9A995] px-2 py-0.5 bg-[#141414] border border-[#B9A995]/20">
                Brut (Hors Annul.)
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-light text-[#E8E4DD] tabular-nums">
                {formatTND(totalRevenueLedger)}
              </span>
            </div>
            <p className="text-xs text-[#96918A] mt-1.5 font-light">
              {nonCancelledTransactions.length} commande(s) confirmée(s)
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
            <span>PORT FLAT : {formatTND(8)}</span>
            <span className="text-[#E8E4DD]">PAIEMENT COD</span>
          </div>
        </div>

        {/* Card 2: Encaissements Réalisés */}
        <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#96918A]">
                Encaissements Réalisés
              </span>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30">
                Encaissé
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-light text-emerald-400 tabular-nums">
                {formatTND(totalCashCollected)}
              </span>
            </div>
            <p className="text-xs text-[#96918A] mt-1.5 font-light">
              Fonds perçus à la livraison client (statut "Livrée")
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
            <span>REMISE EN MAIN PROPRE</span>
            <span className="text-emerald-400 font-semibold">CASH VALIDÉ</span>
          </div>
        </div>

        {/* Card 3: En Cours de Livraison */}
        <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-[#B9A995]/60 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#96918A]">
                En Cours de Livraison
              </span>
              <span className="text-[10px] font-mono text-[#B9A995] px-2 py-0.5 bg-[#141414] border border-[#B9A995]/20">
                En Transit
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-light text-[#E8E4DD] tabular-nums">
                {formatTND(inTransitAmount)}
              </span>
            </div>
            <p className="text-xs text-[#96918A] mt-1.5 font-light">
              {inTransitCount} colis en cours ou en préparation atelier
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
            <span>CRÉANCE LIVREUR</span>
            <span className="text-[#B9A995]">EN ATTENTE</span>
          </div>
        </div>

        {/* Card 4: Unités Vendues */}
        <div className="p-6 bg-[#181818] border border-[#34312D] flex flex-col justify-between hover:border-[#B9A995]/60 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#96918A]">
                Unités Vendues
              </span>
              <span className="text-[10px] font-mono text-[#E8E4DD] px-2 py-0.5 bg-[#141414] border border-[#34312D]">
                Volume
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-light text-[#E8E4DD] tabular-nums">
                {totalUnitsSold}
              </span>
              <span className="font-mono text-xs text-[#96918A]">pièces</span>
            </div>
            <p className="text-xs text-[#96918A] mt-1.5 font-light">
              Silhouettes confectionnées vendues (hors annulations)
            </p>
          </div>
          <div className="pt-3 mt-4 border-t border-[#34312D]/40 flex items-center justify-between text-[#96918A] font-mono text-[10px]">
            <span>MATRICE VARIANTES</span>
            <span className="text-[#E8E4DD]">ATELIER KŪZA</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar + Batch Remittance Toolbar */}
      <div className="space-y-3">
        {/* Top Search & Filter Bar */}
        <div className="p-4 bg-[#181818] border border-[#34312D] flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search input & Quick Reset Button */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96918A]" />
              <input
                type="text"
                placeholder="Recherche client, téléphone, gouvernorat, réf..."
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] pl-10 pr-4 py-2 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#141414] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#B9A995] hover:text-[#E8E4DD] transition-colors cursor-pointer shrink-0"
                title="Réinitialiser tous les filtres"
              >
                <XCircle className="w-4 h-4 cursor-pointer text-[#B9A995]" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Date Filter Pills */}
            <div className="flex items-center gap-1 bg-[#141414] p-1 border border-[#34312D]">
              <button
                type="button"
                onClick={() => setSalesDateFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                  salesDateFilter === 'all'
                    ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                    : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                Tout
              </button>
              <button
                type="button"
                onClick={() => setSalesDateFilter('today')}
                className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                  salesDateFilter === 'today'
                    ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                    : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => setSalesDateFilter('7days')}
                className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                  salesDateFilter === '7days'
                    ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                    : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                7 jours
              </button>
              <button
                type="button"
                onClick={() => setSalesDateFilter('30days')}
                className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                  salesDateFilter === '30days'
                    ? 'bg-[#E8E4DD] text-[#101010] font-semibold'
                    : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                30 jours
              </button>
            </div>

            {/* Status Dropdown */}
            <select
              value={salesStatusFilter}
              onChange={(e) => setSalesStatusFilter(e.target.value)}
              className="bg-[#141414] border border-[#34312D] text-[#E8E4DD] text-xs px-3 py-2 rounded-none focus:border-[#B9A995] focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="ENCAISSÉ">Encaissé (Livré)</option>
              <option value="EN_ATTENTE_LIVRAISON">En attente livreur</option>
              <option value="ANNULÉE">Annulé</option>
            </select>

            {onOpenDirectSaleModal && (
              <button
                type="button"
                onClick={onOpenDirectSaleModal}
                className="px-3.5 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                title="Enregistrer un retrait direct ou une vente en main propre à l'atelier"
              >
                <span>+ NOUVELLE VENTE DIRECTE (REMISE EN MAIN PROPRE)</span>
              </button>
            )}
          </div>
        </div>

        {/* Batch Action Toolbar */}
        <div className="p-3 bg-[#151515] border border-[#34312D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[#E8E4DD] hover:text-[#B9A995] bg-[#181818] border border-[#34312D] transition-colors cursor-pointer"
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#B9A995]" />
              ) : (
                <Square className="w-3.5 h-3.5 text-[#96918A]" />
              )}
              <span>
                {selectedTxIds.length > 0
                  ? `${selectedTxIds.length} sélectionnée(s)`
                  : 'Sélectionner Tout'}
              </span>
            </button>

            {selectedTxIds.length > 0 && (
              <span className="text-[11px] font-mono text-[#96918A]">
                Actions groupées sur {selectedTxIds.length} transaction(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Button: Batch Thermal Print */}
            <button
              type="button"
              disabled={selectedTxIds.length === 0}
              onClick={handleBatchPrintSelected}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedTxIds.length > 0
                  ? 'bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] shadow-md'
                  : 'bg-[#222222] text-[#96918A]/40 border border-[#34312D] cursor-not-allowed'
              }`}
              title="Générer une file d'impression 80mm continue pour tous les slips cochés"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>IMPRIMER SÉLECTIONNÉS ({selectedTxIds.length})</span>
            </button>

            {/* Button 1: Solid Emerald */}
            <button
              type="button"
              disabled={selectedTxIds.length === 0}
              onClick={handleBulkMarkEncaissé}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedTxIds.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-emerald-950/40 text-emerald-600/40 border border-emerald-900/30 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MARQUER ENCAISSÉ</span>
            </button>

            {/* Button 2: Outlined Beige */}
            <button
              type="button"
              onClick={exportFinancialStatementCSV}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#B9A995] text-[#B9A995] hover:bg-[#B9A995] hover:text-[#101010] font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Sales Ledger Table */}
      {filteredSalesTransactions.length === 0 ? (
        <div className="p-12 bg-[#181818] border border-[#34312D] text-center space-y-3">
          <Ban className="w-8 h-8 text-[#96918A] mx-auto opacity-40" />
          <p className="text-xs uppercase tracking-widest text-[#96918A] font-mono">
            Aucune transaction ne correspond aux critères
          </p>
          <p className="text-xs text-[#96918A] font-light max-w-sm mx-auto">
            Modifiez votre recherche ou réinitialisez les filtres pour afficher l'ensemble du registre.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop view: Table */}
          <div className="hidden md:block overflow-x-auto no-scrollbar bg-[#181818] border border-[#34312D]">
            <table className="w-full min-w-[1060px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#34312D] bg-[#141414] font-mono text-[11px] uppercase tracking-widest text-[#A0988E]">
                  <th className="py-3.5 px-4 font-normal w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                      className="cursor-pointer accent-[#B9A995]"
                      aria-label="Tout sélectionner"
                    />
                  </th>
                  <th className="py-3.5 px-4 font-normal text-[#A0988E]">Date / Heure</th>
                  <th className="py-3.5 px-4 font-normal text-[#A0988E]">Réf. Commande / Tx</th>
                  <th className="py-3.5 px-4 font-normal text-[#A0988E]">Client & Coordonnées</th>
                  <th className="py-3.5 px-4 font-normal text-[#A0988E]">Articles</th>
                  <th className="py-3.5 px-4 font-normal text-right text-[#A0988E]">Total (TND)</th>
                  <th className="py-3.5 px-4 font-normal text-center text-[#A0988E]">Statut Livraison</th>
                  <th className="py-3.5 px-4 font-normal text-right">Statut Paiement</th>
                  <th className="py-3.5 px-4 font-normal text-center no-print">Actions Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34312D]/60 font-light">
                {filteredSalesTransactions.map((tx) => {
                  const isDelivered = tx.paymentStatus === 'ENCAISSÉ' || tx.orderStatus === 'Livrée';
                  const isCancelled = tx.paymentStatus === 'ANNULÉE' || tx.orderStatus === 'Annulée';
                  const isSelected = selectedTxIds.includes(tx.transactionId);

                  const netAtelier = tx.subtotal ?? Math.max(0, tx.totalAmount - (tx.shippingFee ?? 8));
                  const port = tx.shippingFee ?? 8;

                  return (
                    <tr
                      key={tx.transactionId}
                      className={`transition-colors ${
                        isCancelled
                          ? 'opacity-50 bg-[#121212]/80 hover:bg-[#141414]'
                          : isSelected
                          ? 'bg-[#1c1b18] hover:bg-[#201e1a]'
                          : 'hover:bg-[#151515]'
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(tx.transactionId)}
                          className="cursor-pointer accent-[#B9A995]"
                          aria-label={`Sélectionner transaction ${tx.orderId}`}
                        />
                      </td>

                      {/* Date / Heure */}
                      <td className="py-4 px-4 font-mono text-[#96918A] whitespace-nowrap">
                        <div className="text-[#E8E4DD] font-medium">
                          {new Date(tx.timestamp).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-[#96918A] mt-0.5">
                          {new Date(tx.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Réf. Commande / Transaction */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#B9A995] block">
                          {tx.orderId}
                        </span>
                        <span className="font-mono text-[10px] text-[#96918A] block">
                          {tx.transactionId}
                        </span>
                      </td>

                      {/* Client & Coordonnées */}
                      <td className="py-4 px-4">
                        <div className="text-[#E8E4DD] font-medium">{tx.client.name}</div>
                        <div className="font-mono text-[11px] text-[#96918A]">{tx.client.phone}</div>
                        <div className="text-[11px] text-[#96918A] font-light truncate max-w-xs">
                          {tx.client.governorate} — {tx.client.address}
                        </div>
                      </td>

                      {/* Articles */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {tx.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-[#E8E4DD] font-medium">{it.name}</span>
                              <span className="text-[#96918A]">
                                ({it.color} · {it.size})
                              </span>
                              <span className="font-mono font-bold text-[#B9A995]">×{it.qty}</span>
                              <span className="font-mono text-[#96918A] text-[10px]">
                                ({formatTND(it.unitPrice)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total with Breakdown & Cancelled Strikethrough */}
                      <td className="py-4 px-4 text-right font-mono whitespace-nowrap">
                        <div
                          className={`text-sm font-semibold tabular-nums ${
                            isCancelled
                              ? 'line-through text-rose-400/80'
                              : 'text-[#E8E4DD]'
                          }`}
                        >
                          {formatTND(tx.totalAmount)}
                        </div>
                        <div className="text-[10px] text-[#96918A] font-light mt-0.5">
                          Net Atelier: {formatTND(netAtelier)} | Port: {formatTND(port)}
                        </div>
                      </td>

                      {/* Statut Livraison (Interactive Selector) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <select
                          value={tx.orderStatus || 'Commande reçue'}
                          onChange={(e) => onUpdateOrderStatus(tx.orderId, e.target.value)}
                          className="bg-[#141414] border border-[#34312D] text-[#E8E4DD] text-xs px-2.5 py-1.5 rounded-none focus:border-[#B9A995] focus:outline-none cursor-pointer"
                        >
                          <option value="Commande reçue">Commande reçue</option>
                          <option value="Confirmation en cours">Confirmation en cours</option>
                          <option value="Commande confirmée">Commande confirmée</option>
                          <option value="En préparation">En préparation</option>
                          <option value="Expédiée">Expédiée</option>
                          <option value="Livrée">Livrée (Encaissement)</option>
                          <option value="Annulée">Annulée (Restock)</option>
                        </select>
                      </td>

                      {/* Statut Paiement Badge */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border ${
                            isDelivered
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : isCancelled
                              ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                              : 'border-[#B9A995]/40 text-[#B9A995] bg-[#B9A995]/10'
                          }`}
                        >
                          {isDelivered ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>ENCAISSÉ</span>
                            </>
                          ) : isCancelled ? (
                            <>
                              <Ban className="w-3 h-3 text-rose-400" />
                              <span>ANNULÉE</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-[#B9A995]" />
                              <span>EN ATTENTE</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action Buttons: IMPRIMER SLIP + FACTURE PDF */}
                      <td className="py-4 px-4 text-center whitespace-nowrap no-print">
                        <div className="flex items-center justify-center gap-2">
                          {/* 1. Imprimer Slip Thermique 80mm */}
                          <button
                            type="button"
                            onClick={() => setThermalSlipTx(tx)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#B9A995] text-[#101010] font-mono text-[10px] font-semibold uppercase hover:bg-[#E8E4DD] transition-colors cursor-pointer shadow-sm"
                            title="Imprimer le ticket thermique 80mm pour livreur"
                          >
                            <Printer className="w-3 h-3 text-[#101010]" />
                            <span>Imprimer Slip</span>
                          </button>

                          {/* 2. Facture PDF A4 */}
                          <button
                            type="button"
                            onClick={() => setSelectedA4InvoiceOrder(createOrderModel(tx))}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141414] border border-[#34312D] text-[#E8E4DD] hover:border-[#B9A995] hover:text-[#B9A995] font-mono text-[10px] uppercase transition-colors cursor-pointer"
                            title="Visualiser et imprimer la facture certifiée A4"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#B9A995]" />
                            <span>Facture PDF A4</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Cards */}
          <div className="block md:hidden space-y-4">
            {filteredSalesTransactions.map((tx) => {
              const isDelivered = tx.paymentStatus === 'ENCAISSÉ' || tx.orderStatus === 'Livrée';
              const isCancelled = tx.paymentStatus === 'ANNULÉE' || tx.orderStatus === 'Annulée';
              const isSelected = selectedTxIds.includes(tx.transactionId);

              const netAtelier = tx.subtotal ?? Math.max(0, tx.totalAmount - (tx.shippingFee ?? 8));
              const port = tx.shippingFee ?? 8;

              return (
                <div
                  key={tx.transactionId}
                  className={`bg-[#181818] border border-[#34312D] p-4 space-y-4 text-xs transition-colors ${
                    isCancelled
                      ? 'opacity-50 bg-[#121212]/80'
                      : isSelected
                      ? 'border-[#B9A995]/60 bg-[#1c1b18]'
                      : ''
                  }`}
                >
                  {/* Card Header: Checkbox + order ID, date, status */}
                  <div className="flex justify-between items-start border-b border-[#34312D] pb-3">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tx.transactionId)}
                        className="mt-0.5 cursor-pointer accent-[#B9A995]"
                        aria-label={`Sélectionner transaction ${tx.orderId}`}
                      />
                      <div>
                        <span className="font-mono font-bold text-[#B9A995] text-sm block">
                          {tx.orderId}
                        </span>
                        <span className="font-mono text-[10px] text-[#96918A]">
                          {new Date(tx.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${
                          isDelivered
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : isCancelled
                            ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                            : 'border-[#B9A995]/40 text-[#B9A995] bg-[#B9A995]/10'
                        }`}
                      >
                        {isDelivered ? 'ENCAISSÉ' : isCancelled ? 'ANNULÉE' : 'EN ATTENTE'}
                      </span>
                      
                      <span className="text-[10px] text-[#96918A] font-mono bg-[#141414] px-1.5 py-0.5 border border-[#34312D]">
                        {tx.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Client details */}
                  <div className="space-y-1">
                    <span className="text-[#96918A] font-mono text-[10px] uppercase tracking-wider block">
                      CLIENT & COORDONNÉES
                    </span>
                    <div className="text-[#E8E4DD] font-medium">
                      {tx.client.name} · <span className="font-mono text-[#96918A]">{tx.client.phone}</span>
                    </div>
                    <div className="text-[#96918A] leading-relaxed text-[11px]">
                      {tx.client.governorate} — {tx.client.address}
                    </div>
                  </div>

                  {/* Items detail */}
                  <div className="space-y-1.5 bg-[#141414] border border-[#34312D] p-2.5">
                    <span className="text-[#96918A] font-mono text-[10px] uppercase tracking-wider block">
                      ARTICLES
                    </span>
                    <div className="divide-y divide-[#34312D]/60 space-y-1">
                      {tx.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] pt-1 first:pt-0">
                          <span className="text-[#E8E4DD]">
                            {it.name} ({it.color} · {it.size})
                          </span>
                          <span className="font-mono font-bold text-[#B9A995]">×{it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer total + Actions */}
                  <div className="flex flex-col gap-3 border-t border-[#34312D] pt-3">
                    <div className="flex justify-between items-baseline font-mono">
                      <div>
                        <span className="text-[9px] text-[#96918A] uppercase block">Total (COD)</span>
                        <span
                          className={`text-sm font-semibold ${
                            isCancelled ? 'line-through text-rose-400/80' : 'text-[#E8E4DD]'
                          }`}
                        >
                          {formatTND(tx.totalAmount)}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-[#96918A]">
                        Net Atelier: {formatTND(netAtelier)}<br />
                        Port: {formatTND(port)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#34312D]/40">
                      <select
                        value={tx.orderStatus || 'Commande reçue'}
                        onChange={(e) => onUpdateOrderStatus(tx.orderId, e.target.value)}
                        className="bg-[#141414] border border-[#34312D] text-[#E8E4DD] text-[11px] px-2 py-1.5 focus:outline-none cursor-pointer font-mono"
                      >
                        <option value="Commande reçue">Reçue</option>
                        <option value="Confirmation en cours">Confirm. en cours</option>
                        <option value="Commande confirmée">Confirmée</option>
                        <option value="En préparation">Préparation</option>
                        <option value="Expédiée">Expédiée</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Annulée">Annulée</option>
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setThermalSlipTx(tx)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#B9A995] text-[#101010] font-mono text-[10px] font-semibold uppercase hover:bg-[#E8E4DD] transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-[#101010]" />
                          <span>Slip 80mm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedA4InvoiceOrder(createOrderModel(tx))}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141414] border border-[#34312D] text-[#E8E4DD] hover:border-[#B9A995] hover:text-[#B9A995] font-mono text-[10px] uppercase transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-[#B9A995]" />
                          <span>PDF A4</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </div>
      )}

      {/* 80mm Thermal Receipt Print Modal (Single or Batch Continuous Queue) */}
      {(thermalSlipTx || batchThermalTxs) && (
        <ThermalReceiptModal
          order={thermalSlipTx ? createOrderModel(thermalSlipTx) : undefined}
          orders={batchThermalTxs ? batchThermalTxs.map(createOrderModel) : undefined}
          onClose={() => {
            setThermalSlipTx(null);
            setBatchThermalTxs(null);
          }}
        />
      )}

      {/* Certified A4 Invoice Print Modal */}
      {selectedA4InvoiceOrder && (
        <InvoiceModal
          order={selectedA4InvoiceOrder}
          onClose={() => setSelectedA4InvoiceOrder(null)}
        />
      )}
    </div>
  );
};

export default SalesJournal;
