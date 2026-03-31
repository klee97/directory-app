import { AccountCircle } from "@mui/icons-material";
import { SxProps, Theme } from "@mui/material/styles";

interface PersonAvatarProps {
  sx?: SxProps<Theme>;
}

export default function PersonAvatar({ sx }: PersonAvatarProps) {
  return (
    <AccountCircle sx={{ fontSize: 32, color: "inherit", ...sx }} />
  );
}