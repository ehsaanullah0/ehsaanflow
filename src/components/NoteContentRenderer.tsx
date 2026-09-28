import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

export interface NoteContentRendererProps {
  content: string;
  searchQuery?: string;
  onToggleCheckbox?: (lineIndex: number, newChecked: boolean) => void;
  className?: string;
  isCompact?: boolean;
  textSize?: 'normal' | 'balanced' | 'reading' | 'xlarge'; // 'reading' is +50% larger
}

// Utility to render inline formatting (bold, italic, strikethrough, underline, highlight, inline color spans)
const renderFormattedText = (
  text: string, 
  searchQuery?: string, 
  textSize: 'normal' | 'balanced' | 'reading' | 'xlarge' = 'normal'
): React.ReactNode => {
  if (!text) return null;

  // Simple token parser for inline styles:
  // 1. <span style="color:(#[0-9a-fA-F]+|[a-z]+)">...</span>
  // 2. <mark>...</mark>
  // 3. <u>...</u>
  // 4. <small>...</small>
  // 5. **bold**
  // 6. *italic*
  // 7. ~~strike~~
  // 8. `code`
  const regex = /(<span style="color:\s*([^"]+)">([\s\S]*?)<\/span>|<mark>([\s\S]*?)<\/mark>|<u>([\s\S]*?)<\/u>|<small>([\s\S]*?)<\/small>|\*\*([\s\S]+?)\*\*|\*([\s\S]+?)\*|~~([\s\S]+?)~~|`([^`]+)`)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  const isEnlarged = textSize === 'reading' || textSize === 'xlarge' || textSize === 'balanced';

  const appendPlainWithSearch = (plainText: string) => {
    if (!plainText) return;
    if (!searchQuery || !searchQuery.trim()) {
      elements.push(<React.Fragment key={`plain-${keyCounter++}`}>{plainText}</React.Fragment>);
      return;
    }

    const cleanTerm = searchQuery.trim().replace(/^#/, '');
    if (!cleanTerm) {
      elements.push(<React.Fragment key={`plain-${keyCounter++}`}>{plainText}</React.Fragment>);
      return;
    }

    const escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sRegex = new RegExp(`(${escaped})`, 'gi');
    const parts = plainText.split(sRegex);

    parts.forEach((p, idx) => {
      if (sRegex.test(p)) {
        elements.push(
          <mark
            key={`hl-${keyCounter++}-${idx}`}
            className="bg-[#df734c]/30 text-[#542114] font-semibold px-0.5 rounded-sm"
          >
            {p}
          </mark>
        );
      } else if (p) {
        elements.push(<React.Fragment key={`p-${keyCounter++}-${idx}`}>{p}</React.Fragment>);
      }
    });
  };

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      appendPlainWithSearch(text.substring(lastIndex, match.index));
    }

    const [
      ,
      ,
      colorVal,
      colorText,
      markText,
      uText,
      smallText,
      boldText,
      italicText,
      strikeText,
      codeText,
    ] = match;

    if (colorText !== undefined && colorVal) {
      elements.push(
        <span key={`col-${keyCounter++}`} style={{ color: colorVal }} className="font-semibold">
          {renderFormattedText(colorText, searchQuery, textSize)}
        </span>
      );
    } else if (markText !== undefined) {
      elements.push(
        <mark key={`mark-${keyCounter++}`} className="bg-[#f8db97] text-[#281b18] px-1.5 py-0.5 rounded-md font-semibold">
          {renderFormattedText(markText, searchQuery, textSize)}
        </mark>
      );
    } else if (uText !== undefined) {
      elements.push(
        <u key={`u-${keyCounter++}`} className="underline underline-offset-4">
          {renderFormattedText(uText, searchQuery, textSize)}
        </u>
      );
    } else if (smallText !== undefined) {
      elements.push(
        <small key={`sm-${keyCounter++}`} className={`${isEnlarged ? 'text-xs sm:text-sm' : 'text-[10px]'} opacity-80`}>
          {renderFormattedText(smallText, searchQuery, textSize)}
        </small>
      );
    } else if (boldText !== undefined) {
      elements.push(
        <strong key={`b-${keyCounter++}`} className="font-black text-[#281b18]">
          {renderFormattedText(boldText, searchQuery, textSize)}
        </strong>
      );
    } else if (italicText !== undefined) {
      elements.push(
        <em key={`i-${keyCounter++}`} className="italic font-serif">
          {renderFormattedText(italicText, searchQuery, textSize)}
        </em>
      );
    } else if (strikeText !== undefined) {
      elements.push(
        <del key={`s-${keyCounter++}`} className="line-through opacity-60">
          {renderFormattedText(strikeText, searchQuery, textSize)}
        </del>
      );
    } else if (codeText !== undefined) {
      elements.push(
        <code 
          key={`c-${keyCounter++}`} 
          className={`font-mono ${isEnlarged ? 'text-sm sm:text-base px-2 py-0.5' : 'text-[11px] px-1 py-0.5'} bg-black/10 rounded text-[#823b28]`}
        >
          {codeText}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    appendPlainWithSearch(text.substring(lastIndex));
  }

  return elements;
};

