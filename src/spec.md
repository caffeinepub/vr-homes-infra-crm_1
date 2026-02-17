# Specification

## Summary
**Goal:** Make the unified login page UI more colorful while keeping all existing login behavior unchanged.

**Planned changes:**
- Update `frontend/src/pages/LoginPage.tsx` styling to use a vibrant multi-color gradient background with improved visual hierarchy.
- Strengthen accent colors for the icon, login card, Admin/Agent toggle section, and primary “Sign In with Internet Identity” button while preserving readability/contrast in both light and dark themes.
- Ensure the page remains responsive and that loading and profile-setup dialog states retain their current layout and behavior.

**User-visible outcome:** The login page at route `/` looks noticeably more vibrant and modern (colorful gradient + accents) across mobile and desktop, while sign-in, toggle, loading, and profile setup all work exactly as before.
