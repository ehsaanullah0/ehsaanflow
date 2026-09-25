import React, { useState } from 'react';
import { Sparkles, GitCommit, Rocket, Heart, ArrowUpRight, CheckCircle2, Flame, Wrench, ChevronDown, ChevronUp } from 'lucide-react';

interface ChangelogSectionProps {
  onOpenSupport?: () => void;
}

interface VersionLog {
  version: string;
  title: string;
  date: string;
  isLatest?: boolean;
  items: string[];
}

export const ChangelogSection: React.FC<ChangelogSectionProps> = ({ onOpenSupport }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const changelogData: VersionLog[] = [
    {
      version: 'v1.1.8',
      title: 'Ehsaan Studio Popup Redesign & Workspace Refinements',
      date: 'September 25, 2026',
      isLatest: true,
      items: [
        'Redesigned Ehsaan Studio modal to exactly match reference design: Golden Project Hub banner, squircle project cards, and navy support footer.',
        'Refined Note Cards: Increased minimum card height, added interactive multicolour gradient color picker for background accents.',
        'Renamed "Ehsaan Flow" project to "Ehsaan Website" in the Studio modal.',
        'Enhanced Notes Workspace: Added dedicated categories, pin-to-top, and rich content capabilities.',
      ],
    },
    {
      version: 'v1.1.7',
      title: 'Ehsaan Studio & Dedicated Notes Workspace Integration',
      date: 'September 25, 2026',
      isLatest: false,
      items: [
        'Integrated "Ehsaan Studio" modal for cross-project accessibility.',
        'Enabled logo-based modal triggers across Sidebar and Mobile Header.',
        'Architected dedicated Notes & Workspace section with Grid and List view options matching warm palette philosophy.',
        'Integrated Note Creation & Editing modal supporting rich body prose, categories, tags, and custom warm card color accents.',
        'Added pin-to-top functionality, real-time word/character count, and one-click quick clipboard copying.',
      ],
    },
    {
      version: 'v1.1.6',
      title: 'Global Brand Logo Synchronization & Image-Matching Consistency',
      date: 'September 24, 2026',
      isLatest: false,
      items: [
        'Redesigned the official brand logo to perfectly match the requested green leaf branch design with bold outlines on a peach squircle and dark brown backdrop',
        'Rendered high-fidelity inline SVGs of the exact brand logo across Sidebar, Mobile Header, Onboarding, and Sample Notice popups',
        'Compiled and exported the exact same high-resolution PNG assets for PWA install packages, apple-touch-icons, and favicons on desktop and mobile',
        'Resolved React console warnings by migrating standard SVG properties (stroke-width, stroke-linejoin, stroke-linecap) to standard React camelCase equivalents across all brand assets',
      ],
    },
    {
      version: 'v1.1.5',
      title: 'Interactive Metric Explanations & Comprehensive Logic Transparency',
      date: 'September 24, 2026',
      isLatest: false,
      items: [
        'Introduced interactive logic explanation info icons and formula badges across all analytic components, meters, and views',
        'Created a central metric explanations registry detailing formulas, data sources, calculations, and optimization tips',
        'Integrated step-by-step logic transparency modals into Today View, Habits list, Progress cards, and Digital Matrices Grid',
        'Removed the Olive Atelier visual theme, custom palette selections, and associated color styles from the workspace',
        'Seeded randomized completed tasks over the entire 365-day year in sample data to provide realistic task velocity analytics',
        'Reconfigured application version schema to designate v1.1.5 as the latest official stable release',
        'Applied high-contrast premium color adjustments to the project architecture footer metadata headers and technology icons',
      ],
    },
    {
      version: 'v1.1.4',
      title: 'Isolated Daily Task Completions, 2-Month Habit Grid & Streamlined Data Safety',
      date: 'September 24, 2026',
      isLatest: false,
      items: [
        'Isolated Everyday recurring task completions so checking a task on one date does not affect other days',
        'Redesigned individual habit analytics logger into an interactive two-month side-by-side progress grid',
        'Updated expanded habit calendar modal to default directly to the 12-month Yearly View',
        'Renamed "Delete Sample Data At Once" action button to "Delete All Data At Once"',
        'Completely removed the Wipe Everything button for cleaner and simpler data safety controls',
        'Updated task completion tracking across Today view, Calendar agenda, and Heatmaps to respect date-specific completion arrays',
        'Maintained full 365-day year snapshot seeding and date accuracy across all habit and progress matrices',
      ],
    },
    {
      version: 'v1.1.3',
      title: 'Yearly Snapshot Optimization, Monthly Bounded Recurring Tasks & Workspace Controls',
      date: 'September 24, 2026',
      isLatest: false,
      items: [
        'Optimized 365-day year snapshot seeding across habit heatmaps, 12-month historical tasks, journal logs, and progress meters',
        'Bounded Everyday recurring tasks strictly to the month they were created across Calendar, Today, Heatmaps, and Badges',
        'Fixed timezone offset shifts in YYYY-MM-DD local date formatting for accurate date matching in all timezones',
        'Persisted sidebar collapse/expand position in local storage across browser sessions and viewport updates',
        'Added first-setup sample data notification modal with quick options to explore or delete sample data at once',
        'Added 1-click "Delete Sample Data At Once" action in Settings > Data Safety for clean workspace reset',
        'Added "Restore Latest Backup" action button in Automatic Backups header for instant 1-click workspace recovery',
      ],
    },
    {
      version: 'v1.1.2',
      title: 'Unified Monthly Weeks Progress Curve Workspace',
      date: 'September 22, 2026',
      isLatest: false,
      items: [
        'Overhauled the individual habit weekly progress graph to display a monthly linear progress curve showing all weeks of the selected calendar month at once',
        'Eliminated the weekly page navigation requirement on the linear graph, updating the curve instantly when changing month context',
        'Enhanced the curve geometry with auto-scaling horizontal markers and custom fractional check-in sub-labels for each week row',
        'Preserved visual alignment with the full-screen interactive dashboard design system across all desktop workspaces',
        'Refactored the extended calendar modal into a full-screen workspace, organizing months in a balanced 2x2 bento-grid on desktop to prevent vertical scrolling clutter',
        'Improved sub-folder progress visual appearance and ensured subtasks render by their name',
        'Presented latest two months side by side in Insights execution matrix and unified Extended Calendar styling',
      ],
    },
    {
      version: 'v1.1.1',
      title: 'Premium Full-Screen Individual Habit Analytics Dashboard Workspace',
      date: 'September 19, 2026',
      isLatest: false,
      items: [
        'Refactored Individual Metric Progress into a gorgeous, full-screen interactive dashboard workspace on desktop',
        'Upgraded all individual habit analytics panels into full-screen immersive workspaces matching the layout logic',
        'Optimized linear trend path geometry using smooth cubic bezier curves with elegant custom point tooltips',
        'Created a responsive dual-column analytical layout for desktop to display high-fidelity metrics side-by-side',
        'Integrated a highly customizable and navigation-ready 7-Day Performance Meter and Weekly Breakdown progress chart',
        'Polished contribution heatmaps with toggles for both Monthly activity cells and Annual 52-Week timelines',
        'Added smooth fade-in animations, cohesive element padding, and color contrast mapping for optimal legibility',
      ],
    },
    {
      version: 'v1.1.0',
      title: 'Dark Blue Refinements & Individual Card View Controls',
      date: 'September 18, 2026',
      isLatest: false,
      items: [
        'Added "Sync All Cards" toggle switch inside View option dropdown to toggle global vs specific card customization styles',
        'Persisted custom localized element visibility configurations for individual cards when Sync All is toggled off',
        'Deepened and darkened all royal blue elements to a premium Navy Blue palette (#1e40af / #1e3a8a) for enhanced legibility and contrast',
        'Reconfigured low-priority badges, progress bars, and metrics tabs to align perfectly with the updated dark blue theme',
        'Darkened the full-width GitHub Repository sidebar buttons for a cohesive, professional workspace layout',
        'Removed card/modal bounds for Overall Analytics, displaying it as an immersive full-screen workspace on desktop',
        'Optimized the Annual 12-Month habit calendar by expanding card size, padding, grid gaps, and typography for maximum cell legibility',
      ],
    },
    {
      version: 'v1.0.9',
      title: 'Royal Blue View Source Action & Sidebar Streamlining',
      date: 'September 13, 2026',
      isLatest: false,
      items: [
        'Added interactive "View" checklist in task card 3-dot menu allowing customization of visible badges, descriptions, dates, tags & subtasks',
        'Enlarged and boldened main task title typography across Grid cards and Agenda views for higher legibility',
        'Unified task card metadata pills into a single fluid flex-wrap row so tags sit directly next to dates',
        'Updated View Source action button in Settings to vibrant royal blue matching low priority color theme',
        'Replaced quote box in sidebar footer with a full-width royal blue GitHub Repository action button',
        'Integrated direct developer contact mailing link (worsmon@proton.me) across Settings and Sidebar',
      ],
    },
    {
      version: 'v1.0.8',
      title: 'Premium Minimalist Calendar, Storage Warnings & Priority-Sorting',
      date: 'Previous Release',
      items: [
        'Enforced a clean, maximum 2-task display limit per cell to maintain premium spacing',
        'Sorted calendar tile tasks systematically from highest (High) to lowest (Low) priority status',
        'Implemented beautiful floating borderless uppercase task titles matching premium layout',
        'Added subtle warm orange pill background styling to non-today dates in Agenda view',
        'Synchronized Priority Segmentation colors in Insights section with unified system palette',
        'Added intuitive Warning Note (!) to local snapshots section highlighting cookie deletion risk',
        'Optimized mobile-responsive calendar layout indicators with top 2 priority-sorted items',
      ],
    },
    {
      version: 'v1.0.5',
      title: 'Annual 12-Month Heatmaps & Aggregated Subtask Progress',
      date: 'Previous Release',
      items: [
        'Annual 12-Month Grid Heatmap view inside Overall Habit Analytics modal',
        'Interactive yearly habit calendar navigation supporting click-to-view daily completed list',
        'Annual 12-Month Calendar Execution Grid inside Insight/Task Section replacing timeline view',
        'Unified subtask and task calculation inside Focus on Outcomes sub-folder progress indicators',
        'Optimized responsive grid configurations for mini monthly heatmaps across viewport widths',
      ],
    },
    {
      version: 'v1.0.4',
      title: 'Linear Analytics, Mobile UX Polish & Refined Habit Grid',
      date: 'Previous Release',
      items: [
        'Weekly Linear Graph for individual habit analytics with completion rate curves',
        'Custom emoji selector allowing typed or pasted custom icons in habit creation',
        'Full-screen analytics experience for mobile and tablet views',
        'Two-grid mini calendar layout for mobile yearly habit overview',
        'Uniform grid habit card sizes with emoji title prefixing and text truncation',
        'Global scrollbar hiding and clean header layout optimization',
        'Fixed task duration multi-day rendering spanning across calendar date ranges',
      ],
    },
    {
      version: 'v1.0.3',
      title: 'Daily Habit Tracking & Consistency Analytics',
      date: 'Previous Release',
      items: [
        'Daily Habit Tracking with connected streak capsules and consecutive day joiners',
        'Overall Analytics with circular consistency gauge, habit ranking, and heatmap visualization',
        'Individual Habit Analytics with weekly progress matrix, started date, and best/current streak metrics',
        'Expanded Monthly and Yearly Habit Calendar view with mini-grid overview',
        'Card expand/collapse toggle for clean names-only mode, and drag/arrow reordering',
        'Responsive layout support with list and multi-column grid views for desktop and tablets',
        'Floating action buttons with Overall Analytics and quick habit creation',
      ],
    },
    {
      version: 'v1.0.2',
      title: 'PWA Installation, Search Highlighter & Tablet Grid',
      date: 'Previous Release',
      items: [
        'Official app logo as favicon (SVG/ICO/Apple Touch) and PWA install icons',
        'PWA installation controls with offline mode support across Desktop, iOS & Android',
        'Subtle brown/terracotta search text highlighter across task titles, notes, tags & subtasks',
        'Collapsible arrow on bottom navigation with floating restore menu button',
        'Tablet responsive multi-column task grid view and touch control optimizations',
      ],
    },
    {
      version: 'v1.0.1',
      title: 'Progress Meter Analytics & UI Refinements',
      date: 'Previous Release',
      items: [
        'Add a progress meter option for max analytics',
        'Improve the look of progress cards and their popups',
        'Add a heatmap view in progress card',
        'Improve light theme throughout the UI',
        'Bug and fine improvements',
      ],
    },
    {
      version: 'v1.0.0',
      title: 'Foundation & Core Workflow Architecture',
      date: 'Initial Release',
      items: [
        'Making app from scratch',
        'Fixing initial layout inconsistency',
        'Add a navigation bar in mobile view',
        'Add a developer and support section',
      ],
    },
  ];

  const currentVersion = changelogData[0]?.version || 'v1.0.8';
  const displayedReleases = isExpanded ? changelogData : changelogData.slice(0, 3);

  return (
    <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#281b18]/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#823b28] text-[#f6e9d7] rounded-xl flex items-center justify-center">
              <GitCommit size={16} />
            </span>
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest">
              PRODUCT UPDATES & RELEASE HISTORY
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#281b18] font-sans tracking-tight">
            Release Changelog
          </h3>
        </div>

        <span className="font-mono text-xs font-bold text-[#df734c] bg-[#df734c]/10 border border-[#df734c]/30 px-3 py-1 rounded-full self-start sm:self-auto">
          Current Version: {currentVersion}
        </span>
      </div>

      {/* Developer Note at Top for ongoing release */}
      <div className="relative bg-[#281b18] text-[#f6e9d7] rounded-2xl p-4.5 border border-[#422119] shadow-md overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Subtle decorative glow */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#df734c]/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-3 relative z-10">
          <div className="p-2.5 bg-[#df734c] text-[#fbf6ef] rounded-xl shrink-0 mt-0.5 sm:mt-0 shadow-sm">
            <Flame size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-[#df734c] bg-[#422119] px-2 py-0.5 rounded-full border border-[#823b28]/50">
                DEVELOPER NOTE
              </span>
              <span className="font-mono text-[10px] text-[#eb9d7d] font-bold">
                Ongoing Evolution: {currentVersion}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#f6e9d7] leading-snug">
              "New release {currentVersion} is live with comprehensive task analytics across 365 days and intuitive metric explanation logic overlays."
            </p>
          </div>
        </div>

        {onOpenSupport && (
          <button
            type="button"
            onClick={onOpenSupport}
            className="w-full sm:w-auto relative z-10 flex items-center justify-center gap-1.5 bg-[#df734c] hover:bg-[#c95f39] text-[#fbf6ef] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <Heart size={14} fill="currentColor" />
            <span>Support {currentVersion}</span>
          </button>
        )}
      </div>

      {/* Release Timeline Cards */}
      <div className="flex flex-col gap-5">
        {displayedReleases.map((release) => (
          <div
            key={release.version}
            className={`rounded-2xl border p-5 transition-all ${
              release.isLatest
                ? 'bg-[#f6e9d7] border-[#823b28]/30 shadow-sm'
                : 'bg-[#fbf6ef] border-[#281b18]/10'
            }`}
          >
            {/* Version Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-[#281b18]/10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-black bg-[#823b28] text-[#f6e9d7] px-3 py-1 rounded-xl shadow-xs">
                  {release.version}
                </span>
                <h4 className="text-sm font-extrabold text-[#281b18] font-sans">
                  {release.title}
                </h4>
              </div>

              {release.isLatest ? (
                <span className="font-mono text-[10px] font-bold text-[#df734c] bg-[#df734c]/15 border border-[#df734c]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={11} />
                  Latest
                </span>
              ) : (
                <span className="font-mono text-[10px] font-bold text-[#823b28]/70 bg-[#edd8c2] px-2.5 py-0.5 rounded-full">
                  {release.date}
                </span>
              )}
            </div>

            {/* Change Items List */}
            <ul className="flex flex-col gap-2.5">
              {release.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs text-[#281b18] font-medium leading-relaxed"
                >
                  <span className="font-mono text-[10px] font-bold text-[#823b28] bg-[#edd8c2] w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Expand/Collapse Toggle Button for Older Releases */}
        {changelogData.length > 3 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-3 px-4 bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#823b28] font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>{isExpanded ? 'Show Less Releases' : `View ${changelogData.length - 3} Older Releases`}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};
