import Typography from "@mui/material/Typography";
import BaseCard from "./BaseCard";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import Diversity3 from "@mui/icons-material/Diversity3";

export default function RecentInquiriesCard({ isApproved }: { isApproved: boolean }) {

  return (
    <BaseCard title="Bridal Inquiries" icon={<Diversity3 sx={{ color: "text.primary" }} />}>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Box>
          {isApproved ? (
            <>
              <Typography variant="body1" gutterBottom>
                New inquiries are sent directly to your email. You'll be able to manage them here soon.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                You are not yet enrolled in bridal inquiries.
                You can opt in from{" "}
                <MuiLink component={NextLink} href="/partner/settings">
                  Settings
                </MuiLink>
                .
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </BaseCard>
  );
}