import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { ChromeIcon, FirefoxIcon, EdgeIcon } from './Icons';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const STORES = [
  {
    name: 'Google Chrome',
    badge: 'Most Popular',
    icon: ChromeIcon,
    href: 'https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj',
    description: 'Chrome Web Store (v1.0.8.7)',
  },
  {
    name: 'Mozilla Firefox',
    badge: 'Verified Add-on',
    icon: FirefoxIcon,
    href: 'https://addons.mozilla.org/firefox/addon/enhancer-for-physics-wallah/',
    description: 'Firefox Add-ons Hub',
  },
  {
    name: 'Microsoft Edge',
    badge: 'Native Add-on',
    icon: EdgeIcon,
    href: 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan',
    description: 'Edge Add-ons Store',
  },
];

export const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl liquid-glass-card p-5 sm:p-8 text-foreground border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5 sm:mb-6 pr-6 pl-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Choose Your Browser
          </span>
          <h2 className="text-2xl sm:text-3xl mt-1 tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Add Enhancer for PW to Browser
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
            100% Free & Open Source. Zero login required.
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {STORES.map((store) => {
            const Icon = store.icon;
            return (
              <a
                key={store.name}
                href={store.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl liquid-glass hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-semibold text-white group-hover:text-white text-sm sm:text-base truncate">
                        {store.name}
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 shrink-0">
                        {store.badge}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block truncate">
                      {store.description}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
