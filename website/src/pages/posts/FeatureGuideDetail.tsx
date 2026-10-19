import React from 'react';
import {
  ArrowLeft,
  Zap,
  Shield,
  Clock,
  Eye,
  Keyboard,
  Monitor,
  MessageSquare,
  GitPullRequest,
} from 'lucide-react';
import { FEATURE_GUIDES } from '@/data/featureGuidesData';
import { AnnotatedSetup } from '@/components/AnnotatedSetup';

interface FeatureGuideDetailProps {
  slug: string;
  onBack: () => void;
}

export const FeatureGuideDetail: React.FC<FeatureGuideDetailProps> = ({ slug, onBack }) => {
  const guide = FEATURE_GUIDES[slug];

  if (!guide) {
    return (
      <div className="w-full text-center py-20">
        <h2 className="text-2xl font-semibold text-white">Guide not found</h2>
        <p className="text-muted-foreground mt-2">The feature guide you requested could not be located.</p>
        <button
          onClick={onBack}
          type="button"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all guides</span>
        </button>
      </div>
    );
  }

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap':
        return <Zap className="w-5 h-5 text-indigo-400 mb-2" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-purple-400 mb-2" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-emerald-400 mb-2" />;
      case 'eye':
        return <Eye className="w-5 h-5 text-rose-400 mb-2" />;
      case 'keyboard':
        return <Keyboard className="w-5 h-5 text-amber-400 mb-2" />;
      case 'monitor':
        return <Monitor className="w-5 h-5 text-sky-400 mb-2" />;
      default:
        return <Zap className="w-5 h-5 text-indigo-400 mb-2" />;
    }
  };

  return (
    <article className="w-full">
      {/* Top Back Link */}
      <div className="mb-6">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all blogs</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-10 sm:mb-12">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-mono border ${guide.badgeClass}`}>
            {guide.badge}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {guide.date} · {guide.readTime}
          </span>
        </div>

        <h1
          className="text-3xl sm:text-6xl tracking-tight text-foreground leading-[1.1]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {guide.title}
        </h1>

        <p className="text-muted-foreground text-sm sm:text-lg mt-4 leading-relaxed">
          {guide.leadParagraph}
        </p>
      </div>

      {/* 3 Overview Cards matching Padhle guide technique */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
        {guide.overviewCards.map((card, idx) => (
          <div key={idx} className="p-5 rounded-2xl liquid-glass-card border border-white/10">
            {renderIcon(card.iconName)}
            <h3 className="text-sm font-semibold text-white">{card.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Body */}
      <div className="space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        {/* Step 1: Why students need this */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            1. Why you need this in your study routine
          </h2>

          <p>{guide.whyNeededIntro}</p>

          <ul className="space-y-2 list-disc list-inside text-white/90 pl-2">
            {guide.whyNeededPoints.map((pt, idx) => (
              <li key={idx}>
                <strong className="text-white">{pt.label}:</strong> {pt.text}
              </li>
            ))}
          </ul>
        </section>

        {/* Step 2: Configuring it in the popup with Connected Blueprint Lines */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            2. Setting it up in your extension
          </h2>

          <AnnotatedSetup slug={slug} intro={guide.step2Intro} points={guide.step2Points} />
        </section>

        {/* Step 3: Best settings and pro tips */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            3. Recommended settings and pro tips
          </h2>

          <p>{guide.step3Intro}</p>

          <ul className="space-y-2 list-disc list-inside text-white/90 pl-2">
            {guide.step3Points.map((pt, idx) => (
              <li key={idx}>
                <strong className="text-white">{pt.label}:</strong> {pt.text}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Feedback & Community Callout */}
      <div className="mt-12 p-6 rounded-2xl border border-white/10 liquid-glass-card">
        <div>
          <h4 className="text-base font-semibold text-white">Have feedback or feature requests?</h4>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            We are actively improving the extension based on student suggestions.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <a
              href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/issues"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Open an issue on GitHub</span>
            </a>
            <a
              href="https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj/reviews?utm_source=website"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Leave a store review</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
