import React from 'react';
import {
  Activity,
  Flame,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  BarChart3,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { Task, JournalEntry, ProgressMeter } from '../types';
import { formatDateStr, isTaskCompletedOnDate } from '../utils/habitUtils';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface DigitalMatricesGridProps {
  tasks: Task[];
  journalEntries: JournalEntry[];
  progressMeters: ProgressMeter[];
}

export const DigitalMatricesGrid: React.FC<DigitalMatricesGridProps> = ({
  tasks,
  journalEntries,
  progressMeters,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completionRatio = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Subtask Depth Calculation
  const allSubtasks = tasks.flatMap((t) => t.subtasks || []);
  const totalSubtasks = allSubtasks.length;
  const completedSubtasks = allSubtasks.filter((s) => s.completed).length;
  const subtaskRatio =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 100;

  // Priority Breakdown
  const highTasks = tasks.filter((t) => t.priority === 'high');
  const highCompleted = highTasks.filter((t) => t.completed).length;
  const highRatio = highTasks.length > 0 ? Math.round((highCompleted / highTasks.length) * 100) : 0;

  const medTasks = tasks.filter((t) => t.priority === 'medium');
  const medCompleted = medTasks.filter((t) => t.completed).length;
  const medRatio = medTasks.length > 0 ? Math.round((medCompleted / medTasks.length) * 100) : 0;

  const lowTasks = tasks.filter((t) => t.priority === 'low');
  const lowCompleted = lowTasks.filter((t) => t.completed).length;
  const lowRatio = lowTasks.length > 0 ? Math.round((lowCompleted / lowTasks.length) * 100) : 0;

  // Day of Week Distribution (Mon to Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayStats = daysOfWeek.map((dayName, dayIndex) => {
    // 0 = Mon, 6 = Sun
    const matchedTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate + 'T00:00:00');
      const idx = (d.getDay() + 6) % 7;
      return idx === dayIndex;
    });

    const completedCount = matchedTasks.filter((t) => t.completed).length;
    const totalCount = matchedTasks.length;
    const ratio = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      dayName,
      totalCount,
      completedCount,
      ratio,
    };
  });

  // Identify peak day of week
  const peakDay = dayStats.reduce((prev, curr) => (curr.totalCount > 0 && curr.ratio > prev.ratio ? curr : prev), dayStats[0]);

  // Streak Calculation (consecutive days with completed tasks)
  const taskDates = Array.from(new Set(tasks.filter((t) => t.completed).map((t) => t.dueDate))).filter(Boolean);
  taskDates.sort();

  let currentStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDateStr(d);
    const hasCompletedOnDay = tasks.some((t) => isTaskCompletedOnDate(t, key));
    if (hasCompletedOnDay) {
      currentStreak++;
    } else if (i === 0) {
      // Check if today hasn't happened yet, allow checking yesterday
      continue;
    } else {
      break;
    }
  }

  // 7-day velocity
  const last7DaysKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7DaysKeys.push(formatDateStr(d));
  }
  const tasks7D = tasks.filter((t) => last7DaysKeys.includes(t.dueDate));
  const completed7D = tasks7D.filter((t) => t.completed).length;
  const ratio7D = tasks7D.length > 0 ? Math.round((completed7D / tasks7D.length) * 100) : completionRatio;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Velocity & Execution Digital Matrix (6-Column Bento Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Overall Ratio */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28]">
              OVERALL RATIO
            </span>
            <div className="flex items-center gap-1">
              <AnalyticInfoButton
                explanation={{
                  ...ANALYTIC_EXPLANATIONS.overallTaskCompletion,
                  currentValue: `${completionRatio}% (${completedTasks.length}/${totalTasks})`,
                }}
                variant="icon"
                iconSize={12}
              />
              <Percent size={13} className="text-[#df734c]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#281b18]">
              {completionRatio}%
            </span>
          </div>
          <div className="w-full bg-[#edd8c2] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#df734c] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRatio}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-[#823b28]/70 mt-1.5 truncate">
            {completedTasks.length} of {totalTasks} tasks done
          </span>
        </div>

        {/* Metric 2: 7-Day Rolling Ratio */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28]">
              7D VELOCITY
            </span>
            <div className="flex items-center gap-1">
              <AnalyticInfoButton
                explanation={{
                  category: 'VELOCITY ANALYTICS',
                  title: '7-Day Rolling Velocity Rate',
                  formula: 'Velocity Rate (%) = (Tasks Completed in Past 7 Days / Total Tasks Scheduled in Past 7 Days) × 100',
                  description: 'Tracks weekly momentum across the last 7 calendar days.',
                  dataPoints: ['Tasks with dueDate in past 7 days', 'Task completion status'],
                  currentValue: `${ratio7D}% (${completed7D} completed)`,
                  tips: ['Sustained 7-day velocity above 70% prevents task backlog accumulation.'],
                }}
                variant="icon"
                iconSize={12}
              />
              <TrendingUp size={13} className="text-emerald-700 font-bold" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-800">
              {ratio7D}%
            </span>
          </div>
          <div className="w-full bg-[#edd8c2] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${ratio7D}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-[#823b28]/70 mt-1.5 truncate">
            {completed7D} resolved this week
          </span>
        </div>

        {/* Metric 3: Active Streak */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28]">
              ACTIVE STREAK
            </span>
            <div className="flex items-center gap-1">
              <AnalyticInfoButton
                explanation={{
                  ...ANALYTIC_EXPLANATIONS.habitCurrentStreak,
                  title: 'Consecutive Daily Task Execution',
                  currentValue: `${currentStreak} Days`,
                }}
                variant="icon"
                iconSize={12}
              />
              <Flame size={13} className="text-[#df734c]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#df734c]">
              {currentStreak}
            </span>
            <span className="font-mono text-xs text-[#823b28] ml-1 font-bold">
              {currentStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#823b28]/70 truncate">
            Consecutive daily execution
          </span>
        </div>

        {/* Metric 4: Subtask Depth */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28]">
              SUBTASK DEPTH
            </span>
            <div className="flex items-center gap-1">
              <AnalyticInfoButton
                explanation={{
                  category: 'DECOMPOSITION METRICS',
                  title: 'Subtask Completion Depth Ratio',
                  formula: 'Subtask Depth (%) = (Completed Subtasks / Total Created Subtasks) × 100',
                  description: 'Measures granularity and progress on multi-step task outcomes.',
                  dataPoints: ['Task.subtasks array elements across all tasks'],
                  currentValue: `${subtaskRatio}% (${completedSubtasks}/${totalSubtasks})`,
                  tips: ['Breaking complex tasks into subtasks improves focus and completion speed.'],
                }}
                variant="icon"
                iconSize={12}
              />
              <Zap size={13} className="text-amber-700" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#281b18]">
              {subtaskRatio}%
            </span>
          </div>
          <div className="w-full bg-[#edd8c2] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#823b28] h-full rounded-full transition-all duration-500"
              style={{ width: `${subtaskRatio}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-[#823b28]/70 mt-1.5 truncate">
            {completedSubtasks} / {totalSubtasks} subtasks
          </span>
        </div>

        {/* Metric 5: High Priority Rate */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28]">
              HIGH PRIORITY
            </span>
            <div className="flex items-center gap-1">
              <AnalyticInfoButton
                explanation={{
                  category: 'PRIORITY MATRIX',
                  title: 'High Priority Resolution Rate',
                  formula: 'Priority Rate (%) = (Completed High Priority Tasks / Total High Priority Tasks) × 100',
                  description: 'Measures your focus on high-impact, critical outcomes.',
                  dataPoints: ['Task.priority === "high"', 'Task.completed'],
                  currentValue: `${highRatio}% (${highCompleted}/${highTasks.length})`,
                  tips: ['Resolve high priority tasks early in the day when willpower is highest.'],
                }}
                variant="icon"
                iconSize={12}
              />
              <AlertCircle size={13} className="text-[#df734c]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#df734c]">
              {highRatio}%
            </span>
          </div>
          <div className="w-full bg-[#edd8c2] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#df734c] h-full rounded-full transition-all duration-500"
              style={{ width: `${highRatio}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-[#823b28]/70 mt-1.5 truncate">
            {highCompleted} / {highTasks.length} critical items
          </span>
        </div>

        {/* Metric 6: Reflection Cadence */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#823b28]">
              REFLECTIONS
            </span>
            <div className="flex items-center gap-1">
              <AnalyticInfoButton
                explanation={{
                  ...ANALYTIC_EXPLANATIONS.journalConsistency,
                  currentValue: `${journalEntries.length} Saved Entries`,
                }}
                variant="icon"
                iconSize={12}
              />
              <Compass size={13} className="text-[#823b28]" />
            </div>
          </div>
          <div className="my-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#823b28]">
              {journalEntries.length}
            </span>
            <span className="font-mono text-xs text-[#823b28]/70 ml-1 font-bold">
              Logs
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#823b28]/70 truncate">
            {progressMeters.length} active meters
          </span>
        </div>
      </div>

      {/* 2. Priority Heat Breakdown & Day-of-Week Efficiency Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Matrix Card */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest block">
                  PRIORITY SEGMENTATION
                </span>
                <h4 className="text-lg font-extrabold text-[#281b18] font-sans">
                  Completion by Priority Tier
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-[#823b28] bg-[#edd8c2] px-3 py-1 rounded-full">
                3 Tiers
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* High Priority */}
              <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#df734c]" />
                    <span className="font-mono text-xs font-bold text-[#281b18] uppercase">
                      High Priority
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#df734c]">
                    {highCompleted} / {highTasks.length} ({highRatio}%)
                  </span>
                </div>
                <div className="w-full bg-[#edd8c2] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#df734c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${highRatio}%` }}
                  />
                </div>
              </div>

              {/* Medium Priority */}
              <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#422119]" />
                    <span className="font-mono text-xs font-bold text-[#281b18] uppercase">
                      Medium Priority
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#422119]">
                    {medCompleted} / {medTasks.length} ({medRatio}%)
                  </span>
                </div>
                <div className="w-full bg-[#edd8c2] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#422119] h-full rounded-full transition-all duration-500"
                    style={{ width: `${medRatio}%` }}
                  />
                </div>
              </div>

              {/* Low Priority */}
              <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e40af]" />
                    <span className="font-mono text-xs font-bold text-[#281b18] uppercase">
                      Low Priority
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#1e40af]">
                    {lowCompleted} / {lowTasks.length} ({lowRatio}%)
                  </span>
                </div>
                <div className="w-full bg-[#edd8c2] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1e40af] h-full rounded-full transition-all duration-500"
                    style={{ width: `${lowRatio}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#281b18]/10 flex items-center justify-between text-[11px] font-mono text-[#823b28]">
            <span>Focus on clearing high priority items first</span>
            <ShieldCheck size={14} />
          </div>
        </div>

        {/* Day-of-Week Efficiency Histogram Matrix */}
        <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest block">
                  TEMPORAL DISTRIBUTION
                </span>
                <h4 className="text-lg font-extrabold text-[#281b18] font-sans">
                  Weekday Efficiency Matrix
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-[#df734c] bg-[#df734c]/10 border border-[#df734c]/30 px-3 py-1 rounded-full">
                Peak: {peakDay.dayName} ({peakDay.ratio}%)
              </span>
            </div>

            {/* 7 Columns Digital Histogram */}
            <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-4">
              <div className="flex items-end justify-between gap-2 h-36 pt-2">
                {dayStats.map((d) => {
                  const isPeak = d.dayName === peakDay.dayName && peakDay.ratio > 0;

                  return (
                    <div
                      key={d.dayName}
                      className="flex-1 flex flex-col items-center gap-2 justify-end h-full group"
                    >
                      {/* Tooltip on hover */}
                      <span className="font-mono text-[9px] font-black text-[#823b28] opacity-80 group-hover:opacity-100 transition-opacity">
                        {d.ratio}%
                      </span>

                      {/* Bar Track */}
                      <div className="w-full bg-[#edd8c2] rounded-xl h-24 flex items-end overflow-hidden p-0.5 border border-[#281b18]/10">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isPeak
                              ? 'bg-[#823b28]'
                              : d.ratio >= 50
                              ? 'bg-[#df734c]'
                              : 'bg-[#eb9d7d]'
                          }`}
                          style={{
                            height: d.ratio > 0 ? `${Math.max(12, d.ratio)}%` : '0%',
                          }}
                        />
                      </div>

                      {/* Day Label */}
                      <span
                        className={`font-mono text-[11px] font-bold uppercase ${
                          isPeak ? 'text-[#823b28] font-black underline' : 'text-[#823b28]/80'
                        }`}
                      >
                        {d.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#281b18]/10 flex items-center justify-between text-[11px] font-mono text-[#823b28]">
            <span>Calculates completion performance per day of week</span>
            <BarChart3 size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
