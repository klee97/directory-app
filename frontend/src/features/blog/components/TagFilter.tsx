'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

export interface TagOption {
  id: string;
  name: string;
}

interface TagFilterProps {
  tags: TagOption[];
  activeTagId: string | null;
  onChange: (tagId: string | null) => void;
}

export function TagFilter({ tags, activeTagId, onChange }: TagFilterProps) {
  if (tags.length === 0) return null;

  const allOptions = [{ id: null, name: 'All Posts' }, ...tags.map((t) => ({ id: t.id as string | null, name: t.name }))];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0,
        mb: 4,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {allOptions.map((option) => {
        const isActive = option.id === activeTagId;
        return (
          <ButtonBase
            key={option.id ?? '__all__'}
            onClick={() => onChange(option.id)}
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: '2px solid',
              borderColor: isActive ? 'primary.main' : 'transparent',
              mb: '-1px',
              transition: 'border-color 0.15s, color 0.15s',
              '&:hover': {
                borderColor: isActive ? 'primary.main' : 'text.disabled',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'primary.main' : 'text.secondary',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
            >
              {option.name}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
