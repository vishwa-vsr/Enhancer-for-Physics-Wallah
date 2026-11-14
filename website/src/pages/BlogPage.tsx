import React, { useState, useEffect } from 'react';
import { PageNavbar } from '../components/PageNavbar';
import { Footer } from '../components/Footer';
import { ScrollCanvasBackground } from '@/components/ScrollCanvasBackground';
import SmoothScroll from '@/components/ui/smooth-scroll';
import { BlogListPage } from './BlogListPage';
import { PadhleDashboardGuide } from './posts/PadhleDashboardGuide';
import { LectureSmoothUpdates } from './posts/LectureSmoothUpdates';
import { FeatureGuideDetail } from './posts/FeatureGuideDetail';
import { FEATURE_GUIDES } from '@/data/featureGuidesData';
import { BLOGS_LIST } from '@/data/blogsData';

export const BlogPage: React.FC = () => {
  const [currentPostSlug, setCurrentPostSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;

    // 1. Check clean path: /blog/skip-silence or /blog/skip-silence.html
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'blog' && pathParts[1]) {
      return pathParts[1].replace('.html', '');
    }

    // 2. Check query param: /blog?post=skip-silence (silent migration to clean URL)
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('post');
    if (querySlug) {
      window.history.replaceState({}, '', `/blog/${querySlug}`);
      return querySlug;
    }

    return null;
  });

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'blog' && pathParts[1]) {
        setCurrentPostSlug(pathParts[1].replace('.html', ''));
      } else {
        const params = new URLSearchParams(window.location.search);
        setCurrentPostSlug(params.get('post'));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync document title
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (!currentPostSlug) {
      document.title = 'Blog & Guides — Enhancer for PW';
      return;
    }

    const currentBlog = BLOGS_LIST.find((b) => b.slug === currentPostSlug);
    if (currentBlog) {
      document.title = `${currentBlog.title} — Enhancer for PW`;
    } else {
      document.title = 'Blog & Guides — Enhancer for PW';
    }
  }, [currentPostSlug]);

  const handleSelectPost = (slug: string) => {
    setCurrentPostSlug(slug);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/blog/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToList = () => {
    setCurrentPostSlug(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    if (currentPostSlug && currentPostSlug in FEATURE_GUIDES) {
      return <FeatureGuideDetail slug={currentPostSlug} onBack={handleBackToList} />;
    }
    if (currentPostSlug === 'padhle-dashboard') {
      return <PadhleDashboardGuide onBack={handleBackToList} />;
    }
    if (
      currentPostSlug === 'making-lectures-smoother' ||
      currentPostSlug === 'speed-fixes-focus-lock'
    ) {
      return <LectureSmoothUpdates onBack={handleBackToList} />;
    }
    return <BlogListPage onSelectPost={handleSelectPost} />;
  };

  return (
    <SmoothScroll>
      <div className="relative min-h-screen text-foreground flex flex-col selection:bg-white/20 selection:text-white">
        {/* Full-Page Clean Scroll Video Background */}
        <ScrollCanvasBackground />

        <PageNavbar currentPage="blog" />

        <main className="relative z-10 flex-1 py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          {renderContent()}
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};
