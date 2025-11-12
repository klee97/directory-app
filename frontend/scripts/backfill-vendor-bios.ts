import { getDefaultBio } from '@/features/profile/common/utils/bio';
import { VendorTag } from '@/types/vendor';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';

// Load environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

interface VendorWithTags {
  id: string;
  business_name: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  description: string | null;
  tags: {
    id: string;
    name: string;
    display_name: string;
    type: string;
    is_visible: boolean;
    style: string | null;
  }[];
}

const DRY_RUN = process.env.DRY_RUN === 'true';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function backfillVendorBios() {
  console.log(`🚀 Starting vendor bio backfill (${DRY_RUN ? 'DRY RUN' : 'LIVE'})...\n`);

  // Fetch all vendors without descriptions (or with empty descriptions)
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select(`
      id,
      business_name,
      city,
      state,
      country,
      description,
      tags (id, display_name, name, type, is_visible, style)
    `)
    .or('description.is.null,description.eq.')
    .order('id');

  if (error) {
    console.error('❌ Error fetching vendors:', error);
    return;
  }

  console.log(`📊 Found ${vendors.length} vendors without descriptions\n`);

  let updated = 0;
  let failed = 0;

  for (const vendor of vendors as VendorWithTags[]) {
    try {
      // Get location string
      console.warn(`Processing vendor ${vendor.id} with city: ${vendor.city}, state: ${vendor.state}, country: ${vendor.country}`);
      const location = getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country);

      // Convert tags to VendorTag format
      const tags: VendorTag[] = (vendor.tags || [])
        .filter(t => t.is_visible)
        .map(t => ({
          id: t.id,
          name: t.name,
          display_name: t.display_name,
          type: t.type as 'SERVICE' | 'SKILL',
          is_visible: t.is_visible,
          style: t.style,
        }));

      // Generate default bio
      const defaultBio = getDefaultBio({
        businessName: vendor.business_name,
        tags: tags,
        location: location,
      });

      // Update vendor
      if (DRY_RUN) {
        console.log(`[DRY RUN] Would update ${vendor.id}: "${defaultBio}"`);
      } else {
        const { error: updateError } = await supabase
          .from('vendors')
          .update({ description: defaultBio })
          .eq('id', vendor.id);

        if (updateError) {
          console.error(`❌ Failed to update ${vendor.id}:`, updateError);
          failed++;
        } else {
          updated++;
          console.log(`✅ ${vendor.id}: "${defaultBio}"`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing ${vendor.id}:`, err);
      failed++;
    }
  }

  console.log('\n📈 Summary:');
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total: ${vendors.length}`);
}

// Run the backfill
backfillVendorBios()
  .then(() => {
    console.log('\n✨ Backfill complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Backfill failed:', err);
    process.exit(1);
  });