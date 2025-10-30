import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight } from 'lucide-react';

// Hardcoded content
const contentMap: Record<string, string> = {
  index: `# Welcome to the FiverFlow Documentation

This home page helps you get started, understand how things work, and follow a clear syllabus across modules.

## Welcome message

Welcome! FiverFlow is your all‑in‑one cockpit to manage clients, orders, invoices, tasks, and analytics — built for freelancers and small teams.

## How it works (overview)

1. Sign in and profile: create your account, fill your public profile, set preferences.
2. Workspace: use the left sidebar to access Dashboard, Calendar, Clients, Orders, Invoices, and Workboard.
3. Real‑time data: all screens sync with the database (Supabase). Actions update instantly across the app.
4. AI Assistant: available depending on plan; speeds up input, search, and automation.

## Syllabus (learning path)

- Week 1: Dashboard basics, onboarding, initial configuration.
- Week 2: Clients and Orders — end‑to‑end flow from offer to delivery.
- Week 3: Invoices and payments — templates, sending, tracking, export.
- Week 4: Workboard and Calendar — tasks, priorities, deadlines, sync.
- Week 5: Statistics and growth — KPIs, reports, decisions.
- Bonus: AI Assistant, automations, and advanced integrations.

## Video placeholder (coming soon)

A short walkthrough video will be embedded here to tour the interface and essential gestures.

> [Coming soon] Guided demo (5 minutes) — fast overview of each module.

## Key areas

Essential features to run your business:

- **Dashboard**: central view of metrics and quick actions
- **Calendar**: planning, events, and deadlines
- **Statistics**: detailed reports and analysis
- **Referrals**: referral program

### AI

Accelerate and automate with the assistant:

- **Assistant**: contextual help, writing, search, and automations

### Workspace

Organize your work and clients:

- **Clients**: contact and account management
- **Orders**: project tracking and deliverables
- **Invoices**: billing and payments
- **Workboard**: tasks/kanban, priorities, progress

### More

Additional features:

- **Profile**: settings, appearance, and security
- **Admin**: administration tools (role‑based)
- **Upgrade**: plans and billing

## Need help

If you have questions or get stuck:

- Browse the dedicated Docs pages from the sidebar
- Open a support ticket from the dashboard
- Visit the pricing page to upgrade your plan

---

*Last updated: ${new Date().toLocaleDateString()}*`,
  
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
    // Normalize path so "/docs" and "/docs/" both resolve to index
    const fullPath = location.pathname.replace(/^\/docs\/?/, '');
    const docPage = fullPath === '' ? 'index' : fullPath;
    
    // Check if we have specific content for this page
    if (contentMap[docPage]) {
      return contentMap[docPage];
    }
    
    // Generate content based on the page path
    const pathParts = docPage.split('/');
    const pageName = pathParts[pathParts.length - 1];
    const category = pathParts[0] || docPage;
    
    // Format the title nicely
    const title = pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const categoryTitle = category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return `# ${title}

This page provides detailed information about ${title} in the ${categoryTitle} section.

## Overview

Content coming soon for this page. We're working on comprehensive documentation.

## Features

Stay tuned for detailed instructions and examples.

---

*Last updated: ${new Date().toLocaleDateString()}*`;
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