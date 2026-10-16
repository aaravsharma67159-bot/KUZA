import { PrintableOrderModel } from '../components/PrintableBordereauModal';
import { formatTND } from './currency';
import { KUZA_CONTACT } from './contact';

/**
 * Generates and triggers printable/saveable PDF Invoice for a KŪZA order or transaction.
 * Uses window.open with a clean, high-precision print-ready HTML/CSS template that triggers
 * the browser's native PDF print dialogue.
 */
export function generatePdfInvoice(order: PrintableOrderModel): void {
  const orderRef = order.orderId || order.id || 'KZ-0000';
  const rawDate = order.date || order.createdAt || order.timestamp || new Date().toISOString();
  
  let formattedDate = rawDate;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }) + ' à ' + d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    formattedDate = rawDate;
  }

  const clientName = order.customerName || order.client?.name || 'Client KŪZA';
  const clientPhone = order.phone || order.client?.phone || 'Non renseigné';
  const clientGov = order.governorate || order.client?.governorate || 'Tunis';
  const clientAddress = order.address || order.client?.address || 'Tunisie';

  const items = order.items || [];
  const subtotal = order.subtotal ?? (order.totalAmount ? Math.max(0, order.totalAmount - (order.shippingFee ?? 8)) : 0);
  const shipping = order.shipping ?? order.shippingFee ?? 8;
  const total = order.total ?? order.totalAmount ?? (subtotal + shipping);

  const printWindow = window.open('', '_blank', 'width=850,height=1000');
  if (!printWindow) {
    alert('Veuillez autoriser les fenêtres pop-up pour générer la facture.');
    return;
  }

  const itemsRows = items.map((it, idx) => {
    const itemName = it.name || it.product?.name || 'Silouhette KŪZA';
    const color = it.color || it.selectedColor?.name || 'Standard';
    const size = it.size || it.selectedSize || 'M';
    const qty = it.qty || it.quantity || 1;
    const unitPrice = it.unitPrice || it.product?.price || 0;
    const lineTotal = unitPrice * qty;

    return `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px;">
          <div style="font-weight: 600; color: #18181b;">${itemName}</div>
          <div style="font-size: 11px; color: #71717a; margin-top: 2px;">Coloris: ${color} &nbsp;·&nbsp; Taille: ${size}</div>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; text-align: center; font-family: monospace;">
          ${qty}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; text-align: right; font-family: monospace;">
          ${formatTND(unitPrice)}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e4e4e7; font-size: 13px; text-align: right; font-weight: 600; font-family: monospace; color: #18181b;">
          ${formatTND(lineTotal)}
        </td>
      </tr>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture_${orderRef}_KUZA</title>
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
    .invoice-container {
      max-width: 780px;
      margin: 0 auto;
      border: 1px solid #e4e4e7;
      padding: 36px;
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
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #18181b;
    }
    .doc-number {
      font-family: monospace;
      font-size: 15px;
      font-weight: 700;
      color: #a16207;
      margin-top: 4px;
    }
    .doc-date {
      font-size: 11px;
      color: #71717a;
      margin-top: 2px;
    }
    .grid-parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
      background: #fafafa;
      padding: 18px;
      border: 1px solid #f4f4f5;
    }
    .party-title {
      font-size: 10px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #71717a;
      margin-bottom: 6px;
      font-weight: 600;
    }
    .party-name {
      font-size: 14px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 4px;
    }
    .party-info {
      font-size: 12px;
      color: #52525b;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
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
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-box {
      width: 320px;
      border: 1px solid #e4e4e7;
      padding: 16px;
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
      padding-top: 10px;
      margin-top: 10px;
      margin-bottom: 0;
      font-size: 15px;
      font-weight: 700;
      color: #18181b;
    }
    .payment-tag {
      margin-top: 8px;
      padding: 6px 8px;
      background: #fef3c7;
      border: 1px solid #fde68a;
      font-size: 10px;
      color: #92400e;
      font-family: monospace;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .footer {
      border-top: 1px solid #e4e4e7;
      padding-top: 18px;
      font-size: 11px;
      color: #71717a;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      margin-right: 12px;
    }
    @media print {
      body {
        padding: 0;
      }
      .invoice-container {
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
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="brand-title">KŪZA</div>
        <div class="brand-sub">Marque Contemporaine · Stock Central Tunis 🇹🇳</div>
      </div>
      <div class="doc-meta">
        <div class="doc-title">Facture Commerciale</div>
        <div class="doc-number">${orderRef}</div>
        <div class="doc-date">${formattedDate}</div>
      </div>
    </div>

    <div class="grid-parties">
      <div>
        <div class="party-title">ÉMETTEUR / STOCK CENTRAL</div>
        <div class="party-name">KŪZA Studio</div>
        <div class="party-info">
          Rue de l'Artisanat, Tunis, Tunisie<br>
          Tél : ${KUZA_CONTACT.phoneDisplay}<br>
          Email : ${KUZA_CONTACT.email}
        </div>
      </div>
      <div>
        <div class="party-title">DESTINATAIRE / CLIENT</div>
        <div class="party-name">${clientName}</div>
        <div class="party-info">
          Tél : ${clientPhone}<br>
          Adresse : ${clientAddress}<br>
          Gouvernorat : ${clientGov}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Désignation Article</th>
          <th style="text-align: center;">Qté</th>
          <th style="text-align: right;">Prix Unitaire</th>
          <th style="text-align: right;">Total Net</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-box">
        <div class="total-row">
          <span>Sous-total HT Stock Central</span>
          <span style="font-family: monospace;">${formatTND(subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Frais de livraison (Flat Port TN)</span>
          <span style="font-family: monospace;">${formatTND(shipping)}</span>
        </div>
        <div class="total-row grand">
          <span>NET À PAYER (TND)</span>
          <span style="font-family: monospace;">${formatTND(total)}</span>
        </div>
        <div class="payment-tag">
          💳 Modalité : Paiement en espèces à la livraison (COD)
        </div>
      </div>
    </div>

    <div class="footer">
      <div>KŪZA — Confection artisanale haut de gamme · Coton 290 GSM</div>
      <div>Support client : ${KUZA_CONTACT.phoneDisplay}</div>
    </div>

    <div class="actions">
      <button class="btn-print" onclick="window.print()">🖨️ Imprimer la Facture / Enregistrer en PDF</button>
    </div>
  </div>
  <script>
    // Auto-trigger print prompt after load
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
