import React from 'react';
import { Lock, Cpu, Eye, Code2 } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <section id="privacy" className="relative z-10 pt-10 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Privacy First & Transparent
          </span>
          <h2
            className="text-3xl sm:text-5xl mt-2 tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Your account, notes, and study habits belong only to you.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Enhancer for Physics Wallah collects zero data. No tracking, no analytics, no microphone access. Read our full <a href="/privacy" className="text-white/80 hover:text-white underline underline-offset-2 transition-colors">Privacy Policy</a> or check out our <a href="/faq" className="text-white/80 hover:text-white underline underline-offset-2 transition-colors">FAQ & Help Guide</a>.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mt-1">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Local Storage</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Speed preferences, time-saved counters, and settings never leave your browser.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mt-1">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Volatile Audio Analysis</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Skip Silence measures volume thresholds in real-time RAM and discards audio buffers instantly. No audio is ever recorded.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mt-1">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Zero Tracking or Analytics</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  We don’t track your name, IP address, batch enrolments, or lecture watch time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="liquid-glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              audited-manifest-v3.json
            </span>
            <Code2 className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="font-mono text-[11px] sm:text-xs text-muted-foreground/90 space-y-1.5 sm:space-y-2 bg-black/40 p-3.5 sm:p-4 rounded-xl border border-white/5 overflow-x-auto">
            <p className="text-white/60">// Minimal Permissions Required</p>
            <p>
              <span className="text-blue-400">"permissions"</span>: [<span className="text-emerald-400">"storage"</span>]
            </p>
            <p>
              <span className="text-blue-400">"host_permissions"</span>: [
            </p>
            <p className="pl-4 text-white/80">"https://*.pw.live/*",</p>
            <p className="pl-4 text-white/80">"https://*.penpencil.co/*",</p>
            <p className="pl-4 text-white/80">"https://*.penpencil.xyz/*",</p>
            <p className="pl-4 text-white/80">"https://*.pwnet.in/*"</p>
            <p>]</p>
            <p className="text-white/60 pt-2">// Zero remote scripts. Clean CSP.</p>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">MIT Licensed Open Source</span>
            <a
              href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:underline flex items-center gap-1"
            >
              <span>Audit Source on GitHub</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
