import React, { useState, useEffect } from 'react';
import { SIZE_TABLE } from '../data/products';
import { X, Ruler, Sparkles } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  defaultProductId?: string;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  defaultProductId = 'shelter-sweat',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'shelter-sweat' | 'rest-wide'>(
    defaultProductId === 'rest-wide' ? 'rest-wide' : 'shelter-sweat'
  );

  // Interactive sizing advisor
  const [height, setHeight] = useState<number>(178);
  const [weight, setWeight] = useState<number>(72);
  const [fitPreference, setFitPreference] = useState<'regular' | 'oversized'>('oversized');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultProductId === 'rest-wide' ? 'rest-wide' : 'shelter-sweat');
    }
  }, [isOpen, defaultProductId]);

  // Simple clean algorithm for recommendation
  const calculateRecommendedSize = () => {
    const bmi = weight / Math.pow(height / 100, 2);
    let size = 'M';
    if (height < 168 && weight < 62) size = 'XS';
    else if (height < 174 && weight < 70) size = 'S';
    else if (height < 182 && weight < 80) size = 'M';
    else if (height < 188 && weight < 90) size = 'L';
    else size = 'XL';

    // If user prefers oversized and size is not already XL
    if (fitPreference === 'oversized' && size === 'XS') size = 'S';
    return size;
  };

  const recommended = calculateRecommendedSize();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div className="relative w-full max-w-3xl bg-[#101010] border border-[#34312D] text-[#E8E4DD] p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#34312D] pb-4">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-4 h-4 text-[#B9A995]" />
            <h2
              id="size-guide-title"
              className="text-lg md:text-xl font-serif text-[#E8E4DD] tracking-wide"
              style={{ fontFamily: "'Optima', 'Cormorant Garamond', serif" }}
            >
              Guide des Tailles & Architecture du Vêtement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#96918A] hover:text-[#E8E4DD] hover:bg-[#181818] transition-colors cursor-pointer"
            aria-label="Fermer le guide des tailles"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#34312D]">
          <button
            onClick={() => setActiveTab('shelter-sweat')}
            className={`pb-3 px-4 text-xs uppercase tracking-widest transition-colors font-mono cursor-pointer border-b-2 -mb-px ${
              activeTab === 'shelter-sweat'
                ? 'border-[#B9A995] text-[#E8E4DD] font-medium'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            SHELTER SWEAT
          </button>
          <button
            onClick={() => setActiveTab('rest-wide')}
            className={`pb-3 px-4 text-xs uppercase tracking-widest transition-colors font-mono cursor-pointer border-b-2 -mb-px ${
              activeTab === 'rest-wide'
                ? 'border-[#B9A995] text-[#E8E4DD] font-medium'
                : 'border-transparent text-[#96918A] hover:text-[#E8E4DD]'
            }`}
          >
            REST WIDE
          </button>
        </div>

        {/* Measurement Table Subtitle & Architecture */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#B9A995] uppercase tracking-wider">
          <span>Matrice 290 GSM Oversized Streetwear (CM)</span>
          <span className="text-[#96918A]">Unité : Centimètres (cm)</span>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto no-scrollbar border border-[#34312D] bg-[#141414]">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#34312D] bg-[#181818] text-[#A0988E] uppercase font-mono tracking-widest text-[11px]">
                <th className="py-3 px-3.5">TAILLE (XS to XL)</th>
                {activeTab === 'shelter-sweat' ? (
                  <>
                    <th className="py-3 px-3.5">LARGEUR POITRINE (CM)</th>
                    <th className="py-3 px-3.5">LONGUEUR TOTALE (CM)</th>
                    <th className="py-3 px-3.5">CARRURE (CM)</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3.5">TOUR TAILLE (CM)</th>
                    <th className="py-3 px-3.5">TOUR HANCHES (CM)</th>
                    <th className="py-3 px-3.5">LONGUEUR TOTALE (CM)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34312D]/60 font-mono text-[#E8E4DD]">
              {activeTab === 'shelter-sweat'
                ? SIZE_TABLE['shelter-sweat'].map((row) => (
                    <tr
                      key={row.size}
                      className={`transition-colors ${
                        row.size === recommended
                          ? 'bg-[#1e1c18] font-bold text-[#B9A995]'
                          : 'hover:bg-[#181818]'
                      }`}
                    >
                      <td className="py-3 px-3.5 flex items-center gap-2">
                        <span className="text-sm font-bold">[ {row.size} ]</span>
                        {row.size === recommended && (
                          <span className="text-[10px] text-[#B9A995] font-sans bg-[#B9A995]/15 px-1.5 py-0.5 border border-[#B9A995]/30">
                            Votre fit préconisé
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 tabular-nums">{row.chest}</td>
                      <td className="py-3 px-3.5 tabular-nums">{row.length}</td>
                      <td className="py-3 px-3.5 tabular-nums">{row.shoulder}</td>
                    </tr>
                  ))
                : SIZE_TABLE['rest-wide'].map((row) => (
                    <tr
                      key={row.size}
                      className={`transition-colors ${
                        row.size === recommended
                          ? 'bg-[#1e1c18] font-bold text-[#B9A995]'
                          : 'hover:bg-[#181818]'
                      }`}
                    >
                      <td className="py-3 px-3.5 flex items-center gap-2">
                        <span className="text-sm font-bold">[ {row.size} ]</span>
                        {row.size === recommended && (
                          <span className="text-[10px] text-[#B9A995] font-sans bg-[#B9A995]/15 px-1.5 py-0.5 border border-[#B9A995]/30">
                            Votre fit préconisé
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 tabular-nums">{row.waist}</td>
                      <td className="py-3 px-3.5 tabular-nums">{row.hips}</td>
                      <td className="py-3 px-3.5 tabular-nums">{row.outseam}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Interactive Size Advisor */}
        <div className="p-4 bg-[#181818] border border-[#34312D] space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B9A995] font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Calculateur de Tombé KŪZA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[#96918A] flex justify-between">
                <span>Taille :</span>
                <span className="font-mono text-[#E8E4DD]">{height} cm</span>
              </label>
              <input
                type="range"
                min="155"
                max="200"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-[#B9A995] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#96918A] flex justify-between">
                <span>Poids :</span>
                <span className="font-mono text-[#E8E4DD]">{weight} kg</span>
              </label>
              <input
                type="range"
                min="45"
                max="115"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-[#B9A995] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#96918A] block">Intention de style</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFitPreference('regular')}
                  className={`flex-1 py-1.5 px-2 border text-[11px] transition-colors cursor-pointer ${
                    fitPreference === 'regular'
                      ? 'border-[#B9A995] text-[#E8E4DD] bg-[#101010]'
                      : 'border-[#34312D] text-[#96918A]'
                  }`}
                >
                  Ajusté
                </button>
                <button
                  type="button"
                  onClick={() => setFitPreference('oversized')}
                  className={`flex-1 py-1.5 px-2 border text-[11px] transition-colors cursor-pointer ${
                    fitPreference === 'oversized'
                      ? 'border-[#B9A995] text-[#E8E4DD] bg-[#101010]'
                      : 'border-[#34312D] text-[#96918A]'
                  }`}
                >
                  Ample
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#34312D]/60 flex items-center justify-between text-xs">
            <span className="text-[#96918A]">
              Taille préconisée pour votre morphologie :
            </span>
            <span className="font-mono font-bold text-sm text-[#B9A995] bg-[#101010] px-3 py-1 border border-[#34312D]">
              Taille {recommended}
            </span>
          </div>
        </div>

        {/* Tailoring Architectural Note */}
        <div className="p-3.5 bg-[#141414] border-l-2 border-[#B9A995] border-y border-r border-[#34312D] text-xs space-y-1">
          <p className="font-mono text-[#E8E4DD] font-semibold text-xs tracking-wide">
            ✦ NOTE DE COUPE ARCHITECTURALE :
          </p>
          <p className="text-[#B9A995] font-mono text-xs">
            &ldquo;Coupe contemporaine ample (Oversized fit). Prenez votre taille habituelle.&rdquo;
          </p>
          <p className="text-[11px] text-[#96918A] font-light leading-relaxed pt-0.5">
            Tissu lourd 290 GSM structuré sans fléchissement. Si vous hésitez entre deux tailles, votre taille habituelle préservera le drapé volumétrique voulu par la direction artistique.
          </p>
        </div>
      </div>
    </div>
  );
};
