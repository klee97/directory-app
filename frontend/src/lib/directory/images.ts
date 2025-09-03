import { BackendVendor, IMAGE_PREFIX, R2_IMAGE_PREFIX } from "@/types/vendor";

const URL_MIGRATION_MAP = new Map([
  // [
  //   "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_jane_c_cover_photo.jpeg",
  //   "https://images.asianweddingmakeup.com/test-portraits/hmua_jane_c_cover_photo.jpg"
  // ],
  ["https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_lindsey_ariel_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_lyndsey_ariel_pozo_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmau_lyndsey_ariel_pozo_cover_photo2.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_lyndsey_ariel_pozo_cover_photo2.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmau_lyndsey_ariel_pozo_cover_photo3.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_lyndsey_ariel_pozo_cover_photo3.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmau_lyndsey_ariel_pozo_cover_photo4.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_lyndsey_ariel_pozo_cover_photo4.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmau_lyndsey_ariel_pozo_cover_photo5.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_lyndsey_ariel_pozo_cover_photo5.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmau_lyndsey_ariel_pozo_cover_photo6.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_lyndsey_ariel_pozo_cover_photo6.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmau_mable_pang_cover_photo_2.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_mable_pang_cover_photo_2.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmau_mable_pang_cover_photo_3.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_mable_pang_cover_photo_3.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmau_mable_pang_cover_photo_4.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_mable_pang_cover_photo_4.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_jenny_nguyen_cover_image_2.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jenny_nguyen_cover_image_2.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_jenny_nguyen_cover_image_3.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jenny_nguyen_cover_image_3.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_jenny_nguyen_cover_image_4.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jenny_nguyen_cover_image_4.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_jenny_nguyen_cover_image_5.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jenny_nguyen_cover_image_5.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_jenny_nguyen_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jenny_nguyen_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_mable_pang_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_mable_pang_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_aimee_artistry_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_aimee_artistry_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_ceo_beauty_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_ceo_beauty_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_diemangie_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_diemangie_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_drake_artistry_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_drake_artistry_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_emely_j_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_emely_j_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_j_tan_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_j_tan_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_jennifer_le_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jennifer_le_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_jenny_le_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jenny_le_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_julie_dy_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_julie_dy_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_chien_buffle_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_chien_buffle_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_hera_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_hera_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_joie_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_joie_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_linda_independent_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_linda_independent_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_love_notes_by_june_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_love_notes_by_june_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_luong_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_luong_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_lynn_yee_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_lynn_yee_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_primed_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_primed_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_priscilla_freire_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_priscilla_freire_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_pure_makeup_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_pure_makeup_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_vivi_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_vivi_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_xiomara_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_xiomara_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_all_brides_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_all_brides_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_coco_tsang_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_coco_tsang_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_cp_wedding_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_cp_wedding_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_darima_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_darima_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_ford_beauty_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_ford_beauty_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_grace_lin_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_grace_lin_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_jen_lim_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jen_lim_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_jenny_luu_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_jenny_luu_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_kelly_tran_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_kelly_tran_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_michelle_valentine_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_michelle_valentine_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_pink_palette_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_pink_palette_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos//hmua_refined_beauty_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_refined_beauty_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_rhia_amio_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_rhia_amio_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_teresa_snowball_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_teresa_snowball_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_glitter_glam_sarah_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_glitter_glam_sarah_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_kathy_kho_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_kathy_kho_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_khloe_nguyen_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_khloe_nguyen_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_krimse_cover_photo_1.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_krimse_cover_photo_1.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_m_villanueva_cover_photo.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_m_villanueva_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_mai_tokioka_cover_photo_2.jpeg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_mai_tokioka_cover_photo_2.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_serena_park_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_serena_park_cover_photo.jpg"
  ],
  [
    "https://xbsnelpjukudknfvmnnj.supabase.co/storage/v1/object/public/hmua-cover-photos/hmua_shannon_le_cover_photo.jpg",
    "https://images.asianweddingmakeup.com/test-portraits/hmua_shannon_le_cover_photo.jpg"
  ]
]);

export function getMigratedUrl(originalUrl: string | null) {
  if (!originalUrl) {
    return null;
  }
  // Check if URL is in our migration allowlist
  if (URL_MIGRATION_MAP.has(originalUrl)) {
    return URL_MIGRATION_MAP.get(originalUrl);
  }

  // Return original URL if not migrated yet
  return originalUrl;
}

type ProcessVendorImagesOptions = {
  preferR2?: boolean;
  fallbackToSupabase?: boolean;
};

export function processVendorImages(
  vendor: BackendVendor,
  options: ProcessVendorImagesOptions = {}
) {
  const {
    preferR2 = true,           // Prefer R2 URLs when available
    fallbackToSupabase = true  // Fallback to Supabase if R2 not available
  } = options;

  if (!vendor.vendor_media || vendor.vendor_media.length === 0) {
    return [];
  }

  const images = vendor.vendor_media
    .map((image) => {
      const originalUrl = image.media_url;

      if (!(originalUrl.startsWith(IMAGE_PREFIX) || originalUrl.startsWith(R2_IMAGE_PREFIX))) {
        // Unsupported URL, skip
        return null;
      }

      // Try to get migrated R2 URL first
      const migratedUrl = getMigratedUrl(originalUrl);

      if (preferR2 && migratedUrl !== originalUrl) {
        // We have an R2 version, use it
        return {
          ...image,
          media_url: migratedUrl,
          source: 'r2',
          original_url: originalUrl
        };
      } else if (fallbackToSupabase) {
        // Use original Supabase URL
        return {
          ...image,
          media_url: originalUrl,
          source: 'supabase',
          original_url: originalUrl
        };
      }

      return null;
    })
    .filter(image => image !== null);

  return images;
}