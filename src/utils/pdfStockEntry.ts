import { StockEntryNote } from '../types';
import { formatTND } from './currency';
import { KUZA_CONTACT } from './contact';

/**
 * Generates an official, print-ready PDF Bon d'Entrée & Réception for KŪZA Atelier.
 * Includes KŪZA Directoire Atelier stamp layout, itemized batch summary with color swatches & cost tracking,
 * and quality audit verification signatures ("Maître Mehdi - Atelier 01").
 */
export function generatePdfStockEntry(entry: StockEntryNote): void {
  const refCode = entry.id;
  const rawDate = entry.date || new Date().toISOString();

  let formattedDate = rawDate;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      formattedDate =
        d.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }) +
        ' à ' +
        d.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
    }
  } catch {
    formattedDate = rawDate;
  }

  const defaultUnitCost = entry.unitCostDefault ?? 22;
  const calculatedTotalCost =
    entry.totalCost ??
    entry.items.reduce(
      (sum, it) => sum + it.quantityAdded * (it.unitCost ?? defaultUnitCost),
      0
    );

  const printWindow = window.open('', '_blank', 'width=880,height=1000');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres pop-up pour générer le bon de réception PDF.');
    return;
  }

  const itemsRows = entry.items
    .map((it, idx) => {
      const uCost = it.unitCost ?? defaultUnitCost;
      const tCost = it.totalCost ?? it.quantityAdded * uCost;
      const isNoir = it.color.toLowerCase().includes('noir') || it.color.toLowerCase().includes('black');
      const swatchBg = isNoir ? '#18181b' : '#d4c7b8';
      const swatchBorder = isNoir ? '#3f3f46' : '#a89f91';

      return `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px;">
          <div style="font-weight: 700; color: #18181b;">${it.productName}</div>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #71717a; margin-top: 3px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${swatchBg}; border: 1px solid ${swatchBorder};"></span>
            <span>Coloris: <strong>${it.color}</strong></span>
          </div>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; text-align: center; font-family: monospace; font-weight: 700;">
          <span style="background: #f4f4f5; padding: 3px 8px; border: 1px solid #e4e4e7; border-radius: 2px;">${it.size}</span>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; text-align: center; font-family: monospace; font-weight: 700; color: #047857;">
          +${it.quantityAdded} pcs
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; text-align: right; font-family: monospace; color: #52525b;">
          ${formatTND(uCost)}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; text-align: right; font-weight: 700; font-family: monospace; color: #18181b;">
          ${formatTND(tCost)}
        </td>
      </tr>
    `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bon_Entree_${refCode}_KUZA</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #18181b;
      background: #ffffff;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e4e4e7;
      padding: 36px;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #18181b;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-family: 'Optima', 'Didot', 'Playfair Display', serif;
      font-size: 28px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      font-weight: 700;
      color: #18181b;
    }
    .brand-sub {
      font-size: 11px;
      color: #71717a;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-title {
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #18181b;
    }
    .doc-number {
      font-family: monospace;
      font-size: 15px;
      font-weight: 700;
      color: #047857;
      margin-top: 4px;
    }
    .doc-date {
      font-size: 11px;
      color: #71717a;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 10px;
      font-size: 10px;
      font-family: monospace;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: ${entry.status === 'VALIDATED' ? '#ecfdf5' : '#fffbeb'};
      border: 1px solid ${entry.status === 'VALIDATED' ? '#a7f3d0' : '#fde68a'};
      color: ${entry.status === 'VALIDATED' ? '#065f46' : '#92400e'};
    }
    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
      background: #fafafa;
      padding: 16px;
      border: 1px solid #f4f4f5;
    }
    .info-label {
      font-size: 10px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #71717a;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .info-val {
      font-size: 13px;
      font-weight: 700;
      color: #18181b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f4f4f5;
      padding: 10px 14px;
      text-align: left;
      font-size: 11px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #52525b;
      border-top: 1px solid #e4e4e7;
      border-bottom: 1px solid #e4e4e7;
    }
    .totals-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;
    }
    .notes-box {
      flex: 1;
      border: 1px solid #e4e4e7;
      padding: 14px;
      background: #fafafa;
      font-size: 12px;
      color: #52525b;
    }
    .totals-box {
      width: 300px;
      border: 1px solid #e4e4e7;
      padding: 14px;
      background: #fafafa;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
      color: #52525b;
    }
    .total-row.grand {
      border-top: 2px solid #18181b;
      padding-top: 8px;
      margin-top: 8px;
      margin-bottom: 0;
      font-size: 14px;
      font-weight: 700;
      color: #18181b;
    }
    .signatures-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding-top: 24px;
      border-top: 1px solid #e4e4e7;
      margin-top: 16px;
    }
    .sig-block {
      border: 1px dashed #d4d4d8;
      padding: 16px;
      background: #fafafa;
      position: relative;
    }
    .sig-title {
      font-size: 10px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #71717a;
      margin-bottom: 8px;
    }
    .stamp-box {
      width: 140px;
      height: 60px;
      border: 2px solid #047857;
      border-radius: 4px;
      margin: 10px auto 4px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #047857;
      transform: rotate(-3deg);
      opacity: 0.9;
    }
    .stamp-brand {
      font-family: 'Optima', serif;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.2em;
    }
    .stamp-sub {
      font-size: 8px;
      font-family: monospace;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .stamp-visa {
      font-size: 9px;
      font-weight: 700;
      font-family: monospace;
      color: #065f46;
      margin-top: 2px;
    }
    .footer {
      border-top: 1px solid #e4e4e7;
      padding-top: 14px;
      font-size: 11px;
      color: #71717a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
    }
    .actions {
      margin-top: 24px;
      text-align: center;
    }
    .btn-print {
      background: #18181b;
      color: #ffffff;
      border: none;
      padding: 12px 28px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      cursor: pointer;
      font-weight: 600;
    }
    @media print {
      body {
        padding: 0;
      }
      .container {
        border: none;
        padding: 0;
      }
      .actions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display: flex; align-items: center; gap: 14px;">
        <svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 233.9 203.39" style="width: 38px; height: 38px; fill: #18181b;">
          <line x1="101.03" y1="79.94" x2="100.08" y2="80.83" stroke="#18181b" stroke-width="1"/>
          <path d="M101.03,79.94c-.25.36-.57.66-.95.89l.95-.89Z"/>
          <path d="M166.53,73.12v2.8c.48-.12.98-.18,1.49-.18,3.81,0,6.9,3.35,6.9,7.48v49.06c0,22.36-26.95,33.65-42.88,17.97l-48.44-47.66,25.56-23.98c4.04-3.79,10.65-.92,10.65,4.61v46.74l13.93,13.7v-61.15c0-3.83,3.1-6.93,6.93-6.93.16,0,.31,0,.46.02v-2.52h-41.4v2.23c1.09.49,1.85,1.58,1.85,2.85,0,.67-.21,1.28-.56,1.79-.25.36-.57.66-.95.89,0,0,0,0,0,0l-30.85,28.9v-46.84c0-.8.18-1.59.57-2.29,0,0,0,0,0-.01,1.56-2.84,4.59-4.76,8.06-4.76.44,0,.88.03,1.3.09v-2.81h-34.53v2.81c.42-.06.86-.09,1.3-.09,3.47,0,6.49,1.92,8.06,4.76,0,0,0,0,0,.01.39.7.57,1.49.57,2.29v80.38c0,.78-.2,1.55-.58,2.23-1.56,2.84-4.59,4.76-8.06,4.76-.44,0-.88-.03-1.3-.09v2.81h34.53v-2.81c-.42.06-.86.09-1.3.09-1.74,0-3.36-.48-4.75-1.32-1.38-.83-2.53-2.02-3.31-3.44-.38-.68-.58-1.45-.58-2.23v-27.21l5.06-4.75h0s43.58,42.87,43.58,42.87c23.26,22.88,62.59,6.4,62.59-26.23v-44.75c0-4.13,3.09-7.48,6.9-7.48.51,0,1.01.06,1.49.18v-2.8h-22.32Z"/>
          <rect x="99.74" y="53.11" width="89.12" height="5.53"/>
        </svg>
        <div>
          <svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 623.73 272.88" style="height: 24px; width: auto; fill: #18181b; display: block;">
            <path d="M132.62,203.77h-.43c-1.1,0-2.79-.73-5.06-2.19-2.27-1.46-4.56-3.27-6.85-5.42l-49.23-47.8,38.83-36.32c2.73-2.58,5.18-4.53,7.36-5.85,2.18-1.31,3.89-1.97,5.13-1.97.24,0,.44-.05.61-.14.17-.1.25-.29.25-.57s-.08-.48-.25-.57c-.17-.1-.37-.14-.61-.14h-13.71c-.19,0-.38.05-.57.14-.19.1-.29.29-.29.57s.1.48.29.57c.19.1.38.14.57.14h.43c.62,0,.93.26.93.79,0,1.2-1.72,3.54-5.17,7.03l-41.77,39.11v-39.11c0-2.58.41-4.53,1.22-5.85.81-1.31,1.84-1.97,3.09-1.97.24,0,.44-.07.61-.22.17-.14.25-.31.25-.5,0-.24-.08-.42-.25-.54-.17-.12-.37-.18-.61-.18h-19.02c-.48.05-.72.29-.72.72.05.48.29.72.72.72h.57c1.05,0,1.96.78,2.73,2.33.76,1.55,1.15,3.39,1.15,5.49v84.12c0,2.68-.43,4.62-1.29,5.81-.86,1.2-1.91,1.79-3.16,1.79-.19,0-.36.07-.5.22-.14.14-.22.34-.22.57,0,.19.07.38.22.57.14.19.31.29.5.29h19.02c.24,0,.44-.1.61-.29.17-.19.25-.38.25-.57,0-.38-.13-.61-.39-.68-.26-.07-.59-.11-.97-.11-1.05,0-1.95-.74-2.69-2.22-.74-1.48-1.11-3.28-1.11-5.38v-40.62l39.83,38.68c3.68,3.64,6.71,6.24,9.08,7.82,2.37,1.58,4.81,2.54,7.32,2.87,2.51.34,6.02.5,10.51.5h2.8c.24,0,.44-.07.61-.22.17-.14.25-.36.25-.65,0-.24-.08-.43-.25-.57-.17-.14-.37-.22-.61-.22Z"/>
            <rect x="201.03" y="77.25" width="82.03" height="4.67"/>
            <path d="M282.27,102.93h-11.77c-.19,0-.37.06-.54.18-.17.12-.25.3-.25.54,0,.19.08.37.25.54.17.17.35.25.54.25,1.24,0,2.28.62,3.12,1.87.84,1.25,1.26,3.18,1.26,5.81v64.59c0,4.74-1.18,9.19-3.55,13.35-2.37,4.16-5.73,7.55-10.08,10.16-4.35,2.61-9.55,3.91-15.57,3.91s-11.5-1.23-15.82-3.7c-4.33-2.46-7.62-5.75-9.87-9.87-2.25-4.11-3.44-8.73-3.59-13.85v-64.59c0-2.63.43-4.57,1.29-5.81.86-1.24,1.89-1.87,3.09-1.87.24,0,.43-.08.57-.25s.22-.35.22-.54c0-.24-.07-.42-.22-.54-.14-.12-.34-.18-.57-.18h-18.95c-.19,0-.37.06-.54.18-.17.12-.25.3-.25.54,0,.19.08.37.25.54.17.17.35.25.54.25,1.24,0,2.27.62,3.09,1.87.81,1.25,1.22,3.18,1.22,5.81v64.59c0,5.65,1.42,10.8,4.27,15.47,2.85,4.67,6.95,8.39,12.31,11.16,5.36,2.77,11.82,4.16,19.38,4.16s14.44-1.39,19.77-4.16c5.33-2.77,9.35-6.5,12.06-11.16,2.7-4.67,4.06-9.82,4.06-15.47v-64.59c0-2.11.37-3.91,1.11-5.42.74-1.51,1.64-2.26,2.69-2.26.38,0,.69-.05.93-.14.24-.1.36-.31.36-.64,0-.24-.07-.42-.22-.54-.14-.12-.34-.18-.57-.18Z"/>
            <path d="M439.31,192.21c-.29,0-.49.07-.61.22-.12.14-.23.34-.32.57-.05.05-.1.12-.14.22-.57,2.58-2.68,4.75-6.32,6.5-3.64,1.75-7.85,2.62-12.63,2.62h-46.44l63.95-96.39v-3.16h-71.27l-2.15,12.63c0,.19.07.34.22.43.14.1.31.17.5.22.33,0,.55-.1.65-.29.1-.19.14-.45.14-.79.67-2.54,2.83-4.68,6.5-6.42,3.66-1.74,7.88-2.62,12.67-2.62h40.26l-63.95,96.39v3.09h77.3l2.22-12.34c0-.43-.19-.72-.57-.86Z"/>
            <path d="M598.58,203.98c-1.2,0-2.39-.77-3.59-2.3-1.2-1.53-2.2-3.37-3.01-5.53l-32.15-93.37h-2.94l-32.22,93.37c-.77,2.15-1.75,4-2.94,5.53-1.2,1.53-2.39,2.3-3.59,2.3-.62-.05-.93.19-.93.72,0,.48.24.72.72.72h11.05c.48,0,.72-.24.72-.72-.1-.48-.41-.72-.93-.72-1.2,0-1.84-.48-1.94-1.44l-.14-2.01c0-.96.1-1.82.29-2.58.19-.77.48-1.68.86-2.73.19-.48.38-1.05.57-1.72l8.47-24.55h36.17c6.89,19.91,10.33,30.48,10.33,31.72.05,2.2-.55,3.3-1.79,3.3l-.65-.07c-.34,0-.5.26-.5.79.05.48.29.72.72.72h17.65c.48,0,.72-.24.72-.72-.05-.48-.36-.72-.93-.72ZM537.93,165.87l17.01-49.09,17.08,49.09h-34.09Z"/>
          </svg>
          <div class="brand-sub">Directoire Atelier Confection · Tunis 🇹🇳</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-title">Bon d'Entrée & Réception</div>
        <div class="doc-number">${refCode}</div>
        <div class="doc-date">${formattedDate}</div>
        <div>
          <span class="status-badge">
            ${entry.status === 'VALIDATED' ? '✓ RÉCEPTION CONFORME & STOCK INJECTÉ' : 'BROUILLON EN ATTENTE'}
          </span>
        </div>
      </div>
    </div>

    <div class="grid-info">
      <div>
        <div class="info-label">ATELIER CONFECTION / PARTENAIRE</div>
        <div class="info-val">${entry.supplierAtelier}</div>
      </div>
      <div>
        <div class="info-label">LOT / RÉFÉRENCE TISSU</div>
        <div class="info-val" style="font-family: monospace; color: #b45309;">${entry.referenceBatch}</div>
      </div>
      <div>
        <div class="info-label">RESPONSABLE RÉCEPTION & CONTRÔLE</div>
        <div class="info-val">${entry.createdByName || 'Maître Mehdi - Atelier 01'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Désignation Silhouette & Coloris</th>
          <th style="text-align: center;">Taille</th>
          <th style="text-align: center;">Volume Reçu</th>
          <th style="text-align: right;">Coût Confection</th>
          <th style="text-align: right;">Valeur Totale</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-grid">
      <div class="notes-box">
        <div class="info-label">OBSERVATIONS CONTRÔLE QUALITÉ & TISSU</div>
        <p style="margin-top: 4px; font-style: italic;">
          ${entry.notes ? `« ${entry.notes} »` : 'Molleton 290 GSM conforme, coupe oversize respectée, zéro défaut détecté.'}
        </p>
      </div>

      <div class="totals-box">
        <div class="total-row">
          <span>Total Pièces Réceptionnées :</span>
          <span style="font-family: monospace; font-weight: 700; color: #047857;">+${entry.totalPieces} pcs</span>
        </div>
        <div class="total-row">
          <span>Coût moyen confection :</span>
          <span style="font-family: monospace;">${formatTND(defaultUnitCost)}</span>
        </div>
        <div class="total-row grand">
          <span>VALEUR TOTALE DU BON :</span>
          <span style="font-family: monospace;">${formatTND(calculatedTotalCost)}</span>
        </div>
      </div>
    </div>

    <div class="signatures-section">
      <div class="sig-block">
        <div class="sig-title">ATELIER CONFECTION (EXPÉDITEUR)</div>
        <div style="font-size: 11px; color: #52525b;">Attestation de conformité des métrages et confections.</div>
        <div style="height: 50px; display: flex; align-items: center; justify-content: center; font-style: italic; color: #71717a; margin-top: 8px;">
          Visa Atelier Partenaire
        </div>
      </div>

      <div class="sig-block">
        <div class="sig-title">CONTRÔLE QUALITÉ KŪZA (RÉCEPTIONNAIRE)</div>
        <div class="stamp-box">
          <div class="stamp-brand">KŪZA ATELIER</div>
          <div class="stamp-sub">DIRECTION TECHNIQUE</div>
          <div class="stamp-visa">VALEUR CERTIFIÉE · TUNIS</div>
        </div>
        <div style="text-align: center; font-size: 11px; font-weight: 600; color: #18181b; margin-top: 4px;">
          ${entry.createdByName || 'Maître Mehdi - Atelier 01'}
        </div>
      </div>
    </div>

    <div class="footer">
      <div>KŪZA — Confection artisanale & Streetwear Contemporain · Tunis 🇹🇳</div>
      <div>Contact Atelier : ${KUZA_CONTACT.phoneDisplay}</div>
    </div>

    <div class="actions">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimer le Bon de Réception / Sauvegarder PDF</button>
    </div>
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
