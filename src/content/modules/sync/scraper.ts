export interface ScrapedItem {
  type: 'lecture' | 'dpp' | 'notes';
  title: string;
  duration?: string;
  date?: string;
  noDpp?: boolean;
}

export interface ScrapedPwData {
  pageType: 'chapter_contents' | 'subject_topics' | 'batch_overview' | 'unknown';
  subjectName: string;
  chapterName: string;
  batchName?: string;
  items: ScrapedItem[];
  chapters?: Array<{
    name: string;
    lectureCount?: string;
    dppCount?: string;
  }>;
  subjects?: Array<{
    name: string;
  }>;
}

export function scrapeCurrentPwPage(): ScrapedPwData {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;

  // 1. Extract context from URL parameters (resilient fallback)
  let subjectName =
    searchParams.get('subject')?.replace(/_/g, ' ').trim() || '';
  let chapterName =
    searchParams.get('topic')?.replace(/_/g, ' ').trim() || '';

  // Clean common suffixes or formatting in URL
  if (subjectName) {
    subjectName = decodeURIComponent(subjectName);
  }
  if (chapterName) {
    chapterName = decodeURIComponent(chapterName);
  }

  // Fallback: extract subject name from pathname if missing from query params
  if (!subjectName) {
    const subMatch = window.location.pathname.match(/\/subjects\/([^/?#]+)/i);
    if (subMatch && subMatch[1]) {
      subjectName = decodeURIComponent(subMatch[1])
        .replace(/-\d+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }
  }

  // 2. Determine Page Type
  const path = url.pathname;
  let pageType: ScrapedPwData['pageType'] = 'unknown';

  if (path.includes('/contents')) {
    pageType = 'chapter_contents';
  } else if (path.includes('/subject-topics')) {
    pageType = 'subject_topics';
  } else if (path.includes('/batch-overview')) {
    pageType = 'batch_overview';
  }

  // DOM-based page type fallback if URL path is ambiguous
  if (pageType === 'unknown') {
    const tabText = document.querySelector('[class*="_parentTab_"]')?.textContent || '';
    if (
      document.querySelector('[id^="lecture-card-"], [class*="lectureCard"], [class*="_titleText_"]') ||
      /Lectures|DPPs/i.test(tabText)
    ) {
      pageType = 'chapter_contents';
    } else if (
      document.querySelector('[id^="unit-card-"], [class*="topicCard"], [class*="topicsGrid"]') ||
      /Chapters|Study Material/i.test(tabText)
    ) {
      pageType = 'subject_topics';
    } else if (document.querySelector('[class*="subjectCard"]')) {
      pageType = 'batch_overview';
    }
  }

  // 3. Refine Subject / Chapter names from DOM breadcrumbs or titles if not in URL
  if (!subjectName) {
    const subElem = document.querySelector('[class*="subjectTitle"], [class*="SubjectName"], h1, h2');
    if (subElem && subElem.textContent) {
      subjectName = subElem.textContent.trim();
    }
  }

  if (!chapterName && pageType === 'chapter_contents') {
    // Check for selected chapter in sidebar
    const selectedBadge = document.querySelector('[class*="selectedChapterBadge"]');
    if (selectedBadge) {
      const chapContainer = selectedBadge.closest('[class*="chapterContainer"], [id^="chapter-card-"]') || selectedBadge.parentElement;
      const nameEl = chapContainer?.querySelector('[class*="chapterText"], [class*="chapterTitle"], [class*="title"]') || chapContainer;
      if (nameEl && nameEl.textContent) {
        chapterName = nameEl.textContent.replace(/CH\s*-\s*\d+/i, '').trim();
      }
    }

    if (!chapterName) {
      const chapElem = document.querySelector('[class*="chapterTitle"], [class*="activeChapter"]');
      if (chapElem && chapElem.textContent) {
        chapterName = chapElem.textContent.trim();
      }
    }
  }

  // Fallbacks if still not found
  if (!subjectName) subjectName = 'Physics';
  if (!chapterName) chapterName = 'Chapter 1';

  // 4. Scrape Items for Chapter Contents
  const items: ScrapedItem[] = [];

  if (pageType === 'chapter_contents') {
    // Collect all card elements across content lists
    const cardCandidates = document.querySelectorAll(
      '[id^="lecture-card-"], [class*="_card_"], [class*="cardWrapper"], [class*="contentCard"], [class*="file-item"], [class*="lectureItem"]',
    );

    const seenTitles = new Set<string>();

    cardCandidates.forEach((el) => {
      const fullText = el.textContent || '';
      if (!fullText.trim()) return;

      // Check if it's a Lecture, DPP, or Notes
      const isDpp = /dpp|mcq\s*quiz/i.test(fullText) && !/no\s*dpp/i.test(fullText);
      const isNotes = /notes|pdf/i.test(fullText) && !isDpp && !/lecture/i.test(fullText);
      const isNoDpp = /no\s*dpp/i.test(fullText);

      // Extract Clean Title
      // Often in h3, h4, p, or div with title/name in class
      let title = '';
      const titleElem = el.querySelector('h2, h3, h4, [class*="title"], [class*="Title"], [class*="name"]');
      if (titleElem && titleElem.textContent?.trim()) {
        title = titleElem.textContent.trim();
      } else {
        // Fallback: extract line with chapter name or lecture keywords
        const lines = fullText
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 5);
        title = lines[0] || '';
      }

      // If title is just "Lecture" or "DPP", search for a better descriptive line in the card
      if (title.length < 10 || /^lecture$/i.test(title) || /^dpp$/i.test(title)) {
        const lines = fullText
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 10 && !/watch|resume|attempt|notes & more|marks/i.test(l));
        if (lines[0]) title = lines[0];
      }

      if (!title || seenTitles.has(title)) return;
      seenTitles.add(title);

      // Extract duration if present (e.g. 1h:37m or 45m)
      const durationMatch = fullText.match(/\b\d+h(?::\d+m)?|\b\d+m\b/);
      const duration = durationMatch ? durationMatch[0] : undefined;

      // Extract date if present (e.g. 8 Jun 2026)
      const dateMatch = fullText.match(
        /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:,)?\s+\d{4}\b/i,
      );
      const date = dateMatch ? dateMatch[0].replace(',', '').trim() : undefined;

      const type: ScrapedItem['type'] = isDpp ? 'dpp' : isNotes ? 'notes' : 'lecture';

      items.push({
        type,
        title,
        duration,
        date,
        noDpp: isNoDpp,
      });
    });
  }

  // 5. Scrape Chapters for Subject Topics
  const chapters: ScrapedPwData['chapters'] = [];
  if (pageType === 'subject_topics') {
    const topicCards = document.querySelectorAll(
      '[id^="unit-card-"], [class*="topicCard"], [class*="topicsGrid"] > div, [class*="topicMeta"], [class*="chapterItem"]',
    );
    const seenChaps = new Set<string>();

    topicCards.forEach((tc) => {
      const heading = tc.querySelector('h2, h3, h4, [class*="topicTitle"], [class*="title"], [class*="Title"]');
      const chapName = heading?.textContent?.trim() || '';
      if (chapName && !seenChaps.has(chapName)) {
        seenChaps.add(chapName);
        chapters.push({
          name: chapName,
        });
      }
    });
  }

  // 6. Scrape Subjects for Batch Overview
  const subjects: ScrapedPwData['subjects'] = [];
  if (pageType === 'batch_overview') {
    const subCards = document.querySelectorAll('[class*="subjectCard"], [class*="subjectText"]');
    const seenSubs = new Set<string>();

    subCards.forEach((sc) => {
      const heading = sc.querySelector('h2, h3, h4, [class*="subjectName"], [class*="title"]') || sc;
      const name = heading?.textContent?.trim() || '';
      if (name && !seenSubs.has(name)) {
        seenSubs.add(name);
        subjects.push({ name });
      }
    });
  }

  return {
    pageType,
    subjectName,
    chapterName,
    items,
    chapters,
    subjects,
  };
}
