// src/components/support/FAQ.tsx
import React from "react";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";

type FaqItem = { q: string; a: string };

export const FAQ: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  return (
    <Accordion type="multiple" className="divide-y divide-gray-200 border border-gray-200 rounded-xl bg-white">
      {items.map((it, idx) => (
        <AccordionItem key={idx} title={it.q}>
          <p className="text-gray-600 leading-relaxed">{it.a}</p>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
