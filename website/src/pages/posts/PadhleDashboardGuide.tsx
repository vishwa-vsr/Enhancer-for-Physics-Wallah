import React from 'react';
import { ArrowLeft, BookOpen, Calendar, ShieldCheck, MessageSquare } from 'lucide-react';
import { ImageCarousel } from '@/components/ImageCarousel';

interface PostProps {
  onBack: () => void;
}

export const PadhleDashboardGuide: React.FC<PostProps> = ({ onBack }) => {
  return (
    <article className="w-full">
      {/* Top Back Link */}
      <div className="mb-6">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all blogs</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-10 sm:mb-12">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Feature Guide
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            October 18, 2026 · 3 min read
          </span>
        </div>

        <h1
          className="text-3xl sm:text-6xl tracking-tight text-foreground leading-[1.1]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          How to use the Padhle dashboard in Enhancer for Physics Wallah
        </h1>

        <p className="text-muted-foreground text-sm sm:text-lg mt-4 leading-relaxed">
          The Padhle dashboard is a built-in study planner and task manager inside the Enhancer for Physics Wallah extension. It helps you organize your study schedule, track daily practice problems, and plan your chapters in one clean place without opening separate productivity apps or keeping paper notes.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12">
        <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
          <BookOpen className="w-5 h-5 text-indigo-400 mb-2" />
          <h3 className="text-sm font-semibold text-white">Subject and Chapter Organization</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Group your tasks by subject and chapter with custom colors and icons.
          </p>
        </div>
        <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
          <Calendar className="w-5 h-5 text-emerald-400 mb-2" />
          <h3 className="text-sm font-semibold text-white">Smart Due Dates and Backlog Alerts</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Schedule work for today or tomorrow, with an overdue section for missed tasks.
          </p>
        </div>
        <div className="p-5 rounded-2xl liquid-glass-card border border-white/10">
          <ShieldCheck className="w-5 h-5 text-purple-400 mb-2" />
          <h3 className="text-sm font-semibold text-white">100% Private and Offline</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All your tasks stay saved right inside your browser. No sign-up or tracking.
          </p>
        </div>
      </div>

      {/* Main Body */}
      <div className="space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        {/* Step 1: Subjects and Chapters with bullet points & 2-slide carousel */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            1. Setting up your subjects and chapters
          </h2>

          <p>
            The dashboard organizes your study material into two tiers:
          </p>

          <ul className="space-y-2 list-disc list-inside text-white/90 pl-2">
            <li>
              <strong className="text-white">Subjects:</strong> Click the plus icon next to Subjects in the left sidebar to add a subject with a custom icon and color (such as Physics, Chemistry, or Mathematics).
            </li>
            <li>
              <strong className="text-white">Chapters:</strong> Click on any subject to expand it, then click "Add Chapter" to create individual topics (such as Kinematics or Chemical Bonding) for that subject.
            </li>
          </ul>

          <ImageCarousel
            slides={[
              { src: '/blog/padhle/subjects.png' },
              { src: '/blog/padhle/chapters.png' },
            ]}
          />
        </section>

        {/* Step 2: Adding Tasks */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            2. Adding and scheduling your study tasks
          </h2>

          <p>
            Click the "Add Task" button in the top right corner of the dashboard or inside any chapter.
          </p>

          <p>
            The task dialog allows you to enter a few simple details:
          </p>

          <ul className="space-y-2 list-disc list-inside text-white/90 pl-2">
            <li>
              <strong className="text-white">Task title:</strong> What you plan to work on, such as "Watch Lecture 05" or "Complete DPP 03".
            </li>
            <li>
              <strong className="text-white">Subject and chapter:</strong> Assign the task to a chapter, or leave it blank to send it to your Inbox.
            </li>
            <li>
              <strong className="text-white">Due date:</strong> Choose Today, Tomorrow, or pick any exact date on the calendar.
            </li>
            <li>
              <strong className="text-white">Study labels:</strong> Select labels like Lecture, DPP, Revision, Notes, NCERT, or Test.
            </li>
          </ul>

          <ImageCarousel
            slides={[{ src: '/blog/padhle/add-task.png' }]}
          />
        </section>

        {/* Step 3: Shortened Sidebar Views */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            3. Understanding the sidebar views
          </h2>

          <div className="space-y-3 pl-2">
            <div>
              <strong className="text-white block mb-0.5">Tasks View:</strong>
              <p>
                Shows your scheduled work for today and upcoming dates, with missed tasks highlighted in red at the top so backlogs never get forgotten.
              </p>
            </div>

            <div>
              <strong className="text-white block mb-0.5">Inbox:</strong>
              <p>
                A quick scratchpad to save study reminders instantly without picking a subject or chapter right away.
              </p>
            </div>

            <div>
              <strong className="text-white block mb-0.5">Chapter View:</strong>
              <p>
                Isolates only the tasks for your selected chapter so you can complete one topic from start to finish without distractions.
              </p>
            </div>
          </div>
        </section>

        {/* Step 4: List vs Board View with 2-slide carousel */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            4. Choosing between list view and board view
          </h2>

          <p>
            At the top right of the task area, you can choose how your tasks appear on screen:
          </p>

          <ul className="space-y-2 list-disc list-inside text-white/90 pl-2">
            <li>
              <strong className="text-white">List View:</strong> A clean checklist format grouped by date or study label.
            </li>
            <li>
              <strong className="text-white">Board (Kanban) View:</strong> An interactive card board with columns that you can scroll horizontally.
            </li>
          </ul>

          <ImageCarousel
            slides={[
              { src: '/blog/padhle/list-view.png' },
              { src: '/blog/padhle/board-view.png' },
            ]}
          />
        </section>

        {/* Step 5: Settings */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            5. Customizing study labels in settings
          </h2>

          <p>
            Click "Settings" at the bottom of the left sidebar to manage your labels. You can rename existing tags, change their colors, add new ones like "PYQ Practice" or "Formula Sheet", and delete labels you do not use.
          </p>

          <ImageCarousel
            slides={[{ src: '/blog/padhle/settings.png' }]}
          />
        </section>

        {/* Step 6: Privacy */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            6. Privacy and offline storage
          </h2>

          <p>
            All study planner data is stored locally on your device through your browser's extension storage. No study records or task names are sent to external servers, and the dashboard works completely offline without an internet connection.
          </p>
        </section>

        {/* Closing Note / Feedback Card */}
        <section className="p-6 rounded-2xl liquid-glass-card border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Have feedback or suggestions?</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            If you want to suggest improvements for the Padhle dashboard, or ran into something that could be improved, we would love to hear from you.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdquONSDYSILWZd-ubkmk9pi_TVNXa65b8G7fpbOCbO3UCHdg/viewform"
              target="_blank"
              rel="noreferrer"
              className="liquid-glass rounded-xl px-4 py-2 text-xs sm:text-sm font-medium text-white hover:scale-105 active:scale-95 transition-all shadow-md border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <span>Open Feedback Form</span>
              <span>↗</span>
            </a>
            <a
              href="https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/issues"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors px-3 py-2"
            >
              <span>Submit issue on GitHub</span>
              <span>↗</span>
            </a>
          </div>
        </section>
      </div>
    </article>
  );
};
