import { supabase } from "@/lib/api-client";
import { FeedbackRating } from "../components/FeedbackPopup";

export const submitFeedback = async (rating: FeedbackRating | null, comment?: string) => {
  const { data, error } = await supabase.from("feedback").insert([
    { rating, comment },
  ]);

  if (error) {
    console.error("Error submitting feedback:", error);
    return;
  }

  console.log("Feedback submitted successfully!", data);
};