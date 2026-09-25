import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface UPIQRCodeProps {
  upiString?: string;
  size?: number;
  className?: string;
}

export const UPIQRCode: React.FC<UPIQRCodeProps> = ({
  upiString = 'upi://pay?pa=9454989954@fam&cu=INR',
  size = 320,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate QR matrix
    const qr = QRCode.create(upiString, {
      errorCorrectionLevel: 'H', // High error correction to accommodate center logo
    });

    const moduleCount = qr.modules.size;
    const padding = 28;
    const actualQrSize = size - padding * 2;
    const cellSize = actualQrSize / moduleCount;

    canvas.width = size;
    canvas.height = size;

    // 1. Draw rounded container background (Warm cream #FBF6EF / #F6E9D7)
    ctx.fillStyle = '#F8F1E5';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 28);
    ctx.fill();

    // 2. Draw outer border
    ctx.strokeStyle = '#281B1815';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Helper: check if a cell is in the 3 finder pattern zones (top-left, top-right, bottom-left)
    const isFinderPattern = (r: number, c: number) => {
      // Top-left finder (7x7)
      if (r < 8 && c < 8) return true;
      // Top-right finder (7x7)
      if (r < 8 && c >= moduleCount - 8) return true;
      // Bottom-left finder (7x7)
      if (r >= moduleCount - 8 && c < 8) return true;
      // Center logo clearance (around middle 7x7 area)
      const mid = Math.floor(moduleCount / 2);
      if (Math.abs(r - mid) <= 3 && Math.abs(c - mid) <= 3) return true;
      return false;
    };

    // 3. Draw standard QR modules as rounded chocolate pills/dots
    ctx.fillStyle = '#1D1311';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c) && !isFinderPattern(r, c)) {
          const x = padding + c * cellSize;
          const y = padding + r * cellSize;
          const dotRadius = Math.max(2, cellSize * 0.42);

          ctx.beginPath();
          ctx.roundRect(x + cellSize * 0.08, y + cellSize * 0.08, cellSize * 0.84, cellSize * 0.84, dotRadius);
          ctx.fill();
        }
      }
    }

    // 4. Draw Custom Styled Corner Eyes (Maroon Hexagon/Octagon Outer + Emerald Center) matching uploaded image
    const drawCustomFinder = (startX: number, startY: number, finderSizePx: number) => {
      const centerX = startX + finderSizePx / 2;
      const centerY = startY + finderSizePx / 2;
      const radius = finderSizePx * 0.48;

      // Outer Maroon rounded square/octagon frame
      ctx.fillStyle = '#822438'; // Rich wine/maroon matching uploaded image
      ctx.beginPath();
      ctx.roundRect(startX, startY, finderSizePx, finderSizePx, 14);
      ctx.fill();

      // Inner Cream cutout
      ctx.fillStyle = '#F8F1E5';
      ctx.beginPath();
      ctx.roundRect(startX + finderSizePx * 0.2, startY + finderSizePx * 0.2, finderSizePx * 0.6, finderSizePx * 0.6, 8);
      ctx.fill();

      // Center Emerald Green Octagon/Hexagon
      ctx.fillStyle = '#0F6B4F'; // Deep Emerald green matching uploaded image
      const innerSize = finderSizePx * 0.36;
      ctx.beginPath();
      ctx.roundRect(centerX - innerSize / 2, centerY - innerSize / 2, innerSize, innerSize, 6);
      ctx.fill();
    };

    const finderSizePx = 7 * cellSize;
    // Top-Left Finder
    drawCustomFinder(padding, padding, finderSizePx);
    // Top-Right Finder
    drawCustomFinder(padding + (moduleCount - 7) * cellSize, padding, finderSizePx);
    // Bottom-Left Finder
    drawCustomFinder(padding, padding + (moduleCount - 7) * cellSize, finderSizePx);

    // 5. Draw Center Circular Badge with Flame Icon matching uploaded image
    const centerBadgeSize = 8.5 * cellSize;
    const centerBadgeX = padding + (moduleCount * cellSize) / 2;
    const centerBadgeY = padding + (moduleCount * cellSize) / 2;

    // Greenish-olive circular background
    ctx.fillStyle = '#B2C488';
    ctx.beginPath();
    ctx.arc(centerBadgeX, centerBadgeY, centerBadgeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8E9E68';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Flame inside center badge
    const flameSize = centerBadgeSize * 0.62;
    ctx.font = `${Math.round(flameSize)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔥', centerBadgeX, centerBadgeY + flameSize * 0.05);

  }, [upiString, size]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-3xl shadow-lg border border-[#281b18]/15 bg-[#F8F1E5] max-w-full h-auto"
      />
    </div>
  );
};
