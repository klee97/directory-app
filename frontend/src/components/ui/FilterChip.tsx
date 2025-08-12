
import Chip, { ChipProps } from '@mui/material/Chip';


interface FilterChipProps extends ChipProps {
  label: string; // required
  color?: "primary" | "secondary" | "info" | "default";
}

export default function FilterChip({
  key,
  label,
  color = "default",
  ...props
}: FilterChipProps) {
  return (
    <Chip
      key={key}
      label={label}
      variant="outlined"
      sx={{ fontSize: '0.875rem', fontWeight: 'medium', mt: 1 }}
      color={color}
      {...props}
    />
  );
}