import React from 'react';
import { PageNavbar } from '../components/PageNavbar';
import { Footer } from '../components/Footer';
import { ChromeIcon, FirefoxIcon, EdgeIcon } from '../components/Icons';
import {
  Zap,
  Volume2,
  Keyboard,
  EyeOff,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Sliders,
  Radio,
} from 'lucide-react';
import KineticGrid from '@/components/ui/kinetic-grid';
import SmoothScroll from '@/components/ui/smooth-scroll';

export const PwExtensionsPage: React.FC = () => {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen text-foreground flex flex-col selection:bg-white/20 selection:text-white">
        {/* Kinetic Grid Background */}
        <KineticGrid globalColor="navy" isFixedBackground className="fixed inset-0 w-full h-full pointer-events-none z-0" />

        <PageNavbar currentPage="pw-extensions" />

        <main className="relative z-10 flex-1 py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          {/* Back Link */}
          <div className="mb-6">
            <a
              href="./index.html"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to home</span>
            </a>
          </div>

          {/* Guide Header */}
          <div className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>2026 Student Study Guide</span>
            </div>

            <h1
              className="text-4xl sm:text-6xl tracking-tight text-foreground leading-[1.1]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Best PW Extensions for Chrome & Firefox
            </h1>

            <p className="text-muted-foreground text-sm sm:text-lg mt-4 leading-relaxed">
              Watching 4 to 6 hours of lectures daily on Physics Wallah (<code className="text-sky-300 px-1.5 py-0.5 rounded bg-white/5 font-mono text-xs">pw.live</code>) can feel exhausting. The right browser extensions save you hours each week, smooth out video playback, and eliminate live chat distractions.
            </p>
          </div>

          {/* Quick Summary Banner */}
          <div className="p-6 sm:p-8 rounded-3xl liquid-glass border border-sky-400/20 mb-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Editor's Pick</span>
                <h2
                  className="text-2xl sm:text-3xl text-white mt-1"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Enhancer for PW — #1 Recommended Tool
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
                  An all-in-one free, open-source browser extension designed specifically for Physics Wallah. Features speed controls up to 4.0x, real-time silence skipping, customizable hotkeys, and 1-click focus mode.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 flex items-center gap-2"
                >
                  <ChromeIcon className="w-4 h-4" />
                  <span>Add to Chrome</span>
                </a>
                <a
                  href="https://addons.mozilla.org/firefox/addon/enhancer-for-physics-wallah/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all border border-white/10 flex items-center gap-2"
                >
                  <FirefoxIcon className="w-4 h-4" />
                  <span>Firefox</span>
                </a>
              </div>
            </div>
          </div>

          {/* Deep Breakdown Sections */}
          <div className="space-y-12 mb-16">
            {/* Section 1: Enhancer for PW Deep Dive */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    1. Enhancer for PW — The Complete Toolkit
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.8 Rating
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-sky-300">
                      <Users className="w-3.5 h-3.5" /> 830+ Students
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">100% Free & Open Source</span>
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                Most students start by installing generic speed tools, only to discover that they desynchronize video on PW or reset every time they switch chapters. <strong className="text-white">Enhancer for PW</strong> is built natively for the <code className="text-sky-300">pw.live</code> player.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
                    <Sliders className="w-4 h-4 text-sky-400" />
                    <span>Up to 4.0x Speed Control</span>
                  </div>
                  <p className="text-muted-foreground">
                    Smooth speed slider with direct number input. Jump to 1.75x, 2.3x, or 3.5x with 0.1x accuracy without audio pitch distortion.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Skip Teacher Silence</span>
                  </div>
                  <p className="text-muted-foreground">
                    Automatically speeds through board writing and silence, returning to your chosen speed the exact millisecond the teacher talks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
                    <Keyboard className="w-4 h-4 text-purple-400" />
                    <span>Customizable Shortcuts</span>
                  </div>
                  <p className="text-muted-foreground">
                    Control speed with default keys (<kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">H</kbd> to accelerate, <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">J</kbd> to slow down, <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">L</kbd> to reset), or rebind them to any keys you prefer.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
                    <EyeOff className="w-4 h-4 text-pink-400" />
                    <span>1-Click Focus Mode</span>
                  </div>
                  <p className="text-muted-foreground">
                    Instantly hide live chat, doubt boxes, and Ask AI buttons with one key so you can focus on notes without distraction.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: PW Poll Extensions & Live Tools */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Radio className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  2. What About PW Poll Extensions?
                </h2>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                One of the most frequent student searches on Google is for <strong className="text-white">"PW poll extensions"</strong>. During live classes on Physics Wallah, teachers often start quick multiple-choice polls.
              </p>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 text-xs sm:text-sm text-amber-200 leading-relaxed">
                <strong className="font-semibold block mb-1">A Quick Warning on Unofficial "Auto-Poll" Scripts:</strong>
                Be cautious with unverified scripts found on social media claiming to "auto-solve polls". Many of these scripts violate account terms or contain insecure code that can steal session cookies. Always stick to verified extensions on official browser stores.
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                If your goal is to prevent poll popups from blocking teacher handwriting on the board, <strong className="text-white">Enhancer for PW's Focus Mode</strong> cleanly handles this by letting you toggle off interactive overlays with a single tap, keeping the lecture video clean and centered.
              </p>
            </section>

            {/* Section 3: Generic Speed Tools vs Dedicated PW Tool */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-4">
                3. Why Generic Speed Controllers Fall Short on PW
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                Generic extensions like standard HTML5 speed controllers work fine on simple YouTube videos, but Physics Wallah uses dynamic streaming players with adaptive bitrate and custom chapter segments.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground font-mono">
                      <th className="py-3 px-4">Feature</th>
                      <th className="py-3 px-4 text-white">Enhancer for PW</th>
                      <th className="py-3 px-4">Generic Speed Tools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-muted-foreground">
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Works on pw.live player</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Native compatibility
                      </td>
                      <td className="py-3 px-4">Frequent player bugs</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Skip Teacher Silence</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Real-time RAM detection
                      </td>
                      <td className="py-3 px-4">Not available</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Locks 720p HD Quality</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Automatic quality lock
                      </td>
                      <td className="py-3 px-4">Not available</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Hide Live Chat & Distractions</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> 1-Click Focus Mode
                      </td>
                      <td className="py-3 px-4">Not available</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-white">Finish Time Calculator</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Real finish clock
                      </td>
                      <td className="py-3 px-4">Not available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Safety & Privacy */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  4. Are PW Extensions Safe?
                </h2>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                Safety is paramount when using browser add-ons for your study accounts. Enhancer for PW adheres to strict privacy-first guidelines:
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Zero Telemetry:</strong> No analytics, tracking scripts, or personal data collection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">No Audio Recording:</strong> Silence detection runs in volatile browser memory and discards audio samples instantly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong className="text-white">Open Source Code:</strong> Every line of code is publicly auditable under the MIT license on GitHub.</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Quick FAQ Section */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                PW Extensions FAQ
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                <h3 className="font-semibold text-white mb-2">
                  How do I install Enhancer for PW on Chrome or Brave?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visit the Chrome Web Store link, click "Add to Chrome", and pin the extension icon in your browser toolbar. Then open any lecture on pw.live — the control widget appears automatically.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                <h3 className="font-semibold text-white mb-2">
                  Can I use PW extensions on Android phones or tablets?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Desktop Chrome, Firefox, and Edge are officially supported. On Android, you can run desktop Chrome extensions via Chromium-based mobile browsers like Kiwi Browser or Firefox Nightly for Android.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                <h3 className="font-semibold text-white mb-2">
                  Does this extension work for recorded and live lectures?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Yes. Speed controls, silence skipping, and focus toggles work on recorded batch lectures. Focus mode and keyboard shortcuts work on both live classes and recorded videos.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Installation Call to Action */}
          <div className="p-8 sm:p-10 rounded-3xl liquid-glass border border-white/10 text-center relative overflow-hidden">
            <h2
              className="text-3xl sm:text-5xl text-white mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Start Saving Hours on Every Physics Wallah Lecture
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
              Join 830+ students studying faster with Skip Silence, custom keyboard shortcuts, and 1-click Focus Mode.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <a
                href="https://chromewebstore.google.com/detail/ibepglcdcaanmkledmpgfapaffkhbadj"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <ChromeIcon className="w-5 h-5" />
                <span>Add to Chrome (Free)</span>
              </a>
              <a
                href="https://addons.mozilla.org/firefox/addon/enhancer-for-physics-wallah/"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10 flex items-center gap-2"
              >
                <FirefoxIcon className="w-5 h-5" />
                <span>Add to Firefox</span>
              </a>
              <a
                href="https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10 flex items-center gap-2"
              >
                <EdgeIcon className="w-5 h-5" />
                <span>Add to Edge</span>
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};
