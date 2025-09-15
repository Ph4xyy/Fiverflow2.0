import { cn } from "@/lib/utils";
import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-slate-700 dark:text-slate-300", className)} {...props} />
));
Badge.displayName = "Badge";
