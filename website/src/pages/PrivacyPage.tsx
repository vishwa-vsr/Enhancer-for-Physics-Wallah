import React from 'react';
import { PageNavbar } from '../components/PageNavbar';
import { Footer } from '../components/Footer';
import { Shield, Lock, Cpu, Database } from 'lucide-react';
import KineticGrid from '@/components/ui/kinetic-grid';
import SmoothScroll from '@/components/ui/smooth-scroll';

export const PrivacyPage: React.FC = () => {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen text-foreground flex flex-col selection:bg-white/20 selection:text-white">
        {/* Full-Page Interactive Kinetic Grid Background */}
        <KineticGrid globalColor="navy" isFixedBackground className="fixed inset-0 w-full h-full pointer-events-none z-0" />

        <PageNavbar currentPage="privacy" />

      <main className="relative z-10 flex-1 py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <h1
            className="text-3xl sm:text-6xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg mt-2 sm:mt-3 leading-relaxed">
            At <strong>Enhancer for PW</strong>, your study habits, personal accounts, and browser privacy always come first. This policy explains clearly and honestly how data is handled.
          </p>
          <p className="text-xs sm:text-sm text-white/40 mt-2 font-mono">
            Last updated: September 2026 • Version 1.0.8.6
          </p>
        </div>

        {/* Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
          <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
            <Lock className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Zero Telemetry</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No tracking scripts, cookies, or remote analytics of any kind.
            </p>
          </div>
          <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
            <Cpu className="w-5 h-5 text-blue-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">Volatile Audio Memory</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Skip Silence analyzes volume in RAM and discards it instantly. No audio is ever recorded.
            </p>
          </div>
          <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
            <Database className="w-5 h-5 text-purple-400 mb-2" />
            <h3 className="text-sm font-semibold text-white">100% Local Storage</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Custom speeds and time-saved counters stay strictly inside your browser.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-white/80" />
              <span>1. Zero Data Collection & Zero Tracking</span>
            </h2>
            <p className="mb-3">
              We do not collect, store, transmit, or sell any of your personal information, browsing history, or lecture activity.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-white/80">
              <li><strong>No Analytics or Telemetry:</strong> There are no tracking pixels or Google Analytics scripts inside the extension.</li>
              <li><strong>No Account Access:</strong> We never read, access, or store your Physics Wallah passwords, student profile details, test scores, or payments.</li>
              <li><strong>No Advertisements:</strong> The extension is 100% free and contains zero third-party ads.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-white/80" />
              <span>2. Real-Time Audio Processing (Skip Silence)</span>
            </h2>
            <p className="mb-3">
              The <strong>Skip Silence</strong> feature dynamically fast-forwards through teacher pauses and silent formula writing:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-white/80">
              <li><strong>How it works:</strong> The browser's native Web Audio API measures lecture output volume in real-time to detect quiet moments.</li>
              <li><strong>No Recording:</strong> Audio and video are <strong>never</strong> recorded, saved, downloaded, or sent to any server.</li>
              <li><strong>No Microphone Access:</strong> The extension never requests or activates your microphone.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-white/80" />
              <span>3. Local Storage on Your Device</span>
            </h2>
            <p className="mb-3">
              The extension only uses Chrome's standard <code className="text-white/90 bg-white/10 px-1.5 py-0.5 rounded">chrome.storage.local</code> API to remember your personal preferences on your machine:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-white/80">
              <li>Custom video speed choices (e.g. 2.5x, 3.2x).</li>
              <li>Focus mode settings (hiding live chat or doubt boxes).</li>
              <li>Accumulated "Time Saved" counter.</li>
            </ul>
            <p className="mt-3">
              Uninstalling the extension or clearing your browser extension storage removes 100% of these records instantly.
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Open Source & Contact
            </h2>
            <p className="mb-3">
              Enhancer for PW is an open-source community tool released under the MIT License. Anyone can inspect and audit the complete source code on GitHub.
            </p>
            <p>
              For questions or feedback, open an issue on{' '}
              <a
                href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah"
                target="_blank"
                rel="noreferrer"
                className="text-white underline hover:text-white/80 font-medium"
              >
                GitHub
              </a>{' '}
              or email us at <code className="text-white/90">extensionsfeedback@gmail.com</code>.
            </p>
          </section>
        </div>
      </main>

      <Footer onOpenStore={() => {}} />
    </div>
  </SmoothScroll>
  );
};
