import React from "react";
import { cn } from "../lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800", className)} />
  );
};
