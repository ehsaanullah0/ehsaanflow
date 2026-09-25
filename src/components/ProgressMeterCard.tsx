import React from 'react';
import { Trash2, TrendingUp, Sparkles, ExternalLink } from 'lucide-react';
import { ProgressMeter } from '../types';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface ProgressMeterCardProps {
  meter: ProgressMeter;
  onDeleteMeter: (id: string) => void;
  onOpenDetails: (meter: ProgressMeter) => void;
}

export const ProgressMeterCard: React.FC<ProgressMeterCardProps> = ({
  meter,
  onDeleteMeter,
  onOpenDetails,
}) => {
  // Generate the 7 continuous days ending today
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    last7Days.push(`${y}-${m}-${day}`);
  }

  const todayStr = last7Days[last7Days.length - 1];

  // Scale max value
  const maxScale =
    meter.unitType === 'scale_1_5'
      ? 5
      : meter.unitType === 'percentage'
      ? 100
      : meter.goalValue || 10;

  // Active entries in 7D
  const entries7d = last7Days.map((d) => meter.entries[d] || 0);
  const activeEntries = entries7d.filter((v) => v > 0);

  // Range average calculation
  const average =
    activeEntries.length > 0
      ? Math.round((activeEntries.reduce((a, b) => a + b, 0) / activeEntries.length) * 10) / 10
      : 0;

  // Today's value
  const todayVal = meter.entries[todayStr] ?? 0;

  // Formatting values
  const formatTodayDisplay = () => {
    if (todayVal === 0 && !(todayStr in meter.entries)) {
      return 'Not Logged';
    }
    if (meter.unitType === 'scale_1_5') return `${todayVal}/5`;
    if (meter.unitType === 'percentage') return `${todayVal}%`;
    if (meter.unitType === 'time') {
      const h = Math.floor(todayVal / 60);
      const m = todayVal % 60;
      return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;
    }
    return `${todayVal}`;
  };

  const formatAvgDisplay = () => {
    if (meter.unitType === 'scale_1_5') return `${average} / 5`;
    if (meter.unitType === 'percentage') return `${average} %`;
    if (meter.unitType === 'time') {
      const h = Math.floor(average / 60);
      const m = Math.round(average % 60);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    return `${average} ${meter.unitLabel || ''}`;
  };

  return (
    <div
      id={`progress-meter-card-${meter.id}`}
      onClick={() => onOpenDetails(meter)}
      className="bg-[#231714] text-[#f6e9d7] border border-[#3d231d] hover:border-[#df734c]/60 rounded-[28px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4 z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#361e18] border border-[#522c24] flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
            {meter.emojiIcon}
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#eb9d7d] tracking-widest block">
              METRIC · {meter.unitType.toUpperCase().replace('_', ' ')}
            </span>
            <h3 className="text-2xl font-black font-sans text-[#f6e9d7] tracking-tight group-hover:text-white transition-colors">
              {meter.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <AnalyticInfoButton
            explanation={{
              ...ANALYTIC_EXPLANATIONS.progressMeterPercentage,
              title: `${meter.name} Metric Logic`,
              description: `Tracks daily numeric values for ${meter.name}. Calculates rolling 7-day average and today's status.`,
              currentValue: `Today: ${formatTodayDisplay()} | 7D Avg: ${formatAvgDisplay()}`,
            }}
            variant="icon"
            className="text-[#eb9d7d] hover:text-[#f6e9d7]"
          />
          <button
            id={`delete-meter-btn-${meter.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteMeter(meter.id);
            }}
            className="p-2 rounded-xl bg-[#361e18]/80 hover:bg-red-900/70 text-[#eb9d7d] hover:text-white transition-colors cursor-pointer"
            title="Delete Meter"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Middle Box: Today's Value & Range Avg */}
      <div className="bg-[#331c17]/85 border border-[#4d2922] rounded-2xl p-4 mb-4 flex items-center justify-between shadow-inner">
        <div>
          <span className="font-mono text-[10px] font-bold text-[#eb9d7d] uppercase tracking-wider block">
            TODAY'S VALUE
          </span>
          <div className="text-2xl font-black font-mono text-[#f6e9d7] mt-0.5">
            {formatTodayDisplay()}
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-[10px] font-bold text-[#eb9d7d] uppercase tracking-wider block">
            RANGE AVG
          </span>
          <div className="text-2xl font-bold font-mono text-[#df734c] mt-0.5">
            {formatAvgDisplay()}
          </div>
        </div>
      </div>

      {/* Bottom Box: Historical Trend Chart 7D */}
      <div className="bg-[#1a0f0d]/90 border border-[#3a201a] rounded-2xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-[#eb9d7d] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={12} className="text-[#df734c]" />
            HISTORICAL TREND CHART (7D)
          </span>

          <span className="font-mono text-[9px] text-[#eb9d7d]/50 group-hover:text-[#df734c] transition-colors flex items-center gap-1">
            <span>Tap to inspect matrix</span>
            <ExternalLink size={10} />
          </span>
        </div>

        {/* 7 Columns matching uploaded reference styling */}
        <div className="flex items-end justify-between gap-1.5 pt-2">
          {last7Days.map((dateKey) => {
            const val = meter.entries[dateKey] || 0;
            const heightPercent = maxScale > 0 ? (val / maxScale) * 100 : 0;
            const dateObj = new Date(dateKey + 'T00:00:00');
            const dayLetter = dateObj
              .toLocaleDateString('en-US', { weekday: 'narrow' })
              .toUpperCase();
            const isToday = dateKey === todayStr;

            return (
              <div
                key={dateKey}
                className="flex-1 flex flex-col items-center gap-2 justify-end"
              >
                {/* Column Track */}
                <div
                  className={`w-full bg-[#331c17] rounded-xl h-24 sm:h-28 flex items-end overflow-hidden p-0.5 border ${
                    isToday ? 'border-[#df734c]/60' : 'border-transparent'
                  }`}
                  title={`${dateKey}: ${val}`}
                >
                  <div
                    className="w-full bg-gradient-to-t from-[#df734c] to-[#e68a68] rounded-lg transition-all duration-500"
                    style={{
                      height: val > 0 ? `${Math.max(8, Math.min(100, heightPercent))}%` : '0%',
                    }}
                  />
                </div>

                {/* Day Letter */}
                <span
                  className={`font-mono text-xs font-bold uppercase ${
                    isToday ? 'text-[#f6e9d7]' : 'text-[#eb9d7d]'
                  }`}
                >
                  {dayLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
