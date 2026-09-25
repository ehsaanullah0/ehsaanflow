import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  BarChart2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Layers,
} from 'lucide-react';
import { ProgressMeter, MeasurementType } from '../types';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface ProgressDetailsModalProps {
  meter: ProgressMeter | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateValue: (meterId: string, date: string, value: number) => void;
}

export const ProgressDetailsModal: React.FC<ProgressDetailsModalProps> = ({
  meter,
  isOpen,
  onClose,
  onUpdateValue,
}) => {
  if (!isOpen || !meter) return null;

  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | '90d'>('7d');
  const [isHeatmapExpanded, setIsHeatmapExpanded] = useState<boolean>(false);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);

  // Month navigation for monthly heatmap view
  const [activeMonthDate, setActiveMonthDate] = useState<Date>(() => new Date());

  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{
    date: string;
    value: number;
    formattedDate: string;
    weekday: string;
    level: number;
  } | null>(null);

  // Days count for linear graph and KPI cards
  const daysCount =
    timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 90;

  // Generate continuous date keys backwards from today
  const dateKeys: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dateKeys.push(`${y}-${m}-${day}`);
  }

  const todayStr = dateKeys[dateKeys.length - 1];

  // Max value scale reference
  const maxScale =
    meter.unitType === 'scale_1_5'
      ? 5
      : meter.unitType === 'percentage'
      ? 100
      : meter.goalValue || 10;

  const goalVal = meter.goalValue || (meter.unitType === 'scale_1_5' ? 5 : 100);

  // Extract datapoints
  const dataPoints = dateKeys.map((d) => ({
    date: d,
    value: meter.entries[d] || 0,
    hasLog: d in meter.entries && meter.entries[d] > 0,
  }));

  const activePoints = dataPoints.filter((p) => p.hasLog);
  const activeValues = activePoints.map((p) => p.value);

  // 1. Range Average
  const average =
    activeValues.length > 0
      ? Math.round((activeValues.reduce((a, b) => a + b, 0) / activeValues.length) * 10) / 10
      : 0;

  // 2. Highest / Peak
  let peakVal = 0;
  let peakDate = '—';
  if (activePoints.length > 0) {
    const maxItem = activePoints.reduce((prev, curr) =>
      curr.value > prev.value ? curr : prev
    );
    peakVal = maxItem.value;
    peakDate = new Date(maxItem.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // 3. Lowest / Dip
  let lowestVal = 0;
  let lowestDate = '—';
  if (activePoints.length > 0) {
    const minItem = activePoints.reduce((prev, curr) =>
      curr.value < prev.value ? curr : prev
    );
    lowestVal = minItem.value;
    lowestDate = new Date(minItem.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // 4. Consistency Ratio
  const consistencyPercent = Math.round((activePoints.length / daysCount) * 100);

  // 5. Current Streak
  let streak = 0;
  for (let i = dateKeys.length - 1; i >= 0; i--) {
    const val = meter.entries[dateKeys[i]];
    if (val && val > 0) {
      streak++;
    } else {
      break;
    }
  }

  // 6. Trend Momentum
  const halfLen = Math.floor(dataPoints.length / 2);
  const firstHalf = dataPoints.slice(0, halfLen).filter((p) => p.hasLog).map((p) => p.value);
  const secondHalf = dataPoints.slice(halfLen).filter((p) => p.hasLog).map((p) => p.value);

  const avgFirst =
    firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
  const avgSecond =
    secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

  let momentumDiffPercent = 0;
  if (avgFirst > 0) {
    momentumDiffPercent = Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
  } else if (avgSecond > 0) {
    momentumDiffPercent = 100;
  }

  // Format Helper
  const formatVal = (val: number) => {
    if (meter.unitType === 'scale_1_5') return `${val}/5`;
    if (meter.unitType === 'percentage') return `${val}%`;
    if (meter.unitType === 'time') {
      const h = Math.floor(val / 60);
      const m = val % 60;
      return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;
    }
    return `${val} ${meter.unitLabel || ''}`;
  };

  // Intensity level calculation (0 to 4) like GitHub
  const getContributionLevel = (val: number): number => {
    if (!val || val <= 0) return 0;
    const ratio = maxScale > 0 ? val / maxScale : 0;
    if (ratio >= 0.85) return 4;
    if (ratio >= 0.6) return 3;
    if (ratio >= 0.35) return 2;
    return 1;
  };

  // Color mapping matching light theme
  const getLevelColorClass = (level: number, isSelected: boolean = false): string => {
    const selectedRing = isSelected ? 'ring-2 ring-[#823b28] scale-110 z-10' : '';
    switch (level) {
      case 4:
        return `bg-[#823b28] text-white ${selectedRing}`; // Max intensity
      case 3:
        return `bg-[#df734c] text-white ${selectedRing}`; // High intensity
      case 2:
        return `bg-[#eb9d7d] text-[#281b18] ${selectedRing}`; // Mid intensity
      case 1:
        return `bg-[#f5c3af] text-[#281b18] ${selectedRing}`; // Low intensity
      case 0:
      default:
        return `bg-[#edd8c2] hover:bg-[#e4cbaf] border border-[#281b18]/10 text-[#823b28]/60 ${selectedRing}`; // Empty
    }
  };

  // --- Monthly Heatmap Calculation ---
  const currentMonthYear = activeMonthDate.getFullYear();
  const currentMonthIndex = activeMonthDate.getMonth();
  const monthName = activeMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const monthlyGrid = useMemo(() => {
    const daysInMonth = new Date(currentMonthYear, currentMonthIndex + 1, 0).getDate();
    // Monday as first day of week
    const firstDayIndex = (new Date(currentMonthYear, currentMonthIndex, 1).getDay() + 6) % 7;

    const days: Array<{
      dayNumber: number;
      dateKey: string;
      value: number;
      level: number;
      isToday: boolean;
      weekday: string;
    } | null> = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonthIndex + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${currentMonthYear}-${monthStr}-${dayStr}`;
      const val = meter.entries[dateKey] || 0;
      const level = getContributionLevel(val);
      const isToday = dateKey === todayStr;
      const weekday = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
      });

      days.push({
        dayNumber: d,
        dateKey,
        value: val,
        level,
        isToday,
        weekday,
      });
    }

    return days;
  }, [currentMonthYear, currentMonthIndex, meter.entries, todayStr, maxScale]);

  // Monthly stats
  const monthActiveEntries = monthlyGrid
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .filter((d) => d.value > 0);
  const monthLoggedCount = monthActiveEntries.length;
  const monthAvg =
    monthLoggedCount > 0
      ? Math.round(
          (monthActiveEntries.reduce((a, b) => a + b.value, 0) / monthLoggedCount) * 10
        ) / 10
      : 0;

  // --- Full 52-Week Annual Heatmap Calculation ---
  const fullYearGrid = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = (today.getDay() + 6) % 7;
    const daysUntilEndOfWeek = 6 - currentDayOfWeek;
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysUntilEndOfWeek);

    const totalDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (totalDays - 1));

    const weeks: Array<
      Array<{
        dateKey: string;
        dateNumber: number;
        monthName: string;
        value: number;
        level: number;
        isToday: boolean;
        weekday: string;
        isNewMonth: boolean;
      }>
    > = [];

    let currentWeek: Array<{
      dateKey: string;
      dateNumber: number;
      monthName: string;
      value: number;
      level: number;
      isToday: boolean;
      weekday: string;
      isNewMonth: boolean;
    }> = [];

    let lastMonth = '';

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;
      const val = meter.entries[dateKey] || 0;
      const level = getContributionLevel(val);
      const isToday = dateKey === todayStr;
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });

      const isNewMonth = monthStr !== lastMonth && d.getDate() <= 7;
      if (isNewMonth) {
        lastMonth = monthStr;
      }

      currentWeek.push({
        dateKey,
        dateNumber: d.getDate(),
        monthName: monthStr,
        value: val,
        level,
        isToday,
        weekday,
        isNewMonth,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  }, [meter.entries, todayStr, maxScale]);

  // Annual log stats
  const { annualLoggedCount, annualAvg } = useMemo(() => {
    let logged = 0;
    let sum = 0;
    Object.entries(meter.entries).forEach(([date, val]) => {
      const dateObj = new Date(date + 'T00:00:00');
      const timeDiff = Math.abs(new Date().getTime() - dateObj.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (diffDays <= 365 && val > 0) {
        logged++;
        sum += val;
      }
    });
    return {
      annualLoggedCount: logged,
      annualAvg: logged > 0 ? Math.round((sum / logged) * 10) / 10 : 0
    };
  }, [meter.entries]);

  // SVG Linear Chart Geometry
  const chartWidth = 600;
  const chartHeight = 200;
  const paddingX = 35;
  const paddingTop = 20;
  const paddingBottom = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const pointsCoordinates = dataPoints.map((pt, idx) => {
    const x =
      dataPoints.length > 1
        ? paddingX + (idx / (dataPoints.length - 1)) * usableWidth
        : chartWidth / 2;
    const yRatio = maxScale > 0 ? pt.value / maxScale : 0;
    const y = paddingTop + usableHeight - Math.min(1, Math.max(0, yRatio)) * usableHeight;
    return { ...pt, x, y };
  });

  const pathD = pointsCoordinates.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = pointsCoordinates[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${
    paddingTop + usableHeight
  } L ${pointsCoordinates[0].x} ${paddingTop + usableHeight} Z`;

  const goalYRatio = maxScale > 0 ? goalVal / maxScale : 1;
  const goalY = paddingTop + usableHeight - Math.min(1, Math.max(0, goalYRatio)) * usableHeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-[#281b18]/60 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Light-Themed Full-Screen Dashboard Workspace */}
      <div className="bg-[#fbf6ef] text-[#281b18] w-full h-full shadow-2xl p-5 sm:p-6 relative flex flex-col overflow-hidden">
        
        {/* Close Button & Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#281b18]/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#edd8c2] border border-[#d4aa86] flex items-center justify-center text-2xl sm:text-3xl shadow-inner shrink-0">
              {meter.emojiIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase font-black text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full border border-[#d4aa86]">
                  {meter.unitType.toUpperCase().replace('_', ' ')} METRIC
                </span>
                <AnalyticInfoButton
                  explanation={{
                    ...ANALYTIC_EXPLANATIONS.progressMeterPercentage,
                    title: `${meter.name} Detailed Trend Matrix`,
                    description: `Detailed linear curve, rolling average, goal velocity, and monthly contribution matrix for ${meter.name}.`,
                    currentValue: `Goal Benchmark: ${formatVal(goalVal)}`,
                  }}
                  variant="badge"
                  buttonText="Metric Logic"
                />
                <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#823b28]/80">
                  Goal Benchmark: {formatVal(goalVal)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-sans text-[#281b18] tracking-tight mt-0.5">
                {meter.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Filter Switcher */}
            <div className="flex items-center bg-[#f6e9d7] border border-[#281b18]/15 rounded-xl p-0.5 sm:p-1 gap-0.5 sm:gap-1">
              {(['7d', '14d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  id={`modal-range-${r}`}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                      : 'text-[#823b28]/70 hover:text-[#823b28]'
                  }`}
                >
                  {r === '7d' ? '7D' : r === '14d' ? '14D' : r === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>

            <button
              id="close-progress-details-modal"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] transition-all cursor-pointer border border-[#281b18]/10 shadow-2xs"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dual-Column Responsive Dashboard Body */}
        <div className="flex-1 overflow-hidden mt-4">
          <div className="w-full h-full lg:grid lg:grid-cols-12 lg:gap-6 flex flex-col overflow-y-auto lg:overflow-hidden pb-4">
            
            {/* Left Analytical Sidebar (KPI Bento Block & Weekly performance breakdown) */}
            <div className="lg:col-span-4 lg:h-full lg:overflow-y-auto space-y-4 lg:pr-2 flex flex-col shrink-0">
              
              {/* Premium 2-Column KPI Bento Block */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Range Average */}
                <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <span className="font-mono text-[9px] font-black text-[#823b28] uppercase tracking-wider">
                    Range Avg
                  </span>
                  <div className="my-1">
                    <span className="text-lg font-black font-mono text-[#281b18]">
                      {average}
                    </span>
                    <span className="text-[10px] font-mono text-[#df734c] ml-1 font-bold">
                      {meter.unitType === 'scale_1_5' ? '/5' : meter.unitType === 'percentage' ? '%' : ''}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#823b28]/80 truncate">
                    {maxScale > 0 ? `${Math.round((average / maxScale) * 100)}% of goal` : '—'}
                  </span>
                </div>

                {/* 2. Peak / Highest */}
                <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black text-[#823b28] uppercase tracking-wider">
                      Highest
                    </span>
                    <ArrowUpRight size={12} className="text-emerald-700 font-bold" />
                  </div>
                  <div className="my-1">
                    <span className="text-lg font-black font-mono text-emerald-800">
                      {formatVal(peakVal)}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#823b28]/80 truncate">
                    Peak: {peakDate}
                  </span>
                </div>

                {/* 3. Lowest / Dip */}
                <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black text-[#823b28] uppercase tracking-wider">
                      Lowest
                    </span>
                    <ArrowDownRight size={12} className="text-amber-700 font-bold" />
                  </div>
                  <div className="my-1">
                    <span className="text-lg font-black font-mono text-amber-800">
                      {formatVal(lowestVal)}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#823b28]/80 truncate">
                    Dip: {lowestDate}
                  </span>
                </div>

                {/* 4. Consistency Ratio */}
                <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <span className="font-mono text-[9px] font-black text-[#823b28] uppercase tracking-wider">
                    Consistency
                  </span>
                  <div className="my-1">
                    <span className="text-lg font-black font-mono text-[#281b18]">
                      {consistencyPercent}%
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#823b28]/80 truncate">
                    {activePoints.length} of {daysCount} days
                  </span>
                </div>

                {/* 5. Active Streak */}
                <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black text-[#823b28] uppercase tracking-wider">
                      Streak
                    </span>
                    <Flame size={12} className="text-[#df734c]" />
                  </div>
                  <div className="my-1">
                    <span className="text-lg font-black font-mono text-[#df734c]">
                      {streak} {streak === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#823b28]/80 truncate">
                    Consecutive logs
                  </span>
                </div>

                {/* 6. Trend Momentum */}
                <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-black text-[#823b28] uppercase tracking-wider">
                      Momentum
                    </span>
                    {momentumDiffPercent >= 0 ? (
                      <TrendingUp size={12} className="text-emerald-700" />
                    ) : (
                      <TrendingDown size={12} className="text-rose-700" />
                    )}
                  </div>
                  <div className="my-1">
                    <span
                      className={`text-lg font-black font-mono ${
                        momentumDiffPercent > 0
                          ? 'text-emerald-800'
                          : momentumDiffPercent < 0
                          ? 'text-rose-800'
                          : 'text-[#281b18]'
                      }`}
                    >
                      {momentumDiffPercent > 0 ? `+${momentumDiffPercent}%` : `${momentumDiffPercent}%`}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#823b28]/80 truncate">
                    {momentumDiffPercent >= 0 ? 'Improving' : 'Attention'}
                  </span>
                </div>
              </div>

              {/* Weekly Performance Meter Breakdown List */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-xs flex-1 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between mb-3 border-b border-[#281b18]/10 pb-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider">
                      7-DAY METRICS TRACKER
                    </span>
                    <h4 className="text-sm font-extrabold text-[#281b18] font-sans">
                      Weekly Breakdown Progress
                    </h4>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Goal: {formatVal(goalVal)}
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                  {dataPoints.slice(-7).map((pt) => {
                    const isToday = pt.date === todayStr;
                    const formattedDate = new Date(pt.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });

                    const percentage = Math.min(100, Math.round((pt.value / goalVal) * 100));

                    return (
                      <div key={pt.date} className="flex items-center justify-between gap-3 p-2.5 bg-[#f6e9d7]/70 border border-[#281b18]/10 rounded-xl">
                        <div className="min-w-0 w-28">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-extrabold text-[#281b18] truncate">
                              {isToday ? 'Today' : formattedDate}
                            </span>
                            {isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#df734c] animate-pulse" />
                            )}
                          </div>
                          <span className="font-mono text-[9px] text-[#823b28] font-bold">
                            Val: {pt.hasLog ? formatVal(pt.value) : 'No Log'}
                          </span>
                        </div>

                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-[#edd8c2] h-2.5 rounded-full overflow-hidden relative">
                            <div
                              className="bg-[#823b28] h-full rounded-full transition-all duration-500"
                              style={{ width: `${pt.hasLog ? percentage : 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-black text-[#281b18] w-8 text-right">
                            {pt.hasLog ? `${percentage}%` : '0%'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Primary Panel: Interactive Graphs and Matrix Timelines */}
            <div className="lg:col-span-8 lg:h-full lg:overflow-y-auto space-y-4 lg:pr-2 flex flex-col">
              
              {/* Linear Graph Visual Trend Card */}
              <div className="bg-[#f6e9d7]/80 border border-[#281b18]/15 rounded-3xl p-5 shadow-xs relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={16} className="text-[#df734c]" />
                    <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider">
                      Linear Trend & Trajectory ({timeRange.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[9px] font-mono font-bold">
                    <div className="flex items-center gap-1.5 text-[#823b28]">
                      <span className="w-2.5 h-0.5 bg-[#df734c] inline-block rounded-full" />
                      <span>Recorded Curve</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#823b28]/70">
                      <span className="w-2.5 h-0.5 border-t border-dashed border-[#823b28] inline-block" />
                      <span>Benchmark ({formatVal(goalVal)})</span>
                    </div>
                  </div>
                </div>

                {/* SVG Trend Graph Canvas */}
                <div className="relative w-full overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="areaGlowGradientLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#df734c" stopOpacity="0.3" />
                        <stop offset="85%" stopColor="#df734c" stopOpacity="0.03" />
                        <stop offset="100%" stopColor="#df734c" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const y = paddingTop + usableHeight - ratio * usableHeight;
                      const labelVal = Math.round(ratio * maxScale * 10) / 10;
                      return (
                        <g key={ratio}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={chartWidth - paddingX}
                            y2={y}
                            stroke="#281b18"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <text
                            x={paddingX - 8}
                            y={y + 3}
                            textAnchor="end"
                            fill="#823b28"
                            opacity="0.65"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {labelVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Goal Target Dashed reference Line */}
                    <line
                      x1={paddingX}
                      y1={goalY}
                      x2={chartWidth - paddingX}
                      y2={goalY}
                      stroke="#823b28"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.5"
                    />

                    {/* Area fill path */}
                    {activeValues.length > 0 && <path d={areaD} fill="url(#areaGlowGradientLight)" />}

                    {/* Smooth Linear Path Curve */}
                    {activeValues.length > 0 && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#df734c"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Coordinates node indicators */}
                    {pointsCoordinates.map((pt, idx) => {
                      const isHovered = hoveredPoint?.date === pt.date;
                      const isCurrentToday = pt.date === todayStr;

                      return (
                        <g key={pt.date} className="cursor-pointer">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={14}
                            fill="transparent"
                            onMouseEnter={() =>
                              setHoveredPoint({ date: pt.date, value: pt.value, x: pt.x, y: pt.y })
                            }
                            onMouseLeave={() => hoveredPoint?.date === pt.date && setHoveredPoint(null)}
                          />

                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6 : pt.hasLog ? 4 : 2.5}
                            fill={isHovered ? '#823b28' : isCurrentToday ? '#df734c' : pt.hasLog ? '#823b28' : '#edd8c2'}
                            stroke={pt.hasLog ? '#fbf6ef' : '#d4aa86'}
                            strokeWidth={pt.hasLog ? 2 : 1}
                            className="transition-all duration-150"
                          />

                          {(dataPoints.length <= 14 || idx % Math.ceil(dataPoints.length / 8) === 0) && (
                            <text
                              x={pt.x}
                              y={chartHeight - 10}
                              textAnchor="middle"
                              fill="#823b28"
                              opacity={isCurrentToday ? '1' : '0.7'}
                              fontWeight={isCurrentToday ? 'bold' : 'normal'}
                              fontSize="9"
                              fontFamily="monospace"
                            >
                              {new Date(pt.date + 'T00:00:00').toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                              })}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Interactive tooltip box */}
                  {hoveredPoint && (
                    <div
                      className="absolute pointer-events-none bg-[#281b18] text-[#f6e9d7] border border-[#281b18]/20 rounded-xl px-3 py-2 shadow-2xl z-30 transform -translate-x-1/2 -translate-y-full transition-all duration-100"
                      style={{
                        left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                        top: `${(hoveredPoint.y / chartHeight) * 100 - 4}%`,
                      }}
                    >
                      <div className="font-mono text-[9px] font-bold text-[#eb9d7d] uppercase">
                        {new Date(hoveredPoint.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-xs font-extrabold font-mono text-white mt-0.5">
                        {formatVal(hoveredPoint.value)}
                      </div>
                      {hoveredPoint.value >= goalVal && (
                        <div className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={10} /> Goal Reached
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* GitHub-style Contribution Matrix Panel */}
              <div className="bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-5 shadow-xs relative flex flex-col flex-1">
                
                {/* Heatmap Section Header Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-[#281b18]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-[#edd8c2] text-[#823b28]">
                      <Layers size={16} />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider block">
                        METRIC LOG matrix · HEATMAP
                      </span>
                      <h4 className="text-base font-extrabold text-[#281b18] font-sans">
                        {isHeatmapExpanded
                          ? 'Annual 52-Week Contribution Timeline'
                          : `${monthName} Logging Activity`}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!isHeatmapExpanded && (
                      <div className="flex items-center bg-[#edd8c2] rounded-xl p-0.5 border border-[#281b18]/10">
                        <button
                          onClick={() => {
                            const prev = new Date(activeMonthDate);
                            prev.setMonth(prev.getMonth() - 1);
                            setActiveMonthDate(prev);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="font-mono text-xs font-bold text-[#281b18] px-2 min-w-[75px] text-center">
                          {activeMonthDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <button
                          onClick={() => {
                            const next = new Date(activeMonthDate);
                            next.setMonth(next.getMonth() + 1);
                            setActiveMonthDate(next);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#fbf6ef] text-[#281b18] transition-colors cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}

                    <button
                      id="toggle-heatmap-expansion-btn"
                      onClick={() => setIsHeatmapExpanded(!isHeatmapExpanded)}
                      className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                    >
                      {isHeatmapExpanded ? (
                        <>
                          <Minimize2 size={13} />
                          <span>Monthly Matrix</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 size={13} />
                          <span>Expand 52-Week Matrix</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Interactive Matrix Board */}
                <div className="flex-1 py-1">
                  {!isHeatmapExpanded ? (
                    /* VIEW 1: MONTHLY HEATMAP GRID */
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center font-mono text-[10px] font-black text-[#823b28] uppercase">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <div key={day} className="py-1">{day}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {monthlyGrid.map((item, idx) => {
                          if (!item) {
                            return (
                              <div
                                key={`empty-${idx}`}
                                className="aspect-square rounded-xl bg-transparent opacity-0 pointer-events-none"
                              />
                            );
                          }

                          const isSelected = selectedHeatmapDate === item.dateKey;
                          const colorClass = getLevelColorClass(item.level, isSelected);

                          return (
                            <div
                              key={item.dateKey}
                              onClick={() => setSelectedHeatmapDate(item.dateKey)}
                              onMouseEnter={() =>
                                setHoveredHeatmapCell({
                                  date: item.dateKey,
                                  value: item.value,
                                  formattedDate: new Date(item.dateKey + 'T00:00:00').toLocaleDateString(
                                    'en-US',
                                    { month: 'short', day: 'numeric', year: 'numeric' }
                                  ),
                                  weekday: item.weekday,
                                  level: item.level,
                                })
                              }
                              onMouseLeave={() => setHoveredHeatmapCell(null)}
                              className={`aspect-square rounded-xl flex flex-col items-center justify-between p-2 cursor-pointer transition-all hover:scale-105 border relative ${colorClass} ${
                                item.isToday ? 'border-2 border-[#281b18]' : 'border-transparent'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between">
                                <span className="font-mono text-xs font-black">
                                  {item.dayNumber}
                                </span>
                                {item.isToday && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#df734c] animate-pulse" />
                                )}
                              </div>

                              <div className="text-center font-mono text-xs font-black truncate w-full">
                                {item.value > 0 ? (
                                  meter.unitType === 'scale_1_5' ? (
                                    `${item.value}★`
                                  ) : meter.unitType === 'percentage' ? (
                                    `${item.value}%`
                                  ) : (
                                    formatVal(item.value)
                                  )
                                ) : (
                                  <span className="opacity-40 font-normal">—</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Monthly Stats Summary Row */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#281b18]/10 text-xs font-mono mt-2">
                        <div className="flex items-center gap-4 text-[#823b28]">
                          <span>
                            Logged Days: <strong>{monthLoggedCount} days</strong>
                          </span>
                          <span>
                            Month Avg: <strong>{monthAvg}</strong>
                          </span>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#823b28]/80">
                          <span>Less</span>
                          <div className="w-3.5 h-3.5 rounded-md bg-[#edd8c2] border border-[#281b18]/10" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#f5c3af]" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#eb9d7d]" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#df734c]" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#823b28]" />
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEW 2: EXPANDED 52-WEEK CONTINUOUS ANNUAL MATRIX */
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                      <div className="overflow-x-auto pb-2">
                        <div className="min-w-[720px] flex flex-col gap-1.5">
                          {/* Month labels */}
                          <div className="flex gap-1 pl-7 text-[10px] font-mono font-bold text-[#823b28] relative h-5">
                            {fullYearGrid.map((week, wIdx) => {
                              const firstDay = week[0];
                              return (
                                <div key={wIdx} className="w-3 text-center relative">
                                  {firstDay.isNewMonth && (
                                    <span className="absolute -translate-y-1.5 font-extrabold text-[#281b18] whitespace-nowrap">
                                      {firstDay.monthName}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* standard 7 Rows x 52 Columns */}
                          <div className="flex gap-1.5">
                            <div className="flex flex-col justify-between pr-1.5 font-mono text-[9px] font-bold text-[#823b28] py-0.5">
                              <span>Mon</span>
                              <span className="opacity-0">Tue</span>
                              <span>Wed</span>
                              <span className="opacity-0">Thu</span>
                              <span>Fri</span>
                              <span className="opacity-0">Sat</span>
                              <span>Sun</span>
                            </div>

                            <div className="flex gap-1 flex-1">
                              {fullYearGrid.map((week, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-1">
                                  {week.map((day) => {
                                    const isSelected = selectedHeatmapDate === day.dateKey;
                                    const colorClass = getLevelColorClass(day.level, isSelected);

                                    return (
                                      <div
                                        key={day.dateKey}
                                        onClick={() => setSelectedHeatmapDate(day.dateKey)}
                                        onMouseEnter={() =>
                                          setHoveredHeatmapCell({
                                            date: day.dateKey,
                                            value: day.value,
                                            formattedDate: new Date(
                                              day.dateKey + 'T00:00:00'
                                            ).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                            }),
                                            weekday: day.weekday,
                                            level: day.level,
                                          })
                                        }
                                        onMouseLeave={() => setHoveredHeatmapCell(null)}
                                        className={`w-3.5 h-3.5 rounded-sm cursor-pointer transition-all hover:scale-125 ${colorClass} ${
                                          day.isToday ? 'border border-[#281b18]' : ''
                                        }`}
                                        title={`${day.dateKey}: ${day.value > 0 ? formatVal(day.value) : 'No entry'}`}
                                      />
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Annual summary */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#281b18]/10 text-xs font-mono">
                        <div className="flex items-center gap-4 text-[#823b28]">
                          <span>
                            Year Logs: <strong>{annualLoggedCount} entries</strong>
                          </span>
                          <span>
                            Year Avg: <strong>{annualAvg}</strong>
                          </span>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#823b28]/80">
                          <span>Less</span>
                          <div className="w-3.5 h-3.5 rounded-md bg-[#edd8c2] border border-[#281b18]/10" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#f5c3af]" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#eb9d7d]" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#df734c]" />
                          <div className="w-3.5 h-3.5 rounded-md bg-[#823b28]" />
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating hovered cell logs or manual logs detail */}
                {hoveredHeatmapCell && (
                  <div className="mt-3 bg-[#edd8c2] border border-[#d4aa86] rounded-xl px-4 py-2 flex items-center justify-between text-xs font-mono animate-in fade-in duration-150 shrink-0 shadow-2xs">
                    <span className="font-bold text-[#281b18]">
                      {hoveredHeatmapCell.weekday}, {hoveredHeatmapCell.formattedDate}
                    </span>
                    <span className="font-black text-[#823b28]">
                      {hoveredHeatmapCell.value > 0
                        ? `Logged score: ${formatVal(hoveredHeatmapCell.value)}`
                        : 'No value logged'}
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
