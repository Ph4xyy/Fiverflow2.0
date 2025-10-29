# Documentation Files

**IMPORTANT:** These `.mdx` files are NO LONGER USED for serving content.

The documentation content is now hardcoded directly in `src/pages/docs/DocPage.tsx` to avoid serving raw MDX files.

## Why?

When accessing `/docs` or refreshing the page, the browser was trying to serve the raw `.mdx` files from this directory, displaying them as plain text instead of rendering them through React.

## Solution

All documentation content is now embedded in the React component, so:
- `/docs` always renders through React Router
- No raw MDX files are served to the browser
- All routing works correctly in all scenarios

## File Structure

These MDX files remain as reference but are NOT imported or used:
- `index.mdx` - Content for the docs home page
- `dashboard.mdx` - Dashboard documentation
- Other MDX files - Placeholder content

To edit documentation, modify the `contentMap` object in `src/pages/docs/DocPage.tsx`.

