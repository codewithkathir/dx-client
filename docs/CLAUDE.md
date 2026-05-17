

# CLAUDE.md

# Frontend Enterprise Architecture Master Instructions

You are building a production-grade enterprise frontend application using modern scalable architecture standards.

This project must follow:

* scalable architecture
* reusable systems
* modular development
* enterprise-grade engineering
* clean maintainable code
* high-performance frontend patterns
* secure frontend practices

Every implementation decision must prioritize:

* maintainability
* scalability
* reusability
* developer experience
* clean architecture
* performance
* security

---

# Core Tech Stack

Frontend Framework:

* Next.js (App Router)

Language:

* TypeScript

Styling:

* Tailwind CSS

UI Library:

* shadcn/ui

State Management:

* Redux Toolkit

Server State:

* React Query

API Layer:

* Axios

Forms:

* React Hook Form

Validation:

* Zod

Tables:

* TanStack Table

Icons:

* Lucide React
  OR
* React Icons

---

# Portal Architecture

The application contains 2 separate portals.

---

# Admin Portal

Purpose:

* internal management system
* analytics dashboard
* heavy CRUD operations

Requirements:

* desktop-first UI
* advanced tables
* reusable filters
* reusable modals
* scalable dashboard architecture
* multi-column layouts

Route Structure:

```txt id="claude1"
/admin/*
```

Examples:

```txt id="claude2"
/admin/dashboard
/admin/users
/admin/expenses
/admin/settings
```

---

# User Portal

Purpose:

* customer-facing application

Requirements:

* mobile-first UI
* fully responsive architecture
* touch-friendly UX
* card-based layouts
* responsive navigation

Route Structure:

```txt id="claude3"
/app/*
```

Examples:

```txt id="claude4"
/app/home
/app/profile
/app/orders
```

---

# Authentication Architecture

Admin and user authentication must remain completely separate.

Admin Authentication:

```txt id="claude5"
/admin/login
/admin/forgot-password
```

User Authentication:

```txt id="claude6"
/login
/forgot-password
```

Requirements:

* separate auth layouts
* separate auth flows
* separate route protection
* separate branding capability

---

# Architecture Principles

The application must follow:

* feature-based architecture
* reusable-first development
* centralized systems
* isolated business modules
* scalable folder organization

Avoid:

* duplicated logic
* monolithic page files
* mixed business logic
* unstructured folders

---

# Feature-Based Architecture

Each feature must remain isolated.

Every feature must contain its own:

```txt id="claude7"
components/
hooks/
services/
store/
types/
schemas/
constants/
literals/
utils/
data/
config/
```

Example:

```txt id="claude8"
features/
│
├── users/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── schemas/
│   ├── types/
│   ├── constants/
│   ├── literals/
│   ├── utils/
│   ├── data/
│   └── config/
```

---

# Reusable Component Architecture

Avoid duplicate code completely.

Mandatory Rule:

```txt id="claude9"
If reused more than once,
convert into reusable architecture.
```

Reusable systems must include:

* buttons
* forms
* inputs
* cards
* tables
* modals
* dialogs
* loaders
* filters
* pagination
* dropdowns
* date pickers
* error panels
* empty states

Global reusable structure:

```txt id="claude10"
components/
│
├── ui/
├── forms/
├── tables/
├── cards/
├── modals/
├── dialogs/
├── feedback/
├── layout/
└── shared/
```

---

# API Architecture

All API communication must use:

* Axios
* centralized service architecture

Required Structure:

```txt id="claude11"
services/
│
├── api.ts
├── interceptors.ts
├── base.service.ts
└── endpoints.ts
```

Feature service naming:

```txt id="claude12"
feature-name.service.ts
```

Examples:

```txt id="claude13"
users.service.ts
expenses.service.ts
auth.service.ts
```

Mandatory Rule:

```txt id="claude14"
Never call axios directly inside components/pages.
Always use service layer.
```

---

# State Management Architecture

Use Redux Toolkit ONLY for:

* auth state
* sidebar state
* theme state
* permissions
* global modal state
* app-level settings

Use React Query for:

* server state
* API caching
* pagination
* mutations
* background refetching

Core Rule:

```txt id="claude15"
Redux = Global App State
React Query = Server State
```

