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
      version: 'v1.2.9',
      title: 'Minimalist UX & Personalization Enhancements',
      date: 'September 27, 2026',
      isLatest: true,
      items: [
        'Added Avatar Background Color Picker in Settings for custom personalization.',
        'Removed black background overlay from QR support modal for a cleaner, integrated look.',
        'Streamlined QR support modal header for a more minimalist design.',
        'Cleaned up Ehsaan Studio by removing Project Hub and Footer Support banners.',
        'Streamlined Today Page header by removing the Journal entry shortcut.',
        'Simplified Today Page header graphics by removing decorative flower branch.',
        'Removed "Principle of the Day" quote section for a more focused layout.',
        'Enhanced overall UI consistency for a cleaner, minimalist aesthetic.',
      ],
    },
    {
      version: 'v1.2.8',
      title: 'Translucent Stats Wrapper Card & Premium Framing Overhaul',
      date: 'September 27, 2026',
      isLatest: false,
      items: [
        'Translucent Stats Wrapper Card: Wrapped the grid of four beautiful stats cards inside a subtle, premium translucent background container with a delicate border (bg-[#fbf6ef]/40 backdrop-blur-sm).',
        'Enhanced Contrast & Layout: Heightened contrast, framing, and visual depth for the Tasks Today, Streak, Completion Rate, and Focus metrics across all viewports.',
      ],
    },
    {
      version: 'v1.2.7',
      title: 'Frameless Header Aesthetics & Workspace Profile Personalization Sync',
      date: 'September 27, 2026',
      isLatest: false,
      items: [
        'Frameless Header Layout: Removed the enclosing background card and border from the Today Page header area, allowing the elements to float directly on the page background.',
        'Top App Icon Personalization: Synchronized your active Settings avatar (custom uploaded image or emoji preset) directly into the Sidebar top-left app icon.',
        'Removed Today Page Customizer: Cleaned up Today Page layout by removing the local avatar picker drawer and avatar upload buttons, keeping customization centralized in Settings.',
        'Float Date & Overdue Badges: Grouped the pill-shaped Date badge and live "Overdue tasks" indicator for a clean, unified meta row.',
      ],
    },
    {
      version: 'v1.2.6',
      title: 'Today Command Center Redesign & Unified Landscape Header Integration',
      date: 'September 27, 2026',
      isLatest: false,
      items: [
        'Unified Landscape Header: Created a gorgeous, wide cream-toned top header banner spanning the entire Today Page.',
        'Aesthetic Rolling Hills Artwork: Rendered a beautiful, organic sun & rolling hills plant vector illustration seamlessly within the premium organic color palette.',
        'Uppercase Greeting Title: Styled the greeting statement in bold, fully capitalized "Good day, EHSAAN 🌿" layout.',
        'Pill-Shaped Date Badge: Formatted the compact calendar icon and date badge inside a rounded-full floating pill.',
        'Inlined Action Controls: Relocated the Search bar, Studio wizard, + New Task, and Journal buttons inside the Today Page header banner.',
        'Four Stats Grid Cards: Re-engineered the stats cards into a premium horizontal layout (Tasks Today, Streak, Completion Rate, Focus).',
        'Checkmark, Flame, Target, Star Icons: Customized each stats circle container with custom colored ring gradients.',
      ],
    },
    {
      version: 'v1.2.5',
      title: 'Mindful Today Avatar Hero Banner & Uncluttered Navigation Overhaul',
      date: 'September 27, 2026',
      isLatest: false,
      items: [
        'Removed Sidebar Profile Card: Cleaned up sidebar footer navigation by removing redundant profile badge for streamlined, uncluttered navigation.',
        'Today Page Hero Avatar Section: Integrated a high-impact, warm organic Avatar Identity Card inside the Today Page command center.',
        'Direct Photo Upload Overlay: Embedded a camera upload trigger directly on the Today Page avatar preview with real-time canvas compression.',
        'Inline Quick Avatar Customizer: Built a collapsible avatar customization drawer right on the Today Page with quick preset emoji selectors.',
        'Personalized Greeting Header: Enhanced the "Good day, Ehsaan" welcome banner with warm squircle borders, status ring, and focus stats.',
        'Removed Redundant Header Avatar Pill: Extracted the unnecessary profile/avatar capsule next to the date badge in the top header, preserving a clean, minimalist and aesthetic toolbar.',
      ],
    },
    {
      version: 'v1.2.4',
      title: 'Exact Brand Logo Identity & Multi-Platform PWA/Favicon Overhaul',
      date: 'September 27, 2026',
      isLatest: false,
      items: [
        'Exact Brand Logo Identity: Seamlessly implemented the official brand logo featuring the elegant white monoline leaf and flowing wave seedling emblem with 100% geometric and aesthetic fidelity.',
        'Authentic Warm Colour Science: Implemented the exact dual-gradient color science with deep roasted mocha-espresso (#562814 to #6d3319) transitioning into radiant warm amber and honey terracotta (#cb6222 to #ea7d27) with subtle organic depth waves.',
        'Vector SVG Master Assets: Updated /public/icon.svg and /public/favicon.svg with sharp, scalable vector definitions and smooth 23% squircle corner curvature.',
        'Multi-Resolution PWA App Packages: Compiled and synchronized high-resolution raster assets (pwa-192x192.png and pwa-512x512.png) across public and distribution directories.',
        'Android Maskable Safe-Zone Compliance: Engineered public/icon-maskable.svg with full-bleed continuous gradient and safe-zone emblem centering for flawless Android home-screen adaptive masking.',
        'Apple Touch & Browser Favicon Sync: Generated 180x180 apple-touch-icon.png for iOS devices and crisp 32x32 favicon.ico for all browser tabs.',
        'Unified In-App Brand Component: Created a dedicated <AppLogo /> React component deployed across Desktop Sidebar (expanded and collapsed), Mobile Header, Onboarding Modal, and Sample Notice dialogs.',
        'Persisted Note Workspace Settings: Saved text scale zoom (+50% reading default), layout mode (framed editorial folio vs full canvas), view mode, and note pinning state across browser refreshes.',
        'Dedicated Avatar & Profile Section: Redesigned the Personal Profile tab in Settings with a dedicated Avatar management card, live active avatar badge, and custom photo preview.',
        'Custom Avatar Image Upload: Added an interactive image upload button supporting PNG, JPG, WEBP, and SVG with automatic canvas compression and instant cross-app header and sidebar synchronization.',
      ],
    },
    {
      version: 'v1.2.3',
      title: 'Full-Screen Note Workspace & Overall Analytics Activation Resolution',
      date: 'September 27, 2026',
      isLatest: false,
      items: [
        'Pure Full-Screen Note Reader: Clicking any note now opens ONLY the note in full-screen reader mode (clean typography, interactive checklists, reading stats) without the edit panel, with a dedicated "Edit Note" button to switch to editing when desired.',
        'Split View Live Preview: Added side-by-side split layout allowing simultaneous note editing and real-time interactive checklist previewing on desktop.',
        'View Switcher & Maximize Toggle: Integrated top-bar controls to toggle between Write, Split View, and Preview, with a maximize/restore button.',
        'Note Keyboard Shortcuts: Added Ctrl/Cmd + Enter to immediately save notes and Escape key to close without losing context.',
        'Progress Meter Overall Analytics Activation Fix: Resolved the Rules of Hooks ordering violation caused by an early return before useMemo hooks.',
        'Conditional Mounting: Optimized Overall Progress Analytics to mount conditionally when activated, eliminating background re-renders when closed.',
        'Document Metrics: Added live line, word, and character counters in the sticky header and footer of the note workspace.',
        'Automatic +50% Reading Typography: Opening a note in full screen now automatically scales all body text, lists, and checklists up by +50% for optimal editorial legibility, automatically returning to standard scale when closed.',
        'Serene Editorial Folio Redesign: Replaced flat full-bleed color wash with an elevated manuscript folio sheet, ambient reading backdrop, smooth shadow depth, and responsive A- / A+ zoom controls.',
      ],
    },
    {
      version: 'v1.2.2',
      title: 'Overall Analytics Crash Fix & Runtime Resilience Hardening',
      date: 'September 27, 2026',
      isLatest: false,
      items: [
        'Resolved blank white screen crash on opening Overall Progress Analytics by defensively sanitizing uninitialized meter entries and missing unit types.',
        'Hardened data normalization pipeline against undefined, null, or string metric values with zero-error type coercion.',
        'Integrated client-side React ErrorBoundary wrapping the Overall Analytics Command Center with instant self-recovery options.',
        'Guarded SVG path geometry and coordinate offsets against zero-division and NaN rendering exceptions.',
        'Hardened Date parsing across mobile, Safari, and all timezone offsets for the consistency heatmap and trajectory charts.',
        'Added bounding box checks on SVG interactive crosshair handlers to eliminate cursor tracking errors.',
        'Secured Dip Recovery calculations against edge cases where minimum data points were undefined.',
      ],
    },
    {
      version: 'v1.2.1',
      title: 'Overall Progress Analytics Diagnostic & Performance Hardening',
      date: 'September 26, 2026',
      isLatest: false,
      items: [
        'Audited Overall Progress Analytics Command Center with comprehensive mathematical and visual diagnostics across multi-dimensional meters.',
        'Fixed comparative trend meter visibility toggle bug so meters can be freely toggled on/off to isolate curves.',
        'Corrected streak algorithm to stop immediately upon detecting inactive days and preserve active streaks if today is still in progress.',
        'Upgraded Momentum and Multi-line time-series charts to use smooth SVG crosshair cursor tracking, eliminating 90D/365D overlapping circle jitter.',
        'Implemented smart tiered empty states for 0 meters, 1-meter tracking, and zero logged entries in active timeframe.',
        'Enhanced Personal Records accuracy to capture true single-day normalized peaks and format empty records cleanly.',
        'Completed 3-part Recovery After Dip analysis featuring Drop (↓), Rebound (↑), and Current vs Pre-Drop baseline differential.',
        'Added historical fallback for Latest Raw values in Meter Performance Map ensuring recent ratings display accurately even on compact time windows.',
      ],
    },
    {
      version: 'v1.2.0',
      title: 'Interactive Note Checklists, Text Styling Drawer & Progress Meter Diagnostics',
      date: 'September 26, 2026',
      isLatest: false,
      items: [
        'Implemented interactive note checklists with real-time checkbox toggles directly on note cards and list items.',
        'Built expandable Text Controls Drawer inside Note Workspace with quick tools for board text (bold), text styling, sizes, and color palettes.',
        'Created dual-mode Write & Live Preview tab in Note modal for instant markdown and checklist verification.',
        'Integrated dedicated NoteContentRenderer to format headings, bold/italic text, highlights, and custom text colors cleanly.',
        'Fixed Progress Meter 0-value logging bug to accurately recognize 0 scores across 7-day averages, monthly consistency, and streaks.',
        'Added interactive Quick Score Setter inside Progress Details Modal to easily log or adjust ratings for any date in the heatmap.',
        'Shifted Calendar Agenda below full-width month matrix with side-by-side Completed and Missed habit status cards.',
        'Redesigned the full-screen Overall Progress Analytics Command Center with cross-meter 0–100% normalization, momentum trajectory curves, bento performance maps, and balance matrices.',
        'Cleaned up progress meter workspace by removing unused legacy analytics imports and hardening type definitions.',
      ],
    },
    {
      version: 'v1.1.9',
      title: 'Redesigned Overall Progress Command Center & Normalization Engine',
      date: 'September 26, 2026',
      isLatest: false,
      items: [
        'Redesigned Overall Progress Analytics into an immersive system-wide command center with strict 0-100% normalized cross-meter calculations.',
        'Added time range selector (7D, 30D, 90D, ALL) with instant recalculation across all analytics modules.',
        'Integrated interactive momentum trajectory area chart with clean date labels and comparative period analysis.',
        'Created Meter Performance Map grid with sparklines and seamless drill-down to individual meter analytics.',
        'Added Contribution Balance and Tracking Consistency analysis with structured distribution progress bars.',
        'Generated automated data-driven system insights and pattern observations.',
        'Upgraded calendar analytics to click-based date inspection to eliminate cursor jitter.',
      ],
    },
    {
      version: 'v1.1.8',
      title: 'Ehsaan Studio Popup Redesign & Workspace Refinements',
      date: 'September 25, 2026',
      isLatest: false,
      items: [
        'Redesigned Ehsaan Studio modal to exactly match reference design: Golden Project Hub banner, squircle project cards, and navy support footer.',
        'Refined Note Cards: Increased minimum card height, added interactive multicolour gradient color picker for background accents.',
        'Renamed "Ehsaan Flow" project to "Ehsaan Website" in the Studio modal.',
        'Enhanced Notes Workspace: Added dedicated categories, pin-to-top, and rich content capabilities.',
        'Added powerful global search bar capable of searching all workflow items (tasks, habits, notes, and journal entries) from one place.',
        'Implemented real-time text highlighting for search matches across notes, journals, and habit cards.',
        'Optimized Ehsaan Studio modal layout with stacked card design and improved touch targets for mobile and tablet screens.',
        'Updated habit and task completion check/tick buttons to a high-attention vibrant orange accent color.',
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

      {/* Enhanced Developer Note */}
      <div className="bg-[#fbf6ef] border border-[#df734c]/30 rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#df734c]/5 rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#df734c]/10 text-[#df734c] rounded-xl">
            <Flame size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#281b18] uppercase tracking-tight">
              Developer Announcement
            </h4>
            <p className="text-xs font-medium text-[#823b28]/80">
              The next version will be launched at 5 January 2027. Any bug and fix request will be accepted.
            </p>
          </div>
        </div>
        
        <a
          href="mailto:worsmon@proton.me"
          className="flex items-center justify-center gap-2 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Heart size={14} fill="currentColor" />
          Contact Developer (worsmon@proton.me)
        </a>
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
