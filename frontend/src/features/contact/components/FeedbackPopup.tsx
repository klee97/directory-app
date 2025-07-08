"use client";
import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import { submitFeedback } from '../api/submitFeedback';

export enum FeedbackRating {
  Sad = 1,
  Neutral = 2,
  Happy = 3
}

const FeedbackPopup = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("feedbackShown");

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem("feedbackShown", "true"); // Mark as shown
      }, 30000); // 30 seconds

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleRating = (value: FeedbackRating) => {
    setRating(value);
  };

  const handleSubmit = () => {
    submitFeedback(rating, comment);
    setOpen(false);
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ position: 'relative', paddingRight: '40px' }}>
        We&apos;d love your feedback!
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
          sx={{
            position: 'absolute',
            top: 8,
            right: 16,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>Thanks for using our site! How&apos;s your experience so far?</Typography>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          {[
            { value: FeedbackRating.Sad, emoji: "☹️" },
            { value: FeedbackRating.Neutral, emoji: "😐" },
            { value: FeedbackRating.Happy, emoji: "😊" }
          ].map(({ value, emoji }) => (
            <IconButton
              key={value}
              onClick={() => handleRating(value)}
              sx={{
                fontSize: 40,
                transition: "0.2s",
                color: rating === value ? "#64b5f6" : "inherit",
                backgroundColor: rating === value ? "#e0f2f1" : "transparent",
                boxShadow: rating === value ? "0px 3px 8px rgba(0, 0, 0, 0.15)" : "none",
                borderRadius: "30%",
                "&:hover": {
                  backgroundColor: "#e0f7fa"
                }
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Stack>
        <TextField
          fullWidth
          margin="dense"
          label="Anything you&apos;d like us to improve?"
          rows={3}
          multiline
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ marginBottom: 1 }}>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" sx={{ marginRight: 2 }} disabled={!rating || !comment.trim()}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackPopup;
