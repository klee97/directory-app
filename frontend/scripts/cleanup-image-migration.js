import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';
import { URL_MIGRATION_MAP } from '../src/lib/directory/images.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPABASE_URL_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL;

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
const NEXT_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// ─── Revalidation ─────────────────────────────────────────────────────────────

async function revalidateVendor(slug) {
  if (!NEXT_APP_URL || !REVALIDATE_SECRET) {
    console.warn('   ⚠️  NEXT_PUBLIC_APP_URL or REVALIDATE_SECRET not set — skipping revalidation');
    return;
  }
  try {
    const res = await fetch(`${NEXT_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REVALIDATE_SECRET}`,
      },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`   🔄 Revalidated vendor: ${slug}`);
  } catch (err) {
    console.warn(`   ⚠️  Revalidation failed for ${slug}:`, err.message);
  }
}

async function revalidateAllVendors() {
  if (!NEXT_APP_URL || !REVALIDATE_SECRET) {
    console.warn('   ⚠️  NEXT_PUBLIC_APP_URL or REVALIDATE_SECRET not set — skipping revalidation');
    return;
  }
  try {
    const res = await fetch(`${NEXT_APP_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REVALIDATE_SECRET}`,
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log('   🔄 Revalidated all-vendors tag');
  } catch (err) {
    console.warn('   ⚠️  Revalidation failed for all-vendors:', err.message);
  }
}

async function migrateVendorMedia() {
  console.log('\n📋 Migrating vendor_media.media_url...');
  const affectedSlugs = new Set();

  const { data: rows, error } = await supabase
    .from('vendor_media')
    .select('id, media_url')
    .like('media_url', `${SUPABASE_URL_PREFIX}%`);

  if (error) throw error;
  console.log(`   Found ${rows.length} Supabase URLs`);

  writeFileSync(`backup-vendor-media-${Date.now()}.json`, JSON.stringify(rows, null, 2));

  let ok = 0, fail = 0, skipped = 0;

  for (const row of rows) {
    const r2Url = URL_MIGRATION_MAP.get(row.media_url);

    if (!r2Url) {
      console.warn(`   ⚠️  No mapping found for id=${row.id}: ${row.media_url}`);
      skipped++;
      continue;
    }

    console.log(`   ${row.media_url}\n   → ${r2Url}`);

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('vendor_media')
        .update({ media_url: r2Url })
        .eq('id', row.id);

      if (updateError) {
        console.error(`   ❌ Failed (id=${row.id}):`, updateError.message);
        fail++;
        continue;
      }
    }
    const slug = row.vendors?.slug;
    if (slug) affectedSlugs.add(slug);

    ok++;
  }

  return { ok, fail, skipped, affectedSlugs };
}

async function migrateCoverImages() {
  console.log('\n📋 Migrating vendors.cover_image...');

  const affectedSlugs = new Set();
  const { data: rows, error } = await supabase
    .from('vendors')
    .select('id, business_name, slug, cover_image')
    .like('cover_image', `${SUPABASE_URL_PREFIX}%`);

  if (error) throw error;
  console.log(`   Found ${rows.length} Supabase URLs`);

  writeFileSync(`backup-vendors-${Date.now()}.json`, JSON.stringify(rows, null, 2));

  let ok = 0, fail = 0, skipped = 0;

  for (const row of rows) {
    const r2Url = URL_MIGRATION_MAP.get(row.cover_image);

    if (!r2Url) {
      console.warn(`   ⚠️  No mapping found for ${row.business_name}: ${row.cover_image}`);
      skipped++;
      continue;
    }

    console.log(`   ${row.business_name}: ${row.cover_image}\n   → ${r2Url}`);

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('vendors')
        .update({ cover_image: r2Url })
        .eq('id', row.id);

      if (updateError) {
        console.error(`   ❌ Failed (id=${row.id}):`, updateError.message);
        fail++;
        continue;
      }

    }
    const slug = row.vendors?.slug;
    if (slug) affectedSlugs.add(slug);

    ok++;
  }

  return { ok, fail, skipped, affectedSlugs };
}

async function verifyStragglers() {
  console.log('\n🔍 Checking for remaining Supabase URLs...');

  const [{ data: mediaRows }, { data: vendorRows }] = await Promise.all([
    supabase.from('vendor_media').select('id, media_url').like('media_url', `${SUPABASE_URL_PREFIX}%`),
    supabase.from('vendors').select('id, business_name, cover_image').like('cover_image', `${SUPABASE_URL_PREFIX}%`),
  ]);

  if (mediaRows?.length) {
    console.warn(`⚠️  ${mediaRows.length} stragglers in vendor_media:`);
    mediaRows.forEach(r => console.warn(`   id=${r.id} — ${r.media_url}`));
  }
  if (vendorRows?.length) {
    console.warn(`⚠️  ${vendorRows.length} stragglers in vendors.cover_image:`);
    vendorRows.forEach(r => console.warn(`   id=${r.id} (${r.business_name}) — ${r.cover_image}`));
  }
  if (!mediaRows?.length && !vendorRows?.length) {
    console.log('✅ No Supabase URLs remaining — safe to remove the migration map!');
  }
}

async function main() {
  console.log(`🚀 Starting migration${DRY_RUN ? ' (DRY RUN)' : ''}...`);

  const mediaResult = await migrateVendorMedia();
  const vendorResult = await migrateCoverImages();

  console.log('\n🎉 Done!');
  console.log(`   vendor_media:  ✅ ${mediaResult.ok}  ❌ ${mediaResult.fail}  ⚠️  ${mediaResult.skipped} unmapped`);
  console.log(`   vendors:       ✅ ${vendorResult.ok}  ❌ ${vendorResult.fail}  ⚠️  ${vendorResult.skipped} unmapped`);

  if (!DRY_RUN) {
    await verifyStragglers();
    console.log('\n🔄 Revalidating affected vendors...');
    const allSlugs = new Set([...mediaResult.affectedSlugs, ...vendorResult.affectedSlugs]);
    for (const slug of allSlugs) {
      await revalidateVendor(slug);
    }
    await revalidateAllVendors();
  }
}

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});