import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors", className)} {...props} />
));
Input.displayName = "Input";
