import { OrderDetails } from '../types';

/**
 * Clean helper function prepared for EmailJS / Resend / Webhook integration.
 * Triggers automated email notifications immediately upon Cash on Delivery order placement.
 */
export const sendOrderNotification = async (order: OrderDetails): Promise<boolean> => {
  try {
    const customerEmail = order.customerEmail || 'client-invite@kuza.tn';
    const adminEmail = 'contact@kuza.tn';

    console.group(`[AUTOMATED NOTIFICATIONS] - Commande ${order.orderId}`);
    
    // 1. Customer Confirmation Email Mockup/Log
    console.log(`[EMAIL CLIENT] Envoi du mail de confirmation à : ${customerEmail}`);
    console.log(`Contenu :
      De : Maison KŪZA <no-reply@kuza.tn>
      À : ${customerEmail}
      Objet : Confirmation de votre commande ${order.orderId} · Maison KŪZA
      
      Cher(e) ${order.customerName},
      Votre commande n° ${order.orderId} a bien été enregistrée par notre atelier.
      
      Récapitulatif des pièces :
      ${order.items.map(it => `- ${it.quantity}x ${it.product.name} (${it.selectedColor.name} · ${it.selectedSize}) - ${it.product.price} TND`).join('\n      ')}
      
      Sous-total : ${order.subtotal} TND
      Livraison Flat : 8 TND
      Total à payer en espèces au livreur : ${order.total} TND
      
      Adresse de livraison : ${order.address}, ${order.governorate}
      Notre transporteur prendra contact avec vous par téléphone au ${order.phone} avant son passage sous 24-48 heures.
      
      FORM NEEDS SPACE.
      Maison KŪZA Tunis.
    `);

    // 2. Admin Alert Email Mockup/Log
    console.log(`[EMAIL ADMIN] Envoi de l'alerte de commande à : ${adminEmail}`);
    console.log(`Contenu :
      De : Maison KŪZA Web <system@kuza.tn>
      À : ${adminEmail}
      Objet : 🚨 ALERTE NOUVELLE COMMANDE ${order.orderId} - COD Tunisie
      
      Une nouvelle commande vient d'être enregistrée :
      - Référence : ${order.orderId}
      - Client : ${order.customerName}
      - Téléphone : ${order.phone}
      - Ville / Gouvernorat : ${order.governorate}
      - Adresse complète : ${order.address}
      - Total de l'encaissement : ${order.total} TND
      - Note client : ${order.deliveryNotes || 'Aucune'}
      
      Veuillez préparer les housses de coton et mettre à jour la matrice logistique.
    `);

    console.groupEnd();

    // Here is where the developer would insert actual integration code:
    // Example with Resend:
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ from: 'Maison KŪZA <no-reply@kuza.tn>', to: customerEmail, ... })
    // });

    return true;
  } catch (error) {
    console.error('Erreur lors du traitement de la notification email :', error);
    return false;
  }
};
