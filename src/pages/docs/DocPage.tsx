import React from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight } from 'lucide-react';
import indexContent from '../../../public/docs/index.mdx?raw';
import dashboardContent from '../../../public/docs/dashboard.mdx?raw';

const DocPage: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  
  // Map page params to content
  const getContent = () => {
    const docPage = page || 'index';
    
    switch (docPage) {
      case 'index':
        return indexContent;
      case 'dashboard':
        return dashboardContent;
      default:
        return `# ${docPage} Documentation\n\nContent coming soon for ${docPage}...`;
    }
  };

  const content = getContent();
  return (
    <div className="prose prose-invert max-w-none text-[#A6A6A6]">
      {/* Breadcrumb */}
      {page && (
        <div className="flex items-center gap-2 text-sm text-[#A6A6A6] mb-6">
          <span>Docs</span>
          <ChevronRight size={14} />
          <span className="text-[#FAFAFA]">{page.charAt(0).toUpperCase() + page.slice(1)}</span>
        </div>
      )}

      {/* Content */}
      <div className="markdown-content">
        <ReactMarkdown
        components={{
          h1: ({ children }) => {
            const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
            return (
              <h1 id={id} className="text-4xl md:text-5xl font-bold text-[#FAFAFA] mt-0 mb-6 scroll-mt-20">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
            return (
              <h2 id={id} className="text-2xl font-bold text-[#FAFAFA] mt-12 mb-4 scroll-mt-20">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
            return (
              <h3 id={id} className="text-xl font-semibold text-[#FAFAFA] mt-8 mb-3 scroll-mt-20">
                {children}
              </h3>
            );
          },
          p: ({ children }) => (
            <p className="text-[#A6A6A6] mb-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="text-[#A6A6A6] mb-4 space-y-2 ml-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="text-[#A6A6A6] mb-4 space-y-2 ml-6">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-[#1A1A1A] text-[#8B5CF6] px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className="block bg-[#1A1A1A] text-[#A6A6A6] p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4 border border-[rgba(255,255,255,0.04)]">
                {children}
              </code>
            );
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-[#FAFAFA]">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-[#8B5CF6] hover:text-[#A78BFA] underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#8B5CF6] pl-4 italic text-[#A6A6A6] my-4">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="border-t border-[rgba(255,255,255,0.04)] my-8" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      </div>
    </div>
  );
};

export default DocPage;