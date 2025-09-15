// src/components/ui/Accordion.tsx
import React, { useState, PropsWithChildren } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionProps = {
  type?: "single" | "multiple";
  className?: string;
};
type AccordionContextType = {
  open: number[]; // indexes
  toggle: (i: number) => void;
  type: "single" | "multiple";
};
const Ctx = React.createContext<AccordionContextType | null>(null);

export const Accordion: React.FC<PropsWithChildren<AccordionProps>> = ({ children, type = "single", className }) => {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) => {
    setOpen((prev) => {
      if (type === "single") return prev[0] === i ? [] : [i];
      return prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
    });
  };
  const value = { open, toggle, type };
  return (
    <Ctx.Provider value={value}>
      <div className={cn("w-full", className)}>{children}</div>
    </Ctx.Provider>
  );
};

export const AccordionItem: React.FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  const ctx = React.useContext(Ctx);
  const [index] = React.useState<number>(() => {
    // compute stable index by counting siblings before this render
    // fallback: use a random large number to avoid clashes (not visible)
    return Math.floor(Math.random() * 1e9);
  });

  // Because we generated random indices, we store a map in ref to maintain order — simpler approach:
  // Instead, we derive index from array position by cloning children in parent. To keep it simple here,
  // we’ll use a local counter via closure:
  // (Pragmatic approach) We attach our own counter on ctx if not present.
  const idxRef = React.useRef<number | null>(null);
  if (!idxRef.current) {
    // assign sequential index
    // @ts-ignore
    Ctx._i = (Ctx as any)._i ?? 0;
    // @ts-ignore
    idxRef.current = (Ctx as any)._i++;
  }
  const i = idxRef.current!;

  const isOpen = !!ctx?.open.includes(i);
  const onToggle = () => ctx?.toggle(i);

  return (
    <div className="px-4 sm:px-5">
      <button
        onClick={onToggle}
        className="w-full py-4 sm:py-5 flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform", isOpen && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-200 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden pb-4 sm:pb-5">{children}</div>
      </div>
    </div>
  );
};
