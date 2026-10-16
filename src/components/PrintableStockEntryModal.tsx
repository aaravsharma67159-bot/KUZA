import React from 'react';
import { X, Printer, PackageCheck, Layers, Calendar, User, FileText, CheckCircle2, Download } from 'lucide-react';
import { StockEntryNote } from '../types';
import { formatTND } from '../utils/currency';
import { generatePdfStockEntry } from '../utils/pdfStockEntry';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

interface PrintableStockEntryModalProps {
  entryNote: StockEntryNote | null;
  onClose: () => void;
}

export const PrintableStockEntryModal: React.FC<PrintableStockEntryModalProps> = ({
  entryNote,
  onClose,
}) => {
  if (!entryNote) return null;

  const defaultUnitCost = entryNote.unitCostDefault ?? 22;
  const totalValuation =
    entryNote.totalCost ??
    entryNote.items.reduce(
      (sum, it) => sum + it.quantityAdded * (it.unitCost ?? defaultUnitCost),
      0
    );

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = () => {
    generatePdfStockEntry(entryNote);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-entry-title"
    >
      <div className="relative w-full max-w-3xl bg-[#141414] border border-[#34312D] text-[#E8E4DD] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-fade-in">
        {/* Top Modal Controls bar (hidden in print) */}
        <div className="p-4 bg-[#101010] border-b border-[#34312D] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#B9A995]">
              ATELIER DIRECTOIRE · BORDEREAU DE RÉCEPTION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePdf}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-xs font-mono text-[#E8E4DD] hover:text-[#B9A995] transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#B9A995]" />
              <span>Facture / Bon PDF</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer Bon</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="p-6 sm:p-10 overflow-y-auto no-scrollbar bg-[#121212] print:bg-white print:text-black print:p-8 space-y-8 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-[#34312D] print:border-black/30 pb-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#181818] border border-[#34312D] print:bg-transparent print:border-black/20 shrink-0">
                <KuzaMonogram className="w-9 h-9 text-[#B9A995] print:text-black" fillColor="currentColor" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#B9A995] print:text-neutral-600 block">
                  ATELIER CONFECTION DE LUXE · TUNIS
                </span>
                <KuzaLogo className="h-6 w-auto text-[#E8E4DD] print:text-black my-1" />
                <p className="text-xs font-mono text-[#96918A] print:text-neutral-500">
                  REGISTRE OFFICIEL DES MOUVEMENTS DE STOCK
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print:bg-transparent print:border-black print:text-black">
                {entryNote.status === 'VALIDATED' ? 'BON VALIDÉ & STOCK INJECTÉ' : 'BROUILLON EN ATTENTE'}
              </span>
              <div className="font-mono text-sm font-bold text-[#E8E4DD] print:text-black mt-1">
                {entryNote.id}
              </div>
              <div className="text-xs font-mono text-[#96918A] print:text-neutral-600">
                Date : {new Date(entryNote.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Supplier & Batch Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#181818] border border-[#34312D] print:bg-neutral-50 print:border-black/20 text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#96918A] uppercase tracking-wider block print:text-neutral-500">
                Atelier / Fournisseur
              </span>
              <span className="font-semibold text-[#E8E4DD] print:text-black text-sm block mt-0.5">
                {entryNote.supplierAtelier}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#96918A] uppercase tracking-wider block print:text-neutral-500">
                Lot / Référence Tissu
              </span>
              <span className="font-semibold text-[#B9A995] print:text-neutral-800 text-sm block mt-0.5">
                {entryNote.referenceBatch}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#96918A] uppercase tracking-wider block print:text-neutral-500">
                Responsable Réception & Visa
              </span>
              <span className="font-semibold text-[#E8E4DD] print:text-black text-sm block mt-0.5">
                {entryNote.createdByName || 'Maître Mehdi - Atelier 01'}
              </span>
            </div>
          </div>

          {/* Items Table with Cost Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B9A995] print:text-neutral-700 font-bold">
                DÉTAIL DES PIÈCES RÉCEPTIONNÉES & VALORISATION
              </span>
              <span className="text-xs font-mono text-[#96918A] print:text-neutral-600">
                Total : {entryNote.totalPieces} pièces
              </span>
            </div>

            <table className="w-full text-left text-xs font-mono border-collapse border border-[#34312D] print:border-black/30">
              <thead>
                <tr className="bg-[#181818] print:bg-neutral-100 border-b border-[#34312D] print:border-black/30 text-[#96918A] print:text-neutral-700">
                  <th className="py-2.5 px-3 uppercase tracking-wider">Modèle & Coloris</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider text-center">Taille</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider text-center">Volume</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider text-right">Coût Unitaire</th>
                  <th className="py-2.5 px-3 uppercase tracking-wider text-right">Valeur Bon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34312D] print:divide-black/20">
                {entryNote.items.map((item, idx) => {
                  const uCost = item.unitCost ?? defaultUnitCost;
                  const tCost = item.totalCost ?? item.quantityAdded * uCost;
                  const isNoir = item.color.toLowerCase().includes('noir');

                  return (
                    <tr key={idx} className="hover:bg-[#181818]/50 print:hover:bg-transparent">
                      <td className="py-2.5 px-3 font-semibold text-[#E8E4DD] print:text-black">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
                              isNoir ? 'bg-black border-zinc-500' : 'bg-[#D4C7B8] border-[#A89F91]'
                            }`}
                          />
                          <span>{item.productName} ({item.color})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 bg-[#181818] border border-[#34312D] text-[#E8E4DD] font-bold text-[11px] print:bg-transparent print:border-black/40 print:text-black">
                          {item.size}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-400 print:text-black">
                        +{item.quantityAdded} pcs
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#96918A] print:text-black">
                        {formatTND(uCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#E8E4DD] print:text-black">
                        {formatTND(tCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#181818] print:bg-neutral-100 border-t-2 border-[#34312D] print:border-black font-bold">
                  <td colSpan={2} className="py-3 px-3 uppercase text-right text-[#E8E4DD] print:text-black">
                    TOTAL GLOBAL ENTRÉES :
                  </td>
                  <td className="py-3 px-3 text-center text-sm text-emerald-400 print:text-black">
                    +{entryNote.totalPieces} pcs
                  </td>
                  <td className="py-3 px-3 text-right text-xs text-[#96918A] print:text-black">
                    Moyenne : {formatTND(defaultUnitCost)}
                  </td>
                  <td className="py-3 px-3 text-right text-sm text-[#B9A995] print:text-black">
                    {formatTND(totalValuation)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes & Atelier Signatures Stamp */}
          <div className="space-y-4 pt-4 border-t border-[#34312D] print:border-black/30">
            {entryNote.notes && (
              <div className="p-3 bg-[#181818] border border-[#34312D] print:bg-neutral-50 print:border-black/20 text-xs font-mono">
                <span className="text-[10px] text-[#96918A] uppercase block mb-1 print:text-neutral-500">
                  Observations / Remarques Contrôle Qualité :
                </span>
                <p className="text-[#E8E4DD] print:text-black italic">
                  « {entryNote.notes} »
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 pt-8 font-mono text-[11px] print:pt-6">
              <div className="border-t border-[#34312D] print:border-black/50 pt-2 text-center text-[#96918A] print:text-neutral-700">
                Signature Responsable Atelier
                <div className="h-14 flex items-center justify-center italic text-[#B9A995] print:text-neutral-800">
                  {entryNote.createdByName || 'Atelier Confection'}
                </div>
              </div>
              <div className="border-t border-[#34312D] print:border-black/50 pt-2 text-center text-[#96918A] print:text-neutral-700">
                Visa Contrôle Qualité & Clôture
                <div className="h-14 flex flex-col items-center justify-center">
                  <div className="px-3 py-1 border border-emerald-500/60 rounded text-[10px] text-emerald-400 font-bold uppercase tracking-wider print:border-black print:text-black">
                    KŪZA ATELIER · APPROUVÉ
                  </div>
                  <span className="text-[9px] text-[#96918A] mt-1 print:text-neutral-600">
                    Maître Mehdi - Atelier 01
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableStockEntryModal;
