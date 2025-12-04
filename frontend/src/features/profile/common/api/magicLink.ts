import { logEnvironmentInfo } from "@/lib/env/env";
import { fetchVendorBySlug } from "./fetchVendor";

export async function verifyVendorMagicLink(slug: string, email: string, token: string) {  
  logEnvironmentInfo();
  const vendor = await fetchVendorBySlug(slug);
  
  if (!vendor) {
    return { success: false, error: 'Vendor not found' };
  }
  
  const doEmailAndTokenMatch = 
    email.toLowerCase() === vendor.email?.toLowerCase() && 
    token.toLowerCase() === vendor.access_token?.toLowerCase();

  console.debug(`Magic link verification for vendor "${slug}": ${doEmailAndTokenMatch ? 'SUCCESS' : 'FAILURE'}`);
  
  return { 
    success: doEmailAndTokenMatch, 
    vendorAccessToken: doEmailAndTokenMatch ? vendor.access_token : null,
    vendorEmail: vendor.email,
    vendorBusinessName: vendor.business_name
  };
}