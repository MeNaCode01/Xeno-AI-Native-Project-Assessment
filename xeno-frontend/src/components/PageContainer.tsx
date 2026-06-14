import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>}
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
