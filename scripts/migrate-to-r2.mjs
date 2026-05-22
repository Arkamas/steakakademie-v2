/**
 * Migrate /public/images/ → Cloudflare R2
 *
 * Voraussetzungen:
 *   .env.local mit R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET, R2_PUBLIC_URL
 *
 * Ausführen:
 *   node scripts/migrate-to-r2.mjs
 *   node scripts/migrate-to-r2.mjs --dry-run   (zeigt nur was hochgeladen würde)
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config({ path: '.env.local' });

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'public');

const DRY_RUN = process.argv.includes('--dry-run');

const REQUIRED = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_URL'];
for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`❌ Fehlende Umgebungsvariable: ${key}`);
    process.exit(1);
  }
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const IMAGE_EXTENSIONS = new Set(Object.keys(MIME_TYPES));

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (IMAGE_EXTENSIONS.has(extname(entry).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fileExistsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const allFiles = walkDir(PUBLIC_DIR);
  const imageFiles = allFiles.filter(f => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()));

  console.log(`\n📦 Gefunden: ${imageFiles.length} Bilder in /public/`);
  if (DRY_RUN) console.log('🔍 DRY-RUN — nichts wird hochgeladen\n');

  const results = { uploaded: [], skipped: [], errors: [] };

  for (const filePath of imageFiles) {
    // Key = relativer Pfad von /public/ an, z.B. "images/vergleich/premium-fleischthermometer.jpg"
    const key = relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    if (!DRY_RUN) {
      const exists = await fileExistsInR2(key);
      if (exists) {
        console.log(`⏭  Bereits vorhanden: ${key}`);
        results.skipped.push(key);
        continue;
      }
    }

    console.log(`${DRY_RUN ? '🔍' : '⬆️ '} ${key} → ${publicUrl}`);

    if (!DRY_RUN) {
      try {
        const body = readFileSync(filePath);
        await s3.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }));
        results.uploaded.push({ key, url: publicUrl });
      } catch (err) {
        console.error(`❌ Fehler bei ${key}:`, err.message);
        results.errors.push(key);
      }
    }
  }

  console.log('\n──────────────────────────────────────────');
  console.log(`✅ Hochgeladen:    ${results.uploaded.length}`);
  console.log(`⏭  Übersprungen:  ${results.skipped.length}`);
  console.log(`❌ Fehler:        ${results.errors.length}`);

  if (results.uploaded.length > 0) {
    console.log('\n📋 Neue URLs (für MDX / registry.yaml):');
    for (const { key, url } of results.uploaded) {
      console.log(`  /images/${key.replace('images/', '')}  →  ${url}`);
    }
  }
}

main().catch(console.error);
