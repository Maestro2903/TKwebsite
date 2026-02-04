#!/usr/bin/env node
/**
 * Downloads all external assets (CDN, prod, etc.) to public/ for local hosting.
 * Run: node scripts/download-external-assets.mjs
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const PROJECT_ROOT = join(__dirname, '..');
const PUBLIC = join(PROJECT_ROOT, 'public');

const ASSETS = [
  // Videos
  { url: 'https://Zeit.b-cdn.net/3d-zeit.mp4', path: 'videos/3d-zeit.mp4' },
  { url: 'https://Zeit.b-cdn.net/COVER%20FINAL%202.mp4', path: 'videos/cover-final-2.mp4' },

  // Spline 3D scene
  { url: 'https://prod.spline.design/aB0YuJDUGNCJKg5T/scene.splinecode', path: 'assets/spline/scene.splinecode' },

  // Images
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68ee3aa36df1cc984c221657_parallax.avif', path: 'assets/images/parallax.avif' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b811c1b18d63df71dcdb3b_dots.svg', path: 'assets/images/dots.svg' },

  // Fonts - InterDisplay
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa94b4ba3d24853d42e5_InterDisplay-Regular.woff2', path: 'assets/fonts/InterDisplay-Regular.woff2' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa94383843d4d03e7d20_InterDisplay-Regular.woff', path: 'assets/fonts/InterDisplay-Regular.woff' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa9416ba48fe016158cc_InterDisplay-Medium.woff2', path: 'assets/fonts/InterDisplay-Medium.woff2' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa9497ebfb4ee497864a_InterDisplay-Medium.woff', path: 'assets/fonts/InterDisplay-Medium.woff' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa94bcb080090e1ea3f4_InterDisplay-Light.woff2', path: 'assets/fonts/InterDisplay-Light.woff2' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa9468d9e9525785234c_InterDisplay-Light.woff', path: 'assets/fonts/InterDisplay-Light.woff' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa94f9193241eb1e6ed2_InterDisplay-SemiBold.woff2', path: 'assets/fonts/InterDisplay-SemiBold.woff2' },
  { url: 'https://cdn.prod.website-files.com/68b811bfb18d63df71dcda99/68b8fa948bd0aedd711aef45_InterDisplay-SemiBold.woff', path: 'assets/fonts/InterDisplay-SemiBold.woff' },
];

async function download(url, destPath) {
  const fullPath = join(PUBLIC, destPath);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);

  const fileStream = createWriteStream(fullPath);
  await pipeline(res.body, fileStream);
  console.log(`  ✓ ${destPath}`);
}

async function main() {
  console.log('Downloading external assets to public/...\n');

  for (const { url, path } of ASSETS) {
    try {
      await download(url, path);
    } catch (err) {
      console.error(`  ✗ ${path}: ${err.message}`);
    }
  }

  // HLS show reel: try ffmpeg to convert to mp4 (simpler for local hosting)
  const hlsUrl = 'https://vz-bf52cb50-0a5.b-cdn.net/ce1749fb-077d-416a-8df8-bc32ac669c3c/playlist.m3u8';
  const showReelPath = join(PUBLIC, 'videos/show-reel.mp4');
  if (!existsSync(join(PUBLIC, 'videos'))) mkdirSync(join(PUBLIC, 'videos'), { recursive: true });

  console.log('\nHLS show reel: attempting ffmpeg conversion...');
  try {
    const { execSync } = await import('child_process');
    execSync(`ffmpeg -i "${hlsUrl}" -c copy -y "${showReelPath}"`, { stdio: 'inherit' });
    console.log('  ✓ videos/show-reel.mp4 (from HLS)');
  } catch (e) {
    console.warn('  ⚠ ffmpeg not found or failed. Install ffmpeg and run:');
    console.warn(`    ffmpeg -i "${hlsUrl}" -c copy -y public/videos/show-reel.mp4`);
    console.warn('  Or keep using the remote HLS URL for the show reel.');
  }

  console.log('\nDone. Update component references to use /videos/, /assets/fonts/, etc.');
}

main().catch(console.error);
