import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { SxProps, Theme } from "@mui/material/styles";

export interface ChecklistItem {
  label: string;
  detail?: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  sx?: SxProps<Theme>;
}

export default function Checklist({ items, sx }: ChecklistProps) {
  return (
    <List dense disablePadding sx={sx}>
      {items.map((item) => (
        <ListItem key={item.label} disablePadding sx={{ py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: "grey.500" }} />
          </ListItemIcon>
          <ListItemText
            primary={
              item.detail ? (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  <Box component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
                    {item.label}
                  </Box>
                  {" "} {item.detail}
                </Typography>
              ) : (
                <Typography variant="body2">{item.label}</Typography>
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
}