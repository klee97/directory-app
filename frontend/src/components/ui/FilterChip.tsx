
import Chip, { ChipProps } from '@mui/material/Chip';


interface FilterChipProps extends ChipProps {
  chipKey: string | number;
  label: string;
  color?: "primary" | "secondary" | "info" | "default";
}

export default function FilterChip({
  chipKey,
  label,
  color = "default",
  ...props
}: FilterChipProps) {
  return (
    <Chip
      key={chipKey}
      label={label}
      variant="outlined"
      sx={{
        fontSize: '0.875rem',
        fontWeight: 'medium',
        mt: 1,
        cursor: 'pointer',
        transition: 'all 0.1s ease-out',

        ...(props.onDelete && {
          '& .MuiChip-deleteIcon': {
            transition: 'all 0.1s ease-out',
            '&:hover': {
              transform: 'scale(1.1)',
            },
            '&:active': {
              transform: 'scale(0.9)',
              opacity: 0.85,
            }
          }
        })
      }}
      color={color}
      {...props}
    />
  );
}