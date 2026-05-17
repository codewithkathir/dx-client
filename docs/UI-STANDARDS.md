# UI-STANDARDS.md

# Frontend UI/UX Standards

This document defines the complete UI/UX architecture standards, reusable design principles, responsive layout rules, component styling standards, and frontend visual consistency guidelines.

The goal is to build:

* clean modern UI
* scalable design systems
* reusable visual architecture
* responsive interfaces
* professional enterprise dashboards
* consistent user experience

---

# Core UI Stack

UI Framework:

* Tailwind CSS

Component System:

* shadcn/ui

Icons:

* Lucide React
  OR
* React Icons

Animation:

* Framer Motion (when required)

---

# Core UI Principles

Every UI must prioritize:

* consistency
* reusability
* readability
* responsiveness
* accessibility
* scalability
* clean spacing
* smooth interactions

---

# Design Philosophy

The UI should feel:

* modern
* clean
* lightweight
* professional
* responsive
* user-friendly
* enterprise-grade

Avoid:

* cluttered layouts
* inconsistent spacing
* random colors
* oversized modals
* crowded tables
* unstructured components

---

# Portal UI Architecture

The application contains 2 separate UI systems.

---

# 1. Admin Portal UI

Purpose:

* Internal management dashboard
* Data-heavy operations
* Advanced CRUD interfaces

Requirements:

* Desktop-first layout
* Sidebar navigation
* Large content areas
* Dashboard cards
* Advanced tables
* Filters & search systems
* Multi-column layouts

UI Characteristics:

* professional dashboard feel
* dense but readable layouts
* optimized productivity UI

---

# 2. User Portal UI

Purpose:

* Customer-facing application

Requirements:

* Mobile-first design
* Responsive layouts
* Touch-friendly interactions
* Card-based design
* Responsive navigation
* Smooth mobile UX

UI Characteristics:

* lightweight UI
* clean card systems
* simplified interactions
* user-friendly layouts

---

# Responsive Design Standards

The entire application must be responsive.

Required support:

* Mobile
* Tablet
* Desktop
* Large screens

---

# Responsive Breakpoint Strategy

Use Tailwind responsive architecture:

```txt id="ui1"
sm:
md:
lg:
xl:
2xl:
```

Requirements:

* mobile-first implementation
* adaptive layouts
* responsive typography
* responsive spacing

Avoid:

* desktop-only layouts
* fixed widths
* overflow issues

---

# Layout Standards

Use reusable layout systems.

Required layouts:

```txt id="ui2"
AdminLayout
UserLayout
AuthLayout
```

---

# Admin Layout Standards

Requirements:

* fixed sidebar
* sticky header
* responsive content container
* breadcrumb navigation
* scroll-safe content areas

Structure:

```txt id="ui3"
Sidebar
Header
Content Area
Footer (optional)
```

---

# User Layout Standards

Requirements:

* mobile navigation
* responsive navbar
* bottom navigation (optional)
* mobile drawer
* touch-friendly spacing

---

# Authentication UI Standards

Requirements:

* clean centered layouts
* responsive auth cards
* lightweight forms
* separate admin/user auth branding

Pages:

* Login
* Forgot Password
* Reset Password

---

# Spacing Standards

Use consistent spacing system.

Preferred spacing:

* 4
* 6
* 8
* 10
* 12
* 16
* 20

Avoid:

* random spacing
* inconsistent padding
* overcrowded layouts

---

# Typography Standards

Typography must remain consistent.

Requirements:

* clear hierarchy
* readable font sizes
* balanced font weights
* responsive typography

Preferred hierarchy:

```txt id="ui4"
Heading
Subheading
Body Text
Caption
Helper Text
```

Avoid:

* inconsistent font sizes
* excessive font weights
* oversized headings

---

# Color System Standards

Use centralized theme colors.

Requirements:

* primary color
* secondary color
* muted colors
* semantic colors
* dark/light mode support (future-ready)

Semantic colors:

* success
* warning
* error
* info

Avoid:

