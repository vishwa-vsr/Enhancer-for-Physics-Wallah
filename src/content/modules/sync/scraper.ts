export interface ScrapedItem {
  type: 'lecture' | 'dpp' | 'notes';
  title: string;
  duration?: string;
  date?: string;
  completed?: boolean;
  noDpp?: boolean;
  attachedDppTitle?: string;
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
      '[id^="lecture-card-"], [id^="dpp-card-"], [class*="_cardWrapper_"], [class*="contentCard"], [class*="file-item"], [class*="lectureItem"]',
    );
    const cards =
      cardCandidates.length > 0 ? cardCandidates : document.querySelectorAll('[class*="_card_"]');

    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    cards.forEach((el) => {
      const elId = el.id || '';
      if (elId && seenIds.has(elId)) return;
      if (elId) seenIds.add(elId);

      const fullText = el.textContent || '';
      if (!fullText.trim()) return;

      const metaEl = el.querySelector('[class*="_meta_"], [class*="meta"]');
      const metaText = metaEl?.textContent?.trim() || '';

      const isLectureCard =
        elId.startsWith('lecture-card-') ||
        /lecture/i.test(metaText) ||
        /lecture/i.test(fullText.slice(0, 50));
      const isStandaloneDpp =
        elId.startsWith('dpp-card-') || (/dpp|quiz/i.test(metaText) && !isLectureCard);
      const isNotes = /notes|pdf/i.test(metaText) && !isLectureCard && !isStandaloneDpp;

      // Extract Clean Title from title container (ignoring DPP button tray text)
      const titleElem =
        el.querySelector('[class*="_titleText_"]') ||
        el.querySelector('h2, h3, h4, [class*="title"], [class*="Title"], [class*="name"]');
      let title = titleElem?.textContent?.trim() || '';
      if (!title) {
        const lines = fullText
          .split('\n')
          .map((l) => l.trim())
          .filter(
            (l) =>
              l.length > 8 &&
              !/watch|resume|attempt|notes & more|marks|dpp\s*\d+/i.test(l),
          );
        title = lines[0] || '';
      }

      if (!title || seenTitles.has(title)) return;
      seenTitles.add(title);

      // Extract duration if present (e.g. 1h:37m or 45m)
      const durEl = el.querySelector('[class*="_durationText_"]');
      const duration =
        durEl?.textContent?.trim() || fullText.match(/\b\d+h(?::\d+m)?|\b\d+m\b/)?.[0];

      // Extract date if present (e.g. 8 Jun 2026 or 08 June, 2026 or Jun 8, 2026)
      let date: string | undefined = undefined;

      // 1. Direct search in child spans and meta tags first (avoids squished "Lecture8" text)
      const dateSpans = el.querySelectorAll('span, [class*="_meta_"], [class*="meta"]');
      for (const s of dateSpans) {
        const txt = s.textContent?.trim() || '';
        const sm =
          txt.match(/(?:^|[^\d])(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:,)?\s+\d{4})\b/i) ||
          txt.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,)?\s+\d{4})\b/i);
        if (sm) {
          date = (sm[1] || sm[0]).replace(',', '').trim();
          break;
        }
      }

      // 2. Fallback search across full text without strict leading word boundary
      if (!date) {
        const dm =
          fullText.match(/(?:^|[^\d])(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:,)?\s+\d{4})\b/i) ||
          fullText.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,)?\s+\d{4})\b/i);
        date = dm ? (dm[1] || dm[0]).replace(',', '').trim() : undefined;
      }

      // Extract completion status (PW green checkmark circle or progress >= 90%)
      const markCompleteEl = el.querySelector(
        '[class*="_markCompleteIcon_"], [class*="markComplete"], [class*="completed"]',
      );
      const isCompleteIcon = Boolean(
        markCompleteEl &&
          (/#3ccb7f|#3CCB7F/i.test(markCompleteEl.innerHTML) ||
            markCompleteEl.querySelector(
              'circle[fill*="#3CCB7F" i], circle[fill*="#3ccb7f" i], path[stroke*="#FFFFFF" i]',
            )),
      );

      const progEl = el.querySelector('[class*="_progress_"]');
      const progStyle = progEl?.getAttribute('style') || '';
      const progMatch = progStyle.match(/width:\s*(\d+)%/);
      const isFullyWatched = progMatch ? parseInt(progMatch[1], 10) >= 90 : false;

      const completed = isCompleteIcon || isFullyWatched;

      if (isLectureCard) {
        // Check for attached DPP tray at bottom of lecture card
        const tray = el.querySelector('[class*="_tray_"]');
        const dppNameEl = el.querySelector('[class*="_dppName_"]');
        let attachedDppTitle = dppNameEl?.textContent?.trim();
        if (!attachedDppTitle && tray) {
          const trayText = tray.textContent?.trim() || '';
          if (/dpp/i.test(trayText)) {
            attachedDppTitle = trayText.replace(/attempt\s*dpp/i, '').trim();
          }
        }

        const isNoDpp = !attachedDppTitle && /no\s*dpp/i.test(fullText);

        items.push({
          type: 'lecture',
          title,
          duration,
          date,
          completed,
          noDpp: isNoDpp,
          attachedDppTitle: attachedDppTitle || undefined,
        });

        // Also add the attached DPP as an item for standalone lookups
        if (attachedDppTitle) {
          items.push({
            type: 'dpp',
            title: attachedDppTitle,
            date,
          });
        }
      } else if (isStandaloneDpp) {
        items.push({
          type: 'dpp',
          title,
          date,
          completed,
        });
      } else if (isNotes) {
        items.push({
          type: 'notes',
          title,
          date,
        });
      }
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
