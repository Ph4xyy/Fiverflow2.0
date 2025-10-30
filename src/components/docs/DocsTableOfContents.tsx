import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface DocsTableOfContentsProps {
  headings: Heading[];
}

const DocsTableOfContents: React.FC<DocsTableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Fixed navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-[#A6A6A6] mb-4 uppercase tracking-wide">
        On this page
      </h3>
      <ul className="space-y-1">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={`block w-full text-left text-sm py-1.5 transition-colors ${
                  isActive
                    ? 'text-[#8B5CF6]'
                    : 'text-[#A6A6A6] hover:text-[#FAFAFA]'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocsTableOfContents;
