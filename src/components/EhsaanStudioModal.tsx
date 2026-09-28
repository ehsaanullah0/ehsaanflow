import React from 'react';
import { 
  X, 
  Flame, 
  LayoutGrid, 
  Globe, 
  Image, 
  Palette, 
  Sprout, 
  ExternalLink, 
  Heart, 
  ChevronRight 
} from 'lucide-react';

interface EhsaanStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EhsaanStudioModal: React.FC<EhsaanStudioModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const projects = [
    {
      id: 'qr-generator',
      title: 'QR CODE GENERATOR',
      description: 'Create beautiful and customizable QR codes for your links, text, and more.',
      icon: Globe,
      iconBg: 'bg-gradient-to-br from-[#80311f] to-[#591e10]',
      web: 'ehsaanqr.ai.studio',
      github: 'github.com/ehsaanullah0/ehsaanqr',
    },
    {
      id: 'image-compressor',
      title: 'IMAGE COMPRESSOR',
      description: 'Reduce image size without losing quality. Fast, simple, reliable.',
      icon: Image,
      iconBg: 'bg-gradient-to-br from-[#d9673b] to-[#b04a25]',
      web: 'ehsaancompress.ai.studio',
      github: 'github.com/ehsaanullah0/ehsaancompress',
    },
    {
      id: 'colour-studio',
      title: 'COLOUR STUDIO',
      description: 'Explore beautiful colour palettes, shades and hex codes for your designs.',
      icon: Palette,
      iconBg: 'bg-gradient-to-br from-[#d99f34] to-[#a87a1d]',
      web: 'ehsaancolour.ai.studio',
      github: 'github.com/ehsaanullah0',
    },
    {
      id: 'ehsaan-website',
      title: 'EHSAAN WEBSITE',
      description: 'A minimal portfolio & personal workspace showcase.',
      icon: Sprout,
      iconBg: 'bg-gradient-to-br from-[#576133] to-[#3a421e]',
      web: 'ehsaan.odoo.com',
      github: 'github.com/ehsaanullah0/fertenix',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#1e1310]/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#fcf8f2] border border-[#e8ded0] rounded-[28px] sm:rounded-[36px] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200 relative text-[#2c1e19]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Plant Accents */}
        <div className="absolute top-0 right-12 w-32 h-32 opacity-15 pointer-events-none text-[#b89f80]">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M80,20 C60,20 40,40 40,70 C50,50 70,30 80,20 Z" />
            <path d="M90,35 C70,35 50,55 50,85 C60,65 80,45 90,35 Z" />
          </svg>
        </div>
        <div className="absolute bottom-12 left-0 w-24 h-24 opacity-15 pointer-events-none text-[#b89f80]">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M20,80 C40,80 60,60 60,30 C50,50 30,70 20,80 Z" />
          </svg>
        </div>

        {/* Modal Header */}
        <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 flex items-center justify-between z-10 border-b border-[#ebdcd0]/60">
          <div className="flex items-center gap-3">
            {/* Flame Logo */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#f8ebd7] border border-[#ebd8c0] flex items-center justify-center text-[#e09b2d] shadow-2xs shrink-0">
              <Flame size={22} className="fill-[#e09b2d]" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-xl font-black font-sans tracking-tight leading-none text-[#2c1e19]">
                EHSAAN STUDIO
              </h2>
              <p className="text-[11px] sm:text-xs font-medium text-[#806a5c] tracking-wide mt-1 font-sans">
                Small Projects • Big Dreams
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-[#f2e7da] hover:bg-[#e7d8c7] text-[#594236] flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Close"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex flex-col gap-4 z-10 scrollbar-thin">
          
          {/* Project Items Cards List */}
          <div className="flex flex-col gap-3">
            {projects.map((proj) => {
              const IconComponent = proj.icon;

              return (
                <div 
                  key={proj.id}
                  className="bg-[#f5ebde]/90 hover:bg-[#f1e4d3] border border-[#e3d4c3] rounded-[24px] p-3.5 sm:p-4 transition-all duration-200 shadow-2xs flex flex-col gap-3 group"
                >
                  {/* Top Row: Icon, Title, Description */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[18px] ${proj.iconBg} flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                      <IconComponent size={22} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="font-extrabold text-xs sm:text-sm font-sans text-[#2c1e19] tracking-tight truncate">
                        {proj.title}
                      </h4>
                      <p className="text-[11.5px] text-[#6e584a] font-medium leading-relaxed mt-0.5 line-clamp-2">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom / Action Row: Website & GitHub Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#ebd8c5]/70 justify-end">
                    {/* Website Link */}
                    <a 
                      href={`https://${proj.web}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-[#482015] hover:bg-[#36170e] text-[#fbf6ef] text-[11px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer flex-1 sm:flex-none justify-center"
                    >
                      <span>Website</span>
                      <ExternalLink size={12} />
                    </a>

                    {/* GitHub Link */}
                    <a 
                      href={`https://${proj.github}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-[#d9613a] hover:bg-[#be4f2b] text-[#fbf6ef] text-[11px] font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer flex-1 sm:flex-none justify-center"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
