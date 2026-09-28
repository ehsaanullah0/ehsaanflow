const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.resolve(__dirname, '../public/icon.svg');
const svgMaskablePath = path.resolve(__dirname, '../public/icon-maskable.svg');

const targets = [
  { file: 'pwa-192x192.png', size: 192, source: svgPath },
  { file: 'pwa-512x512.png', size: 512, source: svgPath },
  { file: 'pwa-maskable-512x512.png', size: 512, source: svgMaskablePath },
  { file: 'apple-touch-icon.png', size: 180, source: svgPath },
];

async function generate() {
  console.log('Generating PNG icons from new brand SVG...');
  for (const target of targets) {
    const dest = path.resolve(__dirname, '../public', target.file);
    await sharp(target.source)
      .resize(target.size, target.size)
      .png()
      .toFile(dest);
    console.log(`Created ${target.file} (${target.size}x${target.size})`);

    // If dist folder exists, update it too
    const distPath = path.resolve(__dirname, '../dist', target.file);
    if (fs.existsSync(path.resolve(__dirname, '../dist'))) {
      fs.copyFileSync(dest, distPath);
    }
  }

  // Also convert SVG to favicon.ico
  const destIco = path.resolve(__dirname, '../public/favicon.ico');
  const buffer = await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toBuffer();
  fs.writeFileSync(destIco, buffer);
  console.log('Created favicon.ico (32x32)');

  if (fs.existsSync(path.resolve(__dirname, '../dist'))) {
    fs.copyFileSync(destIco, path.resolve(__dirname, '../dist/favicon.ico'));
    fs.copyFileSync(svgPath, path.resolve(__dirname, '../dist/icon.svg'));
    fs.copyFileSync(path.resolve(__dirname, '../public/favicon.svg'), path.resolve(__dirname, '../dist/favicon.svg'));
  }

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
