const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.resolve(__dirname, '../public/icon.svg');

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'pwa-maskable-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  console.log('Generating PNG icons from SVG...');
  for (const target of targets) {
    const dest = path.resolve(__dirname, '../public', target.file);
    await sharp(svgPath)
      .resize(target.size, target.size)
      .png()
      .toFile(dest);
    console.log(`Created ${target.file} (${target.size}x${target.size})`);
  }

  // Also convert SVG to favicon.ico
  const destIco = path.resolve(__dirname, '../public/favicon.ico');
  const buffer = await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toBuffer();
  fs.writeFileSync(destIco, buffer);
  console.log('Created favicon.ico (32x32)');

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
