import UserLogin from "@/features/login/components/UserLogin";
import { Metadata } from "next";
import { Suspense } from "react";


export const metadata: Metadata = {
  title: 'Login | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserLogin />
    </Suspense>
  );
}
