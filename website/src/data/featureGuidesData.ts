export interface OverviewCard {
  title: string;
  desc: string;
  iconName: 'zap' | 'shield' | 'clock' | 'eye' | 'keyboard' | 'monitor';
}

export interface BulletPoint {
  label: string;
  text: string;
}

export interface FeatureGuideContent {
  slug: string;
  badge: string;
  badgeClass: string;
  date: string;
  readTime: string;
  title: string;
  leadParagraph: string;
  overviewCards: OverviewCard[];
  whyNeededIntro: string;
  whyNeededPoints: BulletPoint[];
  step2Intro: string;
  step2Points: BulletPoint[];
  step3Intro: string;
  step3Points: BulletPoint[];
  proTipTitle: string;
  proTipText: string;
}

export const FEATURE_GUIDES: Record<string, FeatureGuideContent> = {
  'skip-silence': {
    slug: 'skip-silence',
    badge: 'Feature Guide',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    date: 'October 19, 2026',
    readTime: '3 min read',
    title: 'How to Automatically Skip Silence in Physics Wallah Lectures',
    leadParagraph:
      'Skip Silence is a built-in lecture accelerator in Enhancer for Physics Wallah. When teachers pause to write on the blackboard, solve complex equations in silence, or take sips of water, the extension speeds through the dead air automatically and drops back to your regular speed the millisecond the teacher speaks again.',
    overviewCards: [
      {
        title: 'Save 15 to 25 Minutes',
        desc: 'Fast-forward through quiet board-writing and pauses automatically without touching the keyboard.',
        iconName: 'clock',
      },
      {
        title: 'Zero Word Clipping',
        desc: 'Instant audio detection restores your standard speed in milliseconds so you never miss explanations.',
        iconName: 'zap',
      },
      {
        title: '100% On-Device & Private',
        desc: 'Audio analysis runs locally inside your browser window. No audio data ever leaves your computer.',
        iconName: 'shield',
      },
    ],
    whyNeededIntro:
      'In a typical two-hour batch lecture, up to 20% of the total runtime consists of pauses, silent problem-solving, and blackboard transitions. Here is why automated silence skipping helps your study routine:',
    whyNeededPoints: [
      {
        label: 'Eliminate Backlog Burnout',
        text: 'Instead of spending 2.5 hours on a recorded lecture, finish in under 90 minutes with zero loss of comprehension.',
      },
      {
        label: 'No Manual 10-Second Skips',
        text: 'Manually tapping the forward button often skips past the beginning of an important derivation or formula. Skip Silence is millisecond-precise.',
      },
      {
        label: 'Maintains Flow State',
        text: 'Dead air causes students to check phones or lose attention. Keeping playback snappy keeps your mind locked into the subject.',
      },
    ],
    step2Intro:
      'To enable and fine-tune Skip Silence, open any lecture on pw.live, click the Enhancer extension icon, and head to the Media settings:',
    step2Points: [
      {
        label: 'Enable Skip Silence',
        text: 'Turn on the master switch. The extension will begin monitoring audio levels in real time.',
      },
      {
        label: 'Silence Speed',
        text: 'Adjust your silent playback rate (default is 2.5x). When silence hits, the video accelerates to this speed immediately.',
      },
      {
        label: 'Auto Noise Calibration',
        text: 'Keeps background mic hiss and fan noise from falsely triggering speech detection.',
      },
    ],
    step3Intro:
      'To get the most out of silence skipping during tough revision sessions, try these student-tested practices:',
    step3Points: [
      {
        label: 'Pair with 1.4x Standard Speed',
        text: 'Set your regular lecture speed to 1.3x–1.5x and silence speed to 2.8x. You will glide through lectures effortlessly.',
      },
      {
        label: 'Use Auto Noise Calibration',
        text: 'If your batch teacher uses a sensitive microphone with noticeable air conditioning hum, keep Auto Noise Calibration turned on.',
      },
    ],
    proTipTitle: 'Quiet Board-Writing Derivations',
    proTipText:
      'When teachers solve long physics or math problems silently across multiple blackboards, you can safely bump Silence Speed up to 3.0x to review their steps in seconds.',
  },

  'constant-720p-hd': {
    slug: 'constant-720p-hd',
    badge: 'Feature Guide',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    date: 'October 19, 2026',
    readTime: '3 min read',
    title: 'How to Lock Constant 720p HD Quality on Physics Wallah',
    leadParagraph:
      'Constant 720p HD locks your lecture video resolution to clear high definition right from the first second. It prevents the default video player from dropping to blurry 360p or 480p whenever brief network hiccups occur.',
    overviewCards: [
      {
        title: 'Always Sharp Blackboard Notes',
        desc: 'Never struggle to read tiny mathematical subscripts or organic chemistry bonds again.',
        iconName: 'monitor',
      },
      {
        title: 'Zero Blurry Buffer Drops',
        desc: 'Overrides adaptive bitrate switches that downgrade your stream when you need clarity most.',
        iconName: 'zap',
      },
      {
        title: 'Saved Across All Batches',
        desc: 'Remembers your HD quality preference for every video so you never have to re-select it.',
        iconName: 'shield',
      },
    ],
    whyNeededIntro:
      'The standard PW video player uses adaptive bitrate streaming, which frequently starts videos at 360p and takes minutes to upgrade. Here is why locking 720p is essential:',
    whyNeededPoints: [
      {
        label: 'Unreadable Notes',
        text: 'Low resolutions turn handwritten board formulas and diagrams into a pixelated smear.',
      },
      {
        label: 'Wasted Study Time',
        text: 'Pausing a video and waiting for the settings gear icon to reload 720p breaks your learning momentum.',
      },
      {
        label: 'Consistent Visual Comfort',
        text: 'Sudden resolution jumps strain your eyes during 6-hour marathon study blocks.',
      },
    ],
    step2Intro:
      'Open any lecture on pw.live, click the extension icon, and scroll to Video Quality:',
    step2Points: [
      {
        label: 'Constant Video Quality',
        text: 'Flip the toggle switch to ON. This prevents quality downgrades during small buffering events.',
      },
      {
        label: 'Default Video Quality',
        text: 'Ensure the dropdown is set to 720p (High).',
      },
      {
        label: 'Hide Quality Widget',
        text: 'Optionally hide the on-screen quality pill if you prefer a completely clean video frame.',
      },
    ],
    step3Intro:
      'Recommended configuration for smooth HD playback:',
    step3Points: [
      {
        label: 'For Moderate Internet Connections',
        text: 'Keep Constant Video Quality turned on. Modern browsers buffer 720p streams cleanly even on modest broadband speeds.',
      },
      {
        label: 'Full Screen Clarity',
        text: 'Locking 720p ensures that pressing F for full screen never pixelates your view.',
      },
    ],
    proTipTitle: 'Fast Forward Without Quality Drops',
    proTipText:
      'When skipping ahead 30 seconds, default players often degrade video quality to save bandwidth. Constant HD keeps the blackboard sharp immediately after skipping.',
  },

  'keyboard-shortcuts': {
    slug: 'keyboard-shortcuts',
    badge: 'Feature Guide',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    date: 'October 19, 2026',
    readTime: '3 min read',
    title: 'Mastering Keyboard Shortcuts for PW Lectures',
    leadParagraph:
      'Keyboard shortcuts allow you to adjust playback speed, rewind tricky derivations, and toggle distraction-free mode without lifting your pen or moving your mouse.',
    overviewCards: [
      {
        title: 'Zero Mouse Distraction',
        desc: 'Keep your hands on your notes and keyboard while controlling your lecture smoothly.',
        iconName: 'keyboard',
      },
      {
        title: 'Precision Speed Tapping',
        desc: 'Increment speed by 0.1x steps to find the exact sweet spot for each teacher.',
        iconName: 'zap',
      },
      {
        title: 'Fully Rebindable',
        desc: 'Use natural defaults (H / J / L) or customize any key to match your muscle memory.',
        iconName: 'shield',
      },
    ],
    whyNeededIntro:
      'Reaching for the mouse every few minutes breaks physical posture and interrupts deep focus. Here is how hotkeys streamline your lectures:',
    whyNeededPoints: [
      {
        label: 'Faster Pacing Adjustments',
        text: 'Speed up during simple introductory slides and slow down for complex proofs in a single keystroke.',
      },
      {
        label: 'Instant Formula Rewind',
        text: 'Missed a key term? Tap left arrow to jump back 10 seconds without hunting for the timeline.',
      },
      {
        label: 'One-Tap Focus',
        text: 'Press F to hide all comment spam the second live class banter gets noisy.',
      },
    ],
    step2Intro:
      'Access your shortcuts under the Playback tab inside the extension popup:',
    step2Points: [
      {
        label: 'Enable Keyboard Hotkeys',
        text: 'Ensure the hotkey master switch is active.',
      },
      {
        label: 'Speed Up (H)',
        text: 'Increases playback speed by 0.1x (e.g., from 1.5x to 1.6x).',
      },
      {
        label: 'Slow Down (J)',
        text: 'Decreases playback speed by 0.1x for difficult concepts.',
      },
      {
        label: 'Reset Speed (L)',
        text: 'Instantly resets your lecture to standard 1.0x normal speed.',
      },
    ],
    step3Intro:
      'Best shortcut habits for high-output study sessions:',
    step3Points: [
      {
        label: 'Hold Space to Speed Up',
        text: 'Enable "Hold Space to Speed Up" in settings to temporarily fly through repetitive review sections at 3.0x.',
      },
      {
        label: 'Conflict-Free Binding',
        text: 'The extension automatically prevents shortcut clashes with native browser commands like Ctrl+R or F5.',
      },
    ],
    proTipTitle: 'Muscle Memory Speed Surfing',
    proTipText:
      'Keep your index and middle fingers hovering near H and J. When the teacher is making small talk, tap H twice. When theory starts, tap J to drop back.',
  },

  'focus-mode': {
    slug: 'focus-mode',
    badge: 'Feature Guide',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    date: 'October 19, 2026',
    readTime: '3 min read',
    title: 'How to Use 1-Click Focus Mode to Remove PW Distractions',
    leadParagraph:
      '1-Click Focus Mode instantly strips away live chat spam, doubts boxes, Ask AI widgets, and floating UI buttons from pw.live, giving you a clean cinema-style lecture display.',
    overviewCards: [
      {
        title: 'Zero Chat Spam',
        desc: 'Block out endless emoji streams and irrelevant comments during live and recorded batches.',
        iconName: 'eye',
      },
      {
        title: 'Cinema Screen Layout',
        desc: 'Dedicate 100% of your monitor pixels strictly to teacher slides and blackboard diagrams.',
        iconName: 'monitor',
      },
      {
        title: 'Auto-Hide Controls',
        desc: 'Player buttons fade out smoothly until you deliberately move your mouse.',
        iconName: 'shield',
      },
    ],
    whyNeededIntro:
      'Live batches frequently suffer from distracting comments and floating widget clutter that steal your attention. Here is why Focus Mode transforms your sessions:',
    whyNeededPoints: [
      {
        label: 'Protect Your Concentration',
        text: 'Watching students debate in live chat pulls your brain away from difficult physics formulas.',
      },
      {
        label: 'Maximize Blackboard Real Estate',
        text: 'Removing sidebars lets the video fill your entire display with crisp clarity.',
      },
      {
        label: 'Peaceful Recorded Watching',
        text: 'Even on recorded lectures, distracting overlay icons get in the way of problem text.',
      },
    ],
    step2Intro:
      'Open the Focus tab inside the Enhancer popup menu on pw.live:',
    step2Points: [
      {
        label: 'Hide Live Chat',
        text: 'Completely eliminates comment streams and reaction popups.',
      },
      {
        label: 'Hide Doubt Box & Ask AI',
        text: 'Clears floating assistant buttons that cover parts of the lecture board.',
      },
      {
        label: 'Hide Notes Icon',
        text: 'Hides unnecessary badges across the top and side of the video frame.',
      },
    ],
    step3Intro:
      'How to setup your ultimate distraction-free study space:',
    step3Points: [
      {
        label: 'Full Screen Integration',
        text: 'Pair Focus Mode with browser full-screen (F11 or player full-screen) to eliminate taskbar notifications.',
      },
      {
        label: 'Quick Toggle',
        text: 'You can toggle Focus Mode on or off instantly with your customized hotkey whenever you want to ask a doubt.',
      },
    ],
    proTipTitle: 'Auto-Hide Player Timeline',
    proTipText:
      'Turn on "Auto-Hide Controls" in the Focus tab. The timeline and buttons will vanish completely after 3 seconds of mouse inactivity.',
  },

  'finish-clock': {
    slug: 'finish-clock',
    badge: 'Feature Guide',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    date: 'October 19, 2026',
    readTime: '3 min read',
    title: 'Real Finish Clock: Know Exactly When Your Lecture Ends',
    leadParagraph:
      'The Real Finish Clock calculates the exact wall-clock completion time of your lecture based on your active playback speed and silence skipping, so you always know when your study session will finish.',
    overviewCards: [
      {
        title: 'Accurate Wall-Clock Time',
        desc: 'Shows real completion times like "Ends at 7:15 PM" directly on your video progress bar.',
        iconName: 'clock',
      },
      {
        title: 'Dynamic Speed Math',
        desc: 'Recalculates instantly whenever you change playback speed or enable silence skipping.',
        iconName: 'zap',
      },
      {
        title: 'Better Schedule Planning',
        desc: 'Plan meals, study breaks, and mock tests without doing mental speed arithmetic.',
        iconName: 'shield',
      },
    ],
    whyNeededIntro:
      'Standard video players show remaining minutes at 1.0x speed. When studying at 1.5x with pauses skipped, that remaining time is inaccurate. Here is how the finish clock solves this:',
    whyNeededPoints: [
      {
        label: 'No More Mental Arithmetic',
        text: 'Dividing 47 minutes by 1.35x while trying to understand organic chemistry is exhausting and imprecise.',
      },
      {
        label: 'Prevent Study Overrun',
        text: 'Never be late for coaching tests, dinner, or your next scheduled chapter.',
      },
      {
        label: 'Motivation to Finish',
        text: 'Seeing a concrete finish time (e.g. "Ends at 6:30 PM") provides a clear target to stay seated.',
      },
    ],
    step2Intro:
      'Configure your clock format under the Focus tab inside the extension popup:',
    step2Points: [
      {
        label: 'Show Finish Time',
        text: 'Turn on the switch to display the completion clock on your video controls bar.',
      },
      {
        label: 'Finish Time Format',
        text: 'Choose between "Minimal (Time Only)", "Clock with Label", or "Full (Clock + Remaining)".',
      },
    ],
    step3Intro:
      'Best timetable strategies using the Finish Clock:',
    step3Points: [
      {
        label: 'Set Evening Deadlines',
        text: 'Notice that a lecture will end at 8:15 PM? Speed up to 1.6x to wrap up right at 8:00 PM for dinner.',
      },
      {
        label: 'Dynamic Updates',
        text: 'The clock continuously updates as you watch, giving you a true progress forecast.',
      },
    ],
    proTipTitle: 'Combines with Silence Skipping',
    proTipText:
      'When Skip Silence is active, the Finish Clock automatically factors in dead air savings to give you an ultra-accurate completion prediction.',
  },
};

