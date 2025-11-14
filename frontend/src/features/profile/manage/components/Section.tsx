"use client";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ContrastIcon from '@mui/icons-material/Contrast';
import React from 'react';
import { VendorFormData } from '@/types/vendorFormData';

interface SectionIconProps {
  status: 'complete' | 'inProgress' | 'empty';
}

export function SectionIcon({ status }: SectionIconProps) {
  if (status === 'complete') {
    // Green check for completed
    return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
  } else if (status === 'inProgress') {
    return <ContrastIcon sx={{ color: 'grey.400', fontSize: 20 }} />;
  } else if (status === 'empty') {
    return <RadioButtonUncheckedIcon sx={{ color: 'grey.400', fontSize: 20 }} />;
  }
}


export interface Section {
  id: string;
  label: string;
  validate: (formData: VendorFormData) => {
    isValid: boolean;
    isComplete: boolean;
    errors: Record<string, string | null>;
  };
}

export const SECTIONS: Section[] = [
  {
    id: 'business',
    label: 'Business info',
    validate: (formData: VendorFormData) => {
      const business_name = formData.business_name?.trim();

      return {
        isValid: !!(business_name && formData.locationResult),
        isComplete: !!(business_name && formData.locationResult),
        errors: {
          business_name: !business_name ? 'Business name is required' : null,
          location: !formData.locationResult ? 'Location is required' : null,
        }
      }
    }
  },
  {
    id: 'links',
    label: 'Website & Socials',
    validate: (formData: VendorFormData) => {
      const instagram = formData.instagram?.trim();

      return {
        isValid: !!(instagram),
        isComplete: !!(instagram && formData.website?.trim() && formData.google_maps_place?.trim()),
        errors: {
          instagram: !instagram ? 'Instagram handle is required' : null,
        }
      }
    }
  },
  {
    id: 'bio',
    label: 'Bio',
    validate: (formData: VendorFormData) => {
      const description = formData.description?.trim();
      return {
        isValid: !!description,
        isComplete: !!description,
        errors: {
          description: !description ? 'Bio is required' : null,
        }
      }
    }
  },
  {
    id: 'services',
    label: 'Services and Skills',
    validate: (formData: VendorFormData) => {
      const hasService = formData.tags.some(tag => tag.type === 'SERVICE');
      return {
        isValid: hasService,
        isComplete: !!(hasService && formData.tags.some(tag => tag.type === 'SKILL')),
        errors: {
          services: !hasService ? 'Please select at least one service' : null,
        }
      };
    }
  },
  {
    id: 'pricing',
    label: 'Pricing',
    validate: (formData: VendorFormData) => {
      return {
        isValid: true,
        isComplete: !!(formData.bridal_hair_price
          && formData.bridal_makeup_price
          && formData.bridal_hair_price
          && formData.bridesmaid_hair_price
          && formData.bridesmaid_makeup_price
          && formData["bridal_hair_&_makeup_price"]
          && formData["bridesmaid_hair_&_makeup_price"]),
        errors: {}
      }
    }
  },
  {
    id: 'image',
    label: 'Business image',
    validate: (formData: VendorFormData) => {
      return {
        isValid: true,
        isComplete: !!(formData.images && formData.images.length > 0),
        errors: {} 
      };
    }
  },
];