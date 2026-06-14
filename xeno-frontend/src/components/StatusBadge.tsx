import React from "react";
import { cn } from "../lib/utils";

interface StatusBadgeProps {
  status: "draft" | "sent" | "completed" | "failed" | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();

  const config: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: "bg-slate-100 dark:bg-slate-900", text: "text-slate-800 dark:text-slate-300", label: "Draft" },
    sent: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", label: "Sent" },
    completed: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-400", label: "Completed" },
    failed: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", label: "Failed" },
  };

  const current = config[normalizedStatus] || { bg: "bg-slate-100", text: "text-slate-800", label: status };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        current.bg,
        current.text
      )}
    >
      {current.label}
    </span>
  );
};
