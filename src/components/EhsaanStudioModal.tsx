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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1e1310]/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#fcf8f2] border border-[#e8ded0] rounded-[32px] sm:rounded-[36px] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200 relative text-[#2c1e19]"
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
        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {/* Flame Logo */}
            <div className="w-10 h-10 rounded-2xl bg-[#f8ebd7] border border-[#ebd8c0] flex items-center justify-center text-[#e09b2d] shadow-2xs">
              <Flame size={22} className="fill-[#e09b2d]" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black font-sans tracking-tight leading-none text-[#2c1e19]">
                EHSAAN STUDIO
              </h2>
              <p className="text-xs font-medium text-[#806a5c] tracking-wide mt-1 font-sans">
                Small Projects • Big Dreams
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-[#f2e7da] hover:bg-[#e7d8c7] text-[#594236] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="px-5 sm:px-6 pb-6 overflow-y-auto flex flex-col gap-3.5 z-10 scrollbar-thin">
          
          {/* Top Banner: PROJECT HUB */}
          <div className="relative bg-gradient-to-r from-[#f8df95] via-[#f7e6ac] to-[#faeed1] rounded-[24px] p-4 sm:p-4.5 border border-[#e5c168]/50 shadow-2xs overflow-hidden flex items-center justify-between">
            {/* Decorative Organic Wave on Left */}
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[#e5a83a]/30 rounded-full blur-md pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-[#e5a83a]/30 flex items-center justify-center text-[#522b13] shrink-0">
                <LayoutGrid size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-extrabold text-sm sm:text-base font-sans text-[#3d1e0d] tracking-wide uppercase">
                  PROJECT HUB
                </h3>
                <p className="text-[11.5px] font-medium text-[#664322] leading-tight mt-0.5">
                  Explore my projects, tools and creative builds.
                </p>
              </div>
            </div>

            {/* Right Cursive Slogan */}
            <div className="hidden sm:block text-right pr-1 relative z-10">
              <p className="font-serif italic text-[11.5px] text-[#915a1a] font-semibold leading-snug max-w-[130px]">
                Make useful things. <br />
                Make them feel good to use.
              </p>
            </div>
          </div>

          {/* Project Items Cards List */}
          <div className="flex flex-col gap-3">
            {projects.map((proj) => {
              const IconComponent = proj.icon;

              return (
                <div 
                  key={proj.id}
                  className="bg-[#f5ebde]/90 hover:bg-[#f1e4d3] border border-[#e3d4c3] rounded-[24px] p-3.5 sm:p-4 transition-all duration-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-[18px] ${proj.iconBg} flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                      <IconComponent size={22} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm font-sans text-[#2c1e19] tracking-tight truncate">
                        {proj.title}
                      </h4>
                      <p className="text-[11.5px] text-[#6e584a] font-medium leading-snug mt-0.5 line-clamp-2">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action Buttons (Website & GitHub) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Website Link */}
                    <a 
                      href={`https://${proj.web}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-[#482015] hover:bg-[#36170e] text-[#fbf6ef] text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Website</span>
                      <ExternalLink size={11} />
                    </a>

                    {/* GitHub Link */}
                    <a 
                      href={`https://${proj.github}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-[#d9613a] hover:bg-[#be4f2b] text-[#fbf6ef] text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>GitHub</span>
                      <ExternalLink size={11} />
                    </a>

                    {/* Chevron Indicator */}
                    <ChevronRight size={16} className="text-[#a89083] hidden sm:block ml-0.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Card: Support Banner */}
          <div className="relative bg-[#203a54] text-white rounded-[26px] p-4 sm:p-4.5 shadow-md border border-[#182e47] overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            {/* Organic Yellow Accents on Footer */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#e5a83a] rounded-full opacity-80 blur-xs pointer-events-none" />
            <div className="absolute -bottom-10 -left-6 w-20 h-20 bg-[#2b4c6e] rounded-full pointer-events-none" />

            {/* Left Info: Circle Heart & Text */}
            <div className="flex items-center gap-3 relative z-10 min-w-0">
              <div className="w-10 h-10 rounded-full border-2 border-[#f0b943] flex items-center justify-center text-[#f0b943] shrink-0">
                <Heart size={18} fill="none" strokeWidth={2.5} />
              </div>

              <div className="flex flex-col min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base font-sans text-white tracking-tight leading-none">
                  Support Ehsaan Studio
                </h4>
                <p className="text-[11.5px] text-[#a3c3dd] font-medium leading-tight mt-1">
                  Your support keeps these projects alive.
                </p>
              </div>
            </div>

            {/* Right Action: Support Now Button */}
            <a 
              href="upi://pay?pa=9454989954%40fam&cu=INR" 
              className="bg-[#fcf8f2] hover:bg-white text-[#182e47] text-xs font-extrabold px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap relative z-10 shrink-0 self-start sm:self-center"
            >
              <Heart size={14} className="text-[#182e47]" fill="#182e47" />
              <span>Support Now</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
