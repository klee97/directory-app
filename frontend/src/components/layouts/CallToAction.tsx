import { Box } from "@mui/material";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
export function CallToAction() {
  return (
    <Box
      bgcolor="background.paper"
      sx={{
        mt: 4,
        py: 4,
        px: 2,
        textAlign: "center",
      }}
    >
      {/* Newsletter Signup */}
      <NewsletterForm />
    </Box>
  );
}
