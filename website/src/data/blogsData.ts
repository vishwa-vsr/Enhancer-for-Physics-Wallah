export interface BlogPostMeta {
  slug: string;
  title: string;
  category: 'Feature Guide' | 'Extension Update';
  date: string;
  readTime: string;
  excerpt: string;
  badgeClass: string;
}

export const BLOGS_LIST: BlogPostMeta[] = [
  {
    slug: 'skip-silence',
    title: 'How to Automatically Skip Silence in PW Lectures',
    category: 'Feature Guide',
    date: 'October 19, 2026',
    readTime: '2 min read',
    excerpt:
      'Save 15 to 25 minutes on every long lecture without missing a single word. Learn how real-time audio detection skips dead air automatically.',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    slug: 'constant-720p-hd',
    title: 'How to Lock Constant 720p HD Quality on PW',
    category: 'Feature Guide',
    date: 'October 19, 2026',
    readTime: '2 min read',
    excerpt:
      'Stop waiting 30 seconds for blurry video to fix itself. Lock crystal-clear 720p HD playback from start to finish.',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  {
    slug: 'keyboard-shortcuts',
    title: 'Mastering Keyboard Shortcuts for PW Lectures',
    category: 'Feature Guide',
    date: 'October 19, 2026',
    readTime: '2 min read',
    excerpt:
      'Control speed, skip ahead, and stay locked in without touching your mouse using easy keys.',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    slug: 'focus-mode',
    title: 'How to Use 1-Click Focus Mode to Remove PW Distractions',
    category: 'Feature Guide',
    date: 'October 19, 2026',
    readTime: '2 min read',
    excerpt:
      'Silence spammy live chats, doubts popups, and floating icons in one tap for cinema-grade focus.',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  {
    slug: 'finish-clock',
    title: 'Real Finish Clock: Know Exactly When Your Lecture Ends',
    category: 'Feature Guide',
    date: 'October 19, 2026',
    readTime: '2 min read',
    excerpt:
      'Never guess if you will finish studying before dinner. See your exact wall-clock finish time updated dynamically.',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    slug: 'padhle-dashboard',
    title: 'How to use the Padhle dashboard in Enhancer for Physics Wallah',
    category: 'Feature Guide',
    date: 'October 18, 2026',
    readTime: '3 min read',
    excerpt:
      'A step-by-step guide to the built-in study planner. Learn how to set up subjects, organize chapters, schedule daily tasks, and customize your study labels.',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    slug: 'making-lectures-smoother',
    title: 'Making lectures smoother: speed fixes, focus lock, and battery saver',
    category: 'Extension Update',
    date: 'September 19, 2026',
    readTime: '3 min read',
    excerpt:
      'What changed in the extension after v1.0.8.2: wider speed slider, direct speed typing, focus mode fixes, low-end PC optimization, and battery saver for quiet moments.',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
];
