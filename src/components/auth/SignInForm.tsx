"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@amdglobaltravel.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("admin_session", "true");
        if (data.user) {
          localStorage.setItem("admin_profile", JSON.stringify(data.user));
        }
        document.cookie = "admin_session=true; path=/; max-age=604800";
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.message || "Invalid email or password!");
      }
    } catch (err) {
      setError("An error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">

      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </div>
              <span className="text-xl text-center d-flex justify-center items-center  font-bold tracking-tight text-gray-900 dark:text-white font-outfit">
                AMD <span className="text-brand-500">Global</span>
              </span>
            </div>


          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email Address <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="admin@amdglobaltravel.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
              </div>
              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In to Admin Portal"}
                </Button>
              </div>
            </div>
          </form>

          <div className="p-4 mt-6 border border-gray-200/60 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-sm dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              🔑 Demo Admin Credentials:
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              Email: <span className="font-semibold text-brand-500">admin@amdglobaltravel.com</span>
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
              Password: <span className="font-semibold text-brand-500">admin123</span> (or <span className="font-semibold text-brand-500">Amd@123.com</span>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