* random inline colors
* inconsistent theme usage

---

# Card UI Standards

Cards must be reusable.

Requirements:

* soft shadows
* rounded corners
* proper spacing
* responsive behavior

Use cards for:

* dashboards
* statistics
* mobile content
* summaries
* user information

Avoid:

* overcrowded card content
* inconsistent card padding

---

# Table UI Standards

Tables must support:

* pagination
* sorting
* filtering
* responsive behavior
* loading states
* empty states

Requirements:

* reusable table architecture
* sticky headers (if needed)
* scroll-safe layouts

Avoid:

* overflowing tables
* hardcoded table layouts

---

# Form UI Standards

Forms must remain:

* reusable
* responsive
* validated
* accessible

Requirements:

* reusable form fields
* centralized validation messages
* proper label spacing
* loading states
* error handling

Use:

* React Hook Form
* Zod validation

---

# Input Standards

All inputs must be reusable.

Supported inputs:

* text
* email
* password
* select
* multi-select
* textarea
* date picker
* checkbox
* radio
* file upload

Requirements:

* consistent heights
* proper error states
* helper text support
* disabled states
* loading states

---

# Modal Standards

Modals must be reusable.

Requirements:

* centralized modal architecture
* responsive sizing
* proper overlay handling
* scroll-safe body
* close handling

Avoid:

* oversized modals
* nested modal chaos

---

# Loading State Standards

Every async UI must support loading states.

Requirements:

* skeleton loaders
* spinner fallback
* loading buttons
* table loading states

Avoid:

* blank loading screens
* layout shifting

---

# Empty State Standards

Every data-driven UI must support empty states.

Requirements:

* meaningful messaging
* action buttons
* reusable empty state component

Examples:

* No users found
* No expenses available
* No search results

---

# Error UI Standards

All UI errors must be centralized.

Requirements:

* reusable error panels
* retry actions
* meaningful error messaging

Handle:

* network errors
* server errors
* permission errors
* validation errors

---

# Navigation Standards

Navigation must remain scalable.

Requirements:

* centralized route configs
* reusable sidebar items
* active route handling
* permission-based navigation

Avoid:

* hardcoded navigation everywhere

---

# Icon Standards

Use:

* Lucide React
  OR
* React Icons

Requirements:

* centralized icon usage
* consistent icon sizes
* scalable icon wrappers

Avoid:

* mixed random icon libraries

---

# Animation Standards

Use animation carefully.

Allowed:

* smooth modal transitions
* dropdown animations
* page transitions
* loading animations

Avoid:

* excessive animations
* distracting motion
* performance-heavy effects

---

# Accessibility Standards

Requirements:

* keyboard navigation
* proper labels
* aria support
* focus states
* accessible modals
* accessible buttons

Avoid:

* inaccessible forms
* hidden focus states

---

# Mobile UX Standards

Mobile UX must prioritize:

* touch-friendly spacing
* thumb-friendly navigation
* responsive tables/cards
* optimized form layouts

Avoid:

* tiny click areas
* horizontal scrolling
* overcrowded mobile UI

---

# Dashboard Standards

Dashboards should contain:

* statistics cards
* charts
* quick actions
* filters
* responsive widgets

Requirements:

* reusable dashboard widgets
* scalable card layouts

---

# Theme Standards

Future-ready support:

* dark mode
* theme switching
* centralized theme variables

Avoid:

* hardcoded colors

---

# Performance UI Standards

Requirements:

* lazy load heavy components
* optimize rendering
* minimize layout shift
* optimize table rendering

Avoid:

* rendering huge lists without optimization

---

# Important UI Rules

DO NOT:

* create inconsistent UI
* duplicate component styles
* hardcode spacing/colors
* use random font sizes
* create non-responsive layouts
* mix different design patterns
* overcrowd interfaces
* create inaccessible components

---

# Expected UI Quality

The UI system must always remain:

* responsive
* reusable
* scalable
* clean
* maintainable
* accessible
* modern
* enterprise-grade
