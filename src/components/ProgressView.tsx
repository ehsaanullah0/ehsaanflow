import React, { useState } from 'react';
import { Activity, Plus, TrendingUp, Calendar, Trash2, Edit3, X, Check, BarChart2 } from 'lucide-react';
import { ProgressMeter, MeasurementType } from '../types';
import { ProgressMeterCard } from './ProgressMeterCard';
import { ProgressDetailsModal } from './ProgressDetailsModal';

interface ProgressViewProps {
  progressMeters: ProgressMeter[];
  onAddMeter: (meter: Omit<ProgressMeter, 'id' | 'createdAt' | 'entries'>) => void;
  onDeleteMeter: (meterId: string) => void;
  onUpdateMeterValue: (meterId: string, date: string, value: number) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progressMeters,
  onAddMeter,
  onDeleteMeter,
  onUpdateMeterValue,
}) => {
  const [selectedMeterForDetails, setSelectedMeterForDetails] = useState<ProgressMeter | null>(null);
  const [isNewMeterModalOpen, setIsNewMeterModalOpen] = useState(false);

  // Form states for creating new meter
  const [newMeterName, setNewMeterName] = useState('');
  const [newMeterEmoji, setNewMeterEmoji] = useState('😊');
  const [newMeterUnitType, setNewMeterUnitType] = useState<MeasurementType>('scale_1_5');
  const [newMeterGoal, setNewMeterGoal] = useState<number>(5);

  const emojiOptions = ['😊', '⚡', '🎯', '🔋', '📚', '🏃', '🧘', '💧', '🌿', '💡', '🔥', '🎨'];

  // Sync selected meter state with updated entries from props
  const activeModalMeter = selectedMeterForDetails
    ? progressMeters.find((m) => m.id === selectedMeterForDetails.id) || selectedMeterForDetails
    : null;

  const handleCreateMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeterName.trim()) return;

    onAddMeter({
      name: newMeterName.trim(),
      emojiIcon: newMeterEmoji,
      unitType: newMeterUnitType,
      goalValue: newMeterGoal,
    });

    setNewMeterName('');
    setIsNewMeterModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 shadow-sm">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] tracking-widest flex items-center gap-1.5">
            <Activity size={12} />
            HISTORICAL ANALYTICS & METRICS
          </span>
          <h2 className="text-xl font-extrabold text-[#281b18] font-sans">
            Personal Progress Meters
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="font-mono text-xs text-[#823b28]/70 hidden md:inline">
            Tap any card to open detailed linear charts & matrix
          </span>

          <button
            id="create-meter-btn"
            onClick={() => setIsNewMeterModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-4 py-2 rounded-2xl text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Create Meter</span>
          </button>
        </div>
      </div>

      {/* Progress Meters Grid matching uploaded screenshot design */}
      {progressMeters.length === 0 ? (
        <div className="bg-[#fbf6ef] border border-dashed border-[#281b18]/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#edd8c2] flex items-center justify-center text-[#823b28] mb-4">
            <BarChart2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#281b18]">No progress meters found</h3>
          <p className="text-xs text-[#823b28]/80 max-w-sm mt-1">
            Create custom meters to track your daily mood, focus, reading, discipline, and energy over time.
          </p>
          <button
            onClick={() => setIsNewMeterModalOpen(true)}
            className="mt-4 bg-[#823b28] text-[#f6e9d7] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer hover:bg-[#6f2f1f]"
          >
            Create Your First Meter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progressMeters.map((meter) => (
            <ProgressMeterCard
              key={meter.id}
              meter={meter}
              onDeleteMeter={onDeleteMeter}
              onOpenDetails={(selected) => setSelectedMeterForDetails(selected)}
            />
          ))}
        </div>
      )}

      {/* Rich Popup Details Modal */}
      <ProgressDetailsModal
        meter={activeModalMeter}
        isOpen={!!selectedMeterForDetails}
        onClose={() => setSelectedMeterForDetails(null)}
        onUpdateValue={onUpdateMeterValue}
      />

      {/* Modal for Creating New Progress Meter */}
      {isNewMeterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#281b18]/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#fbf6ef] border border-[#281b18]/20 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setIsNewMeterModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl hover:bg-[#edd8c2] text-[#823b28] cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="mb-5">
              <span className="font-mono text-[10px] font-bold text-[#df734c] uppercase tracking-wider bg-[#edd8c2] px-3 py-1 rounded-full border border-[#d4aa86]">
                CUSTOM METRIC
              </span>
              <h2 className="text-2xl font-extrabold text-[#281b18] mt-2 font-sans">
                Create Progress Meter
              </h2>
            </div>

            <form onSubmit={handleCreateMeterSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono">
                  Meter Name *
                </label>
                <input
                  type="text"
                  required
                  id="new-meter-name-input"
                  value={newMeterName}
                  onChange={(e) => setNewMeterName(e.target.value)}
                  placeholder="e.g. Mood, Focus, Energy, Reading, Potential"
                  className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono">
                  Icon Emoji
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewMeterEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-pointer ${
                        newMeterEmoji === emoji ? 'bg-[#823b28] text-white scale-110' : 'bg-[#f6e9d7]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1 font-mono">
                  Measurement System
                </label>
                <select
                  id="new-meter-unit-select"
                  value={newMeterUnitType}
                  onChange={(e) => {
                    const nextType = e.target.value as MeasurementType;
                    setNewMeterUnitType(nextType);
                    if (nextType === 'scale_1_5') setNewMeterGoal(5);
                    if (nextType === 'percentage') setNewMeterGoal(100);
                    if (nextType === 'time') setNewMeterGoal(180);
                    if (nextType === 'numeric') setNewMeterGoal(10);
                  }}
                  className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-2.5 text-xs text-[#281b18] font-medium outline-none cursor-pointer"
                >
                  <option value="scale_1_5">1 – 5 Rating Scale (e.g. Mood 5/5)</option>
                  <option value="percentage">Percentage % (e.g. Focus 92%)</option>
                  <option value="time">Time Duration (e.g. Study 2h 30m)</option>
                  <option value="numeric">Numeric Counter (e.g. Water 8 glasses)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#281b18]/10 mt-2">
                <button
                  type="button"
                  onClick={() => setIsNewMeterModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[#823b28] hover:bg-[#edd8c2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-create-meter-btn"
                  className="bg-[#823b28] text-[#f6e9d7] px-6 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer hover:bg-[#6f2f1f]"
                >
                  Create Meter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
