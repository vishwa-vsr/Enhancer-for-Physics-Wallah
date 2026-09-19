import React from 'react';
import { PageNavbar } from '../components/PageNavbar';
import { Footer } from '../components/Footer';
import { Gauge, ShieldAlert, Battery, GitPullRequest, MessageSquare, ArrowLeft } from 'lucide-react';
import KineticGrid from '@/components/ui/kinetic-grid';
import SmoothScroll from '@/components/ui/smooth-scroll';

export const BlogPage: React.FC = () => {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen text-foreground flex flex-col selection:bg-white/20 selection:text-white">
        {/* Full-Page Interactive Kinetic Grid Background */}
        <KineticGrid globalColor="navy" isFixedBackground className="fixed inset-0 w-full h-full pointer-events-none z-0" />

        <PageNavbar currentPage="blog" />

        <main className="relative z-10 flex-1 py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
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

          {/* Article Header */}
          <div className="mb-10 sm:mb-12">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Extension Update
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                September 19, 2026 · Updates v1.0.8.3 & v1.0.8.4
              </span>
            </div>

            <h1
              className="text-3xl sm:text-6xl tracking-tight text-foreground leading-[1.1]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Making lectures smoother: speed fixes, focus lock, and battery saver
            </h1>

            <p className="text-muted-foreground text-sm sm:text-lg mt-4 leading-relaxed">
              When you study for hours every day, small glitches get in your way. A laggy slider or a freezing tab breaks your study groove.
            </p>
            <p className="text-muted-foreground text-sm sm:text-lg mt-2 leading-relaxed">
              Over the past two weeks, students shared honest feedback and opened issues on our GitHub repository. We listened to those complaints, fixed the annoying bugs, and made playback much lighter on older laptops.
            </p>
          </div>

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
            <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
              <Gauge className="w-5 h-5 text-indigo-400 mb-2" />
              <h3 className="text-sm font-semibold text-white">Smoother Speed Slider</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Wider 200px bar, no mouse drag stutter, and direct typing for any exact speed.
              </p>
            </div>
            <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
              <ShieldAlert className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-semibold text-white">Focus Lock Fixed</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Locks into full screen and pauses on exit. Player buttons no longer disappear.
              </p>
            </div>
            <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
              <Battery className="w-5 h-5 text-purple-400 mb-2" />
              <h3 className="text-sm font-semibold text-white">Old Laptop Saver</h3>
              <p className="text-xs text-muted-foreground mt-1">
                No web page freezing, ignores chat emoji spam, and cuts silence skipping CPU load in half.
              </p>
            </div>
          </div>

          {/* Article Body */}
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* Section 1: Speed Controls */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Fixing the speed slider and lag
              </h2>

              {/* Student Review Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-2 mb-2 text-indigo-300 font-medium">
                  <MessageSquare className="w-4 h-4" />
                  <span>Student Feedback from Pranshu Kumar:</span>
                </div>
                <p className="italic text-muted-foreground">
                  "Nice but the speed slider is not very smooth, i mean for dragging and changing the speed i need to hold the mouse button, and holding the button makes video 2x and it is kind off mess"
                </p>
              </div>

              <p>
                Pranshu was completely right. When you held down the mouse button to drag the slider, the video player thought you wanted the built-in 2x speed boost. The slider also stuttered and lagged while moving.
              </p>

              <p>
                We reworked the slider to fix both problems:
              </p>

              <ul className="space-y-2 list-disc list-inside text-white/90 pl-2">
                <li>
                  <strong className="text-white">Wider slider bar:</strong> We made the speed slider wider (200 pixels) so it is easy to grab with your mouse without misclicking.
                </li>
                <li>
                  <strong className="text-white">No more stutter:</strong> The slider no longer calculates heavy math while you drag. It updates smoothly and only saves when you let go of your mouse.
                </li>
                <li>
                  <strong className="text-white">Direct speed typing:</strong> A student contributor named Mayank Mahaur added a new way to pick your speed. You can now click right on the speed number (like 1.0x) and type exact numbers like 1.25x or 1.75x.
                </li>
              </ul>
            </section>

            {/* Section 2: Focus Lock */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Focus lock and the missing buttons bug
              </h2>

              <p>
                Another student contributor named Parth built Focus Lock mode to help you stay in the zone.
              </p>

              <p>
                With one click, Focus Lock puts your lecture into full screen. If you get distracted and leave full screen, your video pauses right away so you never miss what the teacher is explaining.
              </p>

              <p>
                In our first release of this feature, we ran into a frustrating bug. Turning on the option to hide the video timer accidentally hid the play, settings, and full screen buttons.
              </p>

              <p>
                We fixed that issue. Focus Lock now keeps things simple by handling full screen and pausing on exit. If you want to hide live chat, student doubts, or notes, you can turn those off one by one using the normal switches.
              </p>
            </section>

            {/* Section 3: Low-End PCs */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                No more website freezes on budget laptops
              </h2>

              <p>
                Some students told us that the extension made Physics Wallah lag or crash on older computers. That was our fault, and we tracked down why it happened.
              </p>

              <p>
                The extension was scanning the web page multiple times every second to find the video player controls. On top of that, live classes with thousands of floating reaction emojis forced the extension to do extra work.
              </p>

              <p>
                We cleaned up how the extension watches the page:
              </p>

              <ul className="space-y-2 list-disc list-inside text-white/90 pl-2">
                <li>It now finds the video player controls once and remembers them.</li>
                <li>It ignores live class emoji animations so your computer does not waste power.</li>
                <li>The video player now runs smoothly without freezing your web browser.</li>
              </ul>
            </section>

            {/* Section 4: Battery Saver */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Battery saver for skip silence
              </h2>

              <p>
                Skip Silence automatically cuts out quiet gaps when a teacher pauses or writes on the board.
              </p>

              <p>
                Listening to audio in real time takes extra battery power. If you are studying on a laptop without a charger nearby, your battery drains faster and the fans can get loud.
              </p>

              <p>
                We added a new "Low CPU / Battery Saver" switch inside the Skip Silence settings tab. Turning it on cuts the audio workload in half so your laptop runs cooler and your battery lasts longer.
              </p>
            </section>

            {/* Contributor Credits Card */}
            <section className="p-6 rounded-2xl liquid-glass-card border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-white font-medium">
                <GitPullRequest className="w-5 h-5 text-indigo-400" />
                <span>Special thanks to our open source contributors</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Enhancer for Physics Wallah is built in the open. Huge thanks to <strong className="text-white">Mayank Mahaur</strong> for contributing direct speed typing and to <strong className="text-white">Parth</strong> for creating Focus Lock mode.
              </p>
              <div className="pt-2">
                <a
                  href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-indigo-300 hover:text-white transition-colors"
                >
                  <span>View the project on GitHub</span>
                  <span>↗</span>
                </a>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};
