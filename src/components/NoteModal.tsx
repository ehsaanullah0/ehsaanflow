import React, { useState, useEffect } from 'react';
import { X, Pin, Tag, Hash, Palette, Check } from 'lucide-react';
import { Note } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  editingNote?: Note | null;
}

const COLOR_OPTIONS = [
  { id: '#fbf6ef', name: 'Warm Cream', bg: 'bg-[#fbf6ef]', border: 'border-[#281b18]/15' },
  { id: '#f6e9d7', name: 'Earthen Sand', bg: 'bg-[#f6e9d7]', border: 'border-[#823b28]/20' },
  { id: '#edd8c2', name: 'Terracotta Glow', bg: 'bg-[#edd8c2]', border: 'border-[#823b28]/30' },
  { id: '#f8db97', name: 'Golden Ochre', bg: 'bg-[#f8db97]', border: 'border-[#823b28]/30' },
  { id: '#eec7a7', name: 'Peach Sunset', bg: 'bg-[#eec7a7]', border: 'border-[#823b28]/30' },
];

const POPULAR_CATEGORIES = ['Ideas', 'Projects', 'Personal', 'Work', 'Learning', 'Reflections'];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSaveNote,
  editingNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Ideas');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState('#fbf6ef');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setCategory(editingNote.category || 'Ideas');
      setIsPinned(!!editingNote.isPinned);
      setColor(editingNote.color || '#fbf6ef');
      setTags(editingNote.tags || []);
    } else {
      setTitle('');
      setContent('');
      setCategory('Ideas');
      setIsPinned(false);
      setColor('#fbf6ef');
      setTags([]);
    }
    setTagInput('');
  }, [editingNote, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#/, '');
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    onSaveNote({
      id: editingNote ? editingNote.id : undefined,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      category: category.trim() || 'Ideas',
      isPinned,
      color,
      tags,
    });

    onClose();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#281b18]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#fbf6ef] border border-[#281b18]/20 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl hover:bg-[#edd8c2] text-[#823b28] transition-colors cursor-pointer"
          title="Close Modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <span className="font-mono text-[10px] font-bold text-[#df734c] uppercase tracking-wider bg-[#edd8c2] px-3 py-1 rounded-full border border-[#d4aa86]">
            {editingNote ? 'EDIT NOTE' : 'NEW NOTE WORKSPACE'}
          </span>
          <h2 className="text-2xl font-extrabold text-[#281b18] mt-2 font-sans tracking-tight">
            {editingNote ? 'Refine Note Content' : 'Capture Ideas & Documentation'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          {/* Note Title Input */}
          <div>
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono">
              Note Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Philosophy & Color Palette Tokens"
              className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-base text-[#281b18] font-black outline-none focus:border-[#823b28] focus:ring-1 focus:ring-[#823b28] transition-all"
            />
          </div>

          {/* Category & Pin Toggle & Accent Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                <Tag size={13} />
                Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ideas, Work, Personal..."
                  className="w-full bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl px-3.5 py-2.5 text-xs text-[#281b18] font-bold outline-none focus:border-[#823b28]"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {POPULAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                      category.toLowerCase() === cat.toLowerCase()
                        ? 'bg-[#823b28] text-white border-[#823b28]'
                        : 'bg-[#f6e9d7] text-[#823b28] border-[#281b18]/10 hover:bg-[#edd8c2]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker & Pin Toggle */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                  <Palette size={13} />
                  Card Theme Accent
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-7 h-7 rounded-xl ${c.bg} ${c.border} border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-2xs`}
                      title={c.name}
                    >
                      {color === c.id && <Check size={14} className="text-[#823b28]" strokeWidth={3} />}
                    </button>
                  ))}
                  
                  {/* Mixed Color Picker */}
                  <div className="relative group cursor-pointer">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 via-yellow-400 to-cyan-400 p-[2px] flex items-center justify-center">
                      <div className="w-full h-full rounded-[10px] bg-[#fbf6ef] flex items-center justify-center">
                        <Palette size={14} className="text-[#823b28]" />
                      </div>
                    </div>
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Pin Switch */}
              <div className="mt-3 flex items-center justify-between bg-[#f6e9d7] p-2.5 rounded-2xl border border-[#281b18]/15">
                <div className="flex items-center gap-2">
                  <Pin size={15} className={isPinned ? 'text-[#df734c] fill-[#df734c]' : 'text-[#823b28]'} />
                  <span className="text-xs font-extrabold text-[#281b18]">
                    Pin Note to Top
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isPinned ? 'bg-[#df734c]' : 'bg-[#edd8c2] border border-[#281b18]/20'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform absolute top-1 left-1 ${
                      isPinned ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl p-3">
            <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <Hash size={13} />
              Tags & Index Keywords
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Type tag name and press Enter"
                className="flex-1 bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-1.5 text-xs text-[#281b18] outline-none focus:border-[#823b28]"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Add Tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold bg-[#edd8c2] text-[#823b28] px-2.5 py-0.5 rounded-lg border border-[#d4aa86]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-700 cursor-pointer ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Note Content Textarea */}
          <div className="flex-1 flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider font-mono">
                Note Body / Content
              </label>
              <span className="font-mono text-[10px] text-[#823b28]/70 font-semibold">
                {wordCount} words · {charCount} characters
              </span>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, documentation, meeting minutes, code snippets, or ideas here..."
              className="w-full flex-1 bg-[#f6e9d7] border border-[#281b18]/20 rounded-2xl p-4 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28] focus:ring-1 focus:ring-[#823b28] transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#281b18]/10 pt-4 mt-2">
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
              {editingNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
