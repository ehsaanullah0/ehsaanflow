import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Pin, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Tag, 
  Hash, 
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { Note } from '../types';
import { HighlightText } from './HighlightText';

interface NotesViewProps {
  notes: Note[];
  onOpenNewNoteModal: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePinNote: (noteId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes = [],
  onOpenNewNoteModal,
  onEditNote,
  onDeleteNote,
  onTogglePinNote,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Extract all categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    notes.forEach((n) => {
      if (n.category) cats.add(n.category);
    });
    return Array.from(cats);
  }, [notes]);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      (n.category && n.category.toLowerCase().includes(query)) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(query)));

    const matchesCategory =
      selectedCategory === 'all' ||
      (n.category && n.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesQuery && matchesCategory;
  });

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleCopyNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => {
      setCopiedNoteId(null);
    }, 2000);
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Search / Filter Controls */}
      <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Title and Badge */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#823b28] text-[#f6e9d7] rounded-2xl shadow-sm">
              <StickyNote size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full border border-[#823b28]/20">
                  CREATIVE WORKSPACE
                </span>
                <span className="font-mono text-[10px] text-[#823b28]/70 font-bold bg-[#f6e9d7] px-2 py-0.5 rounded-full">
                  {notes.length} Note{notes.length === 1 ? '' : 's'}
                </span>
              </div>
              <h2 className="text-2xl font-black font-sans text-[#281b18] mt-0.5 tracking-tight">
                Notes & Documentation
              </h2>
            </div>
          </div>

          {/* Actions: View Toggle + New Note Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* View Grid/List Switcher */}
            <div className="bg-[#f6e9d7] border border-[#281b18]/15 p-1 rounded-2xl flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#823b28] text-[#f6e9d7] shadow-2xs'
                    : 'text-[#823b28] hover:bg-[#edd8c2]'
                }`}
                title="Grid View Layout"
              >
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#823b28] text-[#f6e9d7] shadow-2xs'
                    : 'text-[#823b28] hover:bg-[#edd8c2]'
                }`}
                title="List View Layout"
              >
                <List size={15} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* New Note Button */}
            <button
              onClick={onOpenNewNoteModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer border border-[#a14c35]/40 h-10"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>+ New Note</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#281b18]/10">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#823b28]/60" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, content, or #tags..."
              className="w-full bg-[#f6e9d7] border border-[#281b18]/15 text-[#281b18] placeholder-[#823b28]/50 text-xs font-semibold rounded-2xl pl-9 pr-8 py-2.5 outline-none focus:border-[#823b28] focus:ring-1 focus:ring-[#823b28] transition-all shadow-2xs h-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#823b28]/60 hover:text-[#823b28] p-1 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                selectedCategory === 'all'
                  ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28]'
                  : 'bg-[#f6e9d7] text-[#823b28] border-[#281b18]/10 hover:bg-[#edd8c2]'
              }`}
            >
              All Notes ({notes.length})
            </button>
            {categories.map((cat) => {
              const count = notes.filter((n) => n.category?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#823b28] text-[#f6e9d7] border-[#823b28]'
                      : 'bg-[#f6e9d7] text-[#823b28] border-[#281b18]/10 hover:bg-[#edd8c2]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Notes Area */}
      {filteredNotes.length === 0 ? (
        <div className="bg-[#fbf6ef] border border-dashed border-[#281b18]/20 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-14 h-14 rounded-2xl bg-[#edd8c2] text-[#823b28] flex items-center justify-center mb-3.5 shadow-xs">
            <StickyNote size={28} />
          </div>
          <h3 className="text-base font-extrabold text-[#281b18] font-sans">
            {notes.length === 0 ? 'No notes created yet' : 'No notes matching search'}
          </h3>
          <p className="text-xs text-[#823b28]/80 max-w-sm mt-1 leading-relaxed">
            {notes.length === 0
              ? 'Start recording your thoughts, meeting points, project documentation, or quick creative ideas.'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          {notes.length === 0 && (
            <button
              onClick={onOpenNewNoteModal}
              className="mt-5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              + Create First Note
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Pinned Notes Section if Any */}
          {pinnedNotes.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Pin size={15} className="text-[#df734c] fill-[#df734c]" />
                <span className="font-mono text-xs font-black uppercase text-[#823b28] tracking-wider">
                  PINNED NOTES ({pinnedNotes.length})
                </span>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      searchQuery={searchQuery}
                      copiedNoteId={copiedNoteId}
                      onCopyNote={handleCopyNote}
                      onEditNote={onEditNote}
                      onDeleteNote={onDeleteNote}
                      onTogglePinNote={onTogglePinNote}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {pinnedNotes.map((note) => (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      searchQuery={searchQuery}
                      copiedNoteId={copiedNoteId}
                      onCopyNote={handleCopyNote}
                      onEditNote={onEditNote}
                      onDeleteNote={onDeleteNote}
                      onTogglePinNote={onTogglePinNote}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All / Other Notes Section */}
          {otherNotes.length > 0 && (
            <div className="flex flex-col gap-3">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-[#281b18]/10">
                  <span className="font-mono text-xs font-black uppercase text-[#823b28] tracking-wider">
                    ALL NOTES ({otherNotes.length})
                  </span>
                </div>
              )}

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      searchQuery={searchQuery}
                      copiedNoteId={copiedNoteId}
                      onCopyNote={handleCopyNote}
                      onEditNote={onEditNote}
                      onDeleteNote={onDeleteNote}
                      onTogglePinNote={onTogglePinNote}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {otherNotes.map((note) => (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      searchQuery={searchQuery}
                      copiedNoteId={copiedNoteId}
                      onCopyNote={handleCopyNote}
                      onEditNote={onEditNote}
                      onDeleteNote={onDeleteNote}
                      onTogglePinNote={onTogglePinNote}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const getContrastColor = (hex: string) => {
  if (!hex) return '#281b18';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? '#281b18' : '#fbf6ef';
};

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  searchQuery,
  copiedNoteId,
  onCopyNote,
  onEditNote,
  onDeleteNote,
  onTogglePinNote,
  formatDate,
}) => {
  const cardBgColor = note.color || '#fbf6ef';
  const textColor = getContrastColor(cardBgColor);
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;

  return (
    <div
      onClick={() => onEditNote(note)}
      style={{ backgroundColor: cardBgColor, color: textColor }}
      className={`group relative rounded-3xl p-5 border border-[#281b18]/15 hover:border-[#823b28]/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[280px] overflow-hidden`}
    >
      {/* Top Header: Category & Pin Toggle */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {note.category && (
              <span style={{ backgroundColor: `${textColor}20` }} className="font-mono text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-transparent">
                <HighlightText text={note.category} highlight={searchQuery} />
              </span>
            )}
            {note.isPinned && (
              <span className="font-mono text-[10px] font-bold text-[#df734c] bg-[#df734c]/15 px-2 py-0.5 rounded-full border border-[#df734c]/30 flex items-center gap-1">
                <Pin size={10} className="fill-[#df734c]" />
                Pinned
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePinNote(note.id);
            }}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              note.isPinned
                ? 'text-[#df734c] bg-[#df734c]/10'
                : 'hover:bg-[#edd8c2]/50 transition-all'
            }`}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note to Top'}
          >
            <Pin size={15} className={note.isPinned ? 'fill-[#df734c]' : ''} />
          </button>
        </div>

        {/* Note Title */}
        <h3 className="text-base sm:text-lg font-black font-sans tracking-tight leading-snug mb-1.5 transition-colors">
          <HighlightText text={note.title} highlight={searchQuery} />
        </h3>

        {/* Note Excerpt */}
        <p style={{ color: `${textColor}cc` }} className="text-xs font-medium leading-relaxed line-clamp-4 whitespace-pre-wrap">
          <HighlightText text={note.content} highlight={searchQuery} />
        </p>

        {/* Tags list */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map((t) => (
              <span
                key={t}
                style={{ backgroundColor: `${textColor}20` }}
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Metadata & Actions */}
      <div style={{ borderColor: `${textColor}20` }} className="pt-3 mt-4 border-t flex items-center justify-between gap-2 text-xs font-mono">
        <div style={{ color: `${textColor}80` }} className="flex items-center gap-2 text-[10.5px]">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{formatDate(note.updatedAt || note.createdAt)}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Copy button */}
          <button
            type="button"
            onClick={(e) => onCopyNote(note, e)}
            className="p-1.5 rounded-xl hover:bg-[#edd8c2] transition-colors cursor-pointer"
            title="Copy Note Text"
          >
            {copiedNoteId === note.id ? (
              <Check size={14} className="text-green-600" strokeWidth={2.5} />
            ) : (
              <Copy size={14} />
            )}
          </button>

          {/* Edit button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditNote(note);
            }}
            className="p-1.5 rounded-xl hover:bg-[#edd8c2] transition-colors cursor-pointer"
            title="Edit Note"
          >
            <Edit3 size={14} />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNote(note.id);
            }}
            className="p-1.5 rounded-xl hover:bg-red-200/50 text-red-600 transition-colors cursor-pointer"
            title="Delete Note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* Compact Note Row Item for List View */
const NoteListItem: React.FC<NoteCardProps> = ({
  note,
  searchQuery,
  copiedNoteId,
  onCopyNote,
  onEditNote,
  onDeleteNote,
  onTogglePinNote,
  formatDate,
}) => {
  const cardBgColor = note.color || '#fbf6ef';
  const textColor = getContrastColor(cardBgColor);
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;

  return (
    <div
      onClick={() => onEditNote(note)}
      style={{ backgroundColor: cardBgColor, color: textColor }}
      className="group rounded-2xl p-5 border border-[#281b18]/15 hover:border-[#823b28]/50 shadow-2xs transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[90px]"
    >
      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePinNote(note.id);
          }}
          className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
            note.isPinned ? 'text-[#df734c] bg-[#df734c]/10' : 'hover:bg-[#edd8c2]/50'
          }`}
          title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
        >
          <Pin size={18} className={note.isPinned ? 'fill-[#df734c]' : ''} />
        </button>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-extrabold font-sans tracking-tight truncate group-hover:opacity-80">
              <HighlightText text={note.title} highlight={searchQuery} />
            </h3>
            {note.category && (
              <span style={{ backgroundColor: `${textColor}20` }} className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md border border-transparent shrink-0">
                <HighlightText text={note.category} highlight={searchQuery} />
              </span>
            )}
          </div>
          <p style={{ color: `${textColor}cc` }} className="text-sm font-medium line-clamp-2 mt-1">
            <HighlightText text={note.content} highlight={searchQuery} />
          </p>
        </div>
      </div>

      <div style={{ color: `${textColor}cc` }} className="flex items-center gap-4 self-end sm:self-center shrink-0 text-xs font-mono">
        <span className="text-[10.5px] font-medium hidden md:inline">
          {wordCount} words · {formatDate(note.updatedAt || note.createdAt)}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => onCopyNote(note, e)}
            className="p-1.5 rounded-xl hover:bg-[#edd8c2] cursor-pointer"
            title="Copy Note"
          >
            {copiedNoteId === note.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditNote(note);
            }}
            className="p-1.5 rounded-xl hover:bg-[#edd8c2] cursor-pointer"
            title="Edit Note"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNote(note.id);
            }}
            className="p-1.5 rounded-xl hover:bg-red-200/50 text-red-600 cursor-pointer"
            title="Delete Note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
