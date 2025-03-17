"use server";
import { verifyRecaptchaToken } from "@/lib/security/recaptchaVerification";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorRecommendationInsert } from "@/types/vendor";

export const createRecommendation = async (rec: BackendVendorRecommendationInsert & { recaptchaToken: string }) => {
  try {

    // Extract and verify reCAPTCHA token
    const { recaptchaToken, ...cleanRec } = rec;
    const { success } = await verifyRecaptchaToken(recaptchaToken);
    if (!success) {
      console.log("CAPTCHA verification failed");
      throw new Error("Security verification failed. Please try again.");
    }

    // Create the recommendation in database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vendor_recommendations")
      .insert(cleanRec)
      .select("id")
      .single();

    if (error) {
      console.error("Error creating recommendation:", error);
      throw error;
    }

    console.log("Recommendation created successfully!", data);
    return data;
  } catch (error: unknown) {
    console.error("Error in createRecommendation:", error);

    // Return a cleaner error for the client
    if (error instanceof Error) {
      if (error.message === "CAPTCHA verification failed") {
        throw new Error("Security verification failed. Please try again.");
      }
    }
    throw new Error("Failed to create recommendation. Please try again.");


  }
};