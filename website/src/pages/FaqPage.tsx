import React, { useState } from 'react';
import { PageNavbar } from '../components/PageNavbar';
import { Footer } from '../components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';
import KineticGrid from '@/components/ui/kinetic-grid';
import SmoothScroll from '@/components/ui/smooth-scroll';

interface FaqItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'General',
    question: 'What is Enhancer for PW?',
    answer: 'Enhancer for PW is a 100% free and open-source browser extension designed for Physics Wallah students on pw.live. It adds playback speed up to 4.0x with a quick speed widget, automatic real-time silence skipping, constant 720p HD video quality, customizable keyboard shortcuts, and a 1-click focus mode to hide chat distractions.',
  },
  {
    category: 'General',
    question: 'Which browsers are supported?',
    answer: 'Enhancer for PW is officially available for Google Chrome, Mozilla Firefox, and Microsoft Edge. You can install it directly with one click from their official extension web stores.',
  },
  {
    category: 'Installation',
    question: 'How do I install Enhancer for PW?',
    answer: 'Click your browser button on our homepage or search "Enhancer for Physics Wallah" on the Chrome Web Store, Firefox Add-ons, or Microsoft Edge Add-on Store. Once installed, pin the extension to your toolbar. When you open any lecture, your speed bar and focus controls appear automatically.',
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
    answer: 'No. Enhancer for PW works entirely locally on your own computer screen. It never sends automated bot requests, does not bypass logins, and does not touch private PW database servers.',
  },
  {
    category: 'Safety & Privacy',
    question: 'Does Skip Silence record my audio or microphone?',
    answer: 'Never. Skip Silence only listens to the volume level of the teacher speaking in the video in real-time RAM to detect pauses, and discards that data milliseconds later.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <SmoothScroll>
      <div className="relative min-h-screen text-foreground flex flex-col selection:bg-white/20 selection:text-white">
        {/* Full-Page Interactive Kinetic Grid Background */}
        <KineticGrid globalColor="navy" isFixedBackground className="fixed inset-0 w-full h-full pointer-events-none z-0" />

        <PageNavbar currentPage="faq" />

      <main className="relative z-10 flex-1 py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
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
                  className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-lg font-medium text-white tracking-tight">
                    {item.question}
                  </span>
                  <div className="p-1.5 rounded-xl bg-white/5 text-muted-foreground shrink-0">
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
  </SmoothScroll>
  );
};
