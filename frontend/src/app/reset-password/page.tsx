import { Container, Typography } from "@mui/material";
import { ResetPasswordForm } from "@/features/login/components/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <Container maxWidth="sm">
            <br />
            <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
                Reset Password
            </Typography>
            <ResetPasswordForm />
        </Container>
    );
} 