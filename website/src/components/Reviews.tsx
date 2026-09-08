import React from 'react';
import { Star, MessageSquare, CheckCircle2, ExternalLink } from 'lucide-react';

interface ReviewItem {
  name: string;
  avatarColor: string;
  stars: number;
  date: string;
  quote: string;
  devReply?: string;
}

const REVIEWS: ReviewItem[] = [
  {
    name: 'Akarsh Singh',
    avatarColor: 'bg-purple-600',
    stars: 5,
    date: '9 Aug 2026',
    quote:
      'Works flawlessly & efficiently and the features exceeded my expectations. All features which should have been there in PW itself are present and more. Hiding all unnecessary and irrelevant icons filter distractions and increases focus; and the 4x speed bar is a valuable addition to it. Amazing product!',
    devReply:
      'Appreciate the detailed feedback Akarsh! Really glad the extension exceeded your expectations and helps you stay focused. Best of luck with your preparation!',
  },
  {
    name: 'Manojit Sarkar',
    avatarColor: 'bg-amber-600',
    stars: 5,
    date: '2 Sept 2026',
    quote: 'Thanks man too overpowered',
  },
  {
    name: 'Alex',
    avatarColor: 'bg-rose-600',
    stars: 5,
    date: '4 Sept 2026',
    quote:
      'loved this extension so much it deserves more than 5 stars. my suggestions for future updates :- 1. autodetect and skip the welcome slide and ending slide 2. time stamps in the seekbar for every slide 3. Force playback quality',
    devReply:
      'Ayy Alex massive W review, thank you so much! Already cooking force playback quality. Will look into the other two features.',
  },
  {
    name: 'KESHAV',
    avatarColor: 'bg-blue-600',
    stars: 5,
    date: '21 Aug 2026',
    quote: 'I love this ngl',
  },
  {
    name: 'Hitesh Raj',
    avatarColor: 'bg-teal-600',
    stars: 5,
    date: '31 Aug 2026',
    quote:
      'GOOD BUT ALSO SKIP VIDEO AT DOUBT CHECKING TIME AS MOST OF THE DOUBT ARE USELESS AND TEACHER OPEN DOUBT SECTION ONLY FOR MOOD REFRESHING IN AND DURING CLASS',
    devReply:
      'Tysm for the 5 stars! Just press and hold Spacebar on your keyboard to fast-forward through them instantly, and release when actual teaching starts.',
  },
  {
    name: 'Wahidur Rahman',
    avatarColor: 'bg-emerald-600',
    stars: 5,
    date: '18 Aug 2026',
    quote: 'works great, hoping pw doesnt ban me',
    devReply: 'Zero risk of bans brother! All changes are strictly 100% on your local browser screen.',
  },
  {
    name: 'Deadly Dominator',
    avatarColor: 'bg-red-600',
    stars: 5,
    date: '28 Jul 2026',
    quote: 'Is great extension does its job well 🤠',
    devReply: 'Thanks for the awesome support! Really glad to know it is doing its job well for you.',
  },
  {
    name: 'Sulaksh Sharma',
    avatarColor: 'bg-pink-600',
    stars: 5,
    date: '12 Aug 2026',
    quote:
      'ONE REQUEST MY BROTHER FOR LECTURE QUALITY CONTROL BUTTON IF ITS POSSIBLE THEN PLEASE ADD BECAUSE DEFAULT BUTTON WORKS BUT EVEN AT HIGH QUALITY IT DROPS UPTO 144p RESOLUTION SO PLEASE HELP FOR THAT ALSO 🥰🤍',
    devReply:
      'Thank you so much for the 5 stars and support brother! Actively implemented in recent updates to lock crisp HD quality.',
  },
];

export const Reviews: React.FC = () => {
  return (
    <section id="reviews" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2
          className="text-3xl sm:text-5xl md:text-6xl tracking-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Loved by 600+ students.
        </h2>
        <p className="text-muted-foreground text-sm sm:text-lg mt-3 sm:mt-4 leading-relaxed">
          Real feedback from students using Enhancer for PW to crush backlogs and finish daily lectures.
        </p>
      </div>

      {/* Dynamic Masonry Columns (Cards only take the height their content needs) */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
        {REVIEWS.map((rev, idx) => (
          <div
            key={idx}
            className="break-inside-avoid liquid-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-white/10 hover:border-white/20 transition-all group"
          >
            {/* User Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${rev.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-md`}
                >
                  {rev.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {rev.name}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    {rev.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {[...Array(rev.stars)].map((_, sIdx) => (
                  <Star
                    key={sIdx}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
            </div>

            {/* Review Quote */}
            <p className="text-sm text-muted-foreground/90 leading-relaxed italic">
              "{rev.quote}"
            </p>

            {/* Developer Reply (if available) */}
            {rev.devReply && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
                  <div className="flex items-center gap-1.5 text-sky-400 font-medium mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Developer reply</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {rev.devReply}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Callout Footer */}
      <div className="mt-14 text-center">
        <a
          href="https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj/reviews"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full liquid-glass text-xs sm:text-sm text-foreground hover:scale-105 transition-all shadow-lg border border-white/10"
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Read all verified reviews on Chrome Web Store</span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      </div>
    </section>
  );
};
