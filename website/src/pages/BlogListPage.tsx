import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { BLOGS_LIST, BlogPostMeta } from '@/data/blogsData';

interface BlogListPageProps {
  onSelectPost: (slug: string) => void;
}

export const BlogListPage: React.FC<BlogListPageProps> = ({ onSelectPost }) => {
  return (
    <div className="w-full">
      {/* Back Link to Home */}
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </a>
      </div>

      {/* Page Header */}
      <div className="mb-12 sm:mb-16">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Blog & Guides
          </span>
        </div>

        <h1
          className="text-4xl sm:text-7xl tracking-tight text-foreground leading-[1.08]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Articles, guides, and extension updates
        </h1>

        <p className="text-muted-foreground text-sm sm:text-lg mt-4 max-w-2xl leading-relaxed">
          Helpful walkthroughs on how to get the most out of Enhancer for Physics Wallah, practical study setup guides, and latest release improvements.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {BLOGS_LIST.map((blog: BlogPostMeta) => (
          <div
            key={blog.slug}
            onClick={() => onSelectPost(blog.slug)}
            className="group p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:scale-[1.015] hover:shadow-2xl"
          >
            <div>
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono border ${blog.badgeClass}`}
                >
                  {blog.category}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{blog.readTime}</span>
                </div>
              </div>

              {/* Title */}
              <h2
                className="text-2xl sm:text-3xl text-white tracking-tight leading-snug group-hover:text-indigo-200 transition-colors mb-3"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {blog.title}
              </h2>

              {/* Date */}
              <p className="text-xs text-muted-foreground/80 font-mono mb-4">
                {blog.date}
              </p>

              {/* Excerpt */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {blog.excerpt}
              </p>
            </div>

            {/* Read Link */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm font-medium text-indigo-300 group-hover:text-white transition-colors">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Read article</span>
              </span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
