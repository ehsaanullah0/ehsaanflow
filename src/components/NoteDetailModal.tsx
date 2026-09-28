import React, { useEffect, useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Pin, 
  Calendar, 
  Clock, 
  Tag as TagIcon, 
  FileText,
  Sparkles,
  Type,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Layout,
  Maximize2
} from 'lucide-react';
import { Note } from '../types';
import { NoteContentRenderer } from './NoteContentRenderer';

interface NoteDetailModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onSaveNote?: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}

const getContrastColor = (hex?: string) => {
  if (!hex) return '#281b18';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? '#281b18' : '#fbf6ef';
};

type TextScaleLevel = 'normal' | 'balanced' | 'reading' | 'xlarge';

const SCALE_LEVELS: { key: TextScaleLevel; label: string; percent: string }[] = [
  { key: 'normal', label: 'Standard', percent: '100%' },
  { key: 'balanced', label: 'Balanced', percent: '+25%' },
  { key: 'reading', label: 'Reading', percent: '+50%' },
  { key: 'xlarge', label: 'Expansive', percent: '+75%' },
];

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
  onSaveNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  // Remember text scale (+50% reading default) in localStorage across browser refreshes
  const [textScale, setTextScale] = useState<TextScaleLevel>(() => {
    const saved = localStorage.getItem('ehsaan_flow_note_text_scale');
    if (saved === 'normal' || saved === 'balanced' || saved === 'reading' || saved === 'xlarge') {
      return saved as TextScaleLevel;
    }
    return 'reading';
  });

  // Remember layout preference (framed folio vs full-width canvas) in localStorage across browser refreshes
  const [isImmersivePaper, setIsImmersivePaper] = useState<boolean>(() => {
    const saved = localStorage.getItem('ehsaan_flow_note_immersive_paper');
    if (saved !== null) {
      return saved === 'true';
    }
    return false; // Full canvas mode active as seen in user preference
  });

  // Reset confirmation state whenever modal opens, keeping user's saved text scale
  useEffect(() => {
    if (isOpen) {
      setIsConfirmingDelete(false);
      const saved = localStorage.getItem('ehsaan_flow_note_text_scale');
      if (saved === 'normal' || saved === 'balanced' || saved === 'reading' || saved === 'xlarge') {
        setTextScale(saved as TextScaleLevel);
      }
    }
  }, [isOpen, note?.id]);

  // Keyboard accessibility: Escape to close, 'e' to edit (when not focused on input)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.key === 'e' || e.key === 'E') && !e.metaKey && !e.ctrlKey && note) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          onClose();
          onEdit(note);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onEdit, note]);

  if (!isOpen || !note) return null;

  const noteColor = note.color || '#fef9f2';
  const textColor = getContrastColor(noteColor);

  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const charCount = note.content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleCopyNote = () => {
    const textToCopy = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleCheckbox = (lineIndex: number, newChecked: boolean) => {
    if (!onSaveNote || !note) return;
    const lines = note.content.split('\n');
    if (lines[lineIndex] !== undefined) {
      lines[lineIndex] = lines[lineIndex].replace(
        /^(\s*-\s*\[)[ xX](\]\s*.*)$/,
        `$1${newChecked ? 'x' : ' '}$2`
      );
      onSaveNote({
        ...note,
        content: lines.join('\n'),
      });
    }
  };

  const cycleScale = (direction: 'up' | 'down') => {
    const currentIndex = SCALE_LEVELS.findIndex((s) => s.key === textScale);
    if (direction === 'up' && currentIndex < SCALE_LEVELS.length - 1) {
      const nextScale = SCALE_LEVELS[currentIndex + 1].key;
      setTextScale(nextScale);
      localStorage.setItem('ehsaan_flow_note_text_scale', nextScale);
    } else if (direction === 'down' && currentIndex > 0) {
      const nextScale = SCALE_LEVELS[currentIndex - 1].key;
      setTextScale(nextScale);
      localStorage.setItem('ehsaan_flow_note_text_scale', nextScale);
    }
  };

  const currentScaleObj = SCALE_LEVELS.find((s) => s.key === textScale) || SCALE_LEVELS[2];

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200 select-text bg-[#211614]/75 backdrop-blur-md"
    >
      {/* Top Floating Glass Navigation Bar */}
      <header className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-8 py-3 bg-[#fcf8f2]/95 border-b border-[#281b18]/15 shadow-sm z-30">
        {/* Left Side: Back button & Note Category / Reading Time */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] font-bold text-xs transition-all cursor-pointer shadow-2xs shrink-0 group"
            title="Back to Notes Grid (Esc)"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-mono">Back</span>
          </button>

          <div className="flex items-center gap-2 overflow-hidden flex-wrap">
            {note.category && (
              <span className="font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#df734c]/15 text-[#823b28] border border-[#df734c]/30 shrink-0">
                {note.category}
              </span>
            )}
            {note.isPinned && (
              <span className="font-mono text-[10px] font-bold text-[#df734c] bg-[#df734c]/15 px-2 py-0.5 rounded-full border border-[#df734c]/30 flex items-center gap-1 shrink-0">
                <Pin size={10} className="fill-[#df734c]" />
                Pinned
              </span>
            )}
            <span className="font-mono text-[11px] text-[#823b28]/70 hidden md:inline">
              {wordCount} words · {readingTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Center / Right: Interactive +50% Text Scale Controller */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Text Size Scale Pill (Highlights +50% default) */}
          <div className="flex items-center bg-[#edd8c2]/80 border border-[#281b18]/15 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => cycleScale('down')}
              disabled={textScale === 'normal'}
              className="p-1 rounded-xl hover:bg-[#df734c] hover:text-white text-[#281b18] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#281b18] transition-colors cursor-pointer"
              title="Decrease text size"
            >
              <ZoomOut size={13} />
            </button>

            <span className="px-2 font-mono text-[11px] font-black text-[#823b28] flex items-center gap-1 select-none">
              <Type size={11} className="text-[#df734c]" />
              <span className="hidden sm:inline">Text</span> {currentScaleObj.percent}
            </span>

            <button
              type="button"
              onClick={() => cycleScale('up')}
              disabled={textScale === 'xlarge'}
              className="p-1 rounded-xl hover:bg-[#df734c] hover:text-white text-[#281b18] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#281b18] transition-colors cursor-pointer"
              title="Increase text size"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Paper Folio vs Full-Canvas Layout Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsImmersivePaper((prev) => {
                const nextVal = !prev;
                localStorage.setItem('ehsaan_flow_note_immersive_paper', String(nextVal));
                return nextVal;
              });
            }}
            className={`p-2 rounded-2xl border transition-all cursor-pointer shadow-2xs hidden sm:flex items-center justify-center ${
              isImmersivePaper
                ? 'bg-[#edd8c2] text-[#823b28] border-[#281b18]/15 hover:bg-[#e3c4a7]'
                : 'bg-[#df734c] text-white border-[#df734c]'
            }`}
            title={isImmersivePaper ? 'Switch to Full-Width Canvas' : 'Switch to Framed Editorial Folio'}
          >
            <Layout size={15} />
          </button>

          {/* Pin / Unpin button */}
          <button
            type="button"
            onClick={() => onTogglePin(note.id)}
            className={`p-2 rounded-2xl transition-all cursor-pointer border border-[#281b18]/15 shadow-2xs ${
              note.isPinned
                ? 'bg-[#df734c] text-white shadow-xs'
                : 'bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#823b28]'
            }`}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin size={15} className={note.isPinned ? 'fill-current' : ''} />
          </button>

          {/* Copy Note button */}
          <button
            type="button"
            onClick={handleCopyNote}
            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#823b28] font-bold text-xs transition-all cursor-pointer border border-[#281b18]/15 shadow-2xs"
            title="Copy Note Text"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-700" />
                <span className="font-mono text-emerald-800">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="hidden sm:inline font-mono">Copy</span>
              </>
            )}
          </button>

          {/* Delete Note button */}
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1.5 bg-red-100 p-1 rounded-2xl border border-red-300">
              <span className="text-[11px] font-bold text-red-800 px-2 font-mono">Delete?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(note.id);
                  onClose();
                }}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-1 bg-[#edd8c2] text-[#281b18] rounded-xl text-xs font-bold hover:bg-[#e3c4a7] transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="p-2 rounded-2xl bg-[#edd8c2] hover:bg-red-100 hover:text-red-700 text-[#823b28] transition-all cursor-pointer border border-[#281b18]/15 shadow-2xs"
              title="Delete Note"
            >
              <Trash2 size={15} />
            </button>
          )}

          {/* Primary Edit Note Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(note);
            }}
            className="flex items-center gap-1.5 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-3.5 sm:px-4 py-1.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-102"
            title="Open Edit Panel (Hotkey: E)"
          >
            <Edit3 size={14} />
            <span className="hidden sm:inline">Edit Note</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-[#edd8c2] hover:bg-[#df734c] hover:text-white text-[#281b18] transition-all cursor-pointer border border-[#281b18]/15 shadow-2xs ml-0.5"
            title="Close Note (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Reading Sanctuary */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-8 lg:px-12 py-6 sm:py-10 flex justify-center items-start">
        {/* Editorial Manuscript Folio Page Container */}
        <article 
          className={`w-full transition-all duration-300 ${
            isImmersivePaper 
              ? 'max-w-4xl rounded-3xl sm:rounded-4xl p-6 sm:p-12 lg:p-16 border border-[#281b18]/15 shadow-[0_20px_60px_-15px_rgba(20,10,8,0.28)]' 
              : 'max-w-5xl rounded-2xl p-6 sm:p-10 border border-[#281b18]/10'
          }`}
          style={{ 
            backgroundColor: noteColor, 
            color: textColor,
          }}
        >
          {/* Note Metadata Header */}
          <div className="space-y-4 pb-6 sm:pb-8 border-b border-[#281b18]/15">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-[#823b28]/80 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#df734c]" />
                <span>Created {formatDate(note.createdAt)}</span>
              </span>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#df734c]" />
                    <span>Edited {formatDateTime(note.updatedAt)}</span>
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#df734c]" />
                <span>{wordCount} words ({charCount} chars)</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-bold text-[#df734c] bg-[#df734c]/10 px-2 py-0.5 rounded-md text-[11px] hidden sm:inline">
                {currentScaleObj.percent} Reading Mode
              </span>
            </div>

            {/* Note Title with Rich Typographic Presence */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-sans text-[#281b18] tracking-tight leading-[1.15] break-words">
              {note.title || 'Untitled Note'}
            </h1>

            {/* Note Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                {note.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs sm:text-sm font-bold text-[#823b28] bg-[#edd8c2]/80 px-3 py-1 rounded-xl border border-[#281b18]/10 flex items-center gap-1.5 shadow-2xs"
                  >
                    <TagIcon size={12} className="text-[#df734c]" />
                    <span>#{t}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Formatted Note Body with Automatic +50% Scale & Interactive Checklists */}
          <div className="pt-6 sm:pt-8 font-sans selection:bg-[#df734c]/20">
            {note.content.trim() ? (
              <NoteContentRenderer
                content={note.content}
                onToggleCheckbox={handleToggleCheckbox}
                textSize={textScale}
              />
            ) : (
              <p className="italic text-[#823b28]/60 text-base sm:text-lg py-4">
                This note is currently empty. Click "Edit Note" in the top bar to begin writing.
              </p>
            )}
          </div>

          {/* Footer Metadata & Folio Monogram */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-[#281b18]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm font-mono text-[#823b28]/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#df734c]" />
              <span>Ehsaan Flow Note Workspace · </span>
              <span className="text-[#281b18] font-black">{note.category || 'General'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(note);
                }}
                className="hover:text-[#df734c] font-bold underline cursor-pointer transition-colors"
              >
                Open in Edit Panel
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopyNote}
                className="hover:text-[#df734c] font-bold underline cursor-pointer transition-colors"
              >
                Copy Content
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={onClose}
                className="hover:text-[#df734c] font-bold underline cursor-pointer transition-colors"
              >
                Close (Esc)
              </button>
            </div>
          </div>

        </article>
      </main>
    </div>
  );
};
