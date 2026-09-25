import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight?: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = '',
}) => {
  if (!text) return null;
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const cleanTerm = highlight.trim().replace(/^#/, '');
  if (!cleanTerm) {
    return <span className={className}>{text}</span>;
  }

  // Escape regex special chars
  const escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#df734c]/25 text-[#542114] font-semibold px-0.5 py-0.2 rounded-sm border-b-2 border-[#df734c] shadow-xs"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};
