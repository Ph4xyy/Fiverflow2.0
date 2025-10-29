import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight } from 'lucide-react';

const DocPage: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const docPage = page || 'index';
        const response = await fetch(`/docs/${docPage}.mdx`);
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent(`# ${docPage} Documentation\n\nContent coming soon...`);
        }
      } catch (error) {
        console.error('Error loading documentation:', error);
        setContent(`# ${page || 'index'} Documentation\n\nContent coming soon...`);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [page]);
  
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6] mx-auto mb-4"></div>
        <p className="text-[#A6A6A6]">Loading documentation...</p>
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      {/* Breadcrumb */}
      {page && (
        <div className="flex items-center gap-2 text-sm text-[#A6A6A6] mb-6">
          <span>Docs</span>
          <ChevronRight size={14} />
          <span className="text-[#FAFAFA]">{page.charAt(0).toUpperCase() + page.slice(1)}</span>
        </div>
      )}

      {/* Content */}
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
  );
};

export default DocPage;