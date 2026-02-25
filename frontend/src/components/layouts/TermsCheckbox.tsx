"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import Alert from "@mui/material/Alert";

interface TermsCheckboxProps {
  isVendorTerms: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
  checked: boolean;
}

export default function TermsCheckbox({
  isVendorTerms,
  onChange,
  error,
  checked,
}: TermsCheckboxProps) {
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          You must agree to the terms and conditions before continuing
        </Alert>
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            I agree to the{isVendorTerms ? " Vendor" : ""}{" "}
            <Link component={NextLink} href={isVendorTerms ? "/vendor-terms" : "/terms"} target="_blank">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link component={NextLink} href="/privacy" target="_blank">
              Privacy Policy
            </Link>
          </Typography>
        }
      />
    </Box>
  );
}