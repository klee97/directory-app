"use client";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { submitVendorFeedback } from "@/features/contact/api/airtable";


interface VendorFeedbackPopupProps {
  /** Pass the vendor's ID and name so it's captured alongside the feedback */
  vendorId: string;
  businessName: string;
  /** Text to display related to the trigger action */
  triggerText?: string;
  /** Set to true after the vendor clicks Publish to trigger the popup */
  trigger: boolean;
  /** Optional: reset the trigger after the popup has been handled */
  onDismiss?: () => void;
}

const STORAGE_KEY = "vendorFeedbackShown";
const NO_FEEDBACK_TEXT = "No issues";

export const VendorFeedbackPopup = ({
  vendorId,
  businessName,
  trigger,
  onDismiss
}: VendorFeedbackPopupProps) => {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    return trigger && sessionStorage.getItem(STORAGE_KEY) !== "true";
  })
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    setStatus("idle");
    setComment("");
    onDismiss?.();
  };

  const handleSubmit = async () => {
    setStatus("loading");
    const success: boolean = await submitVendorFeedback(vendorId, businessName, comment);
    if (success) {
      setStatus("success");
      sessionStorage.setItem(STORAGE_KEY, "true");
      setTimeout(() => {
        setOpen(false);
        onDismiss?.();
      }, 1800);
    } else {
      setStatus("error");
    }
  };

  const handleNothingWrong = async () => {
    handleClose();
    submitVendorFeedback(vendorId, businessName, NO_FEEDBACK_TEXT);
  };

  return (
    <Dialog open={open} onClose={handleNothingWrong} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ position: "relative", paddingRight: "40px" }}>
        {status === "success" ? "Thank you!" : "Anything we can improve?"}
      </DialogTitle>

      <DialogContent>
        {status === "success" ? (
          <Typography color="text.secondary">
            Your feedback helps us improve our site.
          </Typography>
        ) : (
          <>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Let us know if something went wrong, or if you have any suggestions.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={status === "loading"}
              error={status === "error"}
              helperText={status === "error" ? "Something went wrong — please try again." : undefined}
            />
          </>
        )}
      </DialogContent>

      {status !== "success" && (
        <DialogActions sx={{ mb: 1, px: 3 }}>
          <Button onClick={handleNothingWrong} color="inherit" disabled={status === "loading"}>
            {NO_FEEDBACK_TEXT}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!comment.trim() || status === "loading"}
            startIcon={status === "loading" ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {status === "loading" ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default VendorFeedbackPopup;