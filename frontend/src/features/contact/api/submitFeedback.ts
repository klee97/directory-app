import { FeedbackRating } from "@/features/contact/components/FeedbackPopup";
import { createBrowserClient } from "@/lib/supabase/clients/browserClient";

const supabaseBrowserClient = createBrowserClient();

export const submitFeedback = async (rating: FeedbackRating | null, comment?: string) => {
  const { error } = await supabaseBrowserClient.from("feedback").insert([
    { rating, comment },
  ]);

  if (error) {
    console.error("Error submitting feedback:", error);
    return;
  }
};