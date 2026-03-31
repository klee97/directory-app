"use client";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signUpAndClaimVendor } from "@/features/profile/dashboard/hooks/claimVendor";
import { useNotification } from "@/contexts/NotificationContext";
import { validatePassword } from "@/utils/passwordValidation";
import TermsCheckbox from "@/components/layouts/TermsCheckbox";

interface VendorClaimFormProps {
  vendorInfo: { name: string; email: string };
  token: string;
}

export default function VendorClaimForm({ vendorInfo, token }: VendorClaimFormProps) {
  const { addNotification } = useNotification();
  const router = useRouter();
  const supabase = createClient();

  const [isClaiming, setIsClaiming] = useState(false);
  const [formError, setFormError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [enableInquiries, setEnableInquiries] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setFormError("Please fill out all fields.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setFormError(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    // Clear any field errors
    setFormError("");

    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }

    setIsClaiming(true);

    try {
      const result = await signUpAndClaimVendor(
        vendorInfo.email,
        token,
        password,
        enableInquiries
      );

      if (!result.success) {
        setFormError(result.error || "Failed to claim vendor.");
        setIsClaiming(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: vendorInfo.email,
        password,
      });

      if (signInError) {
        setFormError("Account created, but sign-in failed. Please log in manually.");
        setIsClaiming(false);
        return;
      }

      addNotification("Welcome! Your vendor account has been created.");
      router.push("/partner/dashboard");
    } catch {
      setFormError("Failed to claim business profile. Please try again.");
      setIsClaiming(false);
    }
  };

  return (
    <>
      <Typography variant="h4" color="text.primary" sx={{ mb: 2 }}>
        Set a password below to claim your profile
      </Typography>

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      {/* Password */}
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        size="small"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleClaim(e); }}
        sx={{ mb: 0.75 }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 2 }}>
        8+ characters · one uppercase · one number · one symbol (!@#$%^&amp;*)
      </Typography>

      {/* Confirm password */}
      <TextField
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        fullWidth
        size="small"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleClaim(e); }}
        sx={{ mb: 2.5 }}
      />

      {/* Inquiries opt-in */}
      <FormControlLabel
        sx={{ mt: 1, mb: 2, alignItems: 'flex-start' }}
        control={
          <Checkbox
            checked={enableInquiries}
            onChange={(e) => setEnableInquiries(e.target.checked)}
            sx={{ pt: 0 }}
            color="secondary"
          />
        }
        label={
          <Typography variant="body2">
            Receive bridal inquiries through Asian Wedding Makeup
          </Typography>
        }
      />

      {/* Terms */}
      <TermsCheckbox
        isVendorTerms={true}
        checked={acceptedTerms}
        onChange={(checked) => {
          setAcceptedTerms(checked);
          setTermsError(false);
        }}
        error={termsError}
      />

      {/* Submit */}
      <Button
        onClick={handleClaim}
        variant="contained"
        fullWidth
        disabled={isClaiming}
        size="large"
        color="secondary"
        sx={{ mt: 2 }}
      >
        {isClaiming ? <CircularProgress size={20} color="inherit" /> : "Claim profile"}
      </Button>
    </>
  );
}