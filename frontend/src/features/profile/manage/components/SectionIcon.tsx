"use client";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ContrastIcon from '@mui/icons-material/Contrast';
import AdjustIcon from '@mui/icons-material/Adjust';
import React from 'react';

interface SectionIconProps {
  completed: boolean;
  required: boolean;
  inProgress?: boolean;
}

export default function SectionIcon({ completed, required, inProgress }: SectionIconProps) {
  if (completed) {
    // Green check for completed
    return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
  } else {
    if (inProgress) {
      // Green check for completed
      if (required) {
        return <ContrastIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
      } else {
        return <AdjustIcon sx={{ color: 'grey.400', fontSize: 20 }} />;
      }
    }
    // Empty for not started/optional
    if (required) {
      return <RadioButtonUncheckedIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
    } else {
      return <RadioButtonUncheckedIcon sx={{ color: 'grey.400', fontSize: 20 }} />;
    }
  }
}

