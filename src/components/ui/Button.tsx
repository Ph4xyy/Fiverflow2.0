import { cn } from "@/lib/utils";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 px-4 py-2", className)} {...props} />
));
Button.displayName = "Button";
