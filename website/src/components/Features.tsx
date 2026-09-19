import React from 'react';
import { Keyboard, VolumeX, EyeOff, Monitor, Clock, PauseCircle } from 'lucide-react';

const FEATURE_LIST = [
  {
    icon: VolumeX,
    title: 'Skip Silence',
    subtitle: 'Automatically speeds up when the teacher stops talking or writes on the board, and returns to normal the second they speak.',
    badge: '100% On-Device',
  },
  {
    icon: Monitor,
    title: 'Constant 720p HD Quality',
    subtitle: 'Never wait 30 seconds for blurry video to buffer. Automatically locks crisp 720p HD quality so lectures stay clear from start to finish.',
    badge: 'Always Crisp',
  },
  {
    icon: Keyboard,
    title: 'Customizable Keyboard Shortcuts',
    subtitle: 'Control speed with default keys (H to speed up, J to slow down), or customize them to any keys you like in settings.',
    badge: 'Zero Friction',
  },
  {
    icon: EyeOff,
    title: '1-Click Focus Mode',
    subtitle: 'Instantly hide live chat, doubt box, Ask AI, and other on-screen icons so you can focus in peace.',
    badge: 'Zero Distractions',
  },
  {
    icon: Clock,
    title: 'Real Finish Clock',
    subtitle: 'Calculates the exact wall-clock time your lecture will end at your active speed, so you know if you will finish before dinner.',
    badge: 'Time Saved',
  },
  {
    icon: PauseCircle,
    title: 'Smart Tab Auto-Pause',
    subtitle: 'Switched tabs to check formula notes or solve a problem? The lecture pauses and resumes the second you switch back.',
    badge: 'Never Miss Notes',
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="relative z-10 pt-16 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <h2
          className="text-3xl sm:text-5xl md:text-6xl tracking-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Exam bagal mein <em className="not-italic text-muted-foreground">aa gaya hai!</em>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Speed up lectures up to 4.0x with speed widget, skip silence with real-time audio detection, constant 720p HD video quality, customizable Keyboard Shortcuts, and instantly hide all icons with one click on pw.live.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {FEATURE_LIST.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="liquid-glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between group"
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
                <h3 className="text-lg sm:text-xl font-medium text-white mb-2 tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.subtitle}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Active on pw.live</span>
                <span className="text-white/80 group-hover:translate-x-1 transition-transform">
                  Instant →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
