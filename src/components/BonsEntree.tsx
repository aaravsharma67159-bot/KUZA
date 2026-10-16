import React, { useState, useMemo } from 'react';
import {
  PackageCheck,
  Search,
  Download,
  Plus,
  Eye,
  Printer,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { StockEntryNote } from '../types';
import { Product } from '../data/products';
import { formatTND } from '../utils/currency';
import { generatePdfStockEntry } from '../utils/pdfStockEntry';

interface BonsEntreeProps {
  entries: StockEntryNote[];
  products: Product[];
  onOpenCreateModal: () => void;
  onOpenPrintModal: (entry: StockEntryNote) => void;
  onValidateDraft: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
  showNotice: (msg: string) => void;
}

export const BonsEntree: React.FC<BonsEntreeProps> = ({
  entries,
  products,
  onOpenCreateModal,
  onOpenPrintModal,
  onValidateDraft,
  onDeleteEntry,
  showNotice,
}) => {
  const [entrySearch, setEntrySearch] = useState('');
  const [entryStatusFilter, setEntryStatusFilter] = useState<'all' | 'VALIDATED' | 'DRAFT'>('all');
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<StockEntryNote | null>(null);

  // Filtered Stock Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const q = entrySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        entry.id.toLowerCase().includes(q) ||
        entry.supplierAtelier.toLowerCase().includes(q) ||
        entry.referenceBatch.toLowerCase().includes(q) ||
        entry.createdByName.toLowerCase().includes(q) ||
        entry.items.some(
          (it) =>
            it.productName.toLowerCase().includes(q) ||
            it.color.toLowerCase().includes(q) ||
            it.size.toLowerCase().includes(q)
        );

      const matchStatus =
        entryStatusFilter === 'all' || entry.status === entryStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [entries, entrySearch, entryStatusFilter]);

  // Total valuation calculation
  const totalValuationAll = useMemo(() => {
    return entries.reduce((acc, ent) => {
      const defaultUnitCost = ent.unitCostDefault ?? 22;
      const cost =
        ent.totalCost ??
        ent.items.reduce(
          (sum, it) => sum + it.quantityAdded * (it.unitCost ?? defaultUnitCost),
          0
        );
      return acc + cost;
    }, 0);
  }, [entries]);

  const totalPiecesAll = useMemo(() => {
    return entries.reduce((acc, ent) => acc + ent.totalPieces, 0);
  }, [entries]);

  // CSV Export for Bons d'Entrée
  const exportCSV = () => {
    if (filteredEntries.length === 0) {
      showNotice('Aucun bon à exporter');
      return;
    }

    const headers = [
      'Référence Bon',
      'Date & Heure',
      'Atelier / Fournisseur',
      'Lot / Référence Tissu',
      'Responsable Réception',
      'Articles Reçus',
      'Total Pièces',
      'Coût Confection Moyen (TND)',
      'Valeur Totale Bon (TND)',
      'Statut',
      'Remarques',
    ];

    const rows = filteredEntries.map((ent) => {
      const defaultUnitCost = ent.unitCostDefault ?? 22;
      const cost =
        ent.totalCost ??
        ent.items.reduce(
          (sum, it) => sum + it.quantityAdded * (it.unitCost ?? defaultUnitCost),
          0
        );

      return [
        ent.id,
        new Date(ent.date).toLocaleString('fr-FR'),
        `"${ent.supplierAtelier.replace(/"/g, '""')}"`,
        `"${ent.referenceBatch.replace(/"/g, '""')}"`,
        `"${ent.createdByName.replace(/"/g, '""')}"`,
        `"${ent.items
          .map((it) => `${it.productName} (${it.color} · ${it.size}) ×${it.quantityAdded}`)
          .join(' | ')}"`,
        ent.totalPieces,
        defaultUnitCost.toFixed(3),
        cost.toFixed(3),
        ent.status,
        `"${(ent.notes || '').replace(/"/g, '""')}"`,
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
      `kuza_bons_entree_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`Registre des réceptions (${filteredEntries.length} bons) exporté en CSV`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header with Correct Accent Typography */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#34312D] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-2xl md:text-3xl font-serif text-[#E8E4DD]"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              Bons d'Entrée (Réception Stock)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#181818] border border-emerald-500/40 text-emerald-400">
              Réception Dépôt & Stock Central
            </span>
          </div>
          <p className="text-xs text-[#96918A] font-light mt-1">
            Système officiel de réception des pièces livrées au stock central. Validation directe ou brouillon avec valorisation du coût confection et incrémentation de stock.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B9A995]" />
            <span>Exporter Registre (CSV)</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#E8E4DD] hover:bg-white text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Bon d'Entrée</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-wider text-[#96918A] block">
            Total Bons Établis
          </span>
          <span className="text-2xl font-bold text-[#E8E4DD] block mt-1 tabular-nums">
            {entries.length}
          </span>
          <span className="text-[10px] text-[#96918A]">Documents officiels archivés</span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-wider text-[#96918A] block">
            Pièces Réceptionnées
          </span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1 tabular-nums">
            +{totalPiecesAll}
          </span>
          <span className="text-[10px] text-[#96918A]">Volume confection validé</span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-wider text-[#96918A] block">
            Valorisation Confection
          </span>
          <span className="text-2xl font-bold text-[#B9A995] block mt-1 tabular-nums">
            {formatTND(totalValuationAll)}
          </span>
          <span className="text-[10px] text-[#96918A]">Coût total atelier injecté</span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#34312D]">
          <span className="text-[10px] uppercase tracking-wider text-[#96918A] block">
            Bons en Attente (Brouillons)
          </span>
          <span className="text-2xl font-bold text-amber-400 block mt-1 tabular-nums">
            {entries.filter((e) => e.status === 'DRAFT').length}
          </span>
          <span className="text-[10px] text-[#96918A]">En cours de vérification</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-[#181818] border border-[#34312D] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#96918A]" />
          <input
            type="text"
            placeholder="Rechercher par réf bon (BE-2026), lot, atelier, modèle..."
            value={entrySearch}
            onChange={(e) => setEntrySearch(e.target.value)}
            className="w-full bg-[#141414] border border-[#34312D] focus:border-[#B9A995] pl-10 pr-4 py-2 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] text-[#96918A] uppercase tracking-wider hidden sm:inline">
            Statut :
          </span>
          <div className="flex items-center gap-1 bg-[#141414] p-1 border border-[#34312D]">
            {(['all', 'VALIDATED', 'DRAFT'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setEntryStatusFilter(st)}
                className={`px-2.5 py-1 text-xs uppercase transition-colors cursor-pointer ${
                  entryStatusFilter === st
                    ? 'bg-[#E8E4DD] text-[#101010] font-bold'
                    : 'text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                {st === 'all' ? 'TOUS' : st === 'VALIDATED' ? 'VALIDÉS' : 'BROUILLONS'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Table Grid with Cost Tracking, Swatch Chips, and Action Icons */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center bg-[#181818] border border-[#34312D] space-y-2 font-mono">
          <PackageCheck className="w-8 h-8 text-[#96918A] mx-auto opacity-40" />
          <p className="text-xs text-[#E8E4DD]">
            Aucun Bon d'Entrée ne correspond aux critères de recherche.
          </p>
          <p className="text-[11px] text-[#96918A]">
            Cliquez sur « Nouveau Bon d'Entrée » pour réceptionner un arrivage de fabrication.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto no-scrollbar border border-[#34312D] bg-[#181818]">
            <table className="w-full text-left text-xs font-mono border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[#141414] border-b border-[#34312D] text-[#96918A]">
                  <th className="py-3 px-4 uppercase tracking-wider">Réf Bon</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Atelier / Fournisseur</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Lot Tissu</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Articles Reçus (Coloris)</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-right">Volume</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-right">Coût Confection / Valeur</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-center">Statut</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34312D]/60">
                {filteredEntries.map((entry) => {
                  const isValidated = entry.status === 'VALIDATED';
                  const defaultUnitCost = entry.unitCostDefault ?? 22;
                  const totalVal =
                    entry.totalCost ??
                    entry.items.reduce(
                      (sum, it) => sum + it.quantityAdded * (it.unitCost ?? defaultUnitCost),
                      0
                    );

                  return (
                    <tr key={entry.id} className="hover:bg-[#141414]/60 transition-colors">
                      {/* Réf */}
                      <td className="py-3.5 px-4 font-bold text-[#E8E4DD] whitespace-nowrap">
                        <span className="text-[#B9A995] bg-[#141414] px-2 py-0.5 border border-[#34312D]">
                          {entry.id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#96918A] whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Supplier & Creator */}
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-medium text-[#E8E4DD]">
                          {entry.supplierAtelier}
                        </div>
                        <div className="text-[10px] text-[#96918A]">
                          Par : {entry.createdByName}
                        </div>
                      </td>

                      {/* Lot */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-[#B9A995]">
                          {entry.referenceBatch}
                        </span>
                      </td>

                      {/* Articles Reçus with Color Swatch Chips */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1.5">
                          {entry.items.map((it, idx) => {
                            const isNoir = it.color.toLowerCase().includes('noir');
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-[11px] text-[#96918A]"
                              >
                                <span
                                  className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
                                    isNoir
                                      ? 'bg-black border-zinc-600'
                                      : 'bg-[#D4C7B8] border-[#A89F91]'
                                  }`}
                                  title={it.color}
                                />
                                <span className="text-[#E8E4DD] font-medium">
                                  {it.productName}
                                </span>
                                <span>·</span>
                                <span>{it.color} ({it.size})</span>
                                <span className="font-bold text-emerald-400">
                                  +{it.quantityAdded}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                          +{entry.totalPieces} pcs
                        </span>
                      </td>

                      {/* Coût Confection & Valeur Totale Bon */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono">
                        <div className="text-[#E8E4DD] font-bold text-xs">
                          {formatTND(totalVal)}
                        </div>
                        <div className="text-[10px] text-[#96918A] mt-0.5">
                          Coût : {formatTND(defaultUnitCost)} / unit
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border ${
                            isValidated
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          {isValidated ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>VALIDÉ</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>BROUILLON</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions: View (Eye), Print/PDF, Delete */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1. View / Details Button (Eye) */}
                          <button
                            type="button"
                            onClick={() => setSelectedEntryDetail(entry)}
                            title="Consulter le détail du bon"
                            className="p-1.5 bg-[#141414] text-[#A0988E] hover:text-[#E8E4DD] border border-[#34312D] hover:border-[#B9A995] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Validate Draft if not yet validated */}
                          {!isValidated && (
                            <button
                              type="button"
                              onClick={() => onValidateDraft(entry.id)}
                              title="Valider et injecter immédiatement en stock"
                              className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* 2. Print / PDF Button */}
                          <button
                            type="button"
                            onClick={() => onOpenPrintModal(entry)}
                            title="Imprimer / Télécharger le bon PDF"
                            className="p-1.5 bg-[#141414] text-[#E8E4DD] hover:text-[#B9A995] border border-[#34312D] hover:border-[#B9A995] transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* 3. Delete Button */}
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(entry.id)}
                            title="Supprimer ce bon"
                            className="p-1.5 text-[#96918A] hover:text-rose-400 hover:bg-[#141414] border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3 font-mono text-xs">
            {filteredEntries.map((entry) => {
              const isValidated = entry.status === 'VALIDATED';
              const defaultUnitCost = entry.unitCostDefault ?? 22;
              const totalVal =
                entry.totalCost ??
                entry.items.reduce(
                  (sum, it) => sum + it.quantityAdded * (it.unitCost ?? defaultUnitCost),
                  0
                );

              return (
                <div
                  key={entry.id}
                  className="bg-[#181818] border border-[#34312D] p-4 space-y-3"
                >
                  <div className="flex justify-between items-start border-b border-[#34312D] pb-2">
                    <div>
                      <span className="text-[#B9A995] font-bold text-xs bg-[#141414] px-1.5 py-0.5 border border-[#34312D] inline-block">
                        {entry.id}
                      </span>
                      <span className="text-[10px] text-[#96918A] block mt-1">
                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                        isValidated
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      {isValidated ? 'VALIDÉ' : 'BROUILLON'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[#E8E4DD] font-sans font-medium text-xs">
                      {entry.supplierAtelier}
                    </div>
                    <div className="text-[11px] text-[#B9A995]">
                      Lot : {entry.referenceBatch}
                    </div>
                    <div className="text-[10px] text-[#96918A]">
                      Par : {entry.createdByName}
                    </div>
                  </div>

                  {/* Items with Swatches */}
                  <div className="p-2.5 bg-[#141414] border border-[#34312D] space-y-1.5">
                    <span className="text-[9px] text-[#96918A] uppercase block mb-1">
                      Articles ({entry.totalPieces} pcs) :
                    </span>
                    {entry.items.map((it, idx) => {
                      const isNoir = it.color.toLowerCase().includes('noir');
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full border shrink-0 ${
                                isNoir
                                  ? 'bg-black border-zinc-600'
                                  : 'bg-[#D4C7B8] border-[#A89F91]'
                              }`}
                            />
                            <span className="text-[#E8E4DD]">
                              {it.productName} ({it.color} · {it.size})
                            </span>
                          </div>
                          <span className="font-bold text-emerald-400">+{it.quantityAdded}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Valuation */}
                  <div className="flex justify-between items-center text-[11px] bg-[#141414] p-2 border border-[#34312D]/60">
                    <span className="text-[#96918A]">Valeur totale :</span>
                    <span className="font-bold text-[#E8E4DD]">{formatTND(totalVal)}</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#34312D]/60">
                    <span className="text-emerald-400 font-bold text-xs">
                      +{entry.totalPieces} pièces
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEntryDetail(entry)}
                        className="p-1.5 bg-[#141414] border border-[#34312D] text-[#A0988E] hover:text-[#E8E4DD]"
                        title="Consulter"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {!isValidated && (
                        <button
                          type="button"
                          onClick={() => onValidateDraft(entry.id)}
                          className="px-2.5 py-1 text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold"
                        >
                          Valider
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenPrintModal(entry)}
                        className="p-1.5 bg-[#141414] border border-[#34312D] text-[#E8E4DD]"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteEntry(entry.id)}
                        className="p-1.5 text-[#96918A] hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. View Details Modal (triggered by Eye icon) */}
      {selectedEntryDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl bg-[#101010] border border-[#34312D] text-[#E8E4DD] shadow-2xl overflow-hidden flex flex-col my-auto animate-fade-in font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#34312D] bg-[#141414]">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg uppercase tracking-wider text-[#E8E4DD]">
                  Détail Bon d'Entrée
                </span>
                <span className="text-[#B9A995] font-bold bg-[#181818] px-2.5 py-0.5 border border-[#34312D]">
                  {selectedEntryDetail.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedEntryDetail(null)}
                className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#181818] border border-[#34312D]">
                <div>
                  <span className="text-[10px] text-[#96918A] uppercase block">Atelier</span>
                  <span className="text-sm font-bold text-[#E8E4DD]">{selectedEntryDetail.supplierAtelier}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#96918A] uppercase block">Lot Tissu</span>
                  <span className="text-sm font-bold text-[#B9A995]">{selectedEntryDetail.referenceBatch}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#96918A] uppercase block">
                  Articles Reçus ({selectedEntryDetail.totalPieces} pièces)
                </span>
                <div className="border border-[#34312D] divide-y divide-[#34312D]/60 bg-[#181818]">
                  {selectedEntryDetail.items.map((it, idx) => {
                    const uCost = it.unitCost ?? selectedEntryDetail.unitCostDefault ?? 22;
                    const tCost = it.totalCost ?? it.quantityAdded * uCost;
                    return (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[#E8E4DD]">{it.productName}</div>
                          <div className="text-[11px] text-[#96918A]">
                            Coloris : {it.color} · Taille : {it.size} · Qté : <strong className="text-emerald-400">+{it.quantityAdded}</strong>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#E8E4DD]">{formatTND(tCost)}</div>
                          <div className="text-[10px] text-[#96918A]">{formatTND(uCost)} / unit</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedEntryDetail.notes && (
                <div className="p-3 bg-[#181818] border border-[#34312D] text-xs">
                  <span className="text-[10px] text-[#96918A] uppercase block mb-1">Observations :</span>
                  <p className="italic text-[#E8E4DD]">« {selectedEntryDetail.notes} »</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#34312D] bg-[#141414] flex items-center justify-between">
              <button
                onClick={() => setSelectedEntryDetail(null)}
                className="px-4 py-2 border border-[#34312D] text-[#96918A] hover:text-[#E8E4DD] uppercase"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const target = selectedEntryDetail;
                  setSelectedEntryDetail(null);
                  onOpenPrintModal(target);
                }}
                className="px-4 py-2 bg-[#E8E4DD] text-[#101010] font-bold uppercase flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / Bon PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonsEntree;
