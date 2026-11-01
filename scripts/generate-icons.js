import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  // 1. 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public/pwa-192x192.png'));

  // 2. 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public/pwa-512x512.png'));

  // 3. Apple Touch Icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));

  // 4. Favicon PNG/ICO (32x32 & 64x64)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve('public/favicon.ico'));

  // 5. Maskable icon: Add 15% safe padding around the icon on a solid background
  const innerIcon = await sharp(svgBuffer)
    .resize(380, 380)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 122, g: 61, b: 25, alpha: 1 }, // #7A3D19 brand brown
    },
  })
    .composite([
      {
        input: innerIcon,
        top: 66,
        left: 66,
      },
    ])
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));

  console.log('PWA icons successfully generated!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
