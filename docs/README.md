# FiverFlow Documentation

This directory contains the MDX documentation files for the FiverFlow platform.

## Structure

Each page has its own MDX file:

- `index.mdx` - Documentation homepage
- `dashboard.mdx` - Dashboard overview
- `calendar.mdx` - Calendar functionality
- `statistics.mdx` - Statistics and analytics
- `referrals.mdx` - Referral system
- `assistant.mdx` - AI Assistant features
- `clients.mdx` - Client management
- `orders.mdx` - Order tracking
- `invoices.mdx` - Invoicing system
- `workboard.mdx` - Task management
- `profile.mdx` - Profile settings
- `admin.mdx` - Admin dashboard
- `upgrade.mdx` - Subscription management

## Adding Content

To add or modify documentation:

1. Edit the corresponding MDX file in this directory
2. Copy the updated files to `public/docs/` using:
   ```powershell
   Copy-Item docs\*.mdx public\docs\ -Force
   ```
3. The changes will be reflected on the documentation site

## Format

All documentation follows a consistent format:

- Title with icon
- "What it does" section
- "Getting Started" guide
- "Tips" for best practices
- "Features" breakdown

## Styling

The documentation uses the dark theme with purple accents (#8B5CF6) matching the FiverFlow branding.

