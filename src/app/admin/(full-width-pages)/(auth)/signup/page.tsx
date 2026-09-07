import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign Up",
  description: "Create an account on AMD Global Travel Admin Portal",
};

export default function SignUp() {
  return <SignUpForm />;
}
