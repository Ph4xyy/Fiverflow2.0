import React from 'react';
import { TOC_SECTIONS } from '../../lib/docsPageContent';

export const DocsTOC = () => {
  return (
    <aside className="hidden xl:flex xl:flex-col xl:w-[200px] flex-shrink-0">
      <div className="sticky top-16 text-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 text-neutral-400 shadow-[0_30px_120px_rgba(0,0,0,0.8)]">
        <h3 className="text-white font-medium mb-3">On this page</h3>
        <ul className="space-y-2">
          {TOC_SECTIONS.map((section, index) => (
            <li key={index}>
              <a
                href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
                className="block py-1 text-xs hover:text-white transition-colors"
              >
                {section}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

