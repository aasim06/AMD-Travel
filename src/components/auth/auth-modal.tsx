"use client";

import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";
import { X } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup" | "lookup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-md w-[calc(100%-2rem)] p-0 rounded-3xl border border-slate-200/80 shadow-2xl bg-white overflow-hidden z-[110]"
      >
        <DialogTitle className="sr-only">Sign In or Create Account — AMD Global Travel</DialogTitle>
        <DialogDescription className="sr-only">Access your bookings and flight itineraries</DialogDescription>
        
        <div className="relative w-full">
          {/* Close button in top-right corner */}
          <DialogClose
            aria-label="Close"
            className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all focus:outline-none cursor-pointer"
          >
            <X className="h-4 w-4" />
          </DialogClose>

          {/* Next Level Shadcn LoginForm with dynamic defaultMode */}
          <LoginForm
            defaultMode={defaultTab === "signup" ? "signup" : defaultTab === "lookup" ? "forgot" : "login"}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
