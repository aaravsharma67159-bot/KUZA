import React, { useState, useEffect } from 'react';
import { CustomerUser, OrderDetails, OrderStatus } from '../types';
import { TUNISIAN_GOVERNORATES } from '../data/products';
import {
  X,
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  ChevronRight,
  ShieldCheck,
  Boxes,
  Instagram,
} from 'lucide-react';
import { KUZA_CONTACT } from '../utils/contact';
import { KuzaMonogram } from './KuzaMonogram';
import { KuzaLogo } from './KuzaLogo';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CustomerUser | null;
  orders: OrderDetails[];
  onLogin: (email: string, pass: string) => { success: boolean; role?: string; message?: string };
  onSignup: (userData: Omit<CustomerUser, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  onUpdateProfile: (updatedData: Partial<CustomerUser>) => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  orders,
  onLogin,
  onSignup,
  onUpdateProfile,
  onLogout,
  onOpenAdmin,
}) => {
  // Mode when not logged in: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Mode when logged in: 'orders' | 'profile'
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'profile'>('orders');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupGovernorate, setSignupGovernorate] = useState(TUNISIAN_GOVERNORATES[0]);
  const [signupAddress, setSignupAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  // Profile Edit state
  const [editFirstName, setEditFirstName] = useState(currentUser?.firstName || '');
  const [editLastName, setEditLastName] = useState(currentUser?.lastName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editGovernorate, setEditGovernorate] = useState(
    currentUser?.governorate || TUNISIAN_GOVERNORATES[0]
  );
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [profileSuccessNotice, setProfileSuccessNotice] = useState(false);
  const [profileErrorNotice, setProfileErrorNotice] = useState<string | null>(null);

  // Sync profile fields when currentUser or isOpen changes
  useEffect(() => {
    if (currentUser) {
      setEditFirstName(currentUser.firstName || '');
      setEditLastName(currentUser.lastName || '');
      setEditPhone(currentUser.phone || '');
      setEditGovernorate(currentUser.governorate || TUNISIAN_GOVERNORATES[0]);
      setEditAddress(currentUser.address || '');
    }
  }, [currentUser, isOpen]);

  // Handle Login (Unified interface for Clients & Admin)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanEmail = loginEmail.trim().toLowerCase();

    const res = onLogin(cleanEmail, loginPassword.trim());
    if (res.success) {
      onClose();
    } else {
      setLoginError(res.message || 'Identifiants invalides');
    }
  };

  // Handle Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    const cleanEmail = signupEmail.trim().toLowerCase();

    // Privilege Guard: Cannot register admin email as customer
    if (cleanEmail === 'admin@kuza.tn') {
      setSignupError(
        "L'adresse admin@kuza.tn est réservée à l'administration atelier et ne peut être enregistrée comme compte client."
      );
      return;
    }

    const cleanPhone = signupPhone.replace(/\s+/g, '');
    if (!/^(2|4|5|7|9)\d{7}$/.test(cleanPhone)) {
      setSignupError("Veuillez saisir un numéro tunisien valide à 8 chiffres (ex: 98 123 456)");
      return;
    }

    if (!cleanEmail || !signupPassword.trim()) {
      setSignupError('Veuillez renseigner un email et un mot de passe.');
      return;
    }
    const res = onSignup({
      firstName: signupFirstName.trim(),
      lastName: signupLastName.trim(),
      email: cleanEmail,
      phone: signupPhone.trim(),
      governorate: signupGovernorate,
      address: signupAddress.trim(),
      password: signupPassword,
    });
    if (!res.success) {
      setSignupError(res.message || "Erreur lors de l'inscription");
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorNotice(null);
    
    const cleanPhone = editPhone.replace(/\s+/g, '');
    if (!/^(2|4|5|7|9)\d{7}$/.test(cleanPhone)) {
      setProfileErrorNotice("Veuillez saisir un numéro tunisien valide à 8 chiffres (ex: 98 123 456)");
      return;
    }

    onUpdateProfile({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      phone: editPhone.trim(),
      governorate: editGovernorate,
      address: editAddress.trim(),
    });
    setProfileSuccessNotice(true);
    setTimeout(() => setProfileSuccessNotice(false), 2400);
  };

  // Filter orders belonging to this customer
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerId === currentUser.id ||
          (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          o.phone === currentUser.phone
      )
    : [];

  const getStatusStep = (status: OrderStatus = 'Commande reçue') => {
    switch (status) {
      case 'received':
      case 'Commande reçue':
        return 1;
      case 'Confirmation en cours':
      case 'confirmed':
      case 'Commande confirmée':
        return 2;
      case 'preparing':
      case 'En préparation':
        return 3;
      case 'shipped':
      case 'Expédiée':
        return 4;
      case 'delivered':
      case 'Livrée':
        return 5;
      default:
        return 2;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#101010] border border-[#34312D] text-[#E8E4DD] p-6 md:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] border border-transparent hover:border-[#34312D] transition-colors cursor-pointer"
          aria-label="Fermer l'espace client"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED IN VIEW */}
        {currentUser ? (
          <div className="space-y-6">
            {/* Header with Logout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#34312D] pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#181818] border border-[#34312D] shrink-0">
                  <KuzaMonogram className="w-7 h-7 text-[#B9A995]" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-[#B9A995] font-mono block">
                    {currentUser.role === 'admin' ? 'Espace Administration Atelier' : 'Espace Client KŪZA'}
                  </span>
                  <h2
                    id="account-modal-title"
                    className="text-2xl font-serif text-[#E8E4DD] mt-0.5"
                    style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
                  >
                    Bienvenue, {currentUser.firstName || currentUser.email}
                  </h2>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] border border-[#34312D] hover:border-rose-400 text-xs font-mono text-[#96918A] hover:text-rose-400 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Admin Role Action Card */}
            {currentUser.role === 'admin' && (
              <div className="p-5 bg-[#181818] border border-[#B9A995] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#B9A995]" />
                    <span className="text-xs uppercase font-mono tracking-wider text-[#B9A995] font-semibold">
                      Compte Administrateur Atelier KŪZA
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#E8E4DD] bg-[#101010] px-2 py-0.5 border border-[#34312D] uppercase tracking-wider">
                    Rôle : Admin
                  </span>
                </div>
                <p className="text-xs text-[#96918A] font-light leading-relaxed">
                  Vous disposez des droits d'administration stock et gestion. Vous pouvez gérer le catalogue, ajuster les quantités en stock par matrice SKU et superviser les commandes.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAdmin) onOpenAdmin();
                  }}
                  className="w-full py-3.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Boxes className="w-4 h-4 text-[#101010]" />
                  <span>ESPACE ADMIN / STOCK & GESTION</span>
                </button>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex border-b border-[#34312D]">
              <button
                onClick={() => setDashboardTab('orders')}
                className={`flex items-center gap-2 pb-3 px-4 text-xs uppercase tracking-widest font-mono cursor-pointer border-b-2 -mb-px transition-colors ${
                  dashboardTab === 'orders'
                    ? 'border-[#B9A995] text-[#E8E4DD] font-semibold'
                    : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Mes Commandes ({userOrders.length})</span>
              </button>

              <button
                onClick={() => setDashboardTab('profile')}
                className={`flex items-center gap-2 pb-3 px-4 text-xs uppercase tracking-widest font-mono cursor-pointer border-b-2 -mb-px transition-colors ${
                  dashboardTab === 'profile'
                    ? 'border-[#B9A995] text-[#E8E4DD] font-semibold'
                    : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profil & Livraison</span>
              </button>
            </div>

            {/* TAB: ORDERS HISTORY */}
            {dashboardTab === 'orders' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {userOrders.length === 0 ? (
                  <div className="p-10 bg-[#181818] border border-[#34312D] text-center space-y-3">
                    <span className="text-3xl font-serif text-[#34312D]">KZ</span>
                    <p className="text-xs uppercase tracking-widest text-[#96918A] font-mono">
                      Aucune commande enregistrée
                    </p>
                    <p className="text-xs text-[#96918A] font-light max-w-sm mx-auto">
                      Vos commandes passées avec votre compte apparaîtront ici avec leur suivi d'expédition en temps réel.
                    </p>
                  </div>
                ) : (
                  userOrders.map((order) => {
                    const step = getStatusStep(order.status);
                    return (
                      <div
                        key={order.orderId}
                        className="p-5 bg-[#181818] border border-[#34312D] space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#34312D]/60 pb-3 gap-2">
                          <div>
                            <span className="text-sm font-mono font-bold text-[#B9A995]">
                              {order.orderId}
                            </span>
                            <span className="text-xs text-[#96918A] ml-2">
                              · {order.createdAt}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#E8E4DD] tabular-nums">
                            Total : <strong className="text-[#B9A995]">{order.total} TND</strong> (8 TND livraison incluse)
                          </span>
                        </div>

                        {/* Real-time Order Tracker Timeline */}
                        <div className="py-2">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#96918A] block mb-2">
                            Suivi d’acheminement :
                          </span>

                          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                            <div
                              className={`p-2 border transition-colors ${
                                step >= 1
                                  ? 'border-[#B9A995] bg-[#101010] text-[#E8E4DD]'
                                  : 'border-[#34312D] text-[#96918A]/50'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-[#B9A995]" />
                              <span>Reçue</span>
                            </div>

                            <div
                              className={`p-2 border transition-colors ${
                                step >= 3
                                  ? 'border-[#B9A995] bg-[#101010] text-[#E8E4DD]'
                                  : 'border-[#34312D] text-[#96918A]/50'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1 text-[#B9A995]" />
                              <span>En atelier</span>
                            </div>

                            <div
                              className={`p-2 border transition-colors ${
                                step >= 4
                                  ? 'border-[#B9A995] bg-[#101010] text-[#E8E4DD]'
                                  : 'border-[#34312D] text-[#96918A]/50'
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5 mx-auto mb-1 text-[#B9A995]" />
                              <span>Expédiée</span>
                            </div>

                            <div
                              className={`p-2 border transition-colors ${
                                step >= 5
                                  ? 'border-emerald-500 bg-[#101010] text-emerald-400'
                                  : 'border-[#34312D] text-[#96918A]/50'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mx-auto mb-1" />
                              <span>Livrée</span>
                            </div>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-1.5 text-xs text-[#E8E4DD] pt-1 border-t border-[#34312D]/40">
                          {order.items.map((it) => (
                            <div key={it.id} className="flex justify-between items-center">
                              <span className="truncate pr-2">
                                {it.quantity}x {it.product.name} ({it.selectedColor.name} · {it.selectedSize})
                              </span>
                              <span className="font-mono text-[#96918A] shrink-0 tabular-nums">
                                {it.product.price * it.quantity} TND
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Destination */}
                        <div className="pt-2 border-t border-[#34312D]/40 text-[11px] text-[#96918A] flex items-center justify-between font-mono">
                          <span>
                            Livraison : {order.governorate} — {order.address}
                          </span>
                          <span className="text-[#B9A995]">Paiement à la livraison</span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Customer Support bar */}
                <div className="p-3 bg-[#141414] border border-[#34312D] text-xs font-mono text-[#96918A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Assistance : <a href={KUZA_CONTACT.phoneTel} className="text-[#E8E4DD] hover:text-[#B9A995] transition-colors">{KUZA_CONTACT.phoneDisplay}</a></span>
                  </div>
                  <a
                    href={KUZA_CONTACT.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#B9A995] hover:text-[#E8E4DD] transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>{KUZA_CONTACT.instagramHandle}</span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB: PROFILE & SAVED ADDRESS */}
            {dashboardTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {profileSuccessNotice && (
                  <div className="p-3 bg-[#181818] border border-[#B9A995] text-xs text-[#B9A995] flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#B9A995]" />
                    <span>Vos informations et adresses de livraison ont été mises à jour.</span>
                  </div>
                )}

                {profileErrorNotice && (
                  <div className="p-3 bg-[#181818] border border-rose-500/50 text-xs text-rose-400 font-mono">
                    {profileErrorNotice}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Adresse Email (Fixe)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full bg-[#141414] border border-[#34312D] px-3.5 py-2 text-xs text-[#96918A] cursor-not-allowed font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Téléphone (+216)
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Ex. 98 123 456"
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                    Gouvernorat par défaut
                  </label>
                  <select
                    value={editGovernorate}
                    onChange={(e) => setEditGovernorate(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                  >
                    {TUNISIAN_GOVERNORATES.map((g) => (
                      <option key={g} value={g} className="bg-[#101010]">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                    Adresse complète de livraison
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Rue, Immeuble, Résidence, Ville"
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-[#34312D] flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Enregistrer les coordonnées
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* GUEST / AUTHENTICATION VIEW */
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-[#34312D] pb-4 flex items-center gap-3">
              <div className="p-2 bg-[#181818] border border-[#34312D] shrink-0">
                <KuzaMonogram className="w-7 h-7 text-[#B9A995]" />
              </div>
              <div>
                <KuzaLogo className="h-5 w-auto text-[#E8E4DD] mb-1" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B9A995] font-mono block">
                  Espace Client & Directoire
                </span>
                <p className="text-xs text-[#96918A] font-light mt-0.5">
                  Guichet unique d'accès pour les membres et l'équipe d'atelier.
                </p>
              </div>
            </div>

            {/* Toggle Login / Signup */}
            <div className="flex border-b border-[#34312D]">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                }}
                className={`pb-3 px-4 text-xs uppercase tracking-widest font-mono cursor-pointer border-b-2 -mb-px transition-colors ${
                  authMode === 'login'
                    ? 'border-[#B9A995] text-[#E8E4DD] font-semibold'
                    : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                Connexion
              </button>

              <button
                onClick={() => {
                  setAuthMode('signup');
                  setSignupError(null);
                }}
                className={`pb-3 px-4 text-xs uppercase tracking-widest font-mono cursor-pointer border-b-2 -mb-px transition-colors ${
                  authMode === 'signup'
                    ? 'border-[#B9A995] text-[#E8E4DD] font-semibold'
                    : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
                }`}
              >
                Créer un Compte
              </button>
            </div>

            {/* FORM: LOGIN */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-[#181818] border border-rose-500/50 text-xs text-rose-400 font-mono">
                    {loginError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Adresse Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@domaine.tn"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2.5 text-xs text-[#E8E4DD] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#B9A995]" />
                    <span>Mot de passe</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2.5 text-xs text-[#E8E4DD] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer mt-2"
                >
                  Se Connecter
                </button>

                <p className="text-center text-[11px] text-[#96918A] font-light pt-2">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-[#B9A995] hover:underline cursor-pointer"
                  >
                    Créer un compte en 30 secondes
                  </button>
                </p>

                <div className="pt-3 border-t border-[#34312D]/60 space-y-2 text-[11px] text-[#96918A] font-mono">
                  <div className="flex items-center justify-between">
                    <span>Compte client : client@kuza.tn</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('client@kuza.tn');
                        setLoginPassword('password123');
                        setLoginError(null);
                      }}
                      className="text-[#B9A995] hover:underline cursor-pointer"
                    >
                      Remplir
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Accès Atelier : admin@kuza.tn</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('admin@kuza.tn');
                        setLoginPassword('kuza2026');
                        setLoginError(null);
                      }}
                      className="text-[#B9A995] hover:underline cursor-pointer"
                    >
                      Remplir
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* FORM: SIGNUP */
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {signupError && (
                  <div className="p-3 bg-[#181818] border border-rose-500/50 text-xs text-rose-400 font-mono">
                    {signupError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Yassine"
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ben Salem"
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="votre@adresse.tn"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Téléphone (+216) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="98 123 456"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Gouvernorat *
                    </label>
                    <select
                      value={signupGovernorate}
                      onChange={(e) => setSignupGovernorate(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                    >
                      {TUNISIAN_GOVERNORATES.map((g) => (
                        <option key={g} value={g} className="bg-[#101010]">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 caractères"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-[#96918A] font-mono">
                    Adresse de livraison (Rue, Résidence, Ville) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. 14 Rue de la Liberté, Ennasr 2, Tunis"
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    className="w-full bg-[#181818] border border-[#34312D] focus:border-[#B9A995] px-3.5 py-2 text-xs text-[#E8E4DD] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#E8E4DD] hover:bg-[#B9A995] text-[#101010] text-xs font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer mt-2"
                >
                  Créer mon Compte KŪZA
                </button>

                <p className="text-center text-[11px] text-[#96918A] font-light">
                  Déjà enregistré ?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-[#B9A995] hover:underline cursor-pointer"
                  >
                    Se connecter à votre compte
                  </button>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