---

# Error Handling Architecture

All errors must flow through:

* centralized error architecture

Requirements:

* axios interceptors
* reusable error panels
* global fallback UI
* safe error handling
* error-code-based pages

Must handle:

```txt id="claude16"
401 Unauthorized
403 Forbidden
404 Not Found
422 Validation Error
429 Too Many Requests
500 Internal Server Error
503 Service Unavailable
Network Errors
Timeout Errors
```

Required files:

```txt id="claude17"
error.tsx
global-error.tsx
not-found.tsx
```

---

# Centralized Text System

Never hardcode UI text directly inside components.

Use:

* literals
* messages

Examples:

```txt id="claude18"
auth.literal.ts
user.literal.ts
expense.literal.ts
```

Use centralized messages for:

* validation
* errors
* success messages
* toast messages

---

# Form Architecture

All forms must use:

* React Hook Form
* Zod

Each feature must contain:

```txt id="claude19"
schemas/
```

Examples:

```txt id="claude20"
login.schema.ts
user.schema.ts
expense.schema.ts
```

Requirements:

* reusable validation
* typed form values
* reusable field components

---

# Table Architecture

Use:

* TanStack Table

Requirements:

* reusable table systems
* pagination
* filtering
* sorting
* loading states
* empty states
* reusable actions

Avoid:

* hardcoded tables
* huge dataset rendering

---

# Layout Architecture

Required layouts:

```txt id="claude21"
AdminLayout
UserLayout
AuthLayout
```

Admin Layout:

* desktop sidebar
* header
* breadcrumb
* dashboard layout

User Layout:

* mobile-first
* bottom navigation
* responsive navbar
* touch-friendly UX

---

# Icons Architecture

Use ONLY:

* Lucide React
  OR
* React Icons

Requirements:

* centralized icon usage
* consistent icon sizing
* reusable wrappers if required

Avoid:

* mixing multiple icon systems randomly

---

# Global Folder Structure

Use this architecture:

```txt id="claude22"
src/
│
├── app/
├── components/
├── features/
├── services/
├── store/
├── hooks/
├── lib/
├── constants/
├── messages/
├── providers/
├── assets/
├── static/
├── styles/
├── types/
├── config/
├── utils/
└── middleware.ts
```

---

# Coding Standards

Requirements:

* strict TypeScript
* reusable architecture
* clean code
* scalable structure
* maintainable systems
* optimized rendering
* strongly typed APIs
* reusable hooks

Avoid:

* any type
* giant files
* duplicated logic
* deeply coupled architecture

---

# Performance Standards

Optimize:

* rerenders
* API calls
* bundle size
* rendering performance

Use:

* memoization
* lazy loading
* pagination
* dynamic imports

Prefer:

* Server Components

Use Client Components only when necessary.

Avoid:

* unnecessary "use client"

---

# Security Standards

Requirements:

* secure auth handling
* protected routes
* permission validation
* sanitized rendering
* safe API communication

Avoid:

* exposing secrets
* exposing tokens
* unsafe HTML rendering
* trusting frontend-only authorization

---

# Responsive Standards

Every screen must support:

* mobile responsiveness
* tablet responsiveness
* desktop responsiveness

Portal Rules:

* admin = desktop-first
* user = mobile-first

---

# Accessibility Standards

All UI must support:

* keyboard navigation
* focus states
* accessible labels
* screen readers

Avoid:

* inaccessible UI patterns

---

# Naming Standards

Use consistent naming.

Examples:

```txt id="claude23"
UserTable.tsx
users.service.ts
login.schema.ts
useUsers.ts
auth.slice.ts
```

Avoid:

* vague naming
* inconsistent naming patterns

---

# Development Rules

DO NOT:

* duplicate code
* directly call axios inside UI
* hardcode UI text
* use unsafe any types
* create massive page files
* mix admin/user logic
* bypass centralized systems
* ignore responsive design
* ignore accessibility
* ignore performance optimization
* ignore security standards

---

# Mandatory Development Mindset

Always think like:

* enterprise architect
* scalability engineer
* senior frontend engineer
* long-term maintainer

Every implementation must remain:

* scalable
* reusable
* maintainable
* responsive
* optimized
* secure
* strongly typed
* enterprise-grade
