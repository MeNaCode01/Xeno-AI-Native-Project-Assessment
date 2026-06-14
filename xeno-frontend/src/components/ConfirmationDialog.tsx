import React from "react";
import { Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => !isConfirming && onCancel()}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 transition-all duration-300">
        <div className="space-y-4">
          {/* Header Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isConfirming}
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={isConfirming}
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-red-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
