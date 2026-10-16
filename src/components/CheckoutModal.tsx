import React, { useState, useEffect } from 'react';
import { CartItem, OrderDetails, CustomerUser } from '../types';
import { TUNISIAN_GOVERNORATES } from '../data/products';
import {
  X,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Truck,
  Mail,
  Lock,
  Sparkles,
  Check,
  Tag,
  Instagram,
} from 'lucide-react';
import { formatTND } from '../utils/currency';
import { calculatePromotions } from '../utils/promotions';
import { PromotionsState } from '../types';
import { KUZA_CONTACT } from '../utils/contact';
import { KuzaMonogram } from './KuzaMonogram';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currentUser: CustomerUser | null;
  promotionsState?: PromotionsState;
  appliedCouponCode?: string | null;
  onApplyCoupon?: (code: string) => { success: boolean; error?: string };
  onRemoveCoupon?: () => void;
  onOrderSuccess: (order: OrderDetails) => void;
  onRegisterAfterCheckout?: (userData: Omit<CustomerUser, 'id' | 'createdAt'>) => void;
  onOpenLegal?: (tab: 'cgv' | 'legal') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  promotionsState = { coupons: [], bundleRules: [] },
  appliedCouponCode = null,
  onApplyCoupon,
  onRemoveCoupon,
  onOrderSuccess,
  onRegisterAfterCheckout,
  onOpenLegal,
}) => {
  // Form Fields - Hooks called unconditionally at the top level
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState(
    currentUser?.governorate || TUNISIAN_GOVERNORATES[0]
  );
  const [address, setAddress] = useState(currentUser?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Post-checkout guest account creation
  const [guestPassword, setGuestPassword] = useState('');
  const [guestAccountCreated, setGuestAccountCreated] = useState(false);

  // Sync with currentUser when opening or when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setGovernorate(currentUser.governorate || TUNISIAN_GOVERNORATES[0]);
      setAddress(currentUser.address);
    }
  }, [currentUser]);

  // Promotional Calculation
  const promoSummary = calculatePromotions({
    items,
    couponCode: appliedCouponCode,
    promotionsState,
  });

  const [checkoutCouponInput, setCheckoutCouponInput] = useState('');
  const [checkoutCouponError, setCheckoutCouponError] = useState<string | null>(null);

  const subtotal = promoSummary.originalSubtotal;
  const shipping = promoSummary.shipping;
  const total = promoSummary.finalTotal;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^(2|4|5|7|9)\d{7}$/.test(cleanPhone)) {
      setPhoneError("Veuillez saisir un numéro tunisien valide à 8 chiffres (ex: 98 123 456)");
      return;
    }
    setPhoneError(null);
    if (!phone.trim() || !address.trim()) return;

    const finalCustomerName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Client KŪZA';

    setIsSubmitting(true);
    // Simulate brief confirmation
    setTimeout(() => {
      const newOrderId = `KZ-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedOrder: OrderDetails = {
        id: newOrderId,
        orderId: newOrderId,
        customerName: finalCustomerName,
        customerEmail: email.trim() || currentUser?.email || '',
        customerId: currentUser?.id,
        phone: phone.trim(),
        governorate,
        address: address.trim(),
        deliveryNotes: deliveryNotes.trim(),
        paymentMethod: 'cod',
        items,
        subtotal: promoSummary.originalSubtotal,
        shipping: promoSummary.shipping,
        discountAmount: promoSummary.totalDiscount,
        appliedCouponCode: promoSummary.appliedCoupon?.code,
        appliedBundleName:
          promoSummary.bundleMatches.length > 0
            ? promoSummary.bundleMatches.map((m) => m.rule.name).join(', ')
            : undefined,
        total: promoSummary.finalTotal,
        createdAt: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'Commande reçue',
      };
      setConfirmedOrder(generatedOrder);
      setIsSubmitting(false);
      onOrderSuccess(generatedOrder);
    }, 600);
  };

  // Convert guest checkout into registered account
  const handleCreateAccountFromGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestPassword.trim() || !email.trim()) return;

    if (onRegisterAfterCheckout) {
      onRegisterAfterCheckout({
        firstName: firstName.trim() || 'Client',
        lastName: lastName.trim() || 'KŪZA',
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        governorate,
        address: address.trim(),
        password: guestPassword,
      });
      setGuestAccountCreated(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#101010] md:bg-black/85 md:backdrop-blur-sm md:flex md:items-center md:justify-center md:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="relative w-full max-w-2xl bg-[#101010] md:border md:border-[#34312D] text-[#E8E4DD] min-h-screen md:min-h-0 md:max-h-[92vh] p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Pinned Close Button */}
        <button
          onClick={onClose}
          className="fixed md:absolute top-3 right-3 z-30 p-2.5 bg-[#181818]/90 border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] transition-colors cursor-pointer touch-manipulation backdrop-blur-md"
          aria-label="Fermer la caisse"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {confirmedOrder ? (
          /* Order Confirmation View */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#181818] border border-[#B9A995] flex items-center justify-center text-[#B9A995] shadow-lg">
              <KuzaMonogram className="w-9 h-9 text-[#B9A995]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B9A995] font-mono">
                Commande Validée · Atelier KŪZA
              </span>
              <h2
                className="text-2xl md:text-3xl font-serif text-[#E8E4DD]"
                style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
              >
                Merci, {confirmedOrder.customerName}.
              </h2>
              <p className="text-xs text-[#96918A] max-w-md mx-auto font-light">
                Votre commande n°{' '}
                <strong className="text-[#E8E4DD] font-mono">
                  {confirmedOrder.orderId}
                </strong>{' '}
                est entrée en préparation dans notre atelier. Notre coursier vous
                contactera par téléphone au {confirmedOrder.phone} avant la livraison.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-[#181818] border border-[#34312D] text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                <span className="text-[#96918A]">Date & Heure</span>
                <span className="font-mono text-[#E8E4DD]">{confirmedOrder.createdAt}</span>
              </div>

              {confirmedOrder.customerEmail && (
                <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                  <span className="text-[#96918A]">Email de confirmation</span>
                  <span className="font-mono text-[#E8E4DD]">{confirmedOrder.customerEmail}</span>
                </div>
              )}

              <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                <span className="text-[#96918A]">Mode de règlement</span>
                <span className="text-[#E8E4DD]">
                  Paiement à la livraison (Espèces)
                </span>
              </div>

              <div className="flex justify-between border-b border-[#34312D]/60 pb-2">
                <span className="text-[#96918A]">Destination</span>
                <span className="text-[#E8E4DD]">
                  {confirmedOrder.governorate} — {confirmedOrder.address}
                </span>
              </div>

              <div className="pt-2 space-y-1">
                <span className="text-[11px] text-[#96918A] uppercase font-mono tracking-wider block">
                  Articles commandés :
                </span>
                {confirmedOrder.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-xs">
                    <span>
                      {i.quantity}x {i.product.name} ({i.selectedColor.name} · {i.selectedSize})
                    </span>
                    <span className="font-mono tabular-nums">
                      {formatTND(i.product.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#34312D] flex justify-between font-semibold text-sm">
                <span>Total à régler au livreur</span>
                <span className="font-mono text-[#B9A995] text-base">
                  {formatTND(confirmedOrder.total)}
                </span>
              </div>
            </div>

            {/* Optional Post-Purchase Account Conversion for Guests */}
            {!currentUser && (
              <div className="p-4 bg-[#141414] border border-[#34312D] text-left space-y-3">
                {guestAccountCreated ? (
                  <div className="flex items-center gap-2 text-xs text-[#B9A995] font-mono">
                    <Check className="w-4 h-4 text-[#B9A995]" />
                    <span>Votre compte KŪZA a été créé avec succès et rattaché à cette commande.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B9A995]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Conserver vos coordonnées pour vos prochaines commandes ?</span>
                    </div>
                    <p className="text-[11px] text-[#96918A] font-light">
                      Créez votre compte en un clic pour suivre l’état de préparation et commander en 1-clic la prochaine fois.
                    </p>

                    <form onSubmit={handleCreateAccountFromGuest} className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="password"
                        required
                        placeholder="Créer un mot de passe (min. 6 car.)"
                        value={guestPassword}
                        onChange={(e) => setGuestPassword(e.target.value)}
                        className="flex-1 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Activer mon compte
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {currentUser && (
              <p className="text-xs text-[#96918A] font-mono">
                ✦ Commande automatiquement enregistrée dans votre Espace Client ({currentUser.email}).
              </p>
            )}

            {/* Customer Assistance Badge */}
            <div className="p-4 bg-[#141414] border border-[#34312D] text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#B9A995] font-semibold block">
                  ASSISTANCE ATELIER KŪZA
                </span>
                <p className="text-[11px] text-[#E8E4DD] font-light leading-relaxed">
                  Un problème avec votre commande ? Contactez l'Atelier KŪZA via Instagram{' '}
                  <a
                    href={KUZA_CONTACT.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B9A995] underline hover:text-[#E8E4DD] transition-colors"
                  >
                    {KUZA_CONTACT.instagramHandle}
                  </a>{' '}
                  ou par téléphone au{' '}
                  <a
                    href={KUZA_CONTACT.phoneTel}
                    className="text-[#B9A995] underline hover:text-[#E8E4DD] transition-colors"
                  >
                    {KUZA_CONTACT.phoneDisplay}
                  </a>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <a
                  href={KUZA_CONTACT.phoneTel}
                  className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] hover:text-[#B9A995] transition-colors flex items-center justify-center gap-1.5 text-[11px]"
                  title="Appeler l'Atelier KŪZA"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B9A995]" />
                  <span>{KUZA_CONTACT.phoneDisplay}</span>
                </a>
                <a
                  href={KUZA_CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#181818] border border-[#34312D] hover:border-[#B9A995] text-[#E8E4DD] hover:text-[#B9A995] transition-colors flex items-center justify-center gap-1.5 text-[11px]"
                  title="Ouvrir Instagram @kuza.tn"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#B9A995]" />
                  <span>{KUZA_CONTACT.instagramHandle}</span>
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#E8E4DD] text-[#101010] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#B9A995] transition-colors cursor-pointer"
              >
                Retourner à la boutique
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="space-y-6">
            <div className="border-b border-[#34312D] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#181818] border border-[#34312D] shrink-0">
                  <KuzaMonogram className="w-7 h-7 text-[#B9A995]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#96918A] font-mono">
                    Livraison : 8 TND partout en Tunisie
                  </span>
                  <h2
                    id="checkout-title"
                    className="text-xl md:text-2xl font-serif text-[#E8E4DD] mt-0.5"
                    style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
                  >
                    Finalisation de votre commande
                  </h2>
                </div>
              </div>

              {/* Mode indicator */}
              {currentUser ? (
                <div className="text-xs font-mono text-[#B9A995] bg-[#181818] px-2.5 py-1 border border-[#34312D] self-start sm:self-auto">
                  ✓ Mode Client : {currentUser.firstName}
                </div>
              ) : (
                <div className="text-[11px] font-mono text-[#96918A] bg-[#181818] px-2.5 py-1 border border-[#34312D] self-start sm:self-auto">
                  Mode Invité (Sans inscription requise)
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Prénom *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Yassine"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-11 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Nom de famille *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Ben Salem"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-11 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Email de confirmation *</span>
                  </label>
                  <input
                    type="email"
                    required
                    inputMode="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholder="client@domaine.tn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Téléphone (8 chiffres) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Ex. 98 123 456"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhone(val);
                      const cleanVal = val.replace(/\s+/g, '');
                      if (cleanVal && !/^(2|4|5|7|9)\d{7}$/.test(cleanVal)) {
                        setPhoneError("Veuillez saisir un numéro tunisien valide à 8 chiffres (ex: 98 123 456)");
                      } else {
                        setPhoneError(null);
                      }
                    }}
                    className={`w-full h-11 bg-[#181818] border px-3.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors font-mono ${
                      phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-[#34312D] focus:border-[#B9A995]'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-[11px] text-rose-400 font-mono mt-1">
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* Governorate & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Gouvernorat *</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2.5 text-xs text-[#E8E4DD] focus:outline-none transition-colors"
                  >
                    {TUNISIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov} className="bg-[#101010] text-[#E8E4DD]">
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono">
                    Adresse de livraison (Rue, Résidence, Ville) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. 14 Rue de la Liberté, Ennasr 2, Tunis"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2.5 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono">
                  Instructions pour le livreur (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex. Appeler avant de passer / Interphone B4"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Payment Method: Strictly Cash on Delivery */}
              <div className="pt-2 space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#96918A] font-mono block">
                  Mode de règlement
                </label>
                <div className="p-3.5 border border-[#B9A995] bg-[#181818] text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#E8E4DD]">
                      Paiement à la livraison
                    </span>
                    <span className="text-xs text-[#B9A995] font-mono">✓ Exclusif</span>
                  </div>
                  <p className="text-[11px] text-[#96918A] mt-1 font-light">
                    Réglez en espèces au livreur lors de la réception de votre colis.
                  </p>
                </div>
              </div>

              {/* Promo Code Entry in Checkout if not applied */}
              {onApplyCoupon && (
                <div className="pt-2 border-t border-[#34312D]/60 space-y-1.5">
                  {promoSummary.appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#181818] border border-[#B9A995] text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#B9A995]" />
                        <span className="font-mono font-semibold text-[#E8E4DD]">
                          {promoSummary.appliedCoupon.code}
                        </span>
                        <span className="text-[11px] text-[#B9A995] font-mono">
                          ({promoSummary.appliedCoupon.type === 'PERCENTAGE' ? `-${promoSummary.appliedCoupon.value}%` : `-${formatTND(promoSummary.appliedCoupon.value)}`})
                        </span>
                      </div>
                      {onRemoveCoupon && (
                        <button
                          type="button"
                          onClick={onRemoveCoupon}
                          className="p-1 text-[#96918A] hover:text-[#E8E4DD] transition-colors cursor-pointer"
                          aria-label="Supprimer le code"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CODE PROMO (EX: KUZA10)"
                        value={checkoutCouponInput}
                        onChange={(e) => {
                          setCheckoutCouponInput(e.target.value.toUpperCase());
                          setCheckoutCouponError(null);
                        }}
                        className="flex-1 h-9 bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3 text-xs uppercase font-mono text-[#E8E4DD] placeholder-[#96918A]/50 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!checkoutCouponInput.trim()) return;
                          const res = onApplyCoupon(checkoutCouponInput.trim().toUpperCase());
                          if (!res.success) {
                            setCheckoutCouponError(res.error || 'Code invalide');
                          } else {
                            setCheckoutCouponInput('');
                            setCheckoutCouponError(null);
                          }
                        }}
                        disabled={!checkoutCouponInput.trim()}
                        className={`h-9 px-3.5 text-xs font-mono uppercase tracking-wider transition-colors border ${
                          checkoutCouponInput.trim()
                            ? 'bg-[#181818] hover:bg-[#E8E4DD] hover:text-[#101010] text-[#E8E4DD] border-[#B9A995] cursor-pointer'
                            : 'bg-[#181818] text-[#96918A]/40 border-[#34312D] cursor-not-allowed'
                        }`}
                      >
                        Appliquer
                      </button>
                    </div>
                  )}
                  {checkoutCouponError && (
                    <p className="text-[11px] font-mono text-rose-400">
                      {checkoutCouponError}
                    </p>
                  )}
                </div>
              )}

              {/* Price Calculation Summary */}
              <div className="pt-3 border-t border-[#34312D] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#96918A]">
                  <span>Sous-total articles :</span>
                  <span className="tabular-nums text-[#E8E4DD]">
                    {formatTND(promoSummary.originalSubtotal)}
                  </span>
                </div>

                {promoSummary.bundleDiscountTotal > 0 && (
                  <div className="flex justify-between text-[#B9A995]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#B9A995]" />
                      <span>Remise Offre Ensemble Set :</span>
                    </span>
                    <span className="tabular-nums font-semibold">
                      -{formatTND(promoSummary.bundleDiscountTotal)}
                    </span>
                  </div>
                )}

                {promoSummary.bundleDiscountTotal > 0 && (
                  <div className="flex justify-between text-[#E8E4DD] py-0.5 border-y border-[#34312D]/40">
                    <span className="font-semibold">Total Articles Set :</span>
                    <span className="tabular-nums font-bold text-[#B9A995]">
                      {formatTND(promoSummary.originalSubtotal - promoSummary.bundleDiscountTotal)}
                    </span>
                  </div>
                )}

                {promoSummary.appliedCoupon && promoSummary.couponDiscountTotal > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Code promo ({promoSummary.appliedCoupon.code}):</span>
                    </span>
                    <span className="tabular-nums font-semibold">
                      -{formatTND(promoSummary.couponDiscountTotal)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#96918A]">
                  <span>Frais de livraison :</span>
                  <span className="tabular-nums text-[#E8E4DD]">
                    {formatTND(promoSummary.shipping)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#34312D] flex items-center justify-between text-xs">
                  <div className="text-left">
                    <span className="text-xs uppercase text-[#96918A] block font-mono font-medium">
                      NET À PAYER EN ESPÈCES (COD) :
                    </span>
                    {promoSummary.totalDiscount > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Économie : -{formatTND(promoSummary.totalDiscount)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-mono font-bold text-[#B9A995] tabular-nums">
                      {formatTND(promoSummary.finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit CTA - Sticky on mobile (< md) */}
              <div className="fixed md:static bottom-0 left-0 right-0 p-3.5 sm:p-4 bg-[#101010]/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-t-0 border-[#34312D] z-40">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#E8E4DD] hover:bg-[#B9A995] active:bg-[#B9A995] text-[#101010] text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg touch-manipulation"
                >
                  <Truck className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Préparation de la commande...'
                      : currentUser
                      ? `Commander en 1-clic (${total} TND)`
                      : `Confirmer la commande (${total} TND)`}
                  </span>
                </button>
              </div>

              <p className="text-[10px] text-[#96918A] text-center font-mono uppercase tracking-wider mt-3 pb-24 md:pb-0">
                En confirmant, vous acceptez nos{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal && onOpenLegal('cgv')}
                  className="text-[#B9A995] underline cursor-pointer hover:text-[#E8E4DD] transition-colors"
                >
                  Conditions Générales (CGV)
                </button>{' '}
                et notre politique de{' '}
                <button
                  type="button"
                  onClick={() => onOpenLegal && onOpenLegal('legal')}
                  className="text-[#B9A995] underline cursor-pointer hover:text-[#E8E4DD] transition-colors"
                >
                  Confidentialité
                </button>.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
