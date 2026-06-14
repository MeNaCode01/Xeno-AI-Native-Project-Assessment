import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container floating at the top-right of the viewport */}
      <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-green-50 border-green-100 text-green-800 dark:bg-green-950/90 dark:border-green-900/50 dark:text-green-200"
                : toast.type === "error"
                ? "bg-red-50 border-red-100 text-red-800 dark:bg-red-950/90 dark:border-red-900/50 dark:text-red-200"
                : "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/90 dark:border-blue-900/50 dark:text-blue-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5 dark:text-green-400" />
            ) : toast.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5 dark:text-red-400" />
            ) : (
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
            )}
            <div className="flex-1 text-sm font-semibold">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 focus:outline-hidden dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
