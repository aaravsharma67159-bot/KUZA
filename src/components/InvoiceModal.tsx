import React, { useState, useEffect } from 'react';
import { X, Printer, Download, ZoomIn, ZoomOut, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatTND } from '../utils/currency';
import { KUZA_CONTACT } from '../utils/contact';
import { generatePdfInvoice } from '../utils/pdfInvoice';
import { numberToFrenchWords } from '../utils/numberToWordsFrench';
import { PrintableOrderModel } from './PrintableBordereauModal';

export interface InvoiceModalProps {
  order?: PrintableOrderModel | any;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const [scale, setScale] = useState<number>(1.0);

  // Keyboard shortcut ESC to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const adjustScale = (delta: number) => {
    if (delta === 1.0) {
      setScale(1.0);
    } else {
      setScale((prev) => Math.min(1.4, Math.max(0.65, parseFloat((prev * delta).toFixed(2)))));
    }
  };

  // Safe mapping of order data with default demo fallback for #KZ-8682
  const orderId = order?.orderId || order?.id || 'KZ-8682';
  const numericId = orderId.replace(/[^0-9]/g, '') || '08682';
  const invoiceRef = `FAC-2026-${numericId.padStart(5, '0')}`;

  const rawDate = order?.date || order?.createdAt || order?.timestamp || '05/10/2026 — 14:30:00';
  let formattedDateTime = rawDate;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0');
      formattedDateTime = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} — ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
  } catch {
    formattedDateTime = rawDate;
  }

  const clientName = order?.customerName || order?.client?.name || 'Ines Chaabane';
  const clientPhone = order?.phone || order?.client?.phone || '+216 92 654 321';
  const clientGov = order?.governorate || order?.client?.governorate || 'Bizerte';
  const clientAddress = order?.address || order?.client?.address || 'Corniche de Bizerte, Résidence Émeraude';
  const fullAddress = `${clientAddress}, ${clientGov} — République Tunisienne`;

  // Item lines calculation
  const rawItems = order?.items && order.items.length > 0 ? order.items : null;
  const itemsList = rawItems
    ? rawItems.map((it: any, idx: number) => {
        const name = it.product?.name || it.name || 'SHELTER SWEAT — 290 GSM';
        const color = it.selectedColor?.name || it.color || 'Noir Minéral';
        const size = it.selectedSize || it.size || 'XS';
        const qty = it.quantity !== undefined ? it.quantity : it.qty !== undefined ? it.qty : 1;
        const ttcUnitPrice =
          it.product?.price !== undefined
            ? it.product.price
            : it.unitPrice !== undefined
            ? it.unitPrice
            : 79;
        const totalTTC = ttcUnitPrice * qty;
        const totalHT = totalTTC / 1.19;
        const unitHT = ttcUnitPrice / 1.19;

        return {
          sku: `KZ-SW-0${idx + 1}`,
          name,
          spec: `${color} · Taille ${size} · Broderie nuque soie végétale beige #B9A995`,
          qty,
          unitHT,
          totalHT,
          totalTTC,
        };
      })
    : [
        {
          sku: 'KZ-SW-01',
          name: 'SHELTER SWEAT — 290 GSM',
          spec: 'Noir Minéral · Taille XS · Broderie nuque soie végétale beige #B9A995',
          qty: 1,
          unitHT: 66.387,
          totalHT: 66.387,
          totalTTC: 79.0,
        },
      ];

  const shippingTTC =
    order?.shippingFee !== undefined
      ? order.shippingFee
      : order?.shipping !== undefined
      ? order.shipping
      : 8.0;
  const shippingHT = shippingTTC / 1.19;

  const itemsTotalHT = itemsList.reduce((acc: number, it: any) => acc + it.totalHT, 0);
  const baseImposableHT = itemsTotalHT + shippingHT;
  const tva19 = baseImposableHT * 0.19;
  const netTotalTTC =
    order?.totalAmount !== undefined
      ? order.totalAmount
      : order?.total !== undefined
      ? order.total
      : baseImposableHT + tva19;

  const writtenWordsAmount = numberToFrenchWords(netTotalTTC);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (order) {
      generatePdfInvoice(order);
    } else {
      window.print();
    }
  };

  return (
    <div
      id="invoice-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto selection:bg-[#B9A995] selection:text-[#111111]"
      role="dialog"
      aria-modal="true"
    >
      {/* Scoped A4 Page rule during Invoice printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Floating Luxury Action Toolbar (Stays fixed at top of modal) */}
      <header className="sticky top-0 w-full bg-[#101010]/95 backdrop-blur-xl border-b border-[#34312D] px-6 py-3.5 z-30 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Meta Information */}
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 bg-[#B9A995]"></div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h2
                className="text-xs uppercase tracking-widest text-[#E8E4DD] font-semibold"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Générateur & Visualiseur Facture A4
              </h2>
              <span className="font-mono text-xs text-[#B9A995] px-2 py-0.5 bg-[#1C1B1B] border border-[#34312D]">
                #{orderId}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-[#96918A] tracking-wider uppercase">
                Certifié Fiscalité Tunisienne (MF: 1845920/A/M/000)
              </span>
              <span className="text-[#34312D] text-xs">•</span>
              <span className="text-[10px] font-mono text-[#B9A995] uppercase tracking-wider">
                Format Normalisé A4 (210×297mm)
              </span>
            </div>
          </div>
        </div>

        {/* Controls & Print Triggers */}
        <div className="flex items-center gap-3">
          {/* Scale / Zoom controls */}
          <div className="hidden md:flex items-center bg-[#181818] border border-[#34312D] px-2.5 py-1 text-[#96918A] text-xs font-mono gap-2">
            <button
              onClick={() => adjustScale(0.9)}
              className="hover:text-[#E8E4DD] hover:bg-[#202020] px-1.5 py-0.5 transition-colors cursor-pointer"
              title="Réduire zoom"
            >
              <ZoomOut className="w-3.5 h-3.5 inline mr-0.5" /> -
            </button>
            <span className="text-[#E8E4DD] font-mono font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => adjustScale(1.1)}
              className="hover:text-[#E8E4DD] hover:bg-[#202020] px-1.5 py-0.5 transition-colors cursor-pointer"
              title="Agrandir zoom"
            >
              <ZoomIn className="w-3.5 h-3.5 inline mr-0.5" /> +
            </button>
            <span className="text-[#34312D]">|</span>
            <button
              onClick={() => adjustScale(1.0)}
              className="hover:text-[#E8E4DD] uppercase tracking-wider text-[10px] cursor-pointer"
            >
              Normal
            </button>
          </div>

          {/* Secondary Download Button */}
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-[#181818] hover:bg-[#222222] border border-[#34312D] text-[#E8E4DD] text-xs font-mono uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B9A995]" />
            <span>Télécharger PDF</span>
          </button>

          {/* Primary Print CTA (Executes window.print) */}
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Facture A4</span>
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-[#181818] hover:bg-rose-950/40 hover:text-rose-400 text-[#96918A] border border-[#34312D] transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Modal Viewport & Scaled Document Center */}
      <div className="w-full flex justify-center py-10 px-4">
        {/* ======================================================== */}
        {/* 3. THE AUTHENTIC A4 PDF INVOICE SHEET (Simulated Paper) */}
        {/* ======================================================== */}
        <article
          id="printable-invoice"
          className="w-[794px] min-h-[1123px] bg-[#FFFFFF] text-[#111111] p-[48px] flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative transition-transform duration-200 origin-top select-text"
          style={{
            transform: `scale(${scale})`,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {/* Architectural 15mm guide hairline frame */}
          <div className="pointer-events-none absolute inset-3 border border-[#E5E0D8]/70"></div>

          <div className="relative z-10 flex flex-col gap-7">
            {/* TOP ZONE: Brand Identity & Document Reference Header */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-[#B9A995]">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-[2.75rem] leading-none tracking-[0.25em] uppercase text-[#111111] font-normal"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    K Ū Z A
                  </span>
                  <span className="text-[0.625rem] tracking-[0.3em] uppercase text-[#888888] pl-2 border-l border-[#CCCCCC] font-mono">
                    Tunis · 1928
                  </span>
                </div>
                <span
                  className="text-[0.85rem] tracking-[0.35em] text-[#8C7A6B] uppercase mt-2 font-medium"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  FORM NEEDS SPACE.
                </span>
                <span className="text-[0.65rem] tracking-[0.18em] uppercase text-[#666666] mt-1 font-mono">
                  DIRECTOIRE STOCK & LOGISTIQUE — TUNIS · HAUTE COUTURE CONTEMPORAINE
                </span>
              </div>

              {/* Right Facture Badge & Barcode */}
              <div className="flex flex-col items-end text-right">
                <span className="px-3 py-1 bg-[#111111] text-[#FFFFFF] font-mono text-[0.75rem] uppercase tracking-[0.22em] font-medium">
                  FACTURE D'ACHAT
                </span>
                <span className="font-mono text-[0.95rem] font-bold text-[#111111] mt-2">
                  RÉF: {invoiceRef}
                </span>
                <span className="text-[0.7rem] text-[#666666] font-mono mt-0.5">
                  Date & Heure: {formattedDateTime}
                </span>

                {/* Vector Barcode SVG */}
                <div className="mt-2.5 flex flex-col items-end">
                  <svg
                    className="h-8 w-44"
                    fill="none"
                    viewBox="0 0 176 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect fill="#111111" height="32" width="3" x="0" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="5" y="0"></rect>
                    <rect fill="#111111" height="32" width="4" x="10" y="0"></rect>
                    <rect fill="#111111" height="32" width="1" x="16" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="19" y="0"></rect>
                    <rect fill="#111111" height="32" width="5" x="25" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="32" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="36" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="42" y="0"></rect>
                    <rect fill="#111111" height="32" width="4" x="47" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="53" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="58" y="0"></rect>
                    <rect fill="#111111" height="32" width="1" x="64" y="0"></rect>
                    <rect fill="#111111" height="32" width="5" x="67" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="74" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="79" y="0"></rect>
                    <rect fill="#111111" height="32" width="4" x="85" y="0"></rect>
                    <rect fill="#111111" height="32" width="1" x="91" y="0"></rect>
                    <rect fill="#111111" height="32" width="4" x="94" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="101" y="0"></rect>
                    <rect fill="#111111" height="32" width="4" x="105" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="111" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="116" y="0"></rect>
                    <rect fill="#111111" height="32" width="1" x="122" y="0"></rect>
                    <rect fill="#111111" height="32" width="5" x="126" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="133" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="138" y="0"></rect>
                    <rect fill="#111111" height="32" width="4" x="143" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="149" y="0"></rect>
                    <rect fill="#111111" height="32" width="4" x="154" y="0"></rect>
                    <rect fill="#111111" height="32" width="1" x="160" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="163" y="0"></rect>
                    <rect fill="#111111" height="32" width="2" x="168" y="0"></rect>
                    <rect fill="#111111" height="32" width="3" x="173" y="0"></rect>
                  </svg>
                  <span className="text-[0.55rem] font-mono tracking-[0.28em] text-[#666666] mt-0.5">
                    *{invoiceRef}*
                  </span>
                </div>
              </div>
            </div>

            {/* 2-COLUMN GRID: Émetteur (SARL KŪZA) & Acquéreur (Client) */}
            <div className="grid grid-cols-2 gap-8 text-[0.8rem] leading-relaxed">
              {/* Émetteur Legal Details */}
              <div className="flex flex-col bg-[#F9F8F6] p-4 border border-[#ECE7E1]">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#8C7A6B] font-semibold mb-2">
                  Émetteur / Maison Mère
                </span>
                <span className="font-bold text-[#111111] text-[0.875rem]">
                  KŪZA BRAND SARL
                </span>
                <span className="text-[#444444] mt-0.5">
                  Maison de Confection & Siège Directoire
                </span>
                <span className="text-[#555555]">
                  Rue de la République, Sidi Bou Saïd, 2026 Tunis
                </span>
                <div className="mt-3 pt-2.5 border-t border-[#E5E0D8] flex flex-col gap-1 text-[0.72rem] font-mono text-[#444444]">
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Matricule Fiscal:</span>
                    <span className="font-bold text-[#111111]">1845920 / A / M / 000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Code Douane:</span>
                    <span className="text-[#111111]">482910M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Registre Commerce:</span>
                    <span className="text-[#111111]">R.C. Tunis B0119282024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Contact Atelier:</span>
                    <span className="text-[#111111]">+216 92 929 276</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Facturation:</span>
                    <span className="text-[#111111]">facturation@kuza.tn</span>
                  </div>
                </div>
              </div>

              {/* Client & Facturation */}
              <div className="flex flex-col bg-[#F9F8F6] p-4 border border-[#ECE7E1]">
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#8C7A6B] font-semibold mb-2">
                  Facturé & Livré À
                </span>
                <span className="font-bold text-[#111111] text-[0.875rem]">
                  {clientName}
                </span>
                <span className="text-[#444444] mt-0.5">
                  Destinataire Privé / Acquéreur Enregistré
                </span>
                <span className="text-[#555555]">
                  {fullAddress}
                </span>
                <div className="mt-3 pt-2.5 border-t border-[#E5E0D8] flex flex-col gap-1 text-[0.72rem] font-mono text-[#444444]">
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Téléphone Contact:</span>
                    <span className="font-bold text-[#111111]">{clientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Canal Réception:</span>
                    <span className="text-[#111111]">Livraison Express à domicile</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Mode de Paiement:</span>
                    <span className="font-bold text-[#111111]">Cash on Delivery (COD Espèces)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Status Ribbon */}
            <div className="bg-[#111111] text-[#FFFFFF] px-4 py-2.5 flex items-center justify-between text-[0.72rem] tracking-wider uppercase font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#B9A995] font-semibold">STATUT:</span>
                <span>ACQUITTÉ (ENCAISSÉ COD)</span>
                <span className="text-[#666666]">/</span>
                <span>RÉF COMMANDE #{orderId}</span>
              </div>
              <div className="flex items-center gap-4 text-[#CCCCCC]">
                <span>Échéance: À RÉCEPTION</span>
                <span>Transport: KŪZA EXPRESS SÉCURISÉ</span>
              </div>
            </div>

            {/* ITEMIZED TABLE */}
            <div className="flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#111111] text-[0.65rem] font-mono uppercase tracking-[0.16em] text-[#555555]">
                    <th className="py-2.5 px-3">SKU / Réf</th>
                    <th className="py-2.5 px-3">Désignation de la Pièce</th>
                    <th className="py-2.5 px-3">Variante & Confection</th>
                    <th className="py-2.5 px-2 text-center">Qté</th>
                    <th className="py-2.5 px-3 text-right">P.U. HT</th>
                    <th className="py-2.5 px-3 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE7E1] text-[0.78rem]">
                  {/* Item Rows */}
                  {itemsList.map((it: any, index: number) => (
                    <tr key={index}>
                      <td className="py-3 px-3 font-mono text-[0.72rem] text-[#666666]">
                        {it.sku}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#111111]">{it.name}</span>
                          <span className="text-[0.68rem] text-[#777777] italic">
                            Coton biologique lourd, apprêt feutré
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#444444] text-[0.72rem]">
                        {it.spec}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-medium">
                        {it.qty}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#333333]">
                        {it.unitHT.toFixed(3)} DT
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#111111]">
                        {it.totalHT.toFixed(3)} DT
                      </td>
                    </tr>
                  ))}

                  {/* Logistics Row */}
                  <tr>
                    <td className="py-3 px-3 font-mono text-[0.72rem] text-[#666666]">
                      KZ-EXP-01
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111111]">
                          LIVRAISON NATIONALE EXPRESS COD
                        </span>
                        <span className="text-[0.68rem] text-[#777777] italic">
                          Acheminement sécurisé main propre (Tunis → {clientGov})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#444444] text-[0.72rem]">
                      Colis scellé signature de l'acquéreur · Circuit court garanti
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium">1</td>
                    <td className="py-3 px-3 text-right font-mono text-[#333333]">
                      {shippingHT.toFixed(3)} DT
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#111111]">
                      {shippingHT.toFixed(3)} DT
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FINANCIAL RECAP & OFFICIAL STAMP ZONE */}
            <div className="grid grid-cols-12 gap-6 pt-3 border-t border-[#B9A995]">
              {/* Left Side: Official Atelier Stamp & Written Amount in Words */}
              <div className="col-span-6 flex flex-col justify-between">
                {/* Official Circular Seal Stamp */}
                <div className="p-3 border border-[#8C7A6B]/50 bg-[#FCFBF9] flex items-center gap-3">
                  <div className="w-16 h-16 border-2 border-[#8C7A6B] rounded-full p-1 flex items-center justify-center text-center shrink-0">
                    <div className="w-full h-full border border-dashed border-[#8C7A6B] rounded-full flex flex-col items-center justify-center">
                      <span className="text-[0.45rem] font-bold tracking-widest text-[#8C7A6B] uppercase font-mono">
                        KŪZA
                      </span>
                      <span className="text-[0.38rem] tracking-tighter text-[#8C7A6B] uppercase font-mono">
                        CERTIFIÉ
                      </span>
                      <span className="text-[0.38rem] font-mono text-[#8C7A6B]">
                        TUNIS
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] font-bold text-[#8C7A6B] uppercase tracking-wider font-mono">
                      Atelier Comptabilité & Fiscalité KŪZA
                    </span>
                    <span className="text-[0.62rem] text-[#666666] leading-tight mt-0.5">
                      Certifié Conforme • Émission numérique directe autorisée par la Direction Générale des Impôts (DGI Tunisie).
                    </span>
                  </div>
                </div>

                {/* Sum in written words (Obligation comptable légale) */}
                <div className="mt-3 text-[0.7rem] text-[#444444] leading-relaxed italic bg-[#F9F8F6] p-2.5 border-l-2 border-[#8C7A6B]">
                  <span className="font-bold not-italic text-[#111111]">
                    Arrêté la présente facture à la somme de :
                  </span>
                  <br />
                  {writtenWordsAmount} ({netTotalTTC.toFixed(3)} DT) Toutes Taxes Comprises (TTC).
                </div>
              </div>

              {/* Right Side: Exact Financial Totals Breakdown */}
              <div className="col-span-6 flex flex-col bg-[#F9F8F6] p-4 border border-[#ECE7E1]">
                <div className="flex flex-col gap-1.5 text-[0.75rem] font-mono">
                  <div className="flex justify-between text-[#555555]">
                    <span>Total Hors Taxes (HT Produits):</span>
                    <span>{itemsTotalHT.toFixed(3)} DT</span>
                  </div>
                  <div className="flex justify-between text-[#555555]">
                    <span>Frais de Transport HT:</span>
                    <span>{shippingHT.toFixed(3)} DT</span>
                  </div>
                  <div className="flex justify-between text-[#333333] font-semibold pt-1 border-t border-[#E5E0D8]">
                    <span>Total Base Imposable (HT Brut):</span>
                    <span>{baseImposableHT.toFixed(3)} DT</span>
                  </div>
                  <div className="flex justify-between text-[#555555]">
                    <span>TVA Légale Collectée (19.00%):</span>
                    <span>{tva19.toFixed(3)} DT</span>
                  </div>
                  <div className="flex justify-between text-[#555555]">
                    <span>Droit de Timbre Fiscal (Exonéré/Inclus):</span>
                    <span>0.000 DT</span>
                  </div>

                  {/* GRAND TOTAL HIGHLIGHT BOX */}
                  <div className="mt-3 pt-3 border-t-2 border-[#111111] flex items-baseline justify-between bg-[#111111] text-[#FFFFFF] -mx-4 -mb-4 p-3.5">
                    <div className="flex flex-col">
                      <span className="text-[0.65rem] tracking-[0.2em] font-mono uppercase text-[#B9A995]">
                        Total Net À Payer
                      </span>
                      <span className="text-[0.6rem] text-[#AAAAAA] uppercase tracking-wider font-mono">
                        Toutes Taxes Comprises (TTC)
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[1.35rem] font-mono font-bold tracking-tight text-[#FFFFFF]">
                        {netTotalTTC.toFixed(3)}
                      </span>
                      <span className="text-[0.75rem] font-mono text-[#B9A995] font-semibold">
                        TND
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER: Banking Coordinates & Regulatory Legal Declaration */}
          <div className="relative z-10 pt-5 mt-6 border-t border-[#ECE7E1] flex flex-col gap-2 text-[0.62rem] text-[#777777] font-mono leading-relaxed">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECE7E1] pb-2 text-[#444444]">
              <span>Banque: BIAT Agence Tunis Opéra</span>
              <span>RIB: TN59 08 014 000123456789 42</span>
              <span>Code Swift / BIC: BIATTNTT</span>
              <span>Statut Douanier: Exportateur Enregistré</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="max-w-[85%] text-justify">
                Document édité par voie télématique certifiée conforme aux articles 12 et 13 du Code de la TVA tunisien et au décret d'application des téléprocédures fiscales. Facture valant quittance d'encaissement définitif lors de la remise physique contre espèces au livreur accrédité (Cash on Delivery). Tout retour ou échange atelier souscrit un délai de 14 jours francs sous scellé d'origine.
              </p>
              <span className="text-[0.65rem] font-semibold text-[#111111] uppercase tracking-widest pl-4">
                Page 1 / 1
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default InvoiceModal;
