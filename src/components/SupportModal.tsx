import React, { useState } from 'react';
import { X, Heart, QrCode, Copy, Check, Sparkles, Coffee, ExternalLink, ArrowRight, Mail } from 'lucide-react';
import { QRCodeModal } from './QRCodeModal';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const upiId = '9454989954@fam';
  const upiUrl = 'upi://pay?pa=9454989954%40fam&cu=INR';

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#281b18]/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner (Cream theme) */}
          <div className="relative bg-[#fbf6ef] text-[#281b18] px-6 py-5 border-b border-[#281b18]/15 overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#823b28] text-[#f6e9d7] rounded-2xl shadow-sm">
                  <Coffee size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full border border-[#823b28]/20">
                      COMMUNITY SUPPORT
                    </span>
                  </div>
                  <h3 className="text-xl font-black font-sans text-[#281b18] mt-0.5">
                    Support Ehsaan Flow
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#823b28]/10 text-[#823b28] transition-colors cursor-pointer"
                aria-label="Close Support Window"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto flex flex-col gap-5">
            {/* The Note Requested by User */}
            <div className="bg-[#f6e9d7] border border-[#823b28]/20 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-xs">
              <div className="p-2 bg-[#edd8c2] text-[#823b28] rounded-xl border border-[#d4aa86]/60 shrink-0 mt-0.5 flex items-center justify-center">
                <Heart size={18} strokeWidth={2.2} className="text-[#823b28]" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold font-mono uppercase text-[#823b28] tracking-wider mb-1">
                  A Note From The Creator
                </h4>
                <p className="text-sm font-semibold text-[#281b18] leading-relaxed italic">
                  "Please consider supporting to maintain this app free and open source."
                </p>
              </div>
            </div>

            {/* Direct Payment Action */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] font-bold uppercase text-[#823b28] tracking-wider">
                PAYMENT OPTIONS
              </span>

              {/* Direct Payment Button */}
              <a
                href={upiUrl}
                id="direct-upi-payment-button"
                className="w-full bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] font-bold py-3.5 px-5 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer group"
              >
                <Heart size={18} fill="currentColor" className="text-[#df734c] group-hover:scale-110 transition-transform" />
                <span>Direct Payment (UPI)</span>
                <ExternalLink size={16} className="text-[#eb9d7d]" />
              </a>

              {/* Text Just Bottom to Direct Payment Button (Tappable to open QR Code) */}
              <button
                type="button"
                id="open-qr-code-text-button"
                onClick={() => setShowQRModal(true)}
                className="w-full py-2.5 px-3 bg-[#edd8c2]/50 hover:bg-[#edd8c2] border border-[#281b18]/15 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#823b28] transition-all cursor-pointer group shadow-2xs"
              >
                <QrCode size={16} className="text-[#df734c] group-hover:scale-110 transition-transform" />
                <span>Or scan UPI QR code directly (Tap here to view QR code)</span>
                <ArrowRight size={13} className="text-[#823b28]/60 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* UPI ID Quick Copy Box */}
            <div className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase font-bold text-[#823b28]">
                  Direct UPI ID
                </span>
                <span className="font-mono text-xs font-black text-[#281b18] mt-0.5">
                  {upiId}
                </span>
              </div>
              <button
                onClick={handleCopyUPI}
                className="flex items-center gap-1.5 bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#281b18]/10"
              >
                {copied ? <Check size={14} className="text-green-700" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Direct Email Contact Box */}
            <div className="pt-2 border-t border-[#281b18]/10 flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold uppercase text-[#823b28] tracking-wider">
                DIRECT CONTACT & FEEDBACK
              </span>
              <a
                href="mailto:worsmon@proton.me"
                id="support-modal-email-contact-btn"
                className="w-full bg-[#edd8c2] hover:bg-[#e3c4a7] text-[#281b18] font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2.5 border border-[#281b18]/15 transition-all shadow-2xs group"
                title="Send email to worsmon@proton.me"
              >
                <Mail size={16} className="text-[#823b28] group-hover:scale-110 transition-transform" />
                <span>Contact Developer (worsmon@proton.me)</span>
              </a>
            </div>

            <div className="text-center pt-1 border-t border-[#281b18]/10">
              <p className="text-[11px] text-[#823b28]/80 font-medium">
                Every contribution helps fund continuous open-source improvements and feature development. Thank you!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal when tapped */}
      <QRCodeModal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)} 
      />
    </>
  );
};
