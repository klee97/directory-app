import Tooltip from "@mui/material/Tooltip";
import Verified from "@mui/icons-material/Verified";
import { SxProps, Theme } from "@mui/material/styles";

interface VerifiedBadgeProps {
  size?: number;
  sx?: SxProps<Theme>;
}

/**
 * Verified checkmark badge — displayed next to a verified vendor's name
 * on their card and profile page.
 * Only render this when vendor.verified_at is non-null.
 */
export default function VerifiedBadge({ size = 20, sx }: VerifiedBadgeProps) {
  return (
    <Tooltip title="Verified artist" arrow>
      <Verified
        sx={{
          color: 'primary.main',
          fontSize: size,
          flexShrink: 0,
          ...sx,
        }}
        aria-label="Verified artist"
      />
    </Tooltip>
  );
}
