import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, Users, Star } from 'lucide-react';
import { ChromeIcon, FirefoxIcon, EdgeIcon } from './Icons';
import { VerticalCutReveal, type VerticalCutRevealRef } from './ui/vertical-cut-reveal';

export const Hero: React.FC = () => {
  const [chromeUsers, setChromeUsers] = useState('650+ users');
  const [chromeRating, setChromeRating] = useState('4.8');
  const [isLive, setIsLive] = useState(false);
  const greetingRef = useRef<VerticalCutRevealRef>(null);

  const handleGreetingInteraction = () => {
    greetingRef.current?.restart();
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchLiveStats() {
      try {
        const [usersRes, ratingRes] = await Promise.allSettled([
          fetch('https://img.shields.io/chrome-web-store/users/ibepglcdcaanmkledmpgfapaffkhbadj.json'),
          fetch('https://img.shields.io/chrome-web-store/rating/ibepglcdcaanmkledmpgfapaffkhbadj.json'),
        ]);

        if (!isMounted) return;

        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
          const data = await usersRes.value.json();
          if (data?.message) {
            const count = parseInt(data.message, 10);
            if (!isNaN(count)) {
              setChromeUsers(`${count}+ users`);
              setIsLive(true);
            }
          }
        }

        if (ratingRes.status === 'fulfilled' && ratingRes.value.ok) {
          const data = await ratingRes.value.json();
          if (data?.message) {
            const cleanRating = data.message.replace('/5', '').trim();
            setChromeRating(cleanRating);
          }
        }
      } catch {
        // Keep fallback numbers if network is unavailable
      }
    }

    fetchLiveStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const STORE_CARDS = [
    {
      name: 'Chrome Web Store',
      shortName: 'Chrome',
      icon: ChromeIcon,
      href: 'https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj',
      users: chromeUsers,
      rating: chromeRating,
      stars: 5,
      isLive,
    },
    {
      name: 'Firefox Add-ons',
      shortName: 'Firefox',
      icon: FirefoxIcon,
      href: 'https://addons.mozilla.org/firefox/addon/enhancer-for-physics-wallah/',
      users: '10+ users',
      rating: '5.0',
      stars: 5,
      isLive: false,
    },
    {
      name: 'Edge Add-ons Store',
      shortName: 'Edge',
      icon: EdgeIcon,
      href: 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan',
      users: 'Official',
      rating: 'Verified',
      stars: 5,
      isLive: false,
    },
  ];
  return (
    <section className="relative min-h-[100dvh] sm:min-h-[700px] h-screen flex flex-col justify-between overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source
          src="./hero-bg.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle depth overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#021422]/50 via-transparent to-[#021422] z-[1] pointer-events-none" />

      {/* Hero Centerpiece: Headline Only */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto my-auto pt-24 sm:pt-28 pb-4">
        <h1
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[1.05] sm:leading-[0.95] tracking-tight sm:tracking-[-2.46px] font-normal text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Kyun nahi ho rahi <em className="not-italic text-muted-foreground">padhai?!</em>
        </h1>
      </div>

      {/* Bottom Bar: Vertical Store Cards on Left, Scroll Indicator on Right */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-5 sm:pb-8 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 sm:gap-6">
        {/* Vertical Store Cards Stack */}
        <div className="flex flex-col gap-2 w-full sm:w-[22rem] animate-fade-rise-delay">
          {STORE_CARDS.map((store) => {
            const Icon = store.icon;
            return (
              <a
                key={store.name}
                href={store.href}
                target="_blank"
                rel="noreferrer"
                className="liquid-glass rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 hover:scale-[1.02] hover:border-white/20 transition-all flex items-center justify-between shadow-xl border border-white/10 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:scale-105 transition-all shrink-0">
                    <Icon className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5 truncate">
                    <span>Add to {store.shortName}</span>
                    <span className="text-[10px] text-white/40 group-hover:text-white transition-colors">↗</span>
                  </div>
                </div>

                {/* Glassy Stats Badges */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-2">
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/90 font-medium">
                    <Users className="w-3 h-3 text-sky-400" />
                    <span>{store.users}</span>
                    {store.isLive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 inline-block" title="Live verified from Chrome Web Store" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/90 font-medium">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{store.rating}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Bottom Right: Interactive Greeting Badge & Scroll Indicator */}
        <div className="flex flex-col items-center sm:items-end gap-2.5 self-center sm:self-end shrink-0 animate-fade-rise-delay">
          {/* Greeting Pill with Vertical Cut Reveal */}
          <div
            onMouseEnter={handleGreetingInteraction}
            onClick={handleGreetingInteraction}
            className="liquid-glass rounded-full px-4 py-2 border border-white/10 hover:border-white/20 shadow-xl flex items-center gap-2 cursor-pointer select-none group transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Click or hover to replay"
          >
            <span className="text-sm select-none" aria-hidden="true">👋</span>
            <VerticalCutReveal
              ref={greetingRef}
              splitBy="characters"
              staggerDuration={0.025}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 24,
              }}
              containerClassName="text-xs sm:text-sm font-medium text-white/90 tracking-tight"
            >
              hi friends it's nice to see you
            </VerticalCutReveal>
          </div>

          <a
            href="#features"
            className="flex items-center justify-center sm:justify-end gap-2 text-xs text-muted-foreground hover:text-white transition-colors pb-1 shrink-0"
          >
            <span>Explore features</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
};
