# Specification

## Summary
**Goal:** Improve clarity of the session setup failure message on Login and rearrange Admin/Agent dashboard tabs for better accessibility without changing behavior.

**Planned changes:**
- Update the Login page’s session-initialization failure UI copy to exactly: "Session Setup failed, kindly refresh it." and change the primary action label to a refresh-oriented label while keeping the existing full page reload behavior unchanged.
- Reorder (move) the existing tabs/panels on the Admin Dashboard and Agent Dashboard to a clearer sequence, without removing any tabs or changing panel functionality/content.

**User-visible outcome:** Users see clearer guidance when session setup fails (with a refresh-labeled action that still reloads the page), and Admin/Agent dashboards present the same panels in a reorganized, easier-to-reach tab order.
