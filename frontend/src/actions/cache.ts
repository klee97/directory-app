"use server";
import { isDevelopment } from "@/lib/env/env";
import { revalidateTag } from "next/cache";

  export async function invalidateVendorCache() {
  if (!isDevelopment()) {
    console.warn('Cache invalidation only available in dev');
    return;
  }
  
  revalidateTag('vendors');
}