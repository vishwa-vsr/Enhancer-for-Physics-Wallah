import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { GithubIcon } from './Icons';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAboutOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 w-full bg-transparent">
      <nav className="flex row items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
          <img
            src="./logo.png"
            alt="Enhancer for PW Logo"
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl border border-white/20 shadow-md group-hover:scale-105 transition-transform object-cover"
          />
          <span
            className="text-xl sm:text-3xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Enhancer for PW
          </span>
        </a>

        {/* Desktop Nav Links — exposed so Google can crawl them */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-sm text-foreground font-medium transition-colors"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#reviews"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Reviews
          </a>
          <a
            href="./faq.html"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </a>
        </div>

        {/* Desktop Right Side: GitHub Icon + About Dropdown */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Square GitHub Icon Button */}
          <a
            href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah"
            target="_blank"
            rel="noreferrer"
            className="liquid-glass p-2.5 rounded-xl text-foreground hover:scale-105 transition-all flex items-center justify-center shadow-lg border border-white/10"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-5 h-5 text-white" />
          </a>

          {/* About Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAboutOpen(!aboutOpen)}
              className="liquid-glass rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:scale-[1.02] cursor-pointer flex items-center gap-2 shadow-lg border border-white/10"
              aria-expanded={aboutOpen}
            >
              <span>About</span>
              {aboutOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Dropdown Card */}
            {aboutOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl liquid-glass-card p-3 border border-white/15 shadow-2xl z-50 animate-fade-rise text-sm">
                <div className="space-y-1">
                  <a
                    href="./faq.html"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>FAQ</span>
                    <span className="text-xs text-muted-foreground">↗</span>
                  </a>
                  <a
                    href="./faq.html#blog"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>Blog & Guides</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground font-mono">Soon</span>
                  </a>
                  <a
                    href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/releases"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>Release log (v1.0.8.3)</span>
                    <span className="text-xs text-muted-foreground">↗</span>
                  </a>
                </div>

                <div className="my-2 border-t border-white/10" />

                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Support Us
                </div>
                <div className="space-y-1">
                  <a
                    href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/issues"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>Submit issues</span>
                    <span className="text-xs text-muted-foreground">↗</span>
                  </a>
                  <a
                    href="https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>Feedback & Reviews</span>
                    <span className="text-xs text-muted-foreground">↗</span>
                  </a>
                </div>

                <div className="my-2 border-t border-white/10" />

                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Legal
                </div>
                <div className="space-y-1">
                  <a
                    href="./privacy.html"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>Privacy Policy</span>
                    <span className="text-xs text-muted-foreground">↗</span>
                  </a>
                  <a
                    href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/blob/main/LICENSE"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setAboutOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>License</span>
                    <span className="text-xs text-muted-foreground">↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-5 mx-4 rounded-2xl liquid-glass-card border border-white/10 flex flex-col gap-4 animate-fade-rise">
          <a
            href="#"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm text-foreground font-medium py-1"
          >
            Home
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground py-1"
          >
            Features
          </a>
          <a
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground py-1"
          >
            Reviews
          </a>
          <a
            href="./faq.html"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground py-1"
          >
            FAQ
          </a>
          <a
            href="./faq.html#blog"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground py-1 flex items-center justify-between"
          >
            <span>Blog & Guides</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground font-mono">Soon</span>
          </a>
          <a
            href="./privacy.html"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm text-muted-foreground hover:text-foreground py-1"
          >
            Privacy Policy
          </a>
          <a
            href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground py-1 flex items-center justify-between"
          >
            <span>GitHub Repository</span>
            <span className="text-xs">↗</span>
          </a>
        </div>
      )}
    </header>
  );
};
