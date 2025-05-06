"use client";
import { useTheme } from '@mui/material';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface ReCaptchaProps {
  siteKey?: string;
  onChange?: (token: string | null) => void;
  size?: 'normal' | 'compact' | 'invisible';
  // theme?: 'light' | 'dark';
  tabIndex?: number;
  onExpired?: () => void;
  onErrored?: () => void;
}

export interface ReCaptchaRef {
  executeAsync: () => Promise<string | null>;
  reset: () => void;
  getValue: () => string | null;
}

const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>((props, ref) => {
  const {
    siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    onChange,
    size = 'invisible',
    tabIndex = 0,
    onExpired,
    onErrored
  } = props;
  const theme = useTheme();

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useImperativeHandle(ref, () => ({
    executeAsync: async () => {
      if (!recaptchaRef.current) return null;
      try {
        return await recaptchaRef.current.executeAsync();
      } catch (error) {
        console.error('ReCAPTCHA execution failed:', error);
        return null;
      }
    },
    reset: () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    },
    getValue: () => {
      if (!recaptchaRef.current) return null;
      return recaptchaRef.current.getValue();
    }
  }));

  // Handle case where siteKey is not provided
  if (!siteKey) {
    console.warn('ReCAPTCHA site key is missing. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment variables.');
    return null;
  }

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={siteKey}
      size={size}
      theme={theme.palette.mode}
      tabindex={tabIndex}
      onChange={onChange}
      onExpired={onExpired}
      onErrored={onErrored}
    />
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;