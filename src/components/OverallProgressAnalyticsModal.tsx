import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Award,
  Flame,
  Layers,
  CheckCircle2,
  Activity,
  Calendar,
  ChevronRight,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  Compass,
  Scale,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ProgressMeter, MeasurementType } from '../types';

interface OverallProgressAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meters: ProgressMeter[];
  onSelectMeter?: (meter: ProgressMeter) => void;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

// Color palette for multiple meters on the multi-line chart
const METER_COLORS = [
  '#df734c', // Terracotta Orange
  '#2563eb', // Royal Blue
  '#16a34a', // Emerald Green
  '#9333ea', // Purple
  '#ea580c', // Dark Orange
  '#0d9488', // Teal
  '#ca8a04', // Amber
  '#be123c', // Rose
];

export const OverallProgressAnalyticsModal: React.FC<OverallProgressAnalyticsModalProps> = ({
  isOpen,
  onClose,
  meters = [],
  onSelectMeter,
}) => {
  // Defensive sanitization: ensure meters is a clean array of valid objects with valid entries
  const safeMeters: ProgressMeter[] = useMemo(() => {
    if (!Array.isArray(meters)) return [];
    return meters
      .filter((m): m is ProgressMeter => Boolean(m && typeof m === 'object'))
      .map((m, idx) => ({
        id: m.id || `meter-${idx}`,
        name: m.name || 'Unnamed Meter',
        emojiIcon: m.emojiIcon || '📊',
        unitType: (m.unitType as MeasurementType) || 'percentage',
        goalValue:
          typeof m.goalValue === 'number' && m.goalValue > 0
            ? m.goalValue
            : m.unitType === 'scale_1_5'
            ? 5
            : m.unitType === 'time'
            ? 180
            : 100,
        unitLabel: m.unitLabel || '',
        entries: m.entries && typeof m.entries === 'object' ? m.entries : {},
        createdAt: m.createdAt || '2026-01-01',
      }));
  }, [meters]);

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);
  const [selectedMetersForChart, setSelectedMetersForChart] = useState<Record<string, boolean>>({});
  
  // Interactive hover/tap states for charts
  const [hoveredMomentumPoint, setHoveredMomentumPoint] = useState<{
    date: string;
    displayDate: string;
    value: number;
    prevValue?: number;
    activeCount: number;
    meterValues: { name: string; emoji: string; norm: number; raw: number; unitType: MeasurementType }[];
    x: number;
    y: number;
  } | null>(null);

  const [hoveredMultiLinePoint, setHoveredMultiLinePoint] = useState<{
    date: string;
    displayDate: string;
    meterScores: { id: string; name: string; emoji: string; norm: number; hasLog: boolean; color: string }[];
    x: number;
  } | null>(null);

  const [hoveredHeatmapDay, setHoveredHeatmapDay] = useState<{
    date: string;
    displayDate: string;
    logsCount: number;
    loggedMeters: string[];
  } | null>(null);

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCalculationInfo) {
          setShowCalculationInfo(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showCalculationInfo]);

  // ----------------------------------------------------
  // 1. DATE LIST GENERATION (UTC SAFE)
  // ----------------------------------------------------
  const today = new Date();
  const getDaysArray = (daysCount: number, offsetDays: number = 0) => {
    const arr: string[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - (i + offsetDays));
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      arr.push(`${yyyy}-${mm}-${dd}`);
    }
    return arr;
  };

  const rangeDaysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const dateList = useMemo(() => getDaysArray(rangeDaysCount), [rangeDaysCount]);
  const prevDateList = useMemo(() => getDaysArray(rangeDaysCount, rangeDaysCount), [rangeDaysCount]);

  // ----------------------------------------------------
  // 2. NORMALIZATION HELPER (0 - 100%)
  // ----------------------------------------------------
  const getNormalizedValue = (m: ProgressMeter, val: unknown): number => {
    const num = typeof val === 'number' ? val : Number(val);
    if (isNaN(num)) return 0;
    if (m.unitType === 'percentage') {
      return Math.min(100, Math.max(0, num));
    }
    if (m.unitType === 'scale_1_5') {
      return Math.min(100, Math.max(0, (num / 5) * 100));
    }
    if (m.unitType === 'time') {
      const goal = m.goalValue && m.goalValue > 0 ? m.goalValue : 180;
      return Math.min(100, Math.max(0, (num / goal) * 100));
    }
    const goal = m.goalValue && m.goalValue > 0 ? m.goalValue : 10;
    return Math.min(100, Math.max(0, (num / goal) * 100));
  };

  // Format helper for raw values
  const formatRawVal = (val: unknown, unitType: MeasurementType, unitLabel?: string) => {
    const num = typeof val === 'number' ? val : Number(val);
    const safeVal = isNaN(num) ? 0 : num;
    if (unitType === 'scale_1_5') return `${safeVal}/5`;
    if (unitType === 'percentage') return `${safeVal}%`;
    if (unitType === 'time') {
      const h = Math.floor(safeVal / 60);
      const m = Math.round(safeVal % 60);
      return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;
    }
    return `${safeVal} ${unitLabel || ''}`.trim();
  };

  // ----------------------------------------------------
  // 3. CORE ANALYTICS AGGREGATION
  // ----------------------------------------------------
  const analytics = useMemo(() => {
    let totalLogsCount = 0;
    const activeLoggingDatesSet = new Set<string>();
    const dailyLogsCountMap: Record<string, { count: number; meters: string[] }> = {};

    // Meter specific performance maps
    const meterPerformance: Record<
      string,
      {
        meter: ProgressMeter;
        color: string;
        totalNormalized: number;
        logCount: number;
        avgNormalized: number;
        currentNormalized: number;
        currentRaw: number;
        prevNormalizedAvg: number;
        deltaPercent: number;
        sparkline: { date: string; norm: number; hasLog: boolean }[];
      }
    > = {};

    safeMeters.forEach((m, idx) => {
      let mNormSum = 0;
      let mCount = 0;
      const spark: { date: string; norm: number; hasLog: boolean }[] = [];

      dateList.forEach((dateStr) => {
        const isLogged = dateStr in m.entries && m.entries[dateStr] !== undefined && m.entries[dateStr] !== null;
        const val = isLogged ? m.entries[dateStr] : 0;
        
        if (isLogged) {
          totalLogsCount++;
          activeLoggingDatesSet.add(dateStr);
          if (!dailyLogsCountMap[dateStr]) {
            dailyLogsCountMap[dateStr] = { count: 0, meters: [] };
          }
          dailyLogsCountMap[dateStr].count++;
          dailyLogsCountMap[dateStr].meters.push(m.name);

          const norm = getNormalizedValue(m, val);
          mNormSum += norm;
          mCount++;
          spark.push({ date: dateStr, norm, hasLog: true });
        } else {
          spark.push({ date: dateStr, norm: 0, hasLog: false });
        }
      });

      // Previous period stats for this meter
      let prevSum = 0;
      let prevCount = 0;
      prevDateList.forEach((dStr) => {
        if (dStr in m.entries && m.entries[dStr] !== undefined && m.entries[dStr] !== null) {
          prevSum += getNormalizedValue(m, m.entries[dStr]);
          prevCount++;
        }
      });

      const avgNorm = mCount > 0 ? Math.round((mNormSum / mCount) * 10) / 10 : 0;
      const prevAvg = prevCount > 0 ? Math.round((prevSum / prevCount) * 10) / 10 : avgNorm;
      const delta = Math.round((avgNorm - prevAvg) * 10) / 10;

      // Latest logged entry for this meter (fall back to all-time if not in current window)
      let latestRaw = 0;
      let latestNorm = 0;
      for (let i = dateList.length - 1; i >= 0; i--) {
        const d = dateList[i];
        if (d in m.entries && m.entries[d] !== undefined && m.entries[d] !== null) {
          latestRaw = m.entries[d];
          latestNorm = Math.round(getNormalizedValue(m, latestRaw) * 10) / 10;
          break;
        }
      }
      if (latestRaw === 0 && Object.keys(m.entries).length > 0) {
        const sortedDates = Object.keys(m.entries).sort().reverse();
        for (const sd of sortedDates) {
          if (m.entries[sd] !== undefined && m.entries[sd] !== null) {
            latestRaw = m.entries[sd];
            latestNorm = Math.round(getNormalizedValue(m, latestRaw) * 10) / 10;
            break;
          }
        }
      }

      meterPerformance[m.id] = {
        meter: m,
        color: METER_COLORS[idx % METER_COLORS.length],
        totalNormalized: mNormSum,
        logCount: mCount,
        avgNormalized: avgNorm,
        currentNormalized: latestNorm,
        currentRaw: latestRaw,
        prevNormalizedAvg: prevAvg,
        deltaPercent: delta,
        sparkline: spark,
      };
    });

    // ----------------------------------------------------
    // Overall Progress & Daily Trajectory Calculation
    // ----------------------------------------------------
    const dailyTrajectory = dateList.map((dateStr, idx) => {
      let dayNormSum = 0;
      let dayMetersLogged = 0;
      const meterVals: { name: string; emoji: string; norm: number; raw: number; unitType: MeasurementType }[] = [];

      safeMeters.forEach((m) => {
        if (dateStr in m.entries && m.entries[dateStr] !== undefined && m.entries[dateStr] !== null) {
          const raw = m.entries[dateStr];
          const norm = getNormalizedValue(m, raw);
          dayNormSum += norm;
          dayMetersLogged++;
          meterVals.push({ name: m.name, emoji: m.emojiIcon, norm: Math.round(norm * 10) / 10, raw, unitType: m.unitType });
        }
      });

      const dayOverallScore = dayMetersLogged > 0 ? Math.round((dayNormSum / dayMetersLogged) * 10) / 10 : 0;

      // Corresponding previous period point for comparison
      const prevDateStr = prevDateList[idx];
      let prevDayNormSum = 0;
      let prevDayMetersLogged = 0;
      if (prevDateStr) {
        safeMeters.forEach((m) => {
          if (prevDateStr in m.entries && m.entries[prevDateStr] !== undefined && m.entries[prevDateStr] !== null) {
            prevDayNormSum += getNormalizedValue(m, m.entries[prevDateStr]);
            prevDayMetersLogged++;
          }
        });
      }
      const prevDayScore = prevDayMetersLogged > 0 ? Math.round((prevDayNormSum / prevDayMetersLogged) * 10) / 10 : undefined;

      const dateParts = dateStr.split('-');
      const y = parseInt(dateParts[0], 10);
      const m = parseInt(dateParts[1], 10) - 1;
      const d = parseInt(dateParts[2], 10);
      const dateObj = new Date(y, m, d);
      const displayDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : dateStr;

      return {
        date: dateStr,
        displayDate,
        value: dayOverallScore,
        prevValue: prevDayScore,
        activeCount: dayMetersLogged,
        hasActivity: dayMetersLogged > 0,
        meterValues: meterVals,
      };
    });

    const activeDaysCount = activeLoggingDatesSet.size;
    const consistencyPercentage = rangeDaysCount > 0 ? Math.round((activeDaysCount / rangeDaysCount) * 100) : 0;
    const avgLogsPerActiveDay = activeDaysCount > 0 ? Math.round((totalLogsCount / activeDaysCount) * 10) / 10 : 0;

    // Overall Progress: Average of active normalized progress across meters
    const meterPerfList = Object.values(meterPerformance);
    const activeMeterPerfs = meterPerfList.filter((p) => p.logCount > 0);
    
    const overallNormalizedProgress =
      activeMeterPerfs.length > 0
        ? Math.round(
            (activeMeterPerfs.reduce((acc, p) => acc + (isNaN(p.avgNormalized) ? 0 : p.avgNormalized), 0) /
              activeMeterPerfs.length) *
              10
          ) / 10
        : 0;

    const prevOverallNormalized =
      activeMeterPerfs.length > 0
        ? Math.round(
            (activeMeterPerfs.reduce((acc, p) => acc + (isNaN(p.prevNormalizedAvg) ? 0 : p.prevNormalizedAvg), 0) /
              activeMeterPerfs.length) *
              10
          ) / 10
        : overallNormalizedProgress;

    const rawDelta = overallNormalizedProgress - prevOverallNormalized;
    const overallDelta = isNaN(rawDelta) ? 0 : Math.round(rawDelta * 10) / 10;

    // ----------------------------------------------------
    // Momentum Status Calculation
    // ----------------------------------------------------
    // Split daily trajectory into two halves to assess recent velocity
    const halfLen = Math.floor(dailyTrajectory.length / 2);
    const firstHalfPoints = dailyTrajectory.slice(0, halfLen).filter((p) => p.hasActivity);
    const secondHalfPoints = dailyTrajectory.slice(halfLen).filter((p) => p.hasActivity);

    const firstHalfAvg =
      firstHalfPoints.length > 0 ? firstHalfPoints.reduce((a, b) => a + b.value, 0) / firstHalfPoints.length : 0;
    const secondHalfAvg =
      secondHalfPoints.length > 0 ? secondHalfPoints.reduce((a, b) => a + b.value, 0) / secondHalfPoints.length : 0;

    const momentumVelocity = Math.round((secondHalfAvg - firstHalfAvg) * 10) / 10;

    let momentumStatus: 'BUILDING MOMENTUM' | 'STEADY' | 'COOLING DOWN' | 'RECOVERING' = 'STEADY';
    let momentumDescription = 'Your combined tracking is maintaining a steady and reliable baseline.';

    if (momentumVelocity >= 4 || overallDelta >= 5) {
      momentumStatus = 'BUILDING MOMENTUM';
      momentumDescription = `Overall velocity is accelerating (+${Math.max(momentumVelocity, overallDelta)}% trajectory increase).`;
    } else if (momentumVelocity <= -4 || overallDelta <= -5) {
      momentumStatus = 'COOLING DOWN';
      momentumDescription = `Recent momentum has moderated by ${Math.abs(Math.min(momentumVelocity, overallDelta))}% compared to earlier periods.`;
    } else if (secondHalfPoints.length > firstHalfPoints.length && secondHalfAvg >= firstHalfAvg) {
      momentumStatus = 'RECOVERING';
      momentumDescription = 'Logging frequency and normalized scores are actively rebounding from a recent quiet period.';
    } else {
      momentumStatus = 'STEADY';
      momentumDescription = 'Progress across your dimensions is consistent and maintaining steady velocity.';
    }

    // ----------------------------------------------------
    // Balance / Spread Analysis
    // ----------------------------------------------------
    const normalizedScores = activeMeterPerfs.map((p) => p.avgNormalized);
    const maxScore = normalizedScores.length > 0 ? Math.max(...normalizedScores) : 0;
    const minScore = normalizedScores.length > 0 ? Math.min(...normalizedScores) : 0;
    const spread = maxScore - minScore;

    let balanceCategory: 'BALANCED PROGRESS' | 'MODERATE SPREAD' | 'UNEVEN PROGRESS' = 'BALANCED PROGRESS';
    let balanceExplanation = 'Your dimensions are progressing within a harmoniously aligned range.';

    if (activeMeterPerfs.length <= 1) {
      balanceCategory = 'BALANCED PROGRESS';
      balanceExplanation = 'Tracking is dedicated and focused on your active dimension.';
    } else if (spread <= 20) {
      balanceCategory = 'BALANCED PROGRESS';
      balanceExplanation = `Dimensions are tightly aligned (difference between highest and lowest is only ${Math.round(spread)}%).`;
    } else if (spread <= 40) {
      balanceCategory = 'MODERATE SPREAD';
      balanceExplanation = `Progress is moderate across dimensions with a ${Math.round(spread)}% spread between leading and secondary metrics.`;
    } else {
      balanceCategory = 'UNEVEN PROGRESS';
      balanceExplanation = `Significant gap detected (${Math.round(spread)}% spread). Some dimensions are progressing rapidly while others have lower activity.`;
    }

    // ----------------------------------------------------
    // Accurate Streak Calculation Across All Meters
    // ----------------------------------------------------
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < dateList.length; i++) {
      if (activeLoggingDatesSet.has(dateList[i])) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Current active streak: scan backward from today (or yesterday if today hasn't been logged yet)
    let currentStreak = 0;
    const todayStr = dateList[dateList.length - 1];
    const yesterdayStr = dateList.length >= 2 ? dateList[dateList.length - 2] : null;
    let streakStartIndex = -1;

    if (activeLoggingDatesSet.has(todayStr)) {
      streakStartIndex = dateList.length - 1;
    } else if (yesterdayStr && activeLoggingDatesSet.has(yesterdayStr)) {
      streakStartIndex = dateList.length - 2;
    }

    if (streakStartIndex >= 0) {
      for (let i = streakStartIndex; i >= 0; i--) {
        if (activeLoggingDatesSet.has(dateList[i])) {
          currentStreak++;
        } else {
          break; // Stop immediately on first inactive day
        }
      }
    }

    // ----------------------------------------------------
    // Recovery Analysis (Detecting Dips)
    // ----------------------------------------------------
    let recoveryData: {
      hasRecovery: boolean;
      dropPercent: number;
      recoveryPercent: number;
      currentDeltaVsPreDrop: number;
      dipDate: string;
      peakDate: string;
    } | null = null;

    if (dailyTrajectory.length >= 14) {
      const activePts = dailyTrajectory.filter((p) => p.hasActivity);
      if (activePts.length >= 6) {
        let minPt = activePts[0];
        let minIdx = 0;
        activePts.forEach((pt, idx) => {
          if (pt.value < minPt.value) {
            minPt = pt;
            minIdx = idx;
          }
        });

        if (minIdx > 1 && minIdx < activePts.length - 1) {
          const preMinPts = activePts.slice(0, minIdx);
          const postMinPts = activePts.slice(minIdx + 1);

          if (preMinPts.length > 0 && postMinPts.length > 0 && minPt) {
            const preMax = preMinPts.reduce((max, p) => (p.value > max.value ? p : max), preMinPts[0]);
            const postMax = postMinPts.reduce((max, p) => (p.value > max.value ? p : max), postMinPts[0]);

            if (preMax && postMax) {
              const drop = Math.round((preMax.value - minPt.value) * 10) / 10;
              const recovery = Math.round((postMax.value - minPt.value) * 10) / 10;
              const deltaVsPre = Math.round((postMax.value - preMax.value) * 10) / 10;

              if (drop >= 8 && recovery >= 8) {
                recoveryData = {
                  hasRecovery: true,
                  dropPercent: drop,
                  recoveryPercent: recovery,
                  currentDeltaVsPreDrop: deltaVsPre,
                  dipDate: minPt.displayDate,
                  peakDate: postMax.displayDate,
                };
              }
            }
          }
        }
      }
    }

    // ----------------------------------------------------
    // Personal Records (Historical All-Time & Period Peak)
    // ----------------------------------------------------
    let peakOverallDay = { date: '—', value: 0 };
    let highestSingleMeterPeak = { name: '—', emoji: '⭐', value: 0 };
    let maxLogsInSingleDay = 0;

    dailyTrajectory.forEach((d) => {
      if (d.value > peakOverallDay.value && d.hasActivity) {
        peakOverallDay = { date: d.displayDate, value: d.value };
      }
      if (d.activeCount > maxLogsInSingleDay) {
        maxLogsInSingleDay = d.activeCount;
      }
    });

    // Scan all individual logs across all meters for absolute peak single-day performance
    safeMeters.forEach((m) => {
      Object.entries(m.entries).forEach(([, val]) => {
        if (typeof val === 'number') {
          const norm = Math.round(getNormalizedValue(m, val) * 10) / 10;
          if (norm > highestSingleMeterPeak.value) {
            highestSingleMeterPeak = {
              name: m.name,
              emoji: m.emojiIcon,
              value: norm,
            };
          }
        }
      });
    });

    // ----------------------------------------------------
    // Meaningful Data-Driven Insights
    // ----------------------------------------------------
    const generatedInsights: { title: string; desc: string; type: 'positive' | 'neutral' | 'attention' }[] = [];

    if (safeMeters.length === 0) {
      generatedInsights.push({
        title: 'Initialize Dimension Tracking',
        desc: 'Create progress meters to unlock comprehensive cross-meter normalization and multi-dimensional analysis.',
        type: 'neutral',
      });
    } else {
      // 1. Overall Trajectory
      if (overallDelta > 3) {
        generatedInsights.push({
          title: 'Strong Positive Velocity',
          desc: `Your combined normalized progress grew by +${overallDelta}% over this ${rangeDaysCount}-day timeframe compared to the preceding period.`,
          type: 'positive',
        });
      } else if (overallDelta < -3) {
        generatedInsights.push({
          title: 'Momentum Moderation',
          desc: `Overall score decreased by ${Math.abs(overallDelta)}% compared to the prior period. Focus on small consistent logs to restore upward trajectory.`,
          type: 'attention',
        });
      } else {
        generatedInsights.push({
          title: 'Steady Progress Baseline',
          desc: `Your overall normalized score is balanced at ${overallNormalizedProgress}%, demonstrating consistent stability over the ${rangeDaysCount}-day window.`,
          type: 'neutral',
        });
      }

      // 2. Best performing meter
      const sortedMeters = [...activeMeterPerfs].sort((a, b) => b.avgNormalized - a.avgNormalized);
      if (sortedMeters.length > 0 && sortedMeters[0].avgNormalized > 0) {
        const top = sortedMeters[0];
        generatedInsights.push({
          title: `Leading Metric: ${top.meter.name}`,
          desc: `${top.meter.emojiIcon} ${top.meter.name} is your highest performing dimension, maintaining an average normalized score of ${top.avgNormalized}%.`,
          type: 'positive',
        });
      }

      // 3. Fast improving meter
      const sortedByDelta = [...activeMeterPerfs].sort((a, b) => b.deltaPercent - a.deltaPercent);
      if (sortedByDelta.length > 0 && sortedByDelta[0].deltaPercent > 4) {
        const bestDelta = sortedByDelta[0];
        generatedInsights.push({
          title: `Accelerating Metric: ${bestDelta.meter.name}`,
          desc: `${bestDelta.meter.emojiIcon} ${bestDelta.meter.name} experienced the greatest surge with a +${bestDelta.deltaPercent}% increase over the previous period.`,
          type: 'positive',
        });
      }

      // 4. Balance insight
      if (activeMeterPerfs.length >= 2) {
        if (spread > 35 && sortedMeters.length >= 2) {
          const lowest = sortedMeters[sortedMeters.length - 1];
          generatedInsights.push({
            title: `Opportunity Area: ${lowest.meter.name}`,
            desc: `${lowest.meter.emojiIcon} ${lowest.meter.name} is averaging ${lowest.avgNormalized}% (${Math.round(spread)}% below top dimension). Incremental logging here will balance total progress.`,
            type: 'attention',
          });
        } else {
          generatedInsights.push({
            title: 'Harmonious System Balance',
            desc: `Your active dimensions are advancing in close synergy, maintaining consistent cross-meter alignment.`,
            type: 'positive',
          });
        }
      }

      // 5. Tracking Consistency
      if (consistencyPercentage >= 70) {
        generatedInsights.push({
          title: 'High Habitual Consistency',
          desc: `You logged on ${activeDaysCount} of ${rangeDaysCount} days (${consistencyPercentage}% tracking rate), establishing strong data fidelity.`,
          type: 'positive',
        });
      }
    }

    return {
      totalMetersCount: safeMeters.length,
      activeMetersCount: activeMeterPerfs.length,
      totalLogsCount,
      activeDaysCount,
      consistencyPercentage,
      avgLogsPerActiveDay,
      overallNormalizedProgress,
      prevOverallNormalized,
      overallDelta,
      momentumStatus,
      momentumDescription,
      momentumVelocity,
      balanceCategory,
      balanceExplanation,
      spread,
      currentStreak,
      longestStreak,
      dailyTrajectory,
      dailyLogsCountMap,
      meterPerformance,
      meterPerfList,
      activeMeterPerfs,
      recoveryData,
      peakOverallDay,
      highestSingleMeterPeak,
      maxLogsInSingleDay,
      generatedInsights,
    };
  }, [safeMeters, dateList, prevDateList, rangeDaysCount]);

  // ----------------------------------------------------
  // 4. CHART GEOMETRY (MOMENTUM & MULTI-LINE)
  // ----------------------------------------------------
  const chartWidth = 700;
  const chartHeight = 220;
  const padX = 40;
  const padTop = 25;
  const padBottom = 35;
  const usableW = chartWidth - padX * 2;
  const usableH = chartHeight - padTop - padBottom;

  const trajectoryDenom = Math.max(1, analytics.dailyTrajectory.length - 1);

  // Momentum Coordinates
  const momentumPoints = analytics.dailyTrajectory.map((pt, idx) => {
    const x =
      analytics.dailyTrajectory.length > 1
        ? padX + (idx / trajectoryDenom) * usableW
        : chartWidth / 2;
    const safeVal = isNaN(pt.value) ? 0 : pt.value;
    const y = padTop + usableH - (safeVal / 100) * usableH;
    
    let prevY: number | undefined = undefined;
    if (pt.prevValue !== undefined && !isNaN(pt.prevValue)) {
      prevY = padTop + usableH - (pt.prevValue / 100) * usableH;
    }

    return { ...pt, x, y, prevY };
  });

  const momentumPathD = momentumPoints.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = momentumPoints[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const momentumAreaD =
    momentumPoints.length > 0 && momentumPathD
      ? `${momentumPathD} L ${momentumPoints[momentumPoints.length - 1].x} ${padTop + usableH} L ${
          momentumPoints[0].x
        } ${padTop + usableH} Z`
      : '';

  // Previous period comparison line
  const prevPoints = momentumPoints.filter((p) => p.prevY !== undefined);
  const prevPathD = prevPoints.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.prevY}`;
    const prev = prevPoints[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.prevY!;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.prevY!;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.prevY}`;
  }, '');

  // ----------------------------------------------------
  // 5. PROGRESS RING CALCULATIONS
  // ----------------------------------------------------
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const safeProgressVal = isNaN(analytics.overallNormalizedProgress)
    ? 0
    : Math.min(100, Math.max(0, analytics.overallNormalizedProgress));
  const ringStrokeOffset = isNaN(ringCircumference)
    ? 0
    : ringCircumference - (safeProgressVal / 100) * ringCircumference;

  // High performance closest-point tracking handlers (no circle hitbox overlap or mouse flickering)
  const handleMomentumMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (analytics.activeDaysCount === 0 || momentumPoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || rect.width <= 0) return;
    const mouseX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const svgX = (mouseX / rect.width) * chartWidth;
    let closest = momentumPoints[0];
    let minDiff = Infinity;
    for (const pt of momentumPoints) {
      const diff = Math.abs(pt.x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }
    if (closest) {
      setHoveredMomentumPoint({
        date: closest.date,
        displayDate: closest.displayDate,
        value: closest.value,
        prevValue: closest.prevValue,
        activeCount: closest.activeCount,
        meterValues: closest.meterValues || [],
        x: closest.x,
        y: closest.y,
      });
    }
  };

  const handleMultiLineMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (analytics.activeMetersCount === 0 || analytics.dailyTrajectory.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || rect.width <= 0) return;
    const mouseX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const svgX = (mouseX / rect.width) * chartWidth;
    let closestIdx = 0;
    let minDiff = Infinity;
    analytics.dailyTrajectory.forEach((pt, idx) => {
      const x = analytics.dailyTrajectory.length > 1 ? padX + (idx / trajectoryDenom) * usableW : chartWidth / 2;
      const diff = Math.abs(x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    const pt = analytics.dailyTrajectory[closestIdx];
    if (!pt) return;
    const x = analytics.dailyTrajectory.length > 1 ? padX + (closestIdx / trajectoryDenom) * usableW : chartWidth / 2;
    const scores = analytics.meterPerfList
      .filter((p) => selectedMetersForChart[p.meter.id] !== false)
      .map((p) => {
        const sItem = (p.sparkline || []).find((s) => s.date === pt.date);
        return {
          id: p.meter.id,
          name: p.meter.name,
          emoji: p.meter.emojiIcon,
          norm: sItem && sItem.hasLog ? sItem.norm : 0,
          hasLog: sItem ? sItem.hasLog : false,
          color: p.color,
        };
      });

    setHoveredMultiLinePoint({
      date: pt.date,
      displayDate: pt.displayDate,
      meterScores: scores,
      x,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-[#281b18]/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden select-none">
      {/* Full Screen Command Center Modal */}
      <div className="bg-[#fbf6ef] text-[#281b18] w-full h-full shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* ==================================================== */}
        {/* STICKY TOP HEADER */}
        {/* ==================================================== */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-8 border-b border-[#281b18]/10 bg-[#fbf6ef]/95 backdrop-blur-md shrink-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#df734c] text-white flex items-center justify-center shadow-md shrink-0">
              <Compass size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase font-black text-[#df734c] bg-[#df734c]/10 px-2.5 py-0.5 rounded-full border border-[#df734c]/30">
                  SYSTEM-WIDE COMMAND CENTER
                </span>
                <span className="font-mono text-[10px] text-[#823b28]/80 font-bold bg-[#edd8c2] px-2 py-0.5 rounded-full">
                  {analytics.activeMetersCount} of {analytics.totalMetersCount} Meters Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-sans text-[#281b18] tracking-tight mt-0.5">
                Overall Progress Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Time Range Selector */}
            <div className="bg-[#edd8c2] p-1 rounded-2xl flex items-center gap-1 border border-[#281b18]/10 shadow-2xs">
              {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs scale-102'
                      : 'text-[#823b28]/70 hover:text-[#823b28] hover:bg-[#f6e9d7]'
                  }`}
                >
                  {r === '7d' ? '7 DAYS' : r === '30d' ? '30 DAYS' : r === '90d' ? '90 DAYS' : 'ALL TIME'}
                </button>
              ))}
            </div>

            {/* Close Full Screen Window */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] transition-all cursor-pointer border border-[#281b18]/10 shadow-2xs"
              title="Close Full Screen Analytics (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ==================================================== */}
        {/* MAIN SCROLLABLE DASHBOARD BODY */}
        {/* ==================================================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Zero Meters Detected Smart Notice */}
          {safeMeters.length === 0 && (
            <div className="bg-[#edd8c2] border border-[#d4aa86] rounded-3xl p-6 text-center space-y-2 shadow-sm">
              <span className="font-mono text-[10px] font-black uppercase text-[#823b28] tracking-widest block">
                NO METERS DETECTED
              </span>
              <h3 className="text-lg font-black text-[#281b18]">No Progress Meters Created Yet</h3>
              <p className="text-xs text-[#823b28] max-w-md mx-auto">
                Create progress meters in the main Progress view to track and normalize multiple dimensions (mood, hydration, reading, focus, etc.) in this command center.
              </p>
            </div>
          )}

          {/* TOP SUMMARY BENTO GRID */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Primary Overall Progress Hero Card */}
            <div className="lg:col-span-5 bg-[#231714] text-[#f6e9d7] border border-[#3d231d] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              {/* Subtle background gradient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#df734c]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 z-10">
                <div>
                  <span className="font-mono text-[10px] font-black uppercase text-[#eb9d7d] tracking-widest block">
                    AGGREGATED PERFORMANCE
                  </span>
                  <h2 className="text-xl font-black font-sans text-white mt-0.5">
                    Overall Normalized Progress
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCalculationInfo(true)}
                  className="flex items-center gap-1 font-mono text-[9px] font-bold text-[#eb9d7d] bg-[#361e18] hover:bg-[#522c24] px-2.5 py-1 rounded-xl border border-[#522c24] cursor-pointer transition-colors shadow-2xs"
                  title="How this is calculated"
                >
                  <Info size={11} />
                  <span>Calculation Logic</span>
                </button>
              </div>

              {/* Center Ring & Primary Percentage */}
              <div className="flex items-center justify-between gap-6 my-6 z-10">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                      {analytics.overallNormalizedProgress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        analytics.overallDelta > 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                          : analytics.overallDelta < 0
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                          : 'bg-[#361e18] text-[#eb9d7d]'
                      }`}
                    >
                      {analytics.overallDelta > 0 ? (
                        <ArrowUpRight size={13} />
                      ) : analytics.overallDelta < 0 ? (
                        <ArrowDownRight size={13} />
                      ) : (
                        <Minus size={13} />
                      )}
                      <span>
                        {analytics.overallDelta > 0 ? `+${analytics.overallDelta}%` : `${analytics.overallDelta}%`} from previous {rangeDaysCount}d
                      </span>
                    </span>
                  </div>
                </div>

                {/* SVG Progress Ring */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={ringRadius}
                      className="text-[#361e18]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={ringRadius}
                      className="text-[#df734c] transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringStrokeOffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Compass size={20} className="text-[#eb9d7d]" />
                  </div>
                </div>
              </div>

              {/* Footer Metadata Status */}
              <div className="pt-4 border-t border-[#3d231d] flex items-center justify-between gap-4 font-mono text-xs text-[#eb9d7d]/80 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#df734c]" />
                  <span>{analytics.activeMetersCount} active meters</span>
                </div>
                <span>{analytics.totalLogsCount} total logs recorded</span>
              </div>
            </div>

            {/* Momentum & System Baseline Status Card */}
            <div className="lg:col-span-4 bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-black uppercase text-[#823b28] tracking-widest flex items-center gap-1.5">
                    <Zap size={13} className="text-[#df734c]" />
                    MOMENTUM TRAJECTORY
                  </span>
                  <span
                    className={`font-mono text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      analytics.momentumStatus === 'BUILDING MOMENTUM'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : analytics.momentumStatus === 'COOLING DOWN'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-[#edd8c2] text-[#823b28] border-[#823b28]/20'
                    }`}
                  >
                    {analytics.momentumStatus}
                  </span>
                </div>

                <h3 className="text-xl font-black font-sans text-[#281b18] tracking-tight">
                  {analytics.momentumStatus === 'BUILDING MOMENTUM'
                    ? 'Accelerating Trajectory'
                    : analytics.momentumStatus === 'COOLING DOWN'
                    ? 'Decelerating Rhythm'
                    : analytics.momentumStatus === 'RECOVERING'
                    ? 'Rebounding Progress'
                    : 'Steady Consistency'}
                </h3>

                <p className="text-xs text-[#823b28] font-medium mt-2 leading-relaxed">
                  {analytics.momentumDescription}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#281b18]/10 grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-[#fbf6ef] p-2.5 rounded-xl border border-[#281b18]/10">
                  <span className="text-[9px] font-bold text-[#823b28]/70 uppercase block">Active Streak</span>
                  <span className="text-base font-black text-[#281b18] mt-0.5 block">
                    {analytics.currentStreak} {analytics.currentStreak === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <div className="bg-[#fbf6ef] p-2.5 rounded-xl border border-[#281b18]/10">
                  <span className="text-[9px] font-bold text-[#823b28]/70 uppercase block">Tracking Rate</span>
                  <span className="text-base font-black text-[#281b18] mt-0.5 block">
                    {analytics.consistencyPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Balance & Spread Summary Card */}
            <div className="lg:col-span-3 bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-black uppercase text-[#823b28] tracking-widest flex items-center gap-1.5">
                    <Scale size={13} className="text-[#df734c]" />
                    DIMENSION BALANCE
                  </span>
                  <span className="font-mono text-[9px] font-black text-[#823b28] bg-[#edd8c2] px-2 py-0.5 rounded-full">
                    {analytics.spread}% Spread
                  </span>
                </div>

                <h3 className="text-lg font-black font-sans text-[#281b18] tracking-tight">
                  {analytics.balanceCategory}
                </h3>

                <p className="text-xs text-[#823b28] font-medium mt-1.5 leading-relaxed">
                  {analytics.balanceExplanation}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#281b18]/10">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#823b28] mb-1.5">
                  <span>Alignment Distribution</span>
                  <span>{100 - Math.min(100, Math.round(analytics.spread))}% Harmony</span>
                </div>
                <div className="w-full bg-[#edd8c2] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#df734c] h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(15, 100 - Math.min(100, Math.round(analytics.spread)))}%` }}
                  />
                </div>
              </div>
            </div>

          </section>

          {/* ==================================================== */}
          {/* SECTION: OVERALL MOMENTUM CURVE (LINE/AREA CHART) */}
          {/* ==================================================== */}
          <section className="bg-[#f6e9d7]/70 border border-[#281b18]/15 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#281b18]/10">
              <div>
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#df734c]" />
                  <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider">
                    TIME-SERIES AGGREGATION ({timeRange.toUpperCase()})
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#281b18] font-sans mt-0.5">
                  Overall Momentum Trajectory
                </h3>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <div className="flex items-center gap-1.5 text-[#281b18]">
                  <span className="w-3 h-1 bg-[#df734c] rounded-full inline-block" />
                  <span>Current Period Normalized Curve</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#823b28]/70">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#823b28] inline-block" />
                  <span>Previous Period Reference</span>
                </div>
              </div>
            </div>

            {/* SVG Trajectory Canvas or Smart Empty State */}
            {analytics.activeDaysCount === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 bg-[#fbf6ef]/70 border border-dashed border-[#281b18]/20 rounded-3xl text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#edd8c2] text-[#823b28] flex items-center justify-center mb-1">
                  <Activity size={22} />
                </div>
                <h4 className="text-sm font-extrabold text-[#281b18]">No Tracking Data Recorded</h4>
                <p className="text-xs text-[#823b28]/80 max-w-sm">
                  Log your daily progress across any progress meter to generate the overall momentum curve, trend trajectory, and previous period comparisons.
                </p>
              </div>
            ) : (
              <div className="relative w-full overflow-hidden pt-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto overflow-visible select-none cursor-crosshair"
                  onMouseMove={handleMomentumMouseMove}
                  onMouseLeave={() => setHoveredMomentumPoint(null)}
                >
                  <defs>
                    <linearGradient id="overallAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#df734c" stopOpacity="0.35" />
                      <stop offset="85%" stopColor="#df734c" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#df734c" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((level) => {
                    const y = padTop + usableH - (level / 100) * usableH;
                    return (
                      <g key={level}>
                        <line
                          x1={padX}
                          y1={y}
                          x2={chartWidth - padX}
                          y2={y}
                          stroke="#281b18"
                          strokeOpacity="0.1"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padX - 8}
                          y={y + 3}
                          textAnchor="end"
                          fill="#823b28"
                          opacity="0.65"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {level}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Previous Period Dashed Curve */}
                  {prevPoints.length > 1 && (
                    <path
                      d={prevPathD}
                      fill="none"
                      stroke="#823b28"
                      strokeOpacity="0.35"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Area Fill */}
                  <path d={momentumAreaD} fill="url(#overallAreaGradient)" />

                  {/* Primary Solid Trajectory Line */}
                  <path
                    d={momentumPathD}
                    fill="none"
                    stroke="#df734c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Vertical Tracking Line on Hover */}
                  {hoveredMomentumPoint && (
                    <line
                      x1={hoveredMomentumPoint.x}
                      y1={padTop}
                      x2={hoveredMomentumPoint.x}
                      y2={padTop + usableH}
                      stroke="#823b28"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.7"
                    />
                  )}

                  {/* Data Points (Sampled for visual cleanliness) */}
                  {momentumPoints.map((pt, idx) => {
                    const isHovered = hoveredMomentumPoint?.date === pt.date;
                    // Only render visual circles if count is reasonable or when active/hovered
                    const shouldDrawCircle =
                      isHovered ||
                      rangeDaysCount <= 30 ||
                      (pt.hasActivity && idx % Math.ceil(momentumPoints.length / 20) === 0);

                    return (
                      <g key={pt.date}>
                        {shouldDrawCircle && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6 : pt.hasActivity ? 4 : 2}
                            fill={isHovered ? '#823b28' : pt.hasActivity ? '#df734c' : '#edd8c2'}
                            stroke={pt.hasActivity ? '#fbf6ef' : '#d4aa86'}
                            strokeWidth={pt.hasActivity ? 2 : 1}
                            className="transition-all duration-150 pointer-events-none"
                          />
                        )}

                        {/* X Axis Date Labels */}
                        {(analytics.dailyTrajectory.length <= 14 ||
                          idx % Math.ceil(analytics.dailyTrajectory.length / 7) === 0) && (
                          <text
                            x={pt.x}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            fill="#823b28"
                            opacity={pt.hasActivity ? '0.9' : '0.5'}
                            fontWeight={pt.hasActivity ? 'bold' : 'normal'}
                            fontSize="9"
                            fontFamily="monospace"
                            className="pointer-events-none"
                          >
                            {pt.displayDate}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Interactive Tooltip Overlay with Clamped Positioning */}
                {hoveredMomentumPoint && (
                  <div
                    className="absolute pointer-events-none bg-[#281b18] text-[#f6e9d7] border border-[#281b18]/20 rounded-2xl p-3 shadow-2xl z-30 transform -translate-x-1/2 -translate-y-full transition-all duration-100 min-w-[200px]"
                    style={{
                      left: `${Math.max(14, Math.min(86, (hoveredMomentumPoint.x / chartWidth) * 100))}%`,
                      top: `${Math.max(40, (hoveredMomentumPoint.y / chartHeight) * 100 - 6)}%`,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-[#3d231d] pb-1.5 mb-1.5 font-mono text-[9px]">
                      <span className="font-bold text-[#eb9d7d] uppercase">
                        {hoveredMomentumPoint.displayDate}
                      </span>
                      <span className="text-white font-black text-xs">
                        {hoveredMomentumPoint.value}% Overall
                      </span>
                    </div>

                    {hoveredMomentumPoint.meterValues.length > 0 ? (
                      <div className="space-y-1 text-xs">
                        {hoveredMomentumPoint.meterValues.map((mv, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 text-[11px]">
                            <span className="flex items-center gap-1 text-[#eb9d7d] truncate">
                              <span>{mv.emoji}</span>
                              <span className="truncate">{mv.name}</span>
                            </span>
                            <span className="font-mono font-bold text-white shrink-0">
                              {mv.norm}% ({formatRawVal(mv.raw, mv.unitType)})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-[#eb9d7d]/60 italic">No entries logged on this date</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ==================================================== */}
          {/* SECTION: RECENT MOMENTUM DELTA BREAKDOWN */}
          {/* ==================================================== */}
          <section className="bg-[#f6e9d7]/70 border border-[#281b18]/15 rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#281b18]/10 mb-4">
              <div>
                <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider block">
                  PERIOD-OVER-PERIOD VELOCITY
                </span>
                <h4 className="text-lg font-extrabold text-[#281b18] font-sans">
                  Recent Momentum Breakdown
                </h4>
              </div>
              <span className="font-mono text-[11px] text-[#823b28] font-bold">
                Comparing current {rangeDaysCount}d vs previous {rangeDaysCount}d
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Overall Momentum Card */}
              <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                <span className="font-mono text-[10px] font-black uppercase text-[#823b28]">
                  Combined Overall
                </span>
                <div className="flex items-baseline justify-between my-2">
                  <span className="text-2xl font-black font-mono text-[#281b18]">
                    {analytics.overallNormalizedProgress}%
                  </span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                      analytics.overallDelta > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : analytics.overallDelta < 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-[#edd8c2] text-[#823b28]'
                    }`}
                  >
                    {analytics.overallDelta > 0 ? (
                      <ArrowUpRight size={12} />
                    ) : analytics.overallDelta < 0 ? (
                      <ArrowDownRight size={12} />
                    ) : (
                      <Minus size={12} />
                    )}
                    <span>{analytics.overallDelta > 0 ? `+${analytics.overallDelta}%` : `${analytics.overallDelta}%`}</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#823b28]/70">
                  Prev avg: {analytics.prevOverallNormalized}%
                </span>
              </div>

              {/* Per-Meter Deltas */}
              {analytics.meterPerfList.map((perf) => (
                <div
                  key={perf.meter.id}
                  onClick={() => onSelectMeter && onSelectMeter(perf.meter)}
                  className="bg-[#fbf6ef] border border-[#281b18]/15 hover:border-[#df734c] rounded-2xl p-4 flex flex-col justify-between shadow-2xs cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase text-[#823b28] truncate flex items-center gap-1">
                      <span>{perf.meter.emojiIcon}</span>
                      <span className="truncate">{perf.meter.name}</span>
                    </span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: perf.color }} />
                  </div>

                  <div className="flex items-baseline justify-between my-2">
                    <span className="text-2xl font-black font-mono text-[#281b18]">
                      {perf.avgNormalized}%
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                        perf.deltaPercent > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : perf.deltaPercent < 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-[#edd8c2] text-[#823b28]'
                      }`}
                    >
                      {perf.deltaPercent > 0 ? (
                        <ArrowUpRight size={12} />
                      ) : perf.deltaPercent < 0 ? (
                        <ArrowDownRight size={12} />
                      ) : (
                        <Minus size={12} />
                      )}
                      <span>{perf.deltaPercent > 0 ? `+${perf.deltaPercent}%` : `${perf.deltaPercent}%`}</span>
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-[#823b28]/70">
                    Prev avg: {perf.prevNormalizedAvg}%
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ==================================================== */}
          {/* SECTION: METER PERFORMANCE MAP (BENTO GRID) */}
          {/* ==================================================== */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider block">
                  COMPONENT DIMENSIONS
                </span>
                <h3 className="text-xl font-extrabold text-[#281b18] font-sans">
                  Meter Performance Map
                </h3>
              </div>

              <span className="font-mono text-xs text-[#823b28]/80 font-bold hidden sm:inline">
                Click any meter card to drill down to individual analytics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {analytics.meterPerfList.map((perf) => {
                const m = perf.meter;

                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMeter && onSelectMeter(m)}
                    className="bg-[#fbf6ef] border border-[#281b18]/15 hover:border-[#df734c] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Metric Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#edd8c2] border border-[#d4aa86] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                            {m.emojiIcon}
                          </div>
                          <div>
                            <span className="font-mono text-[9px] uppercase font-bold text-[#823b28] tracking-widest block">
                              {(m.unitType || 'scale_1_5').toUpperCase().replace(/_/g, ' ')}
                            </span>
                            <h4 className="text-base font-black font-sans text-[#281b18] tracking-tight group-hover:text-[#df734c] transition-colors">
                              {m.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[#823b28] opacity-60 group-hover:opacity-100 transition-opacity">
                          <span className="font-mono text-[10px] font-bold">Inspect</span>
                          <ExternalLink size={12} />
                        </div>
                      </div>

                      {/* Normalized Progress % & Raw Value */}
                      <div className="flex items-baseline justify-between gap-2 my-2 bg-[#f6e9d7] p-3 rounded-2xl border border-[#281b18]/10">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-[#823b28]/70 uppercase block">
                            Normalized Score
                          </span>
                          <span className="text-2xl font-black font-mono text-[#281b18]">
                            {perf.avgNormalized}%
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-mono font-bold text-[#823b28]/70 uppercase block">
                            Current / Goal
                          </span>
                          <span className="text-xs font-bold font-mono text-[#823b28]">
                            {formatRawVal(perf.currentRaw, m.unitType, m.unitLabel)} / {formatRawVal(m.goalValue || 10, m.unitType, m.unitLabel)}
                          </span>
                        </div>
                      </div>

                      {/* Sparkline & Delta */}
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 font-mono text-xs font-bold">
                          <span
                            className={`flex items-center gap-0.5 ${
                              perf.deltaPercent > 0
                                ? 'text-emerald-700'
                                : perf.deltaPercent < 0
                                ? 'text-rose-700'
                                : 'text-[#823b28]/70'
                            }`}
                          >
                            {perf.deltaPercent > 0 ? (
                              <ArrowUpRight size={13} />
                            ) : perf.deltaPercent < 0 ? (
                              <ArrowDownRight size={13} />
                            ) : (
                              <Minus size={13} />
                            )}
                            <span>
                              {perf.deltaPercent > 0 ? `+${perf.deltaPercent}%` : `${perf.deltaPercent}%`}
                            </span>
                          </span>
                          <span className="text-[9px] text-[#823b28]/60 uppercase">vs prev</span>
                        </div>

                        <span className="font-mono text-[10px] text-[#823b28]/80">
                          {perf.logCount} logs / {rangeDaysCount}d
                        </span>
                      </div>
                    </div>

                    {/* Mini Sparkline Bar Chart */}
                    <div className="mt-3 pt-3 border-t border-[#281b18]/10 flex items-end gap-1 h-8">
                      {perf.sparkline.slice(-14).map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex-1 bg-[#edd8c2] rounded-xs h-full flex items-end overflow-hidden"
                          title={`${s.date}: ${s.norm}%`}
                        >
                          <div
                            className="w-full bg-[#df734c] rounded-xs transition-all duration-300"
                            style={{ height: `${s.hasLog ? Math.max(15, s.norm) : 0}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ==================================================== */}
          {/* SECTION: MULTI-METER TREND COMPARISON & BALANCE */}
          {/* ==================================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Multi-Line Selectable Trend Comparison */}
            <div className="lg:col-span-8 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#281b18]/10">
                <div>
                  <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider block">
                    COMPARATIVE TRAJECTORY
                  </span>
                  <h4 className="text-lg font-extrabold text-[#281b18] font-sans">
                    Progress Trend by Meter
                  </h4>
                </div>

                {/* Meter Toggle Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {analytics.meterPerfList.map((perf) => {
                    const isVisible = selectedMetersForChart[perf.meter.id] !== false;
                    return (
                      <button
                        key={perf.meter.id}
                        type="button"
                        onClick={() =>
                          setSelectedMetersForChart((prev) => ({
                            ...prev,
                            [perf.meter.id]: prev[perf.meter.id] === false ? true : false,
                          }))
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                          isVisible
                            ? 'bg-[#f6e9d7] text-[#281b18] border-[#281b18]/20 shadow-2xs'
                            : 'bg-transparent text-[#823b28]/40 border-dashed border-[#281b18]/10 line-through opacity-70'
                        }`}
                        title={isVisible ? `Hide ${perf.meter.name} from chart` : `Show ${perf.meter.name} on chart`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isVisible ? perf.color : '#a88574' }} />
                        <span>{perf.meter.emojiIcon}</span>
                        <span className="truncate max-w-[100px]">{perf.meter.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Line SVG Chart or 1-Meter Explanatory State */}
              {safeMeters.length <= 1 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-[#f6e9d7]/50 border border-dashed border-[#281b18]/15 rounded-2xl text-center space-y-1.5 my-4">
                  <div className="w-10 h-10 rounded-xl bg-[#edd8c2] text-[#df734c] flex items-center justify-center mb-1">
                    <Layers size={20} />
                  </div>
                  <span className="text-xs font-bold text-[#281b18]">Multi-Meter Comparison Unlocks with 2+ Dimensions</span>
                  <p className="text-[11px] text-[#823b28]/80 max-w-sm">
                    You currently have {safeMeters.length} meter configured ({safeMeters[0]?.name || 'none'}). Create additional progress meters to plot and compare normalized curves side-by-side.
                  </p>
                </div>
              ) : (
                <div className="relative w-full overflow-hidden pt-3">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto overflow-visible select-none cursor-crosshair"
                    onMouseMove={handleMultiLineMouseMove}
                    onMouseLeave={() => setHoveredMultiLinePoint(null)}
                  >
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map((level) => {
                      const y = padTop + usableH - (level / 100) * usableH;
                      return (
                        <g key={level}>
                          <line
                            x1={padX}
                            y1={y}
                            x2={chartWidth - padX}
                            y2={y}
                            stroke="#281b18"
                            strokeOpacity="0.08"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <text
                            x={padX - 8}
                            y={y + 3}
                            textAnchor="end"
                            fill="#823b28"
                            opacity="0.6"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {level}%
                          </text>
                        </g>
                      );
                    })}

                    {/* Vertical Tracking Line on Hover */}
                    {hoveredMultiLinePoint && (
                      <line
                        x1={hoveredMultiLinePoint.x}
                        y1={padTop}
                        x2={hoveredMultiLinePoint.x}
                        y2={padTop + usableH}
                        stroke="#823b28"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.6"
                      />
                    )}

                    {/* Individual Meter Trend Lines */}
                    {analytics.meterPerfList.map((perf) => {
                      if (selectedMetersForChart[perf.meter.id] === false) return null;

                      const denom = Math.max(1, perf.sparkline.length - 1);
                      const mPoints = perf.sparkline.map((s, idx) => {
                        const x =
                          perf.sparkline.length > 1
                            ? padX + (idx / denom) * usableW
                            : chartWidth / 2;
                        const y = padTop + usableH - (s.norm / 100) * usableH;
                        return { x, y, hasLog: s.hasLog, norm: s.norm };
                      });

                      const lineD = mPoints.reduce((acc, curr, idx) => {
                        if (idx === 0) return `M ${curr.x} ${curr.y}`;
                        const prev = mPoints[idx - 1];
                        const cpX1 = prev.x + (curr.x - prev.x) / 2;
                        const cpY1 = prev.y;
                        const cpX2 = prev.x + (curr.x - prev.x) / 2;
                        const cpY2 = curr.y;
                        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
                      }, '');

                      return (
                        <g key={perf.meter.id}>
                          <path
                            d={lineD}
                            fill="none"
                            stroke={perf.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-90 hover:opacity-100 transition-opacity"
                          />
                        </g>
                      );
                    })}

                    {/* X Axis Date Labels */}
                    {analytics.dailyTrajectory.map((pt, idx) => {
                      const x =
                        analytics.dailyTrajectory.length > 1
                          ? padX + (idx / trajectoryDenom) * usableW
                          : chartWidth / 2;

                      if (
                        analytics.dailyTrajectory.length <= 14 ||
                        idx % Math.ceil(analytics.dailyTrajectory.length / 7) === 0
                      ) {
                        return (
                          <text
                            key={pt.date}
                            x={x}
                            y={chartHeight - 10}
                            textAnchor="middle"
                            fill="#823b28"
                            opacity="0.7"
                            fontSize="9"
                            fontFamily="monospace"
                            className="pointer-events-none"
                          >
                            {pt.displayDate}
                          </text>
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* Multi-Line Tooltip Overlay with Clamped Positioning */}
                  {hoveredMultiLinePoint && (
                    <div
                      className="absolute pointer-events-none bg-[#281b18] text-[#f6e9d7] border border-[#281b18]/20 rounded-2xl p-3 shadow-2xl z-30 transform -translate-x-1/2 -translate-y-full transition-all duration-100 min-w-[210px]"
                      style={{
                        left: `${Math.max(14, Math.min(86, (hoveredMultiLinePoint.x / chartWidth) * 100))}%`,
                        top: `${padTop + 45}px`,
                      }}
                    >
                      <div className="font-mono text-[9px] font-bold text-[#eb9d7d] uppercase border-b border-[#3d231d] pb-1.5 mb-1.5">
                        {hoveredMultiLinePoint.displayDate} Scores
                      </div>
                      <div className="space-y-1">
                        {hoveredMultiLinePoint.meterScores.map((ms) => (
                          <div key={ms.id} className="flex items-center justify-between gap-3 text-xs">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ms.color }} />
                              <span>{ms.emoji}</span>
                              <span className="text-[#f6e9d7] truncate max-w-[110px]">{ms.name}</span>
                            </span>
                            <span className="font-mono font-bold text-white shrink-0">
                              {ms.hasLog ? `${ms.norm}%` : <span className="opacity-40">No log</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contribution Balance Breakdown */}
            <div className="lg:col-span-4 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider block">
                  DISTRIBUTION ANALYSIS
                </span>
                <h4 className="text-lg font-extrabold text-[#281b18] font-sans">
                  Contribution Balance
                </h4>
                <p className="text-xs text-[#823b28] mt-1 leading-relaxed">
                  Relative normalized performance across each dimension:
                </p>

                {/* Horizontal Progress Fill Bars */}
                <div className="space-y-3.5 mt-5">
                  {analytics.meterPerfList.map((perf) => (
                    <div key={perf.meter.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="flex items-center gap-1.5 text-[#281b18]">
                          <span>{perf.meter.emojiIcon}</span>
                          <span className="truncate max-w-[140px]">{perf.meter.name}</span>
                        </span>
                        <span className="text-[#823b28]">{perf.avgNormalized}%</span>
                      </div>
                      <div className="w-full bg-[#edd8c2] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(4, Math.min(100, perf.avgNormalized))}%`,
                            backgroundColor: perf.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#281b18]/10 text-xs font-mono text-[#823b28]">
                {safeMeters.length <= 1 ? (
                  <span>Focusing on 1 active dimension. Add 2+ meters for cross-dimension balance index.</span>
                ) : (
                  <span><strong className="text-[#281b18]">Summary:</strong> {analytics.balanceCategory} ({analytics.spread}% differential)</span>
                )}
              </div>
            </div>

          </section>

          {/* ==================================================== */}
          {/* SECTION: CONSISTENCY HEATMAP & LOGGING MATRIX */}
          {/* ==================================================== */}
          <section className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#281b18]/10">
              <div>
                <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider block">
                  LOGGING BEHAVIOR & FREQUENCY
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#281b18] font-sans">
                  Consistency Matrix Heatmap
                </h3>
              </div>

              {/* Matrix Legend */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#823b28]">
                <span>No Logs</span>
                <div className="w-3.5 h-3.5 rounded-sm bg-[#edd8c2] border border-[#281b18]/10" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[#f5c3af]" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[#eb9d7d]" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[#df734c]" />
                <div className="w-3.5 h-3.5 rounded-sm bg-[#823b28]" />
                <span>3+ Logs/Day</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {analytics.dailyTrajectory.map((d) => {
                const logs = d.activeCount;
                let colorCls = 'bg-[#edd8c2] border border-[#281b18]/10 text-[#823b28]/40';
                if (logs === 1) colorCls = 'bg-[#f5c3af] text-[#281b18]';
                else if (logs === 2) colorCls = 'bg-[#eb9d7d] text-[#281b18]';
                else if (logs === 3) colorCls = 'bg-[#df734c] text-white';
                else if (logs >= 4) colorCls = 'bg-[#823b28] text-white';

                return (
                  <div
                    key={d.date}
                    onMouseEnter={() =>
                      setHoveredHeatmapDay({
                        date: d.date,
                        displayDate: d.displayDate,
                        logsCount: logs,
                        loggedMeters: d.meterValues.map((m) => `${m.emoji} ${m.name}`),
                      })
                    }
                    onClick={() =>
                      setHoveredHeatmapDay({
                        date: d.date,
                        displayDate: d.displayDate,
                        logsCount: logs,
                        loggedMeters: d.meterValues.map((m) => `${m.emoji} ${m.name}`),
                      })
                    }
                    onMouseLeave={() => setHoveredHeatmapDay(null)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-2xs ${colorCls}`}
                    title={`${d.displayDate}: ${logs} logs`}
                  >
                    <span className="font-mono text-[9px] font-bold">
                      {parseInt(d.date.split('-')[2] || '1', 10)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Heatmap Tooltip info bar */}
            {hoveredHeatmapDay ? (
              <div className="mt-3 bg-[#f6e9d7] p-2.5 rounded-xl border border-[#281b18]/15 flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#281b18]">{hoveredHeatmapDay.displayDate}</span>
                <span className="text-[#823b28] font-bold">
                  {hoveredHeatmapDay.logsCount > 0
                    ? `${hoveredHeatmapDay.logsCount} logs: ${hoveredHeatmapDay.loggedMeters.join(', ')}`
                    : 'No tracking logs recorded'}
                </span>
              </div>
            ) : (
              <div className="text-xs font-mono text-[#823b28]/70 pt-1">
                Hover or tap any date cell above to inspect the specific logged dimensions.
              </div>
            )}
          </section>

          {/* ==================================================== */}
          {/* SECTION: CROSS-METER INSIGHTS & PERSONAL RECORDS */}
          {/* ==================================================== */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Real Data Insights */}
            <div className="lg:col-span-7 bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#281b18]/10">
                <Sparkles size={16} className="text-[#df734c]" />
                <h4 className="text-base font-extrabold text-[#281b18] font-sans">
                  Data-Driven Insights & Patterns
                </h4>
              </div>

              <div className="space-y-2.5">
                {analytics.generatedInsights.map((ins, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#fbf6ef] border border-[#281b18]/10 rounded-2xl flex items-start gap-3 shadow-2xs"
                  >
                    <div className="p-1 rounded-lg bg-[#edd8c2] text-[#823b28] shrink-0 mt-0.5">
                      <CheckCircle2 size={13} className="text-[#df734c]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-[#281b18]">{ins.title}</h5>
                      <p className="text-xs text-[#823b28] mt-0.5 leading-relaxed">{ins.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Records & Dip Recovery */}
            <div className="lg:col-span-5 bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-[#281b18]/10">
                  <Award size={16} className="text-[#df734c]" />
                  <h4 className="text-base font-extrabold text-[#281b18] font-sans">
                    Personal Records & Milestones
                  </h4>
                </div>

                <div className="space-y-2.5 mt-3">
                  <div className="flex items-center justify-between p-2.5 bg-[#fbf6ef] rounded-xl border border-[#281b18]/10 text-xs font-mono">
                    <span className="text-[#823b28] font-bold">Peak Overall Day</span>
                    <span className="font-black text-[#281b18]">
                      {analytics.peakOverallDay.value > 0 ? (
                        `${analytics.peakOverallDay.value}% (${analytics.peakOverallDay.date})`
                      ) : (
                        <span className="text-[#823b28]/60 font-medium">No activity yet</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#fbf6ef] rounded-xl border border-[#281b18]/10 text-xs font-mono">
                    <span className="text-[#823b28] font-bold">Longest Active Run</span>
                    <span className="font-black text-[#df734c]">
                      {analytics.longestStreak > 0 ? (
                        `${analytics.longestStreak} Consecutive Days`
                      ) : (
                        <span className="text-[#823b28]/60 font-medium">0 Days</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#fbf6ef] rounded-xl border border-[#281b18]/10 text-xs font-mono">
                    <span className="text-[#823b28] font-bold">Top Metric Peak</span>
                    <span className="font-black text-[#281b18] truncate max-w-[180px] text-right">
                      {analytics.highestSingleMeterPeak.value > 0 ? (
                        `${analytics.highestSingleMeterPeak.emoji} ${analytics.highestSingleMeterPeak.name} (${analytics.highestSingleMeterPeak.value}%)`
                      ) : (
                        <span className="text-[#823b28]/60 font-medium">No entries yet</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#fbf6ef] rounded-xl border border-[#281b18]/10 text-xs font-mono">
                    <span className="text-[#823b28] font-bold">Max Logs In 1 Day</span>
                    <span className="font-black text-[#281b18]">
                      {analytics.maxLogsInSingleDay > 0 ? (
                        `${analytics.maxLogsInSingleDay} logs recorded`
                      ) : (
                        <span className="text-[#823b28]/60 font-medium">0 logs</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recovery after Dip Analysis (Requirement 10: Drop, Recovery, Current vs Pre-Drop) */}
              {analytics.recoveryData && analytics.recoveryData.hasRecovery ? (
                <div className="bg-[#edd8c2] p-3.5 rounded-2xl border border-[#d4aa86] text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#823b28] uppercase text-[10px]">
                      Recovery After a Dip
                    </span>
                    <span className="text-[9px] text-[#823b28]/70">
                      {analytics.recoveryData.dipDate} → {analytics.recoveryData.peakDate}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#fbf6ef] p-2 rounded-xl border border-[#281b18]/10">
                      <span className="text-[9px] text-[#823b28]/70 uppercase block font-bold">Drop</span>
                      <span className="text-rose-700 font-black text-xs">↓ {analytics.recoveryData.dropPercent}%</span>
                    </div>
                    <div className="bg-[#fbf6ef] p-2 rounded-xl border border-[#281b18]/10">
                      <span className="text-[9px] text-[#823b28]/70 uppercase block font-bold">Recovery</span>
                      <span className="text-emerald-700 font-black text-xs">↑ {analytics.recoveryData.recoveryPercent}%</span>
                    </div>
                    <div className="bg-[#fbf6ef] p-2 rounded-xl border border-[#281b18]/10">
                      <span className="text-[9px] text-[#823b28]/70 uppercase block font-bold">Current</span>
                      <span className={`font-black text-xs ${analytics.recoveryData.currentDeltaVsPreDrop >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {analytics.recoveryData.currentDeltaVsPreDrop >= 0 ? `+${analytics.recoveryData.currentDeltaVsPreDrop}%` : `${analytics.recoveryData.currentDeltaVsPreDrop}%`}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#fbf6ef]/60 p-3 rounded-2xl border border-dashed border-[#281b18]/15 text-[11px] text-[#823b28]/70 font-mono text-center">
                  Historical tracking is continuously analyzed for drop & recovery patterns.
                </div>
              )}
            </div>

          </section>

        </main>

        {/* ==================================================== */}
        {/* CALCULATION LOGIC TRANSPARENCY MODAL */}
        {/* ==================================================== */}
        {showCalculationInfo && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#281b18]/70 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-[#fbf6ef] border border-[#281b18]/20 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
              <button
                onClick={() => setShowCalculationInfo(false)}
                className="absolute top-5 right-5 p-2 rounded-2xl hover:bg-[#edd8c2] text-[#823b28] cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-4">
                <span className="font-mono text-[10px] font-bold text-[#df734c] uppercase tracking-wider bg-[#edd8c2] px-3 py-1 rounded-full border border-[#d4aa86]">
                  FORMULA TRANSPARENCY
                </span>
                <h3 className="text-xl font-extrabold text-[#281b18] mt-2 font-sans">
                  How Overall Progress is Calculated
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-[#281b18] leading-relaxed">
                <p>
                  Because your Progress Meters use different measurement types (1–5 ratings, percentages, time duration, and numeric counters), raw values cannot be averaged directly without producing distorted numbers.
                </p>

                <div className="bg-[#f6e9d7] p-3.5 rounded-2xl border border-[#281b18]/15 space-y-1.5 font-mono text-[11px]">
                  <div className="font-bold text-[#823b28]">Standard Normalization (0–100%):</div>
                  <div>• <strong>Scale 1–5</strong>: (Rating ÷ 5) × 100</div>
                  <div>• <strong>Percentage</strong>: Direct 0–100% value</div>
                  <div>• <strong>Time Duration</strong>: (Minutes ÷ Goal Minutes) × 100</div>
                  <div>• <strong>Numeric Counter</strong>: (Count ÷ Goal Count) × 100</div>
                </div>

                <p>
                  The <strong>Overall Progress</strong> score is the unweighted mathematical mean of the normalized scores of all active dimensions for the chosen period:
                </p>

                <div className="bg-[#edd8c2] p-3 rounded-xl font-mono text-center font-bold text-xs text-[#823b28]">
                  Overall Progress = Σ(Normalized Meter Scores) ÷ Number of Active Meters
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#281b18]/10 flex justify-end">
                <button
                  onClick={() => setShowCalculationInfo(false)}
                  className="bg-[#823b28] text-[#f6e9d7] px-5 py-2 rounded-2xl text-xs font-bold shadow-md cursor-pointer hover:bg-[#6f2f1f]"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
