"use client";
import React, { useState, useEffect } from "react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar: string;
  }) => void;
  initialProfile: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar: string;
  };
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  initialProfile,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialProfile.name || "Musharaf Chowdhury");
  const [email, setEmail] = useState(initialProfile.email || "admin@amdglobaltravel.com");
  const [phone, setPhone] = useState(initialProfile.phone || "+92 300 1234567");
  const [role, setRole] = useState(initialProfile.role || "Super Admin");
  const [avatar, setAvatar] = useState(initialProfile.avatar || "/images/user/owner.jpg");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setName(initialProfile.name);
    setEmail(initialProfile.email);
    setPhone(initialProfile.phone);
    setRole(initialProfile.role);
    setAvatar(initialProfile.avatar);
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  // Optimized HTML Canvas Avatar Resizer (Compresses photo to 250x250 px ~15KB thumbnail)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_SIZE = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            setAvatar(dataUrl);
          }
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsSaving(true);

    const updatedData = {
      name,
      email,
      phone,
      role,
      avatar,
    };

    onSave(updatedData);
    setIsSaving(false);
    setSuccessMsg("Profile updated & saved permanently!");
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div>
            <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider font-mono">
              ADMIN PROFILE SETTINGS
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
              Edit Admin Account Details
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Avatar Photo Selection */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand-500 shrink-0 shadow-md">
              <img
                src={avatar || "/images/user/owner.jpg"}
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Profile Photo / Avatar
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setAvatar("/images/user/owner.jpg")}
                  className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Musharaf Chowdhury"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Admin Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@amdglobaltravel.com"
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
            />
          </div>

          {/* Phone Number & Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Admin Role Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Super Admin"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
              />
            </div>
          </div>

          {/* Change Password Fields */}
          <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 font-outfit">
              Security &amp; Change Password (Optional):
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-normal text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSaving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
