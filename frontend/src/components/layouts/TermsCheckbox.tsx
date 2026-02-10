"use client";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NextLink from "next/link";

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
    <div>
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
            {"I agree to the"}{isVendorTerms ? " Vendor" : ""}{" "}
            <Link component={NextLink} href={isVendorTerms ? '/vendor-terms' : '/terms'} target="_blank">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link component={NextLink} href={'/privacy'} target="_blank">
              Privacy Policy
            </Link>
          </Typography>
        }
      />
      {error && (
        <FormHelperText error>
          You must agree to the terms and conditions
        </FormHelperText>
      )}
    </div>
  );
}
