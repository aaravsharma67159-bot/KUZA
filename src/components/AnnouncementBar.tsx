import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';

interface AnnouncementBarProps {
  onPromoClick?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onPromoClick }) => {
  const { siteConfig } = useSiteConfig();
  const { announcement } = siteConfig;

  if (!announcement.visible) return null;

  return (
    <aside
      aria-label="Annonce promotionnelle atelier"
      onClick={onPromoClick}
      className={`w-full bg-[#181818] border-b border-[#34312D] text-[#E8E4DD] py-2 px-3 sm:px-4 text-center select-none transition-colors ${
        onPromoClick ? 'cursor-pointer hover:bg-[#1c1c1c] group' : ''
      }`}
    >
      <div className="max-w-[1920px] mx-auto flex items-center justify-center gap-2 text-[10px] sm:text-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#B9A995] shrink-0 animate-pulse" />
        <p className="tracking-wider leading-tight font-mono text-[#E8E4DD]">
          {announcement.text}
        </p>
        {onPromoClick && (
          <ArrowRight className="w-3 h-3 text-[#B9A995] shrink-0 transition-transform duration-200 group-hover:translate-x-1 hidden sm:inline-block" />
        )}
      </div>
    </aside>
  );
};
