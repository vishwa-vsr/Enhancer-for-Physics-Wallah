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
