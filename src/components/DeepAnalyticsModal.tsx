import React, { useState } from 'react';
import { ArrowLeft, Compass, TrendingUp, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Habit } from '../types';
import { formatDateStr } from '../utils/habitUtils';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';
import {
  calculateOverallConsistencyTrend,
  calculateOverallMissedOpportunities,
  calculateOverallRecentMomentum,
  calculateHabitConsistencyTrend,
  calculateHabitMissedOpportunities,
  calculateHabitRecoveryAfterMiss,
  calculateHabitRecentMomentum,
  TrendChartPoint,
} from '../utils/deepAnalyticsUtils';

interface DeepAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'overall' | 'individual';
  habits?: Habit[];
  habit?: Habit;
  todayStr?: string;
}

export const DeepAnalyticsModal: React.FC<DeepAnalyticsModalProps> = ({
  isOpen,
  onClose,
  mode,
  habits = [],
  habit,
  todayStr = formatDateStr(new Date()),
}) => {
  const [daysRange, setDaysRange] = useState<number>(30); // 7, 30, 90
  const [hoveredPoint, setHoveredPoint] = useState<TrendChartPoint | null>(null);

  if (!isOpen) return null;

  const isIndividual = mode === 'individual' && habit;

  // Calculate metrics based on mode
  const consistencyTrendData = isIndividual
    ? calculateHabitConsistencyTrend(habit, daysRange, todayStr)
    : calculateOverallConsistencyTrend(habits, daysRange, todayStr);

  const missedData = isIndividual
    ? calculateHabitMissedOpportunities(habit, todayStr)
    : calculateOverallMissedOpportunities(habits, todayStr);

  const momentumData = isIndividual
    ? calculateHabitRecentMomentum(habit, todayStr)
    : calculateOverallRecentMomentum(habits, todayStr);

  const recoveryData = isIndividual
    ? calculateHabitRecoveryAfterMiss(habit, todayStr)
    : null;

  // Header Titles
  const mainTitle = isIndividual ? habit.name : 'Overall Progress';
  const mainSubtitle = isIndividual
    ? `${consistencyTrendData.currentConsistency}% Habit consistency`
    : `${consistencyTrendData.currentConsistency}% Overall consistency`;

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 35;
  const paddingY = 25;

  const chartPoints = consistencyTrendData.chartPoints;

  // Render SVG Path for line and area
  const getChartPath = () => {
    if (chartPoints.length < 2) return { linePath: '', areaPath: '', coords: [] };

    const usableWidth = svgWidth - paddingX * 2;
    const usableHeight = svgHeight - paddingY * 2;

    const coords = chartPoints.map((pt, idx) => {
      const x = paddingX + (idx / (chartPoints.length - 1)) * usableWidth;
      const y = svgHeight - paddingY - (pt.value / 100) * usableHeight;
      return { x, y, pt };
    });

    const linePath = coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;

    return { linePath, areaPath, coords };
  };

  const { linePath, areaPath, coords } = getChartPath();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 bg-black/50 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full h-full bg-[#f6e9d7] p-4 sm:p-8 text-[#281b18] overflow-hidden flex flex-col">
        
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#281b18]/15 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] font-mono text-xs font-bold transition-all cursor-pointer shadow-2xs group"
              title="Return to analytics"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>BACK</span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#df734c]" />
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#823b28]">
                  GO MORE DEEP
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-[#281b18] tracking-tight uppercase">
                {mainTitle}
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Close deep view"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Workspace */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 sm:pr-3 space-y-8 max-w-4xl mx-auto w-full pb-12">
          
          {/* Main Hero Summary Card */}
          <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#823b28]/70 block mb-1">
                {isIndividual ? 'Habit Consistency' : 'Overall Consistency'}
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-6xl font-black text-[#281b18] tracking-tight">
                  {consistencyTrendData.currentConsistency}%
                </span>
                <span className="text-sm font-bold text-[#823b28] bg-[#edd8c2]/70 px-3 py-1 rounded-full font-mono">
                  {consistencyTrendData.diffPp >= 0 ? `+${consistencyTrendData.diffPp}` : consistencyTrendData.diffPp} pp vs prev
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-mono font-bold text-[#823b28]/80 uppercase block">
                Tracked Scheduled Days
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#281b18]">
                {missedData.scheduled} Days
              </span>
            </div>
          </div>

          {/* ───────────────────────────── */}
          {/* A. CONSISTENCY TREND */}
          {/* ───────────────────────────── */}
          <section className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#823b28]">
                    CONSISTENCY TREND
                  </h2>
                  <AnalyticInfoButton
                    explanation={{
                      ...ANALYTIC_EXPLANATIONS.overallHabitConsistency,
                      currentValue: `${consistencyTrendData.currentConsistency}% (${consistencyTrendData.diffPp >= 0 ? '+' : ''}${consistencyTrendData.diffPp} pp)`,
                    }}
                    variant="icon"
                    iconSize={13}
                  />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[#281b18] mt-1">
                  {consistencyTrendData.currentConsistency}%
                </p>
                <p className="text-xs font-medium text-[#281b18]/70 mt-0.5">
                  {isIndividual ? (
                    <>Current period: <strong className="text-[#281b18]">{consistencyTrendData.currentConsistency}%</strong> · Previous period: <strong className="text-[#281b18]">{consistencyTrendData.previousConsistency}%</strong> · <span className="font-bold text-[#823b28]">{consistencyTrendData.diffPp >= 0 ? `↑ +${consistencyTrendData.diffPp} pp` : `↓ ${consistencyTrendData.diffPp} pp`}</span></>
                  ) : (
                    <>
                      <span className="font-bold text-[#823b28]">
                        {consistencyTrendData.diffPp >= 0 ? `↑ +${consistencyTrendData.diffPp}` : `↓ ${consistencyTrendData.diffPp}`} percentage points
                      </span>{' '}
                      compared with previous period
                    </>
                  )}
                </p>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1.5 bg-[#edd8c2]/60 p-1 rounded-2xl border border-[#281b18]/10 self-start sm:self-center">
                {[7, 30, 90].map((r) => (
                  <button
                    key={r}
                    onClick={() => setDaysRange(r)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                      daysRange === r
                        ? 'bg-[#823b28] text-[#fbf6ef] shadow-2xs'
                        : 'text-[#281b18]/70 hover:text-[#281b18] hover:bg-[#edd8c2]'
                    }`}
                  >
                    {r} DAYS
                  </button>
                ))}
              </div>
            </div>

            {/* Simple Restrained Area/Line Chart */}
            <div className="relative w-full pt-2">
              {hoveredPoint && (
                <div className="absolute top-0 right-2 bg-[#281b18] text-[#fbf6ef] px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md z-10 animate-in fade-in duration-150">
                  {hoveredPoint.label}: {hoveredPoint.value}% ({hoveredPoint.completed}/{hoveredPoint.scheduled} done)
                </div>
              )}

              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto overflow-visible"
              >
                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = svgHeight - paddingY - (val / 100) * (svgHeight - paddingY * 2);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#281b18"
                        strokeOpacity="0.08"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fontSize="9"
                        fontFamily="monospace"
                        fill="#281b18"
                        fillOpacity="0.4"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Area Fill */}
                {areaPath && (
                  <path d={areaPath} fill="#df734c" fillOpacity="0.12" />
                )}

                {/* Line Path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#823b28"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Dots */}
                {coords.map((c, idx) => (
                  <g key={idx}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="4"
                      fill="#fbf6ef"
                      stroke="#823b28"
                      strokeWidth="2"
                      className="transition-transform hover:scale-150 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(c.pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* X-axis labels */}
                    <text
                      x={c.x}
                      y={svgHeight - 6}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill="#281b18"
                      fillOpacity="0.6"
                      textAnchor="middle"
                    >
                      {c.pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </section>

          {/* ───────────────────────────── */}
          {/* B. MISSED OPPORTUNITIES */}
          {/* ───────────────────────────── */}
          <section className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#823b28]">
                    MISSED OPPORTUNITIES
                  </h2>
                  <AnalyticInfoButton
                    explanation={{
                      category: 'MISSED OPPORTUNITIES',
                      title: 'Missed Opportunities Logic',
                      formula: 'Missed Opportunities = Scheduled Active Days - Completed Check-in Days',
                      description: 'Evaluates missed opportunities strictly on expected target days.',
                      dataPoints: ['Habit target frequency days', 'Habit.completedDates[]'],
                      currentValue: `${missedData.missed} Missed / ${missedData.scheduled} Scheduled (${missedData.missedPct}%)`,
                    }}
                    variant="icon"
                    iconSize={13}
                  />
                </div>
                <p className="text-xs text-[#281b18]/70 mt-1 font-medium">
                  Calculated exclusively from scheduled target days up to today.
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-[#823b28] bg-[#edd8c2]/80 px-3.5 py-1.5 rounded-2xl border border-[#281b18]/10 self-start sm:self-auto">
                {missedData.scheduled} scheduled · {missedData.completed} completed · {missedData.missed} missed
              </div>
            </div>

            {/* Visual Bar Split */}
            <div className="space-y-3 pt-2">
              <div className="w-full h-8 bg-[#edd8c2] rounded-2xl overflow-hidden flex border border-[#281b18]/15 p-1">
                <div
                  className="bg-[#823b28] h-full rounded-xl transition-all duration-500 flex items-center justify-end pr-2 text-[11px] font-mono font-bold text-[#fbf6ef]"
                  style={{ width: `${Math.max(5, missedData.completedPct)}%` }}
                >
                  {missedData.completedPct > 10 && `${missedData.completedPct}%`}
                </div>
                <div
                  className="bg-[#df734c]/30 h-full rounded-xl transition-all duration-500 flex items-center justify-start pl-2 text-[11px] font-mono font-bold text-[#823b28]"
                  style={{ width: `${Math.max(0, 100 - missedData.completedPct)}%` }}
                >
                  {missedData.missedPct > 10 && `${missedData.missedPct}%`}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#281b18]/80 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#823b28] inline-block" />
                  <span>COMPLETED ({missedData.completedPct}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-[#df734c]/30 border border-[#823b28]/30 inline-block" />
                  <span>MISSED ({missedData.missedPct}%)</span>
                </div>
              </div>
            </div>
          </section>

          {/* ───────────────────────────── */}
          {/* C. RECOVERY AFTER A MISS (INDIVIDUAL ONLY) */}
          {/* ───────────────────────────── */}
          {isIndividual && recoveryData && (
            <section className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#823b28]">
                  RECOVERY AFTER A MISS
                </h2>
                <p className="text-xs text-[#281b18]/70 mt-1 font-medium">
                  Measures your resilience and speed returning to the habit after breaking a streak.
                </p>
              </div>

              {!recoveryData.hasData ? (
                <div className="bg-[#edd8c2]/40 border border-dashed border-[#281b18]/20 rounded-2xl p-6 text-center">
                  <p className="text-xs font-mono font-bold text-[#823b28]">
                    Not enough historical miss data yet.
                  </p>
                  <p className="text-xs text-[#281b18]/60 mt-1">
                    Keep tracking to unlock this recovery resilience insight!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#edd8c2]/50 border border-[#281b18]/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#823b28] uppercase">
                      Average Recovery
                    </span>
                    <div className="mt-2">
                      <span className="text-3xl font-black text-[#281b18]">
                        {recoveryData.averageDays}
                      </span>
                      <span className="text-xs font-bold text-[#823b28] ml-1">days</span>
                    </div>
                    <span className="text-[10px] text-[#281b18]/60 mt-1">
                      Average gap before returning
                    </span>
                  </div>

                  <div className="bg-[#edd8c2]/50 border border-[#281b18]/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#823b28] uppercase">
                      Longest Recovery
                    </span>
                    <div className="mt-2">
                      <span className="text-3xl font-black text-[#281b18]">
                        {recoveryData.longestDays}
                      </span>
                      <span className="text-xs font-bold text-[#823b28] ml-1">days</span>
                    </div>
                    <span className="text-[10px] text-[#281b18]/60 mt-1">
                      Longest gap recorded
                    </span>
                  </div>

                  <div className="bg-[#edd8c2]/50 border border-[#281b18]/10 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#823b28] uppercase">
                      Recent Recovery
                    </span>
                    <div className="mt-2">
                      <span className="text-3xl font-black text-[#281b18]">
                        {recoveryData.recentDays}
                      </span>
                      <span className="text-xs font-bold text-[#823b28] ml-1">day{recoveryData.recentDays === 1 ? '' : 's'}</span>
                    </div>
                    <span className="text-[10px] text-[#281b18]/60 mt-1">
                      Speed after latest miss
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ───────────────────────────── */}
          {/* D. RECENT MOMENTUM */}
          {/* ───────────────────────────── */}
          <section className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#823b28]">
                  RECENT MOMENTUM
                </h2>
                <p className="text-xs text-[#281b18]/70 mt-1 font-medium">
                  Compares recent 14-day completion performance against the previous 14 days.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#823b28] text-[#fbf6ef] font-mono text-xs font-black tracking-wider uppercase shadow-2xs">
                <span>{momentumData.symbol}</span>
                <span>{momentumData.state}</span>
              </div>
            </div>

            <div className="bg-[#edd8c2]/40 border border-[#281b18]/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-[#281b18]/80">
                  {isIndividual ? 'Last 14 days:' : 'Current 14 days:'}{' '}
                  <strong className="text-[#281b18] text-sm font-bold">{momentumData.currentPct}%</strong>
                </div>
                <div className="text-xs font-mono text-[#281b18]/80">
                  Previous 14 days:{' '}
                  <strong className="text-[#281b18] text-sm font-bold">{momentumData.previousPct}%</strong>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl sm:text-3xl font-black text-[#823b28] font-mono">
                  {momentumData.diffPp >= 0 ? `+${momentumData.diffPp}` : momentumData.diffPp} pp
                </span>
                <span className="text-[10px] font-mono font-bold text-[#281b18]/60 block uppercase">
                  Net momentum delta
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
