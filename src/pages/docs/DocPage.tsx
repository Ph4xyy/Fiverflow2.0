import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight } from 'lucide-react';

// Hardcoded content
const contentMap: Record<string, string> = {
  index: `# Welcome to FiverFlow Documentation

Comprehensive guides to help you make the most of every feature in the FiverFlow platform.

## Getting Started

FiverFlow is your all-in-one platform for managing freelance projects, clients, invoices, and more. Start by exploring the key sections below.

## Key Areas

### Overview

Essential features to manage your business:

- **Dashboard**: Your central hub for managing your freelance business
- **Calendar**: Schedule and track events and deadlines
- **Statistics**: Analyze your performance with detailed reports
- **Referrals**: Grow your network with our referral system

### AI Features

Leverage artificial intelligence to automate and optimize:

- **Assistant**: Get AI-powered help with tasks and insights

### Workspace

Organize your work and manage clients:

- **Clients**: Manage client information and relationships
- **Orders**: Track projects and deadlines
- **Invoices**: Handle billing and payment tracking
- **Workboard**: Organize tasks with Kanban boards

### More

Additional features to configure and manage:

- **Profile**: Account settings and preferences
- **Admin**: Administrative tools (for admins)
- **Upgrade**: View and manage your subscription

## Getting Help

If you need assistance or have questions:

- Check the individual documentation pages for detailed guides
- Contact support through the dashboard
- Visit the pricing page to upgrade your plan

---

*Last updated: October 2024*`,
  
  dashboard: `# Dashboard

Manage your freelance business from a central dashboard with real-time metrics, activity feeds, and quick actions.

## Overview

The Dashboard provides an at-a-glance view of your business health with key metrics, recent activity, and quick access to important functions.

## Features

### Quick Stats

Monitor your key performance indicators:
- Total revenue for selected period
- Active projects count
- Pending invoices amount
- Client count
- Weekly time tracked

### Recent Activity

Stay updated with the latest happenings:
- Recent client interactions
- Project updates and comments
- Payment notifications
- Upcoming deadlines and reminders

### Visual Analytics

Interactive charts and graphs help you visualize:
- Revenue trends over time
- Project status distribution
- Client activity patterns
- Time tracking summaries by project

## Getting Started

### Customize Your Dashboard

1. Click "Customize Dashboard" to rearrange widgets
2. Add or remove widgets based on what matters to you
3. Set your preferred date ranges
4. Save your layout for future sessions

### Quick Actions

Access common tasks directly from the dashboard:
- **Create Project**: Start a new client project
- **Add Client**: Quickly add new client information
- **Generate Invoice**: Create invoice for any client
- **Track Time**: Start time tracking for active work

## Tips

- Review your dashboard daily to stay informed about your business health
- Set up notifications for important metrics and deadlines
- Export data periodically for backup and analysis
- Customize the layout to show what matters most to your workflow

---

*Last updated: October 2024*`,
};

const DocPage: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  const location = useLocation();
  
  const getContent = () => {
    const docPage = page || 'index';
    return contentMap[docPage] || `# ${docPage} Documentation\n\nContent coming soon...`;
  };

  const content = getContent();
  const getBreadcrumbPath = () => {
    const currentPath = location.pathname;
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = parts.map((part, index) => ({
      label: part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      path: '/' + parts.slice(0, index + 1).join('/')
    }));
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbPath();

  return (
    <div className="prose prose-invert max-w-none text-[#A6A6A6]">
      {/* Breadcrumb */}
      {breadcrumbs.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-[#A6A6A6] mb-6">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <ChevronRight size={14} />}
              <span className={index === breadcrumbs.length - 1 ? 'text-[#FAFAFA]' : 'text-[#A6A6A6]'}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
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