import React from 'react';
import { Keyboard, VolumeX, EyeOff, Monitor, Clock, PauseCircle } from 'lucide-react';

const FEATURE_LIST = [
  {
    icon: VolumeX,
    title: 'Skip Silence',
    subtitle: 'Automatically speeds up when the teacher stops talking or writes on the board, and returns to normal the second they speak.',
    badge: '100% On-Device',
    slug: 'skip-silence',
  },
  {
    icon: Monitor,
    title: 'Constant 720p HD Quality',
    subtitle: 'Never wait 30 seconds for blurry video to buffer. Automatically locks crisp 720p HD quality so lectures stay clear from start to finish.',
    badge: 'Always Crisp',
    slug: 'constant-720p-hd',
  },
  {
    icon: Keyboard,
    title: 'Customizable Keyboard Shortcuts',
    subtitle: 'Control speed with default keys (H to speed up, J to slow down), or customize them to any keys you like in settings.',
    badge: 'Zero Friction',
    slug: 'keyboard-shortcuts',
  },
  {
    icon: EyeOff,
    title: '1-Click Focus Mode',
    subtitle: 'Instantly hide live chat, doubt box, Ask AI, and other on-screen icons so you can focus in peace.',
    badge: 'Zero Distractions',
    slug: 'focus-mode',
  },
  {
    icon: Clock,
    title: 'Real Finish Clock',
    subtitle: 'Calculates the exact wall-clock time your lecture will end at your active speed, so you know if you will finish before dinner.',
    badge: 'Time Saved',
    slug: 'finish-clock',
  },
  {
    icon: PauseCircle,
    title: 'Smart Tab Auto-Pause',
    subtitle: 'Switched tabs to check formula notes or solve a problem? The lecture pauses and resumes the second you switch back.',
    badge: 'Never Miss Notes',
    slug: 'smart-tab-auto-pause',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative z-10 pt-16 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-5xl mx-auto mb-10 sm:mb-14 px-2">
        <h2
          className="text-[clamp(1.15rem,3.6vw,2.85rem)] tracking-tight text-foreground whitespace-nowrap leading-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Everything the PW player <em className="not-italic text-muted-foreground">should have had.</em>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          All the smart lecture controls you wish you had, built right into your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {FEATURE_LIST.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <a
              key={idx}
              href={`/blog?post=${feat.slug}`}
              className="liquid-glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-1 block"
            >
              <div>
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 sm:px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-white mb-2 tracking-tight group-hover:text-sky-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.subtitle}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Active on pw.live</span>
                <span className="text-white/80 group-hover:translate-x-1 group-hover:text-white transition-all font-medium flex items-center gap-1">
                  How it works →
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
