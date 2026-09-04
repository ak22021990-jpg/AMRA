#!/usr/bin/env node
/**
 * build-scorm.cjs
 * Usage: node build-scorm.cjs
 *
 * 1. Runs `npm run build` (vite build → dist/)
 * 2. Verifies imsmanifest.xml is in dist/ (copied by vite from public/)
 * 3. Zips dist/ contents → amra-assessment-scorm.zip
 *
 * Output: amra-assessment-scorm.zip (importable by any SCORM 1.2 LMS)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { zip } = require('node:zlib');   // not used — we use archiver or native

// ── deps check ───────────────────────────────────────────────────────────────
// We use the built-in `archiver` if present, otherwise fall back to PowerShell.
let useArchiver = false;
try {
  require.resolve('archiver');
  useArchiver = true;
} catch {
  // archiver not installed — will use PowerShell Compress-Archive fallback
}

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'amra-assessment-scorm.zip');

// ── 1. Build ──────────────────────────────────────────────────────────────────
console.log('▶ Building Vite app...');
execSync('npm run build', { stdio: 'inherit', cwd: ROOT });

// ── 2. Verify manifest ────────────────────────────────────────────────────────
const manifest = path.join(DIST, 'imsmanifest.xml');
if (!fs.existsSync(manifest)) {
  console.error('✗ imsmanifest.xml missing from dist/. Ensure public/imsmanifest.xml exists.');
  process.exit(1);
}
console.log('✓ imsmanifest.xml found in dist/');

// ── 3. Patch index.html for Articulate/LMS iframe sandbox ────────────────────
// Remove `crossorigin` attributes — Articulate serves files locally with no
// CORS headers, so crossorigin makes the browser block script/style loading.
const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/\s+crossorigin(?:="[^"]*")?/g, '');
// Fix garbled em-dash in title (encoding artifact from Windows build)
html = html.replace(/\uFFFD\?[""]|—/g, '\u2014');
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✓ Patched index.html (stripped crossorigin, fixed encoding)');

// ── 4. Zip ───────────────────────────────────────────────────────────────────
if (fs.existsSync(OUT)) fs.unlinkSync(OUT);

if (useArchiver) {
  const archiver = require('archiver');
  const output = fs.createWriteStream(OUT);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const mb = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✓ SCORM package created: amra-assessment-scorm.zip (${mb} MB)`);
    console.log('  Upload this zip directly to your LMS.');
  });

  archive.on('error', (err) => { throw err; });
  archive.pipe(output);
  archive.directory(DIST, false);  // contents of dist/ at root of zip
  archive.finalize();
} else {
  // PowerShell fallback (Windows)
  console.log('▶ Zipping via PowerShell (archiver not found)...');
  // Use -File with a temp ps1 to avoid escaping hell
  const ps1 = path.join(ROOT, '_scorm_zip_tmp.ps1');
  fs.writeFileSync(ps1, `Compress-Archive -Path '${DIST}\\*' -DestinationPath '${OUT}' -Force\n`);
  execSync(`powershell -ExecutionPolicy Bypass -File "${ps1}"`, { stdio: 'inherit' });
  fs.unlinkSync(ps1);
  const stat = fs.statSync(OUT);
  const mb = (stat.size / 1024 / 1024).toFixed(2);
  console.log(`✓ SCORM package created: amra-assessment-scorm.zip (${mb} MB)`);
  console.log('  Upload this zip directly to your LMS.');
}
