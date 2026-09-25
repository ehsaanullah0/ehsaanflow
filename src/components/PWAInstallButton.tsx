import React, { useState } from 'react';
import { Download, Share, X, Smartphone, CheckCircle2, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If running in standalone installed mode
  if (isInstalled) {
    return (
      <div className={`flex items-center gap-1.5 bg-emerald-800/10 text-emerald-800 border border-emerald-800/30 px-3 py-1.5 rounded-xl text-xs font-bold ${className}`}>
        <CheckCircle2 size={14} className="text-emerald-700" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleButtonClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleButtonClick}
        className={`flex items-center gap-1.5 bg-[#df734c] hover:bg-[#c9623c] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer active:scale-95 ${className}`}
        title="Install Ehsaan Flow App"
      >
        <Download size={14} strokeWidth={2.5} />
        <span>Install App</span>
      </button>

      {/* Installation Instructions Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281b18]/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#fbf6ef] border border-[#281b18]/15 p-6 shadow-2xl text-[#281b18]">
            <div className="flex items-center justify-between pb-3 border-b border-[#281b18]/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#823b28] flex items-center justify-center text-white">
                  {isIOS ? <Smartphone size={16} /> : <Laptop size={16} />}
                </div>
                <h3 className="font-bold text-sm text-[#281b18] font-sans">Install Ehsaan Flow</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-[#823b28]/60 hover:text-[#823b28] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-3 text-xs text-[#281b18]/80 font-medium">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-md">1</span>
                  <p>Tap the <strong className="text-[#823b28] inline-flex items-center gap-1"><Share size={12} /> Share</strong> icon in Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-md">2</span>
                  <p>Scroll down and tap <strong className="text-[#823b28]">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-md">3</span>
                  <p>Tap <strong className="text-[#823b28]">Add</strong> in top-right.</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs text-[#281b18]/80 font-medium">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-md">1</span>
                  <p>In Chrome or Edge, click the <strong className="text-[#823b28]">Install App</strong> icon in the address bar (top right).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-md">2</span>
                  <p>Or open the browser menu (⋮ / •••) and select <strong className="text-[#823b28]">Install Ehsaan Flow</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold bg-[#edd8c2] text-[#823b28] px-2 py-0.5 rounded-md">3</span>
                  <p>Enjoy fast offline access and full-screen workspace view.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full rounded-2xl bg-[#823b28] py-2.5 text-xs font-bold text-white hover:bg-[#6f2f1f] cursor-pointer transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
