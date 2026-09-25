import React, { useState } from 'react';
import { HelpCircle, Info, Calculator, Database, Lightbulb, Sparkles, X, ChevronRight } from 'lucide-react';

export interface AnalyticExplanation {
  title: string;
  category?: string;
  currentValue?: string | number;
  formula: string;
  description: string;
  dataPoints: string[];
  tips?: string[];
  example?: string;
}

interface AnalyticInfoButtonProps {
  explanation: AnalyticExplanation;
  className?: string;
  iconSize?: number;
  buttonText?: string;
  variant?: 'icon' | 'badge' | 'subtle';
}

export const AnalyticInfoButton: React.FC<AnalyticInfoButtonProps> = ({
  explanation,
  className = '',
  iconSize = 14,
  buttonText,
  variant = 'icon',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'badge' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Explain Logic: ${explanation.title}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#823b28]/10 hover:bg-[#823b28]/20 text-[#823b28] border border-[#823b28]/20 transition-all cursor-pointer shadow-2xs ${className}`}
        >
          <HelpCircle size={iconSize} className="text-[#823b28] shrink-0" />
          <span>{buttonText || 'Logic'}</span>
        </button>
      ) : variant === 'subtle' ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Explain Logic: ${explanation.title}`}
          className={`inline-flex items-center gap-1 text-xs font-mono font-medium text-[#823b28] hover:text-[#df734c] underline decoration-dashed transition-all cursor-pointer ${className}`}
        >
          <Info size={iconSize} className="shrink-0" />
          <span>{buttonText || 'How is this calculated?'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`Explain Logic: ${explanation.title}`}
          className={`p-1 rounded-lg text-[#823b28]/70 hover:text-[#823b28] hover:bg-[#823b28]/10 transition-all cursor-pointer shrink-0 ${className}`}
        >
          <HelpCircle size={iconSize} />
        </button>
      )}

      {/* Logic Explainer Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-lg bg-[#fbf6ef] border border-[#281b18]/20 rounded-3xl p-6 text-[#281b18] shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#281b18]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#823b28] text-[#f6e9d7] shadow-sm">
                  <Calculator size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black text-[#823b28] uppercase tracking-wider bg-[#edd8c2] px-2 py-0.5 rounded-md">
                      {explanation.category || 'ANALYTIC LOGIC'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#281b18] tracking-tight mt-0.5">
                    {explanation.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-[#281b18]/60 hover:text-[#281b18] hover:bg-[#edd8c2] transition-colors cursor-pointer"
                title="Close Explainer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Value Highlight Badge if available */}
            {explanation.currentValue !== undefined && (
              <div className="bg-[#edd8c2]/80 border border-[#823b28]/20 rounded-2xl p-3.5 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#823b28]">
                  Current Metric Value:
                </span>
                <span className="font-mono font-black text-base text-[#823b28] bg-[#fbf6ef] px-3 py-1 rounded-xl border border-[#281b18]/10 shadow-2xs">
                  {explanation.currentValue}
                </span>
              </div>
            )}

            {/* General Overview */}
            <div className="text-xs sm:text-sm text-[#281b18]/80 leading-relaxed">
              {explanation.description}
            </div>

            {/* Math Formula Box */}
            <div className="bg-[#281b18] text-[#f6e9d7] rounded-2xl p-4 shadow-sm space-y-2 border border-[#422119]">
              <div className="flex items-center gap-2 text-[#df734c]">
                <Sparkles size={15} />
                <span className="font-mono text-[11px] font-black uppercase tracking-wider">
                  CALCULATION FORMULA & LOGIC
                </span>
              </div>
              <div className="font-mono text-xs sm:text-sm bg-[#1e1311] p-3 rounded-xl border border-[#823b28]/40 text-[#f6e9d7] overflow-x-auto leading-relaxed">
                {explanation.formula}
              </div>
            </div>

            {/* Concrete Example if provided */}
            {explanation.example && (
              <div className="bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#823b28]">
                  <Lightbulb size={16} />
                  <span className="font-mono text-[11px] font-black uppercase tracking-wider">
                    CALCULATION EXAMPLE
                  </span>
                </div>
                <p className="text-xs text-[#281b18]/80 font-mono leading-relaxed bg-[#fbf6ef] p-2.5 rounded-xl border border-[#281b18]/10">
                  {explanation.example}
                </p>
              </div>
            )}

            {/* Data Source Points */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#823b28]">
                <Database size={15} />
                <span className="font-mono text-[11px] font-black uppercase tracking-wider">
                  DATA SOURCES USED
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-1.5 text-xs text-[#281b18]/80 font-medium">
                {explanation.dataPoints.map((dp, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-[#f6e9d7]/60 px-3 py-2 rounded-xl border border-[#281b18]/5">
                    <ChevronRight size={13} className="text-[#823b28] shrink-0" />
                    <span>{dp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips / Why it matters */}
            {explanation.tips && explanation.tips.length > 0 && (
              <div className="bg-[#edd8c2]/50 border border-[#823b28]/15 rounded-2xl p-4 space-y-2">
                <span className="font-mono text-[11px] font-black text-[#823b28] uppercase tracking-wider block">
                  💡 INSIGHT & PRACTICAL TIPS
                </span>
                <ul className="space-y-1.5 text-xs text-[#281b18]/80">
                  {explanation.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#823b28] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] font-bold text-xs font-mono transition-colors cursor-pointer shadow-sm text-center"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
