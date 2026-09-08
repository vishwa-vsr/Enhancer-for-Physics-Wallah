import React, { useState } from 'react';
import { PageNavbar } from '../components/PageNavbar';
import { Footer } from '../components/Footer';
import { ChevronDown, ChevronUp, HelpCircle, CheckCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'Installation',
    question: 'How do I install Enhancer for PW?',
    answer: 'Click your browser button on our homepage or search "Enhancer for Physics Wallah" on the Chrome Web Store, Firefox Add-ons, or Microsoft Edge Add-on Store. Once installed, pin the extension to your toolbar. When you open any lecture, your speed bar and focus controls appear automatically.',
  },
  {
    category: 'Installation',
    question: 'Do I need to pay or create an account?',
    answer: 'No. Enhancer for PW is 100% free and open-source. There are no subscriptions, no premium paywalls, and zero account sign-ups.',
  },
  {
    category: 'Keyboard Shortcuts',
    question: "Why don't keyboard shortcuts work when I press them?",
    answer: 'To protect your study flow, keyboard shortcuts (H to speed up, J to slow down, L to reset) are intentionally disabled whenever your cursor is inside a text input field, doubt box, or search bar. This prevents accidental speed changes while typing notes. If shortcuts are off, click the extension icon in your toolbar to verify "Keyboard Shortcuts" is enabled.',
  },
  {
    category: 'Keyboard Shortcuts',
    question: 'How does mouse wheel speed control work?',
    answer: 'Simply hover your mouse cursor over the speed badge on the video player and scroll your mouse wheel up or down. Speed will smoothly increase or decrease in 0.1x micro-steps without needing any clicks.',
  },
  {
    category: 'Video Playback',
    question: 'Why does the video sometimes start with a delay or blur?',
    answer: 'Default video players start at auto resolution, which can take 10-15 seconds to adjust. With Enhancer for PW, you can set your preferred resolution (such as 720p or 1080p) in the settings, and it locks immediately upon video start.',
  },
  {
    category: 'Video Playback',
    question: 'Does Skip Silence work on live lectures or only recorded classes?',
    answer: 'Skip Silence works on all recorded lectures and live lectures that have an active playback buffer. When watching a live stream in real time with zero buffer, fast-forwarding is naturally limited by the broadcast stream.',
  },
  {
    category: 'Video Playback',
    question: 'What should I do if the controls disappear after a site update?',
    answer: 'If video portal layouts change, simply refresh the lecture page once. If an update breaks compatibility, our open-source team releases an update within 24 hours. You can also report layout bugs on our GitHub Issues page.',
  },
  {
    category: 'Safety & Privacy',
    question: 'Can my account get banned for using this extension?',
    answer: 'No. Enhancer for PW operates strictly as a local browser-side video controller. It does not tamper with batch databases, DRM, or video downloads. It simply adjusts the standard HTML5 video playback rate and hides distracting chat panels.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-white/20 selection:text-white">
      <PageNavbar currentPage="faq" />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium mb-3 sm:mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1
            className="text-3xl sm:text-6xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            FAQ
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg mt-2 sm:mt-3 leading-relaxed">
            Quick solutions to common player questions, keyboard shortcut tips, and account safety.
          </p>
        </div>

        {/* Quick Help Callout */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card border border-white/10 mb-8 sm:mb-10 flex items-start gap-3.5 sm:gap-4">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">Quick Golden Rule for Hotkeys</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              If hotkeys (<code className="text-white bg-white/10 px-1 py-0.5 rounded">H</code>, <code className="text-white bg-white/10 px-1 py-0.5 rounded">J</code>, <code className="text-white bg-white/10 px-1 py-0.5 rounded">L</code>) don't respond, simply click once on the video screen. Browsers require the video player to be focused before accepting keyboard commands.
            </p>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="liquid-glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-6 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1.5 sm:gap-3">
                    <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/5 text-muted-foreground border border-white/5 font-mono">
                      {item.category}
                    </span>
                    <span className="text-sm sm:text-lg font-medium text-white tracking-tight">
                      {item.question}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-white/5 text-muted-foreground shrink-0 mt-0.5 sm:mt-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4 animate-fade-rise">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer onOpenStore={() => {}} />
    </div>
  );
};
