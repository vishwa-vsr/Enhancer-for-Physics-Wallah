import React from 'react';
import { Heart } from 'lucide-react';
import { ChromeIcon, FirefoxIcon, EdgeIcon, GithubIcon } from './Icons';

interface FooterProps {
  onOpenStore?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="relative z-10 border-t border-white/5 py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 sm:mb-12">
        <div className="flex items-center gap-3">
          <img
            src="./logo.png"
            alt="Enhancer for PW Logo"
            className="w-7 h-7 rounded-lg border border-white/20 object-cover"
          />
          <span
            className="text-2xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Enhancer for PW
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <a
            href="https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj"
            target="_blank"
            rel="noreferrer"
            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl liquid-glass hover:scale-110 hover:border-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Chrome Web Store"
          >
            <ChromeIcon className="w-5 h-5" />
          </a>
          <a
            href="https://addons.mozilla.org/firefox/addon/enhancer-for-physics-wallah/"
            target="_blank"
            rel="noreferrer"
            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl liquid-glass hover:scale-110 hover:border-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Firefox Add-ons"
          >
            <FirefoxIcon className="w-5 h-5" />
          </a>
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan"
            target="_blank"
            rel="noreferrer"
            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl liquid-glass hover:scale-110 hover:border-white/20 transition-all cursor-pointer shadow-lg"
            aria-label="Edge Add-ons"
          >
            <EdgeIcon className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah"
            target="_blank"
            rel="noreferrer"
            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl liquid-glass text-muted-foreground hover:text-white hover:scale-110 hover:border-white/20 transition-all"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Footer Navigation Links */}
      <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2.5 mb-8 text-xs text-muted-foreground">
        <a href="./index.html" className="hover:text-white transition-colors">
          Home
        </a>
        <a href="./index.html#features" className="hover:text-white transition-colors">
          Extension Features
        </a>
        <a href="./index.html#reviews" className="hover:text-white transition-colors">
          Student Reviews
        </a>
        <a href="./faq.html" className="hover:text-white transition-colors text-white/90">
          FAQ & Help Guide
        </a>
        <a href="./pw-extensions.html" className="hover:text-white transition-colors text-sky-400 font-medium">
          PW Extensions Guide
        </a>
        <a href="./blog.html" className="hover:text-white transition-colors">
          Blog
        </a>
        <a href="./privacy.html" className="hover:text-white transition-colors">
          Privacy Policy
        </a>
        <a
          href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/releases"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-colors"
        >
          Releases (v1.0.8.3)
        </a>
        <a
          href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-colors"
        >
          Source Code
        </a>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground/80">
        <p className="max-w-3xl text-[11px] sm:text-xs leading-relaxed">
          <strong className="text-white/80">Legal Disclaimer:</strong> "Physics Wallah", "PW", and associated marks or logos are registered trademarks of Physics Wallah Private Limited. <strong className="text-white/80">Enhancer for PW</strong> is an independently developed open-source tool and is NOT affiliated with, endorsed by, or sponsored by Physics Wallah Private Limited. Reference to the marks is solely to indicate product compatibility under Section 30(2)(d) of the Indian Trade Marks Act, 1999.
        </p>

        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 pt-2 md:pt-0">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for students</span>
        </div>
      </div>
    </footer>
  );
};
