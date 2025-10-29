import React, { useEffect, useState } from 'react';

interface TableOfContentsProps {
  items: string[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map(item => 
        document.getElementById(item.toLowerCase().replace(/\s+/g, '-'))
      );

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(item);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (item: string) => {
    const id = item.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-20">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase">On this page</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <button
              onClick={() => scrollToSection(item)}
              className={`
                text-sm transition-colors
                ${activeSection === item 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;

