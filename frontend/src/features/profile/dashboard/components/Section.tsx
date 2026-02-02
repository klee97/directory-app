"use client";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ContrastIcon from '@mui/icons-material/Contrast';
import React from 'react';
import { VendorFormData, VendorFormField } from '@/types/vendorFormData';
import { getGoogleMapsErrorMessage, getUrlErrorMessage } from '@/lib/profile/normalizeUrl';

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

export type ValidationResult = {
  isValid: boolean;
  isComplete: boolean;
  isEmpty: boolean;
  errors: Partial<Record<VendorFormField, string | null>>;
};

export interface Section {
  id: string;
  label: string;
  validate: (formData: VendorFormData) => ValidationResult;
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
        isEmpty: !(business_name || formData.locationResult),
        errors: {
          business_name: !business_name ? 'Business name is required' : null,
          location: !formData.locationResult ? 'Location is required' : null,
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
        isEmpty: !description,
        errors: {
          description: !description ? 'Bio is required' : null,
        }
      }
    }
  },
  {
    id: 'links',
    label: 'Website & Socials',
    validate: (formData: VendorFormData) => {
      const instagram = formData.instagram?.trim();
      const website = formData.website?.trim();
      const googleMaps = formData.google_maps_place?.trim();

      // Validate URLs
      const websiteError = website ? getUrlErrorMessage(website) : null;
      const googleMapsError = googleMaps ? getGoogleMapsErrorMessage(googleMaps) : null;

      const hasErrors = !instagram || websiteError || googleMapsError;
      return {
        isValid: !!(instagram) && !hasErrors,
        isComplete: !!(instagram && website && googleMaps && !hasErrors),
        isEmpty: !(instagram || website || googleMaps),
        errors: {
          instagram: !instagram ? 'Instagram handle is required' : null,
          website: websiteError,
          google_maps_place: googleMapsError,
        }
      }
    }
  },
  {
    id: 'services',
    label: 'Services & Skills',
    validate: (formData: VendorFormData) => {
      const hasService = formData.tags.some(tag => tag.type === 'SERVICE');
      return {
        isValid: hasService,
        isComplete: !!(hasService && formData.tags.some(tag => tag.type === 'SKILL')),
        isEmpty: !formData.tags || formData.tags.length === 0,
        errors: {
          services: !hasService ? 'Please select at least one service' : null,
          skills: null
        }
      };
    }
  },
  {
    id: 'pricing',
    label: 'Pricing',
    validate: (formData: VendorFormData) => {
      const errors: Record<string, string> = {};

      const priceFields = [
        'bridal_hair_price',
        'bridal_makeup_price',
        'bridesmaid_hair_price',
        'bridesmaid_makeup_price',
        'bridal_hair_&_makeup_price',
        'bridesmaid_hair_&_makeup_price'
      ] as const;

      priceFields.forEach(field => {
        if (formData[field] !== null && formData[field] !== undefined && formData[field]! < 0) {
          errors[field] = 'Price cannot be negative';
        }
      });

      // Check if at least one price field is filled
      const isEmpty = !priceFields.some(field =>
        formData[field] !== null && formData[field] !== undefined
      );
      // Check if all price fields are filled
      const isComplete = priceFields.every(field =>
        formData[field] !== null && formData[field] !== undefined
      );

      return {
        isValid: Object.keys(errors).length === 0,
        isComplete: isComplete && Object.keys(errors).length === 0,
        isEmpty,
        errors
      };
    }
  },
  {
    id: 'image',
    label: 'Client photo',
    validate: (formData: VendorFormData) => {
      return {
        isValid: true,
        isComplete: !!(formData.images && formData.images.length > 0),
        isEmpty: !(formData.images && formData.images.length > 0),
        errors: {}
      };
    }
  },
];