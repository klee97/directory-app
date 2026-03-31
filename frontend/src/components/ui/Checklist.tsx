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
  icon?: React.ReactNode;
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
          <ListItemIcon sx={{ minWidth: 32, mt: "2px", alignSelf: "flex-start" }}>
            {item.icon ?? <CheckCircleIcon sx={{ fontSize: 18, color: "grey.500" }} />}
          </ListItemIcon>
          <ListItemText
            primary={
              item.detail ? (
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>
                  <Typography component="span" variant="subtitle2" color="text.primary">
                    {item.label}
                  </Typography>
                  {" "} {item.detail}
                </Typography>
              ) : (
                <Typography variant="subtitle2" color="text.primary">{item.label}</Typography>
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
}