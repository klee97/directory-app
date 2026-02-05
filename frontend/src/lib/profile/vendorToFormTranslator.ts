import { Vendor } from '@/types/vendor';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';
import { VendorFormData } from '@/types/vendorFormData';
import { getDefaultBio } from '@/features/profile/common/utils/bio';

/**
 * Convert Vendor (DB/API model) to VendorFormData (UI form state)
 */
export function vendorToFormData(vendor: Vendor): VendorFormData {
  // Build location result from vendor's flat location fields
  const locationResult = vendor.latitude && vendor.longitude ? {
    lat: vendor.latitude,
    lon: vendor.longitude,
    display_name: getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country),
    address: {
      city: vendor.city || '',
      state: vendor.state || '',
      country: vendor.country || '',
    }
  } : null;

  return {
    business_name: vendor.business_name || '',
    locationResult: locationResult,
    travels_world_wide: vendor.travels_world_wide || false,
    website: vendor.website || '',
    instagram: vendor.instagram || '',
    google_maps_place: vendor.google_maps_place || '',
    description: vendor.description?.trim() 
      ? vendor.description 
      : getDefaultBio({
          businessName: vendor.business_name,
          tags: vendor.tags || [],
          location: getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country)
        }),
    bridal_hair_price: vendor.bridal_hair_price,
    bridal_makeup_price: vendor.bridal_makeup_price,
    "bridal_hair_&_makeup_price": vendor.bridal_hair_makeup_price,
    bridesmaid_hair_price: vendor.bridesmaid_hair_price,
    bridesmaid_makeup_price: vendor.bridesmaid_makeup_price,
    "bridesmaid_hair_&_makeup_price": vendor.bridesmaid_hair_makeup_price,
    cover_image: vendor.cover_image,
    tags: vendor.tags || [],
  };
}