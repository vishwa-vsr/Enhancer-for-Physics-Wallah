import { StudyPlannerData, Subject, Chapter, Task } from '../dashboard/types';
import { ScrapedPwData } from '../content/modules/sync/scraper';

const PLANNER_STORAGE_KEY = 'pw_study_planner_data';

export interface SyncResult {
  success: boolean;
  message: string;
  subjectName: string;
  chapterName?: string;
  importedTasksCount: number;
}

export async function getPlannerDataFromStorage(): Promise<StudyPlannerData> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const res = await chrome.storage.local.get(PLANNER_STORAGE_KEY);
    const data = res[PLANNER_STORAGE_KEY] as StudyPlannerData | undefined;
    return (
      data || {
        subjects: [],
        chapters: [],
        tasks: [],
      }
    );
  } else {
    const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { subjects: [], chapters: [], tasks: [] };
  }
}

export async function savePlannerDataToStorage(data: StudyPlannerData): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [PLANNER_STORAGE_KEY]: data });
  } else {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(data));
  }
}

export async function syncPwDataToPlanner(scraped: ScrapedPwData): Promise<SyncResult> {
  const currentData = await getPlannerDataFromStorage();
  const subjects = [...(currentData.subjects || [])];
  const chapters = [...(currentData.chapters || [])];
  const tasks = [...(currentData.tasks || [])];
  const now = Date.now();

  // 1. Batch Overview Sync (Subjects)
  if (scraped.pageType === 'batch_overview' && scraped.subjects && scraped.subjects.length > 0) {
    let addedCount = 0;
    for (const sub of scraped.subjects) {
      if (!subjects.some((s) => s.name.toLowerCase() === sub.name.toLowerCase())) {
        subjects.push({
          id: 'sub_' + (now + addedCount) + '_' + Math.random().toString(36).substring(2, 6),
          name: sub.name,
          color: '#6366f1',
          icon: 'book',
          createdAt: now + addedCount,
        });
        addedCount++;
      }
    }
    await savePlannerDataToStorage({ ...currentData, subjects });
    return {
      success: true,
      message: `Synced ${addedCount} subjects from your batch!`,
      subjectName: 'Batch Subjects',
      importedTasksCount: 0,
    };
  }

  // 2. Subject Topics Sync (Chapters)
  if (scraped.pageType === 'subject_topics') {
    let targetSubject = subjects.find(
      (s) => s.name.toLowerCase() === scraped.subjectName.toLowerCase(),
    );
    if (!targetSubject) {
      targetSubject = {
        id: 'sub_' + now + '_' + Math.random().toString(36).substring(2, 6),
        name: scraped.subjectName,
        color: '#3b82f6',
        icon: 'atom',
        createdAt: now,
      };
      subjects.push(targetSubject);
    }

    let addedChaps = 0;
    if (scraped.chapters) {
      for (const ch of scraped.chapters) {
        if (
          !chapters.some(
            (c) =>
              c.subjectId === targetSubject?.id &&
              c.name.toLowerCase() === ch.name.toLowerCase(),
          )
        ) {
          chapters.push({
            id: 'chap_' + (now + addedChaps) + '_' + Math.random().toString(36).substring(2, 6),
            name: ch.name,
            subjectId: targetSubject.id,
            icon: 'file-text',
            createdAt: now + addedChaps,
          });
          addedChaps++;
        }
      }
    }

    await savePlannerDataToStorage({ ...currentData, subjects, chapters });
    return {
      success: true,
      message: `Synced ${addedChaps} chapters for ${targetSubject.name}!`,
      subjectName: targetSubject.name,
      importedTasksCount: 0,
    };
  }

  // 3. Chapter Contents Sync (Lectures, DPPs, and connected chains)
  const cleanSubName = scraped.subjectName.trim() || 'Physics';
  const cleanChapName = scraped.chapterName.trim() || 'Electrostatics';

  let targetSubject = subjects.find(
    (s) => s.name.toLowerCase() === cleanSubName.toLowerCase(),
  );
  if (!targetSubject) {
    targetSubject = {
      id: 'sub_' + now + '_' + Math.random().toString(36).substring(2, 6),
      name: cleanSubName,
      color: '#3b82f6',
      icon: 'atom',
      createdAt: now,
    };
    subjects.push(targetSubject);
  }

  let targetChapter = chapters.find(
    (c) =>
      c.subjectId === targetSubject?.id &&
      c.name.toLowerCase() === cleanChapName.toLowerCase(),
  );
  if (!targetChapter) {
    targetChapter = {
      id: 'chap_' + now + '_' + Math.random().toString(36).substring(2, 6),
      name: cleanChapName,
      subjectId: targetSubject.id,
      icon: 'file-text',
      createdAt: now,
    };
    chapters.push(targetChapter);
  }

  const lectures = scraped.items.filter((i) => i.type === 'lecture');
  const dpps = scraped.items.filter((i) => i.type === 'dpp');

  let importedCount = 0;

  for (let idx = 0; idx < lectures.length; idx++) {
    const lec = lectures[idx];
    // Check if task already exists
    const exists = tasks.some(
      (t) =>
        t.chapterId === targetChapter?.id &&
        t.title.toLowerCase() === lec.title.toLowerCase(),
    );
    if (exists) continue;

    const chainId = 'chain_' + now + '_' + idx + '_' + Math.random().toString(36).substring(2, 6);
    const isNoDpp = lec.noDpp || /no\s*dpp/i.test(lec.title);

    // Smart Match: find matching DPP by number
    let matchingDpp = undefined;
    if (!isNoDpp) {
      const matchNum = lec.title.match(/(?:lecture|\b)\s*0?(\d+)/i);
      if (matchNum && matchNum[1]) {
        const num = matchNum[1];
        matchingDpp = dpps.find((d) => {
          const dppMatch = d.title.match(/(?:dpp|\b)\s*0?(\d+)/i);
          return dppMatch && dppMatch[1] === num;
        });
      }
    }

    const lecTaskId = 'task_' + now + '_l_' + idx;
    const dppTaskId = matchingDpp ? 'task_' + now + '_d_' + idx : undefined;
    const revTaskId = 'task_' + now + '_r_' + idx;

    // 1. Lecture Task
    const lectureTask: Task = {
      id: lecTaskId,
      title: lec.title,
      completed: false,
      subjectId: targetSubject.id,
      chapterId: targetChapter.id,
      tags: ['Lecture'],
      createdAt: now + idx * 10,
      chainId,
      chainType: 'lecture',
      orderIndex: 0,
      duration: lec.duration,
      lectureDate: lec.date,
      nextTaskId: dppTaskId || revTaskId,
    };
    tasks.push(lectureTask);
    importedCount++;

    // 2. DPP Task (if matched)
    if (dppTaskId && matchingDpp) {
      const dppTask: Task = {
        id: dppTaskId,
        title: matchingDpp.title,
        completed: false,
        subjectId: targetSubject.id,
        chapterId: targetChapter.id,
        tags: ['DPP'],
        createdAt: now + idx * 10 + 1,
        chainId,
        chainType: 'dpp',
        orderIndex: 1,
        prevTaskId: lecTaskId,
        nextTaskId: revTaskId,
      };
      tasks.push(dppTask);
      importedCount++;
    }

    // 3. Revision Task
    const revTask: Task = {
      id: revTaskId,
      title: `Revision: ${lec.title.split(':')[0]?.trim() || lec.title}`,
      completed: false,
      subjectId: targetSubject.id,
      chapterId: targetChapter.id,
      tags: ['Revision'],
      createdAt: now + idx * 10 + 2,
      chainId,
      chainType: 'revision',
      orderIndex: 2,
      prevTaskId: dppTaskId || lecTaskId,
    };
    tasks.push(revTask);
    importedCount++;
  }

  // If user is on DPPs tab and no lectures were scraped, import the DPP tasks directly
  if (lectures.length === 0 && dpps.length > 0) {
    for (let idx = 0; idx < dpps.length; idx++) {
      const dpp = dpps[idx];
      const exists = tasks.some(
        (t) =>
          t.chapterId === targetChapter?.id &&
          t.title.toLowerCase() === dpp.title.toLowerCase(),
      );
      if (exists) continue;

      const chainId = 'chain_' + now + '_d_' + idx + '_' + Math.random().toString(36).substring(2, 6);
      const dppTaskId = 'task_' + now + '_d_' + idx;

      tasks.push({
        id: dppTaskId,
        title: dpp.title,
        completed: false,
        subjectId: targetSubject.id,
        chapterId: targetChapter.id,
        tags: ['DPP'],
        createdAt: now + idx * 10,
        chainId,
        chainType: 'dpp',
        orderIndex: 0,
      });
      importedCount++;
    }
  }

  await savePlannerDataToStorage({
    ...currentData,
    subjects,
    chapters,
    tasks,
  });

  return {
    success: true,
    message: `Imported ${lectures.length} lecture chains (${importedCount} tasks) for ${cleanChapName}!`,
    subjectName: targetSubject.name,
    chapterName: targetChapter.name,
    importedTasksCount: importedCount,
  };
}
