import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight } from 'lucide-react';
import TableOfContents from './TableOfContents';
import FeedbackSection from './FeedbackSection';

const contentMap: Record<string, string> = {};

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={24} />,
  calendar: <Calendar size={24} />,
  statistics: <BarChart3 size={24} />,
  referrals: <Network size={24} />,
  assistant: <Bot size={24} />,
  clients: <Users size={24} />,
  orders: <ShoppingBag size={24} />,
  invoices: <FileText size={24} />,
  workboard: <CheckSquare size={24} />,
  profile: <User size={24} />,
  admin: <Shield size={24} />,
  upgrade: <ArrowUp size={24} />,
};

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
        <p className="text-gray-400">Loading documentation...</p>
      </div>
    );
  }

  const icon = page ? iconMap[page] : null;

  return (
    <div className="prose prose-invert max-w-none">
      {/* Hero Section */}
      <div className="mb-12">
        {page && (
          <div className="flex items-center gap-4 mb-4">
            {icon && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white shadow-glow-sm">
                {icon}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white m-0">
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </h1>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none">
        <div className="bg-[#0B0E14] rounded-xl border border-[#1C2230] p-6 md:p-8">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-white mt-8 mb-4 first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-white mt-8 mb-3 first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-white mt-6 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="text-gray-300 mb-4 space-y-2 ml-6">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="text-gray-300 mb-4 space-y-2 ml-6">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-[#1C2230] text-[#8B5CF6] px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-[#1C2230] text-gray-300 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4">
                    {children}
                  </code>
                );
              },
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
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
                <blockquote className="border-l-4 border-[#8B5CF6] pl-4 italic text-gray-400 my-4">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="border-t border-[#1C2230] my-8" />
              ),
              h2: ({ children, id }) => (
                <h2 id={id || children?.toString().toLowerCase().replace(/\s+/g, '-')} className="text-2xl font-bold text-white mt-12 mb-4 first:mt-0 scroll-mt-20">
                  {children}
                </h2>
              ),
              h3: ({ children, id }) => (
                <h3 id={id || children?.toString().toLowerCase().replace(/\s+/g, '-')} className="text-xl font-semibold text-white mt-8 mb-3 scroll-mt-20">
                  {children}
                </h3>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Feedback Section */}
        <FeedbackSection />
      </div>

      {/* Sidebar - On this page */}
      <div className="hidden xl:block w-64 flex-shrink-0">
        {features.length > 0 && <TableOfContents items={features} />}
      </div>
    </div>
  );
};

export default DocPage;

