import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight } from 'lucide-react';
import TableOfContents from './TableOfContents';
import FeedbackSection from './FeedbackSection';

const contentMap: Record<string, string> = {};

const featuresMap: Record<string, string[]> = {
  dashboard: ['Overview', 'Quick Stats', 'Recent Activity', 'Performance Metrics'],
  calendar: ['Create Events', 'Manage Deadlines', 'Multiple Views', 'Smart Notifications'],
  statistics: ['Revenue Analytics', 'Client Metrics', 'Time Tracking', 'Custom Reports'],
  referrals: ['Share Links', 'Track Invites', 'Earn Rewards', 'Manage Payouts'],
  assistant: ['AI Suggestions', 'Task Automation', 'Natural Language', 'Custom Workflows'],
  clients: ['Add Clients', 'Manage Contacts', 'Track History', 'Custom Fields'],
  orders: ['Create Orders', 'Track Progress', 'Set Deadlines', 'Attach Files'],
  invoices: ['Create Invoices', 'Custom Templates', 'Track Payments', 'Recurring Invoices'],
  workboard: ['Task Management', 'Time Tracking', 'Kanban Board', 'Set Priorities'],
  profile: ['Account Settings', 'Security', 'Notifications', 'Integrations'],
  admin: ['User Management', 'System Monitoring', 'Analytics', 'Support Tools'],
  upgrade: ['Compare Plans', 'See Features', 'Manage Billing', 'Usage Limits'],
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

  const features = page ? featuresMap[page] || [] : [];

  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 prose prose-invert max-w-none mr-72">
        {/* Breadcrumb */}
        {page && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <span>Docs</span>
            <ChevronRight size={14} />
            <span className="text-white">{page.charAt(0).toUpperCase() + page.slice(1)}</span>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-12">
          {page && (
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </h1>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
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
              h2: ({ children }) => {
                const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
                return (
                  <h2 id={id} className="text-2xl font-bold text-white mt-12 mb-4 first:mt-0 scroll-mt-20">
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => {
                const id = children?.toString().toLowerCase().replace(/\s+/g, '-');
                return (
                  <h3 id={id} className="text-xl font-semibold text-white mt-8 mb-3 scroll-mt-20">
                    {children}
                  </h3>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

      </div>

      {/* Sidebar - On this page */}
      <div className="hidden xl:block w-64 flex-shrink-0 fixed right-8 top-20">
        {features.length > 0 && <TableOfContents items={features} />}
        <FeedbackSection />
      </div>
    </div>
  );
};

export default DocPage;

