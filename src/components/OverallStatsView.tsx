import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Award,
  Zap,
  CheckCheck,
  Target,
  Search,
  ListTree,
  Filter,
} from 'lucide-react';
import { AppData, Priority, Task } from '../types';
import { addDays, formatDisplayDate, getTodayKey } from '../utils/dateUtils';
import { COLOR_OPTIONS, PRIORITY_CONFIG } from '../utils/colorUtils';

interface PieChartItem {
  id: string;
  label: string;
  value: number;
  completedValue?: number;
  color: string;
}

interface PieChartProps {
  title: string;
  subtitle: string;
  items: PieChartItem[];
  centerLabel?: string;
}

const PieChartCard: React.FC<PieChartProps> = ({ title, subtitle, items, centerLabel = 'Tasks' }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.value, 0);

  // Geometry calculations
  const cx = 100;
  const cy = 100;
  const rOut = 80;
  const rIn = 48;

  let currentAngle = 0;
  const slices = items.map((item) => {
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const delta = Math.min(Math.max(endAngle - startAngle, 0), 359.999);
    const actualEnd = startAngle + delta;

    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180.0;
    const p1 = { x: cx + rOut * Math.cos(toRad(startAngle)), y: cy + rOut * Math.sin(toRad(startAngle)) };
    const p2 = { x: cx + rOut * Math.cos(toRad(actualEnd)), y: cy + rOut * Math.sin(toRad(actualEnd)) };
    const p3 = { x: cx + rIn * Math.cos(toRad(actualEnd)), y: cy + rIn * Math.sin(toRad(actualEnd)) };
    const p4 = { x: cx + rIn * Math.cos(toRad(startAngle)), y: cy + rIn * Math.sin(toRad(startAngle)) };
    const largeArcFlag = delta <= 180 ? '0' : '1';

    const pathData =
      total > 0 && item.value > 0
        ? [
            'M', p1.x, p1.y,
            'A', rOut, rOut, 0, largeArcFlag, 1, p2.x, p2.y,
            'L', p3.x, p3.y,
            'A', rIn, rIn, 0, largeArcFlag, 0, p4.x, p4.y,
            'Z',
          ].join(' ')
        : '';

    const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

    return {
      ...item,
      pathData,
      percent,
    };
  });

  const activeHoverItem = hoveredId ? items.find((i) => i.id === hoveredId) : null;

  return (
    <section className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-neutral-950 dark:text-white">{title}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
      </div>

      {total === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-neutral-400 italic">No task data available</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* SVG Pie / Donut Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              {slices.map((slice) => {
                if (!slice.pathData) return null;
                const isHovered = hoveredId === slice.id;
                return (
                  <path
                    key={slice.id}
                    d={slice.pathData}
                    fill={slice.color}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: hoveredId && !isHovered ? 0.35 : 1,
                      transformOrigin: '100px 100px',
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    }}
                    onMouseEnter={() => setHoveredId(slice.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {activeHoverItem ? (
                <>
                  <span className="text-xl font-black text-neutral-950 dark:text-white">
                    {activeHoverItem.value}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 max-w-[70px] truncate">
                    {activeHoverItem.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-neutral-950 dark:text-white">
                    {total}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {centerLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color-Coded Legend List */}
          <div className="flex-1 w-full space-y-2">
            {slices.map((slice) => {
              const isHovered = hoveredId === slice.id;
              return (
                <div
                  key={slice.id}
                  onMouseEnter={() => setHoveredId(slice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-700'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {slice.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold shrink-0">
                    <span className="text-neutral-500">{slice.percent}%</span>
                    <span className="text-neutral-950 dark:text-white font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md">
                      {slice.completedValue !== undefined
                        ? `${slice.completedValue}/${slice.value}`
                        : slice.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

interface OverallStatsViewProps {
  data: AppData;
  todayStr: string;
}

export const OverallStatsView: React.FC<OverallStatsViewProps> = ({
  data,
  todayStr,
}) => {
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState('all');

  const totalTasks = data.tasks.length;
  const completedTasks = useMemo(() => data.tasks.filter((t) => t.completed), [data.tasks]);
  const completedCount = completedTasks.length;
  const openCount = totalTasks - completedCount;
  const overdueCount = data.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const overallRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // On-time completions: completed tasks where completedAt <= dueDate
  const onTimeCount = completedTasks.filter((t) => {
    if (!t.completedAt || !t.dueDate) return true;
    return t.completedAt <= t.dueDate;
  }).length;
  const onTimeRate = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 100;

  // Subtask statistics
  const totalSubtasks = data.tasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0);
  const completedSubtasks = data.tasks.reduce(
    (sum, t) => sum + (t.subtasks?.filter((s) => s.completed).length || 0),
    0
  );
  const subtaskRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // TickTick-style Achievement Score calculation
  // Base points: 10 pts per completed task, +5 pts bonus for on-time completion, +2 pts per completed subtask
  const productivityScore = useMemo(() => {
    return completedCount * 10 + onTimeCount * 5 + completedSubtasks * 2;
  }, [completedCount, onTimeCount, completedSubtasks]);

  // Achievement Tiers
  const tier = useMemo(() => {
    if (productivityScore >= 800) return { name: 'Grandmaster', badge: '👑', nextScore: 1500, minScore: 800 };
    if (productivityScore >= 400) return { name: 'Master', badge: '🥇', nextScore: 800, minScore: 400 };
    if (productivityScore >= 150) return { name: 'Achiever', badge: '🥈', nextScore: 400, minScore: 150 };
    return { name: 'Novice', badge: '🥉', nextScore: 150, minScore: 0 };
  }, [productivityScore]);

  const tierProgress = Math.min(
    Math.round(((productivityScore - tier.minScore) / (tier.nextScore - tier.minScore)) * 100),
    100
  );

  // Category map
  const categoryMap = useMemo(() => new Map(data.categories.map((c) => [c.id, c])), [data.categories]);

  // Tasks by priority breakdown
  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
  const priorityStats = priorities.map((p) => {
    const matching = data.tasks.filter((t) => t.priority === p);
    const done = matching.filter((t) => t.completed).length;
    const rate = matching.length > 0 ? Math.round((done / matching.length) * 100) : 0;
    return {
      priority: p,
      total: matching.length,
      done,
      rate,
    };
  });

  // Priority Pie Chart Items
  const priorityPieItems: PieChartItem[] = useMemo(() => {
    return [
      {
        id: 'urgent',
        label: 'Urgent',
        value: data.tasks.filter((t) => t.priority === 'urgent').length,
        completedValue: data.tasks.filter((t) => t.priority === 'urgent' && t.completed).length,
        color: PRIORITY_CONFIG.urgent.hex,
      },
      {
        id: 'high',
        label: 'High',
        value: data.tasks.filter((t) => t.priority === 'high').length,
        completedValue: data.tasks.filter((t) => t.priority === 'high' && t.completed).length,
        color: PRIORITY_CONFIG.high.hex,
      },
      {
        id: 'medium',
        label: 'Medium',
        value: data.tasks.filter((t) => (t.priority || 'medium') === 'medium').length,
        completedValue: data.tasks.filter((t) => (t.priority || 'medium') === 'medium' && t.completed).length,
        color: PRIORITY_CONFIG.medium.hex,
      },
      {
        id: 'low',
        label: 'Low',
        value: data.tasks.filter((t) => t.priority === 'low').length,
        completedValue: data.tasks.filter((t) => t.priority === 'low' && t.completed).length,
        color: PRIORITY_CONFIG.low.hex,
      },
    ].filter((p) => p.value > 0);
  }, [data.tasks]);

  // Category Pie Chart Items with Category Colors
  const categoryPieItems: PieChartItem[] = useMemo(() => {
    return data.categories
      .map((cat) => {
        const matching = data.tasks.filter((t) => t.category === cat.id);
        const cScheme = COLOR_OPTIONS[cat.color] || COLOR_OPTIONS.emerald;
        return {
          id: cat.id,
          label: cat.name,
          value: matching.length,
          completedValue: matching.filter((t) => t.completed).length,
          color: cScheme.accentHex,
        };
      })
      .filter((c) => c.value > 0);
  }, [data.categories, data.tasks]);

  // 14-day task completion trend (TickTick style 2-week view)
  const past14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const dStr = addDays(todayStr, -(13 - i));
      const completedOnDay = data.tasks.filter((t) => t.completed && t.completedAt === dStr).length;
      const dueOnDay = data.tasks.filter((t) => t.dueDate === dStr).length;
      return {
        dateStr: dStr,
        completedCount: completedOnDay,
        dueCount: dueOnDay,
        dayLabel: formatDisplayDate(dStr, 'weekday').slice(0, 3),
        dateShort: dStr.slice(5),
      };
    });
  }, [data.tasks, todayStr]);

  const maxCompletedDaily = Math.max(...past14Days.map((d) => d.completedCount), 1);

  // Average velocity (tasks completed per day over last 14 days)
  const last14DaysTotalCompleted = past14Days.reduce((acc, curr) => acc + curr.completedCount, 0);
  const dailyVelocity = (last14DaysTotalCompleted / 14).toFixed(1);

  // Peak Productivity Analysis: Most productive day of week
  const dayOfWeekCount: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  completedTasks.forEach((t) => {
    if (t.completedAt) {
      const dayName = formatDisplayDate(t.completedAt, 'weekday');
      if (dayOfWeekCount[dayName] !== undefined) {
        dayOfWeekCount[dayName]++;
      }
    }
  });

  const peakDayEntry = Object.entries(dayOfWeekCount).sort((a, b) => b[1] - a[1])[0];
  const peakDayName = peakDayEntry && peakDayEntry[1] > 0 ? peakDayEntry[0] : 'Consistent';

  // Tag Analytics
  const tagMap = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    data.tasks.forEach((t) => {
      t.tags?.forEach((tag) => {
        const existing = map.get(tag) || { total: 0, done: 0 };
        map.set(tag, {
          total: existing.total + 1,
          done: existing.done + (t.completed ? 1 : 0),
        });
      });
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        done: stats.done,
        rate: Math.round((stats.done / stats.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [data.tasks]);

  // Filtered completed log
  const filteredCompletedLog = useMemo(() => {
    return completedTasks
      .filter((task) => {
        if (logSearchQuery.trim()) {
          const q = logSearchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchNotes = task.notes?.toLowerCase().includes(q);
          if (!matchTitle && !matchNotes) return false;
        }
        if (logCategoryFilter !== 'all' && task.category !== logCategoryFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (b.completedAt || b.dueDate).localeCompare(a.completedAt || a.dueDate));
  }, [completedTasks, logSearchQuery, logCategoryFilter]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Productivity & Insights
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            TickTick-grade performance metrics, achievement scores, velocity, and execution trends.
          </p>
        </div>

        {/* Achievement Badge Banner */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="text-2xl">{tier.badge}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {tier.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold">
                {productivityScore} pts
              </span>
            </div>
            <div className="w-28 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards (4 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completion Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {overallRate}%
          </p>
          <span className="text-[11px] text-neutral-400">
            {completedCount} of {totalTasks} finished
          </span>
        </div>

        {/* On-Time Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              On-Time Rate
            </span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {onTimeRate}%
          </p>
          <span className="text-[11px] text-neutral-400">
            {onTimeCount} delivered on time
          </span>
        </div>

        {/* Subtask Execution */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Sub-Tasks
            </span>
            <ListTree className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {subtaskRate}%
          </p>
          <span className="text-[11px] text-neutral-400">
            {completedSubtasks} of {totalSubtasks} subtasks done
          </span>
        </div>

        {/* Daily Velocity */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Velocity
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {dailyVelocity}
          </p>
          <span className="text-[11px] text-neutral-400">
            Avg tasks / day (14-day)
          </span>
        </div>
      </div>

      {/* 14-Day Completion Trend & Velocity Chart */}
      <section className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neutral-500" />
              <span>14-Day Completion Velocity</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Daily completed tasks plotted against planned task volume.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-neutral-900 dark:bg-white inline-block" />
              <span className="text-neutral-600 dark:text-neutral-300">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-neutral-300 dark:bg-neutral-700 inline-block" />
              <span className="text-neutral-500">Scheduled Due</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-14 gap-1 sm:gap-2 pt-4 items-end h-40">
          {past14Days.map((d) => {
            const heightPercent = Math.max(Math.round((d.completedCount / maxCompletedDaily) * 100), 8);
            const isToday = d.dateStr === todayStr;

            return (
              <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-700 dark:text-neutral-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.completedCount}
                </span>

                <div className="w-full max-w-[28px] bg-neutral-100 dark:bg-neutral-800 rounded-t-lg overflow-hidden flex items-end flex-1">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-neutral-900 dark:bg-white'
                        : d.completedCount > 0
                        ? 'bg-neutral-700 dark:bg-neutral-400'
                        : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                    style={{ height: `${d.completedCount > 0 ? heightPercent : 4}%` }}
                  />
                </div>

                <span
                  className={`text-[9px] sm:text-[10px] mt-1.5 font-mono ${
                    isToday ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-400'
                  }`}
                >
                  {d.dateShort.slice(3)}
                </span>
                <span className="text-[8px] text-neutral-400 hidden sm:block">
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rhythm & Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Peak Rhythm */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
              Peak Focus Day
            </span>
            <span className="text-base font-bold text-neutral-900 dark:text-white">
              {peakDayName}
            </span>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Highest density of checked-off items occurs on this day.
            </p>
          </div>
        </div>

        {/* Task Velocity Insight */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
              Momentum & Execution
            </span>
            <span className="text-base font-bold text-neutral-900 dark:text-white">
              {overdueCount === 0 ? 'Zero Overdue backlog' : `${overdueCount} Overdue item(s)`}
            </span>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {overdueCount === 0
                ? 'Excellent work maintaining all active due dates on schedule.'
                : 'Consider rescheduling or clearing overdue tasks to maintain momentum.'}
            </p>
          </div>
        </div>
      </div>

      {/* Priority & Category Pie Chart Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Pie Chart */}
        <PieChartCard
          title="Tasks by Priority (Pie Chart)"
          subtitle="Distribution of tasks across priority urgency levels"
          items={priorityPieItems}
          centerLabel="Priority"
        />

        {/* Category Pie Chart */}
        <PieChartCard
          title="Tasks by Category (Pie Chart)"
          subtitle="Task allocation across lists and life areas"
          items={categoryPieItems}
          centerLabel="Category"
        />
      </div>

      {/* Tag Analytics if tags exist */}
      {tagMap.length > 0 && (
        <section className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Tag Analytics
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {tagMap.map((t) => (
              <div
                key={t.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700/80 text-xs"
              >
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  #{t.name}
                </span>
                <span className="text-neutral-400 text-[11px]">
                  {t.done}/{t.total} ({t.rate}%)
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filterable Completed Tasks Activity Log */}
      <section className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Completed Tasks Activity Log
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Historical record of all tasks accomplished.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter past tasks..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none w-36 sm:w-44"
              />
            </div>

            {/* Category */}
            <select
              value={logCategoryFilter}
              onChange={(e) => setLogCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Lists</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredCompletedLog.length === 0 ? (
          <p className="text-xs text-neutral-400 italic py-6 text-center">
            No completed tasks match the current filter.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredCompletedLog.map((task) => {
              const cat = task.category ? categoryMap.get(task.category) : undefined;
              const subCount = task.subtasks?.length || 0;
              const doneSubCount = task.subtasks?.filter((s) => s.completed).length || 0;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800/60 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2] shrink-0" />
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {task.title}
                    </span>

                    {cat && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium shrink-0">
                        {cat.name}
                      </span>
                    )}

                    {subCount > 0 && (
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        ({doneSubCount}/{subCount} subtasks)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 shrink-0 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{task.completedAt || task.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
