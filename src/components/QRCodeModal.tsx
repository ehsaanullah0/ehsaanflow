import React, { useState } from 'react';
import { X, Copy, Check, Download, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { UPIQRCode } from './UPIQRCode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#281b18]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#fbf6ef] border border-[#281b18]/15 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#281b18] text-[#f6e9d7] flex items-center justify-between border-b border-[#422119]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#df734c] text-[#fbf6ef] rounded-xl flex items-center justify-center">
              <Heart size={16} fill="currentColor" />
            </span>
            <div>
              <h3 className="text-base font-extrabold font-sans text-[#f6e9d7]">
                Scan to Support
              </h3>
              <p className="text-[11px] font-mono text-[#eb9d7d]">
                UPI Instant Payment QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#eb9d7d] hover:text-[#f6e9d7] transition-colors cursor-pointer"
            aria-label="Close QR Code window"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col items-center text-center">
          {/* QR Code Container */}
          <div className="p-3 bg-white/70 border border-[#281b18]/15 rounded-3xl shadow-sm mb-4">
            <UPIQRCode upiString={upiUrl} size={260} />
          </div>

          <div className="w-full bg-[#f6e9d7] border border-[#281b18]/10 rounded-2xl p-3 mb-4 flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] font-mono font-bold uppercase text-[#823b28]">
                UPI ID
              </span>
              <span className="font-mono text-xs font-bold text-[#281b18]">
                {upiId}
              </span>
            </div>
            <button
              onClick={handleCopyUPI}
              className="flex items-center gap-1 bg-[#823b28] hover:bg-[#6f2f1f] text-[#f6e9d7] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-xs text-[#823b28] font-medium leading-relaxed max-w-xs mb-4">
            Scan using any UPI app like Google Pay, PhonePe, Paytm, BHIM, Cred, or FamPay.
          </p>

          {/* Quick Pay Link Button */}
          <a
            href={upiUrl}
            className="w-full bg-[#df734c] hover:bg-[#c95f39] text-[#fbf6ef] font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <ExternalLink size={14} />
            <span>Open in UPI App</span>
          </a>
        </div>
      </div>
    </div>
  );
};