export const NoteContentRenderer: React.FC<NoteContentRendererProps> = ({
  content,
  searchQuery,
  onToggleCheckbox,
  className = '',
  isCompact = false,
  textSize = 'normal',
}) => {
  if (!content) return null;

  const lines = content.split('\n');

  // Text scaling presets:
  // - 'normal': 12px (text-xs) standard card scale
  // - 'balanced': 15px (+25%)
  // - 'reading': 18px (text-lg) (+50% larger - default for Full-Screen reader)
  // - 'xlarge': 21px (+75%)
  const isReading = textSize === 'reading';
  const isXLarge = textSize === 'xlarge';
  const isBalanced = textSize === 'balanced';
  const isEnlarged = isReading || isXLarge || isBalanced;

  // Sizing tokens
  const containerSpacing = isXLarge
    ? 'space-y-4 sm:space-y-5'
    : isReading
    ? 'space-y-3 sm:space-y-4'
    : isBalanced
    ? 'space-y-2.5'
    : 'space-y-1.5';

  const bodyTextClass = isXLarge
    ? 'text-xl sm:text-2xl leading-relaxed sm:leading-loose text-[#281b18]'
    : isReading
    ? 'text-base sm:text-lg leading-relaxed sm:leading-loose text-[#281b18]'
    : isBalanced
    ? 'text-sm sm:text-base leading-relaxed text-[#281b18]'
    : 'text-xs leading-relaxed';

  const h1Class = isXLarge
    ? 'text-3xl sm:text-4xl font-black font-sans tracking-tight text-[#281b18] mt-6 mb-2'
    : isReading
    ? 'text-2xl sm:text-3xl font-black font-sans tracking-tight text-[#281b18] mt-5 mb-2'
    : isBalanced
    ? 'text-lg sm:text-xl font-black font-sans tracking-tight text-[#281b18] mt-3 mb-1'
    : 'text-sm font-black font-sans tracking-tight text-[#281b18] mt-1';

  const h2Class = isXLarge
    ? 'text-2xl sm:text-3xl font-extrabold font-sans text-[#281b18] mt-5 mb-1.5'
    : isReading
    ? 'text-xl sm:text-2xl font-extrabold font-sans text-[#281b18] mt-4 mb-1.5'
    : isBalanced
    ? 'text-base sm:text-lg font-extrabold font-sans text-[#281b18] mt-2.5 mb-1'
    : 'text-xs font-extrabold font-sans text-[#281b18] mt-1';

  const h3Class = isXLarge
    ? 'text-lg sm:text-xl font-bold font-sans text-[#823b28] uppercase tracking-wider mt-4 mb-1'
    : isReading
    ? 'text-base sm:text-lg font-bold font-sans text-[#823b28] uppercase tracking-wider mt-3 mb-1'
    : isBalanced
    ? 'text-sm font-bold font-sans text-[#823b28] uppercase tracking-wider mt-2 mb-0.5'
    : 'text-xs font-bold font-sans text-[#823b28] uppercase tracking-wider mt-0.5';

  const checkboxIconSize = isXLarge ? 24 : isReading ? 21 : isBalanced ? 18 : 15;

  const quoteClass = isXLarge
    ? 'border-l-4 border-[#df734c] pl-5 py-2 text-xl sm:text-2xl italic font-serif opacity-95 my-3'
    : isReading
    ? 'border-l-4 border-[#df734c] pl-4 py-1.5 text-base sm:text-lg italic font-serif opacity-95 my-2.5'
    : isBalanced
    ? 'border-l-3 border-[#df734c] pl-3 py-1 text-sm sm:text-base italic opacity-95 my-1.5'
    : 'border-l-2 border-[#df734c] pl-2.5 py-0.5 text-xs italic opacity-90 my-1';

  const emptyLineClass = isXLarge ? 'h-5' : isReading ? 'h-4' : isBalanced ? 'h-2.5' : 'h-1.5';

  return (
    <div className={`${containerSpacing} ${className}`}>
      {lines.map((line, idx) => {
        // Check for checkbox: - [ ] or - [x] or - [X]
        const checkboxMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
        if (checkboxMatch) {
          const isChecked = checkboxMatch[2].toLowerCase() === 'x';
          const itemText = checkboxMatch[3];

          return (
            <div
              key={idx}
              className={`flex items-start ${isEnlarged ? 'gap-3.5 py-1' : 'gap-2'} group/cb cursor-pointer select-none leading-relaxed transition-colors`}
              onClick={(e) => {
                if (onToggleCheckbox) {
                  e.stopPropagation();
                  onToggleCheckbox(idx, !isChecked);
                }
              }}
            >
              <button
                type="button"
                className={`mt-1 shrink-0 transition-transform ${
                  onToggleCheckbox ? 'cursor-pointer hover:scale-115 active:scale-95' : 'cursor-default'
                }`}
                title={isChecked ? 'Mark uncompleted' : 'Mark completed'}
              >
                {isChecked ? (
                  <CheckSquare size={checkboxIconSize} className="text-[#df734c]" />
                ) : (
                  <Square size={checkboxIconSize} className="text-[#823b28]/60 group-hover/cb:text-[#823b28]" />
                )}
              </button>
              <span
                className={`${bodyTextClass} break-words flex-1 ${
                  isChecked ? 'line-through opacity-50 text-[#823b28]' : ''
                }`}
              >
                {renderFormattedText(itemText, searchQuery, textSize)}
              </span>
            </div>
          );
        }

        // Heading 1: # Heading
        if (line.startsWith('# ')) {
          return (
            <h4 key={idx} className={h1Class}>
              {renderFormattedText(line.substring(2), searchQuery, textSize)}
            </h4>
          );
        }

        // Heading 2: ## Heading
        if (line.startsWith('## ')) {
          return (
            <h5 key={idx} className={h2Class}>
              {renderFormattedText(line.substring(3), searchQuery, textSize)}
            </h5>
          );
        }

        // Heading 3: ### Heading
        if (line.startsWith('### ')) {
          return (
            <h6 key={idx} className={h3Class}>
              {renderFormattedText(line.substring(4), searchQuery, textSize)}
            </h6>
          );
        }

        // Bullet line: - Item
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className={`flex items-start ${isEnlarged ? 'gap-3 pl-2' : 'gap-2 pl-1'} leading-relaxed ${bodyTextClass}`}>
              <span className={`text-[#df734c] font-black ${isEnlarged ? 'text-xl' : 'text-sm'} leading-none mt-1 shrink-0`}>
                •
              </span>
              <span className="flex-1 break-words">
                {renderFormattedText(line.substring(2), searchQuery, textSize)}
              </span>
            </div>
          );
        }

        // Numbered list: 1. Item
        const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className={`flex items-start ${isEnlarged ? 'gap-3 pl-2' : 'gap-2 pl-1'} leading-relaxed ${bodyTextClass}`}>
              <span className={`font-mono ${isEnlarged ? 'text-base font-bold' : 'text-[10px] font-bold'} text-[#823b28] shrink-0 mt-0.5`}>
                {numMatch[1]}.
              </span>
              <span className="flex-1 break-words">
                {renderFormattedText(numMatch[2], searchQuery, textSize)}
              </span>
            </div>
          );
        }

        // Blockquote: > Quote
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className={quoteClass}>
              {renderFormattedText(line.substring(2), searchQuery, textSize)}
            </blockquote>
          );
        }

        // Empty line
        if (!line.trim()) {
          return isCompact ? null : <div key={idx} className={emptyLineClass} />;
        }

        // Regular line
        return (
          <p key={idx} className={`${bodyTextClass} break-words`}>
            {renderFormattedText(line, searchQuery, textSize)}
          </p>
        );
      })}
    </div>
  );
};
