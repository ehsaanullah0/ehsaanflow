import React, { useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Tag as TagIcon,
  Zap,
  Sparkles,
  Smile,
  ArrowLeft,
  Share2,
  Copy,
} from 'lucide-react';
import { JournalEntry, MoodLevel } from '../types';
import { formatDisplayDate, getTodayKey } from '../utils/dateUtils';

interface JournalDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
}

const MOOD_META: Record<MoodLevel, { label: string; score: number; emoji: string }> = {
  bad: { label: 'Exhausted / Low', score: 1, emoji: '😞' },
  low: { label: 'Meh / Sluggish', score: 2, emoji: '😐' },
  neutral: { label: 'Balanced / Steady', score: 3, emoji: '🙂' },
  good: { label: 'Good / Happy', score: 4, emoji: '😊' },
  great: { label: 'Super / Inspired', score: 5, emoji: '🤩' },
};

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
  }, [entry, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const moodMeta = MOOD_META[entry.mood] || MOOD_META.neutral;
  const isToday = entry.date === getTodayKey();

  const handleCopyText = () => {
    const fullText = `${entry.title ? `${entry.title}\n\n` : ''}${entry.content}\n\nDate: ${entry.date} | Mood: ${moodMeta.label} (${moodMeta.score}/5) | Energy: ${entry.energy}/5`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-950 dark:text-white">
                  {formatDisplayDate(entry.date, 'full')}
                </span>
                {isToday && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                    Today
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                {formatDisplayDate(entry.date, 'relative')} • {entry.date}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyText}
              title="Copy Reflection Text"
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Edit Button (Pencil) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              title="Edit Reflection"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Metadata Badges (Monochrome & Minimal) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Monochrome Mood Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold">
              <span className="text-sm grayscale contrast-125 select-none" aria-hidden="true">
                {moodMeta.emoji}
              </span>
              <span>{moodMeta.label}</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                ({moodMeta.score}/5)
              </span>
            </div>

            {/* Monochrome Energy Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
              <span>Energy: {entry.energy}/5</span>
            </div>

            {/* Copied Feedback */}
            {copied && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                Copied to clipboard!
              </span>
            )}
          </div>

          {/* Title */}
          {entry.title ? (
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight leading-snug">
              {entry.title}
            </h2>
          ) : (
            <h2 className="text-lg sm:text-xl font-bold text-neutral-400 dark:text-neutral-500 italic">
              Untitled Reflection
            </h2>
          )}

          {/* Reflection Body Content */}
          <div className="prose dark:prose-invert max-w-none">
            {entry.content ? (
              <div className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed space-y-4">
                {entry.content}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">No text reflection logged for this date.</p>
            )}
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <TagIcon className="w-3.5 h-3.5" />
                <span>Tags</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {entry.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded-lg"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Created & Updated Info */}
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800 font-mono">
            <span>Entry ID: {entry.id}</span>
            {entry.updatedAt && (
              <span>Updated: {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>

        {/* Bottom Bar: Delete & Navigation */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  onDelete(entry.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entry</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
