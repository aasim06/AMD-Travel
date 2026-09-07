import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to AMD Global Travel Admin Management Portal",
};

export default function SignIn() {
  return <SignInForm />;
}
