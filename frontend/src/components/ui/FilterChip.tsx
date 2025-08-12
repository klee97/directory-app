
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
      sx={{
        fontSize: '0.875rem',
        fontWeight: 'medium',
        mt: 1,
        cursor: 'pointer',
        transition: 'all 0.1s ease-out',

        '&:hover:not(:disabled)': {
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },

        '&:active:not(:disabled)': {
          transform: 'scale(0.95)',
          opacity: 0.8,
          transition: 'all 0.08s ease-out' // Slightly faster for click
        }
      }}
      color={color}
      {...props}
    />
  );
}