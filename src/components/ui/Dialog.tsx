import * as React from "react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
};

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => onOpenChange(false)} />
      <div className="absolute inset-0 p-4 flex items-center justify-center">{children}</div>
    </div>
  );
};

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>;
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl",
        className
      )}
      {...props}
    />
  )
);
DialogContent.displayName = "DialogContent";

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 border-b border-gray-200 dark:border-slate-700", className)} {...props} />
  )
);
DialogHeader.displayName = "DialogHeader";

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 border-t border-gray-200 dark:border-slate-700", className)} {...props} />
  )
);
DialogFooter.displayName = "DialogFooter";
