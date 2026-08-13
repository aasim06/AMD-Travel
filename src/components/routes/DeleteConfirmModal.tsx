"use client";
import React from "react";
import { Modal } from "../ui/modal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Route",
  description = "Are you sure you want to delete this route? This action cannot be undone.",
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] p-5 lg:p-8">
      <div className="flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Text */}
        <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h4>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex w-full items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200 transition-colors duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-rose-700 transition-colors duration-200 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
