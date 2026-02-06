"use client";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ContrastIcon from '@mui/icons-material/Contrast';
import React from 'react';
import { COMBO_PRICE_FIELDS, HAIR_PRICE_FIELDS, MAKEUP_PRICE_FIELDS, VendorFormData, VendorFormField } from '@/types/vendorFormData';
import { getGoogleMapsErrorMessage, getUrlErrorMessage } from '@/lib/profile/normalizeUrl';
import { hasTagByName, VendorSpecialty } from '@/types/tag';

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
      let businessNameError = null;

      if (!business_name) {
        businessNameError = 'Business name is required';
      } else if (business_name.length > 100) {
        businessNameError = 'Business name cannot exceed 100 characters';
      }

      return {
        isValid: !!(business_name && formData.locationResult && !businessNameError),
        isComplete: !!(business_name && formData.locationResult && !businessNameError),
        isEmpty: !(business_name || formData.locationResult),
        errors: {
          business_name: businessNameError,
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
      let descriptionError = null;

      if (!description) {
        descriptionError = 'Bio is required';
      } else if (description.length > 5000) {
        descriptionError = 'Bio cannot exceed 5000 characters';
      }

      return {
        isValid: !!description && !descriptionError,
        isComplete: !!description && !descriptionError,
        isEmpty: !description,
        errors: {
          description: descriptionError,
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

      // Validate Instagram
      let instagramError = null;
      if (!instagram) {
        instagramError = 'Instagram handle is required';
      } else if (instagram.length > 30) {
        instagramError = 'Instagram handle cannot exceed 30 characters';
      }

      // Validate URLs
      let websiteError = website ? getUrlErrorMessage(website) : null;
      if (!websiteError && website && website.length > 2000) {
        websiteError = 'Website URL cannot exceed 2000 characters';
      }

      let googleMapsError = googleMaps ? getGoogleMapsErrorMessage(googleMaps) : null;
      if (!googleMapsError && googleMaps && googleMaps.length > 2000) {
        googleMapsError = 'Google Maps URL cannot exceed 2000 characters';
      }

      const hasErrors = instagramError || websiteError || googleMapsError;
      return {
        isValid: !!(instagram) && !hasErrors,
        isComplete: !!(instagram && website && googleMaps && !hasErrors),
        isEmpty: !(instagram || website || googleMaps),
        errors: {
          instagram: instagramError,
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

      const includeHair = hasTagByName(
        formData.tags,
        VendorSpecialty.SPECIALTY_HAIR
      );
      const includeMakeup = hasTagByName(
        formData.tags,
        VendorSpecialty.SPECIALTY_MAKEUP
      );

      const isFilled = (field: keyof VendorFormData) =>
        formData[field] !== null && formData[field] !== undefined;

      const anyFilled = (fields: readonly (keyof VendorFormData)[]) =>
        fields.some(isFilled);

      const allFilled = (fields: readonly (keyof VendorFormData)[]) =>
        fields.every(isFilled);

      const relevantFields: (keyof VendorFormData)[] = [
        ...(includeHair ? HAIR_PRICE_FIELDS : []),
        ...(includeMakeup ? MAKEUP_PRICE_FIELDS : []),
        ...(includeHair && includeMakeup ? COMBO_PRICE_FIELDS : []),
      ];

      // Validate non-negative pricing
      relevantFields.forEach(field => {
        const value = formData[field];
        if (typeof value === 'number' && value < 0) {
          errors[field] = 'Price cannot be negative';
        }
      });

      // Determine completion rules
      let isComplete = false;

      if (includeHair && !includeMakeup) {
        // Hair-only vendor
        isComplete = allFilled(HAIR_PRICE_FIELDS);
      } else if (!includeHair && includeMakeup) {
        // Makeup-only vendor
        isComplete = allFilled(MAKEUP_PRICE_FIELDS);
      } else if (includeHair && includeMakeup) {
        // Hair + Makeup vendor
        isComplete =
          allFilled(COMBO_PRICE_FIELDS)
          && allFilled(HAIR_PRICE_FIELDS)
          && allFilled(MAKEUP_PRICE_FIELDS);
      }

      const isEmpty = !anyFilled(relevantFields);

      return {
        isValid: Object.keys(errors).length === 0,
        isComplete: isComplete && Object.keys(errors).length === 0,
        isEmpty,
        errors,
      };
    }
  },
  {
    id: 'image',
    label: 'Client photo',
    validate: (formData: VendorFormData) => {
      return {
        isValid: true,
        isComplete: !!(formData.cover_image),
        isEmpty: !formData.cover_image,
        errors: {}
      };
    }
  },
];