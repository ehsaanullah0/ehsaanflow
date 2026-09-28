import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Pin, 
  Tag, 
  Hash, 
  Palette, 
  Check, 
  CheckSquare, 
  Square, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Highlighter, 
  List, 
  ListOrdered, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Edit3, 
  Heading1, 
  Heading2, 
  Heading3, 
  Code, 
  Quote, 
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Columns2,
  StickyNote,
  Clock
} from 'lucide-react';
import { Note } from '../types';
import { NoteContentRenderer } from './NoteContentRenderer';

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

const TEXT_COLOR_PALETTE = [
  { label: 'Terracotta', color: '#c2410c' },
  { label: 'Crimson', color: '#b91c1c' },
  { label: 'Emerald', color: '#15803d' },
  { label: 'Ocean', color: '#1d4ed8' },
  { label: 'Purple', color: '#7e22ce' },
  { label: 'Dark Cocoa', color: '#451a03' },
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
  
  // Full-screen mode (remembered across refreshes, defaults to true)
  const [isFullscreen, setIsFullscreen] = useState(() => {
    const saved = localStorage.getItem('ehsaan_flow_note_editor_fullscreen');
    return saved !== null ? saved === 'true' : true;
  });

  // Format drawer & view tab state: 'write' | 'split' | 'preview' (remembered across refreshes)
  const [isFormatDrawerOpen, setIsFormatDrawerOpen] = useState(() => {
    const saved = localStorage.getItem('ehsaan_flow_note_editor_format_drawer');
    return saved !== null ? saved === 'true' : true;
  });
  const [editorTab, setEditorTab] = useState<'write' | 'split' | 'preview'>(() => {
    const saved = localStorage.getItem('ehsaan_flow_note_editor_tab');
    return saved === 'split' || saved === 'preview' || saved === 'write' ? saved : 'write';
  });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const savedTab = localStorage.getItem('ehsaan_flow_note_editor_tab');
    if (savedTab === 'split' || savedTab === 'preview' || savedTab === 'write') {
      setEditorTab(savedTab as 'write' | 'split' | 'preview');
    }
    const savedFullscreen = localStorage.getItem('ehsaan_flow_note_editor_fullscreen');
    if (savedFullscreen !== null) {
      setIsFullscreen(savedFullscreen === 'true');
    }
  }, [editingNote, isOpen]);

  // Keyboard shortcut support: Esc to close, Ctrl/Cmd + Enter to save
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (title.trim() || content.trim()) {
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
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, title, content, category, isPinned, color, tags, editingNote, onSaveNote]);

  if (!isOpen) return null;

  const insertText = (before: string, after: string = '') => {
    if (editorTab === 'preview') setEditorTab('write');
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);

    setContent(newText);
    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selected.length || 0)
      );
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    if (editorTab === 'preview') setEditorTab('write');
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    
    // Find start of current line
    const lastNewline = text.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    
    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    setContent(newText);
    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const insertColorSpan = (textColor: string) => {
    insertText(`<span style="color:${textColor}">`, '</span>');
  };

  const handleTogglePreviewCheckbox = (lineIndex: number, newChecked: boolean) => {
    const lines = content.split('\n');
    if (lines[lineIndex] !== undefined) {
      lines[lineIndex] = lines[lineIndex].replace(
        /^(\s*-\s*\[)[ xX](\]\s*.*)$/,
        `$1${newChecked ? 'x' : ' '}$2`
      );
      setContent(lines.join('\n'));
    }
  };

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
  const lineCount = content ? content.split('\n').length : 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 ${
        isFullscreen
          ? 'p-0 bg-[#fbf6ef]'
          : 'p-3 sm:p-5 bg-[#281b18]/65 backdrop-blur-xs'
      }`}
    >
      {/* Modal Container */}
      <div 
        className={`bg-[#fbf6ef] text-[#281b18] shadow-2xl flex flex-col relative transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none overflow-hidden'
            : 'border border-[#281b18]/20 rounded-3xl w-full max-w-4xl max-h-[94vh] overflow-hidden'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================================================== */}
        {/* STICKY TOP HEADER */}
        {/* ==================================================== */}
        <header className="shrink-0 border-b border-[#281b18]/10 bg-[#fbf6ef]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#df734c] text-white flex items-center justify-center shadow-md shrink-0">
              <StickyNote size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[9px] uppercase font-black text-[#df734c] bg-[#df734c]/10 px-2 py-0.5 rounded-full border border-[#df734c]/30">
                  {editingNote ? 'EDIT NOTE' : 'NEW NOTE WORKSPACE'}
                </span>
                {isPinned && (
                  <span className="font-mono text-[9px] font-bold text-[#df734c] bg-[#df734c]/15 px-2 py-0.5 rounded-full border border-[#df734c]/30 flex items-center gap-1">
                    <Pin size={10} className="fill-[#df734c]" />
                    Pinned
                  </span>
                )}
                <span className="font-mono text-[10px] text-[#823b28]/70 font-bold bg-[#edd8c2] px-2 py-0.5 rounded-full hidden sm:inline">
                  {wordCount} words · {charCount} chars
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-sans text-[#281b18] tracking-tight truncate mt-0.5">
                {title.trim() || (editingNote ? 'Edit Note' : 'Untitled Note')}
              </h1>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* View Mode Switcher */}
            <div className="bg-[#edd8c2] p-1 rounded-2xl flex items-center gap-1 border border-[#281b18]/10 shadow-2xs">
              <button
                type="button"
                onClick={() => setEditorTab('write')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  editorTab === 'write'
                    ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                    : 'text-[#823b28]/80 hover:text-[#823b28] hover:bg-[#f6e9d7]'
                }`}
                title="Full-width writing editor"
              >
                <Edit3 size={13} />
                <span className="hidden sm:inline">Write</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  editorTab === 'split'
                    ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                    : 'text-[#823b28]/80 hover:text-[#823b28] hover:bg-[#f6e9d7]'
                }`}
                title="Split side-by-side write and live preview"
              >
                <Columns2 size={13} />
                <span className="hidden sm:inline">Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  editorTab === 'preview'
                    ? 'bg-[#823b28] text-[#f6e9d7] shadow-xs'
                    : 'text-[#823b28]/80 hover:text-[#823b28] hover:bg-[#f6e9d7]'
                }`}
                title="Interactive live rendered preview"
              >
                <Eye size={13} />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            {/* Full-screen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-2xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] transition-all cursor-pointer border border-[#281b18]/10 shadow-2xs"
              title={isFullscreen ? "Restore windowed view" : "Maximize to full screen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] transition-all cursor-pointer border border-[#281b18]/10 shadow-2xs"
              title="Close note (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* ==================================================== */}
        {/* MAIN SCROLLABLE FORM BODY */}
        {/* ==================================================== */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 max-w-7xl mx-auto w-full flex flex-col gap-4">
            
            {/* Note Title Input */}
            <div className="bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-4 sm:p-5 shadow-2xs">
              <label className="block text-[11px] font-mono font-bold text-[#823b28] uppercase tracking-wider mb-1.5">
                Note Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design Philosophy, Weekly Checklist & Sprint Goals..."
                className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl px-4 py-3 text-lg sm:text-xl text-[#281b18] font-black outline-none focus:border-[#823b28] focus:ring-2 focus:ring-[#823b28]/20 transition-all placeholder:text-[#823b28]/40"
              />
            </div>

            {/* Metadata Bar: Category, Theme Accent, Pin Toggle, Tags */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Category Input & Quick Pills */}
              <div className="md:col-span-4 bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                    <Tag size={13} />
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ideas, Work, Personal..."
                    className="w-full bg-[#fbf6ef] border border-[#281b18]/20 rounded-2xl px-3.5 py-2 text-xs text-[#281b18] font-bold outline-none focus:border-[#823b28]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-xl border cursor-pointer transition-colors ${
                        category.toLowerCase() === cat.toLowerCase()
                          ? 'bg-[#823b28] text-white border-[#823b28] shadow-2xs'
                          : 'bg-[#fbf6ef] text-[#823b28] border-[#281b18]/10 hover:bg-[#edd8c2]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color Palette & Pin Switch */}
              <div className="md:col-span-4 bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between gap-3 shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                    <Palette size={13} />
                    Card Background Accent
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
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
                    
                    {/* Native Color Picker */}
                    <div className="relative group cursor-pointer" title="Custom color picker">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-500 via-yellow-400 to-cyan-400 p-[2px] flex items-center justify-center shadow-2xs">
                        <div className="w-full h-full rounded-[10px] bg-[#fbf6ef] flex items-center justify-center">
                          <Palette size={13} className="text-[#823b28]" />
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
                <div className="flex items-center justify-between bg-[#fbf6ef] p-2.5 rounded-2xl border border-[#281b18]/10">
                  <div className="flex items-center gap-2">
                    <Pin size={14} className={isPinned ? 'text-[#df734c] fill-[#df734c]' : 'text-[#823b28]'} />
                    <span className="text-xs font-extrabold text-[#281b18]">
                      Pin Note to Top
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      isPinned ? 'bg-[#df734c]' : 'bg-[#edd8c2] border border-[#281b18]/20'
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 left-0.5 ${
                        isPinned ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="md:col-span-4 bg-[#f6e9d7] border border-[#281b18]/15 rounded-3xl p-4 flex flex-col justify-between shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-[#823b28] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
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
                      placeholder="Type tag and press Enter"
                      className="flex-1 bg-[#fbf6ef] border border-[#281b18]/20 rounded-xl px-3 py-1.5 text-xs text-[#281b18] outline-none focus:border-[#823b28]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(tagInput)}
                      className="bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 min-h-[26px]">
                  {tags.length > 0 ? (
                    tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-lg border border-[#d4aa86]"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-red-700 cursor-pointer ml-0.5"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono text-[#823b28]/50 italic">No tags added</span>
                  )}
                </div>
              </div>

            </div>

            {/* Note Content Section with Text Controls Drawer & Workspace */}
            <div className="flex-1 flex flex-col bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-4 sm:p-5 shadow-xs min-h-[480px]">
              
              {/* Toolbar Header: Format Controls Drawer Toggle & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#281b18]/10">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Format Drawer Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsFormatDrawerOpen(!isFormatDrawerOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isFormatDrawerOpen
                        ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28] shadow-2xs'
                        : 'bg-[#f6e9d7] text-[#823b28] border-[#281b18]/15 hover:bg-[#edd8c2]'
                    }`}
                    title="Toggle Text Styling Controls Drawer"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Formatting Controls</span>
                    {isFormatDrawerOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {/* Quick Checkbox Button */}
                  <button
                    type="button"
                    onClick={() => insertLinePrefix('- [ ] ')}
                    className="flex items-center gap-1.5 bg-[#edd8c2] hover:bg-[#e4cbb3] text-[#823b28] font-bold px-3 py-1.5 rounded-xl text-xs border border-[#281b18]/15 cursor-pointer shadow-2xs transition-colors"
                    title="Insert Checkbox item (- [ ] )"
                  >
                    <CheckSquare size={13} className="text-[#df734c]" />
                    <span>+ Checkbox</span>
                  </button>

                  {/* Quick Bullet Button */}
                  <button
                    type="button"
                    onClick={() => insertLinePrefix('- ')}
                    className="flex items-center gap-1 bg-[#edd8c2] hover:bg-[#e4cbb3] text-[#823b28] font-bold px-3 py-1.5 rounded-xl text-xs border border-[#281b18]/15 cursor-pointer shadow-2xs transition-colors"
                    title="Insert Bullet item (- )"
                  >
                    <List size={13} />
                    <span>Bullet</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[#823b28]/80 font-bold">
                  <span>{lineCount} lines</span>
                  <span>·</span>
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{charCount} characters</span>
                </div>
              </div>

              {/* Expandable Text Control / Formatting Drawer */}
              {isFormatDrawerOpen && (
                <div className="py-3 px-3.5 my-3 bg-[#f6e9d7] border border-[#281b18]/15 rounded-2xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150 shadow-2xs">
                  
                  {/* Row 1: Style buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#823b28]/70 mr-1">
                      Inline Styles:
                    </span>

                    {/* Bold */}
                    <button
                      type="button"
                      onClick={() => insertText('**', '**')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] font-black cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Bold (**text**)"
                    >
                      <Bold size={13} />
                      <span>Bold</span>
                    </button>

                    {/* Italic */}
                    <button
                      type="button"
                      onClick={() => insertText('*', '*')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] italic cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Italic (*text*)"
                    >
                      <Italic size={13} />
                      <span>Italic</span>
                    </button>

                    {/* Underline */}
                    <button
                      type="button"
                      onClick={() => insertText('<u>', '</u>')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Underline (<u>text</u>)"
                    >
                      <Underline size={13} />
                      <span className="underline">Underline</span>
                    </button>

                    {/* Strikethrough */}
                    <button
                      type="button"
                      onClick={() => insertText('~~', '~~')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Strikethrough (~~text~~)"
                    >
                      <Strikethrough size={13} />
                      <span className="line-through">Strike</span>
                    </button>

                    {/* Highlight */}
                    <button
                      type="button"
                      onClick={() => insertText('<mark>', '</mark>')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Highlight (<mark>text</mark>)"
                    >
                      <Highlighter size={13} className="text-[#df734c]" />
                      <span className="bg-[#f8db97] px-1 rounded">Mark</span>
                    </button>

                    {/* Code */}
                    <button
                      type="button"
                      onClick={() => insertText('`', '`')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl font-mono text-[#823b28] cursor-pointer shadow-2xs"
                      title="Monospace Code (`code`)"
                    >
                      <Code size={13} />
                    </button>

                    {/* Quote */}
                    <button
                      type="button"
                      onClick={() => insertLinePrefix('> ')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Blockquote (> text)"
                    >
                      <Quote size={13} />
                    </button>

                    {/* Numbered list */}
                    <button
                      type="button"
                      onClick={() => insertLinePrefix('1. ')}
                      className="p-1.5 px-2.5 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Numbered List (1. item)"
                    >
                      <ListOrdered size={13} />
                      <span>1, 2, 3</span>
                    </button>
                  </div>

                  {/* Row 2: Headings & Text Colors */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#281b18]/10 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#823b28]/70 mr-1">
                        Headings:
                      </span>
                      <button
                        type="button"
                        onClick={() => insertLinePrefix('# ')}
                        className="px-2.5 py-1 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] font-black cursor-pointer shadow-2xs"
                        title="Heading 1 (Large)"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onClick={() => insertLinePrefix('## ')}
                        className="px-2.5 py-1 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] font-bold cursor-pointer shadow-2xs"
                        title="Heading 2 (Medium)"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertLinePrefix('### ')}
                        className="px-2.5 py-1 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] font-semibold cursor-pointer shadow-2xs"
                        title="Heading 3 (Small Title)"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('<small>', '</small>')}
                        className="px-2.5 py-1 bg-[#fbf6ef] hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-xl text-[#281b18] text-[10px] cursor-pointer shadow-2xs"
                        title="Small Text"
                      >
                        Small
                      </button>
                    </div>

                    {/* Text Colour Palette */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#823b28]/70">
                        Color:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {TEXT_COLOR_PALETTE.map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => insertColorSpan(c.color)}
                            className="w-5 h-5 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer shadow-2xs"
                            style={{ backgroundColor: c.color }}
                            title={`Color: ${c.label}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Note Body Area (Editor vs Split vs Live Preview) */}
              <div className="flex-1 flex flex-col min-h-[340px] mt-1">
                {editorTab === 'split' ? (
                  /* Split View: Side-by-side Editor & Live Preview */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 h-full min-h-[340px]">
                    <div className="flex flex-col h-full">
                      <div className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Edit3 size={11} />
                        <span>Source Editor</span>
                      </div>
                      <textarea
                        required
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write thoughts, minutes, or create checkboxes like:&#10;- [ ] Task 1&#10;- [ ] Task 2&#10;Use the Formatting Controls above to format text..."
                        className="w-full flex-1 min-h-[300px] bg-[#f6e9d7]/70 border border-[#281b18]/15 rounded-2xl p-4 text-sm text-[#281b18] font-medium outline-none focus:border-[#823b28] focus:ring-2 focus:ring-[#823b28]/20 transition-all resize-y leading-relaxed font-sans"
                      />
                    </div>

                    <div className="flex flex-col h-full">
                      <div className="font-mono text-[10px] font-bold text-[#823b28] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Eye size={11} />
                        <span>Live Document Preview (Interactive Checklists)</span>
                      </div>
                      <div className="w-full flex-1 min-h-[300px] bg-[#f6e9d7]/40 border border-[#281b18]/15 rounded-2xl p-4 overflow-y-auto">
                        {content.trim() ? (
                          <NoteContentRenderer
                            content={content}
                            onToggleCheckbox={handleTogglePreviewCheckbox}
                          />
                        ) : (
                          <p className="text-xs text-[#823b28]/50 italic">
                            No content yet. Type in the editor on the left to see live document preview.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : editorTab === 'write' ? (
                  /* Write View: Expansive full-width Editor */
                  <textarea
                    required
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write thoughts, minutes, or create checkboxes like:&#10;- [ ] Task 1&#10;- [ ] Task 2&#10;Use the Formatting Controls above to format text..."
                    className="w-full flex-1 min-h-[340px] bg-[#f6e9d7]/70 border border-[#281b18]/15 rounded-2xl p-4 text-base text-[#281b18] font-medium outline-none focus:border-[#823b28] focus:ring-2 focus:ring-[#823b28]/20 transition-all resize-y leading-relaxed font-sans"
                  />
                ) : (
                  /* Preview View: Full-width Interactive Live Preview */
                  <div className="w-full flex-1 min-h-[340px] bg-[#f6e9d7]/40 border border-[#281b18]/15 rounded-2xl p-6 overflow-y-auto">
                    {content.trim() ? (
                      <NoteContentRenderer
                        content={content}
                        onToggleCheckbox={handleTogglePreviewCheckbox}
                      />
                    ) : (
                      <p className="text-xs text-[#823b28]/50 italic">
                        No content yet. Click Write tab to add text or checklists.
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ==================================================== */}
          {/* STICKY FOOTER ACTION BAR */}
          {/* ==================================================== */}
          <footer className="shrink-0 border-t border-[#281b18]/10 bg-[#fbf6ef]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between flex-wrap gap-3 z-20 shadow-2xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#823b28]/80">
              <span className="hidden sm:inline">Tip: Press <kbd className="bg-[#edd8c2] px-1.5 py-0.5 rounded border border-[#281b18]/15 font-bold">Ctrl/Cmd + Enter</kbd> to save</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-[#823b28] hover:bg-[#edd8c2] transition-colors cursor-pointer"
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
          </footer>
        </form>

      </div>
    </div>
  );
};
