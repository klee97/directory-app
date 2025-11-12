"use client";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ContrastIcon from '@mui/icons-material/Contrast';
import React from 'react';

interface SectionIconProps {
  status: 'complete' | 'inProgress' | 'empty';
}

export default function SectionIcon({ status }: SectionIconProps) {
  if (status === 'complete') {
    // Green check for completed
    return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
  } else if (status === 'inProgress') {
    return <ContrastIcon sx={{ color: 'grey.400', fontSize: 20 }} />;
  } else if (status === 'empty') {
    return <RadioButtonUncheckedIcon sx={{ color: 'grey.400', fontSize: 20 }} />;
  }
}


