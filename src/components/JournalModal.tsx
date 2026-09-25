import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Smile } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJournal: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  editingEntry?: JournalEntry | null;
  initialDate?: string;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  onSaveJournal,
  editingEntry,
  initialDate,
}) => {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('😊');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Reflection']);

  const moodOptions = ['😊', '⚡', '🧘', '🎯', '📚', '🏃', '💡', '🌱', '😴'];

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setTitle(editingEntry.title);
      setContent(editingEntry.content);
      setMoodEmoji(editingEntry.moodEmoji || '😊');
      setTags(editingEntry.tags || ['Reflection']);
    } else {
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTitle('');
      setContent('');
      setMoodEmoji('😊');
      setTags(['Reflection']);
    }
  }, [editingEntry, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSaveJournal({
      id: editingEntry ? editingEntry.id : undefined,
      date,
      title: title.trim(),
      content: content.trim(),
      moodEmoji,
      tags,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#281b18]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fbf6ef] border border-[#281b18]/20 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl hover:bg-[#edd8c2] text-[#823b28] transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <span className="font-mono text-[10px] font-bold text-[#df734c] uppercase tracking-wider bg-[#edd8c2] px-3 py-1 rounded-full border border-[#d4aa86]">
            {editingEntry ? 'EDIT JOURNAL ENTRY' : 'DAILY JOURNAL REFLECTION'}
          </span>
          <h2 className="text-2xl font-extrabold text-[#281b18] mt-2 font-sans tracking-tight">
            {editingEntry ? 'Refine Entry' : 'Capture Today\'s Thoughts'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Date & Mood Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
                <Calendar size={13} />
                Entry Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-2.5 text-xs text-[#281b18] font-medium outline-none focus:border-[#823b28]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
                <Smile size={13} />
                Daily Mood & Vibe
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {moodOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMoodEmoji(emoji)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all cursor-pointer ${
                      moodEmoji === emoji
                        ? 'bg-[#823b28] text-white scale-110 shadow-sm'
                        : 'bg-[#f6e9d7] hover:bg-[#edd8c2]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spatial Clarity and Midday Focus"
              className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
              Journal Notes & Reflections *
            </label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What went well today? What insights or learnings surfaced?"
              className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28] resize-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
              <Tag size={13} />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag (e.g. Design, Flow)..."
                className="flex-1 bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-3.5 py-2 text-xs text-[#281b18] outline-none focus:border-[#823b28]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[11px] bg-[#edd8c2] text-[#823b28] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#d4aa86]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-700 font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[#281b18]/10 pt-5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-[#823b28] hover:bg-[#edd8c2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-6 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer border border-[#a14c35]/40"
            >
              {editingEntry ? 'Save Changes' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
