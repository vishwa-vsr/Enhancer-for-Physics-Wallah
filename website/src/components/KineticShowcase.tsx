import React from 'react';
import KineticGrid from '@/components/ui/kinetic-grid';
import { Sparkles } from 'lucide-react';

export const KineticShowcase: React.FC = () => {
  return (
    <section id="interactive-grid" className="relative w-full border-t border-b border-white/10">
      <KineticGrid globalColor="default" className="min-h-[550px] sm:min-h-[640px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center px-6 py-20 sm:py-28 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Interactive Background</span>
          </div>

          {/* Headline */}
          <h2 className="max-w-3xl text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
            Move your cursor. Click anywhere.
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-lg text-sm sm:text-base text-white/60 leading-relaxed">
            A kinetic grid that warps toward the pointer and ripples on every click. Tap and drag on touchscreens to create waves.
          </p>
        </div>
      </KineticGrid>
    </section>
  );
};

export default KineticShowcase;
