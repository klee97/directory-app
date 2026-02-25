import { VendorFormData } from "@/types/vendorFormData";

export function hasAnyPrice(formData: VendorFormData): boolean | null {
  return (
    formData.bridal_hair_price !== null ||
    formData.bridal_makeup_price !== null ||
    formData["bridal_hair_&_makeup_price"] !== null ||
    formData.bridesmaid_hair_price !== null ||
    formData.bridesmaid_makeup_price !== null ||
    formData["bridesmaid_hair_&_makeup_price"] !== null
  );
}

