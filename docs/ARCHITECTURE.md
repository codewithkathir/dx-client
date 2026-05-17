# ARCHITECTURE.md

# Frontend Enterprise Architecture

This document defines the complete frontend architecture structure, engineering principles, modular system design, and scalable development standards for the project.

The architecture is designed for:

* scalability
* modularity
* maintainability
* reusability
* enterprise-level frontend systems

---

# Core Technology Stack

Frontend Framework:

* Next.js (App Router)

Language:

* TypeScript

UI System:

* Tailwind CSS
* shadcn/ui

State Management:

* Redux Toolkit
* React Query

API Layer:

* Axios

Forms & Validation:

* React Hook Form
* Zod

Table System:

* TanStack Table

Icons:

* Lucide React OR React Icons

---

# High-Level Architecture

The frontend architecture follows:

* Feature-based modular architecture
* Reusable component-driven architecture
* Centralized API architecture
* Centralized state management
* Centralized error handling
* Scalable folder organization
* Enterprise-grade development standards

---

# Portal Architecture

The application contains 2 completely separated portals.

---

# 1. Admin Portal

Purpose:

* Internal management system
* Heavy CRUD operations
* Dashboard and analytics

Architecture Requirements:

* Desktop-first design
* Sidebar navigation
* Advanced tables
* Filters and search systems
* Multi-column layouts
* Large-screen optimized UI
* Reusable modal architecture

Route Structure:

```txt id="0f8v11"
/admin/*
```

Examples:

```txt id="r0w91c"
/admin/dashboard
/admin/users
/admin/expenses
/admin/settings
```

---

# 2. User Portal

Purpose:

* Customer/client-facing application

Architecture Requirements:

* Mobile-first UI
* Fully responsive layouts
* Tablet + desktop support
* Card-based responsive design
* Mobile navigation systems
* Responsive drawer navigation
* Touch-friendly user experience

Route Structure:

```txt id="fy8cb0"
/app/*
```

Examples:

```txt id="2x3z7m"
/app/home
/app/profile
/app/orders
```

---

# Authentication Architecture

Authentication must remain separated between:

* Admin Portal
* User Portal

Admin Authentication Routes:

```txt id="m4n8rk"
/admin/login
/admin/forgot-password
```

User Authentication Routes:

```txt id="pruhll"
/login
/forgot-password
```

Requirements:

* Separate auth layouts
* Separate auth flows
* Separate route protection
* Separate branding capability
* Separate UI systems

---

# Core Architectural Principles

The entire application must follow these principles:

---

## 1. Feature Isolation

Every feature/module must remain isolated.

A feature should contain:

* UI
* hooks
* services
* types
* schemas
* store
* constants
* literals
* utilities

Avoid:

* cross-feature coupling
* logic leakage
* dumping everything globally

---

## 2. Reusability First

If UI or logic is reused more than once:

* convert it into reusable architecture

Examples:

* forms
* tables
* cards
* modals
* filters
* loaders
* pagination

---

## 3. Centralized Systems

The project must centralize:

* API handling
* state management
* error handling
* validation
* text/messages
* configuration

Avoid scattered architecture.

---

## 4. Type Safety

Strict TypeScript is mandatory.

Requirements:

* strong typing
* typed API responses
* typed forms
* typed Redux state
* typed table models

Avoid:

* any types
* unsafe casting
* untyped APIs

---

# Global Folder Architecture

Use this structure:

```txt id="3nkhj2"
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
└── middleware.ts
```

---

# App Router Architecture

Use Next.js App Router structure.

Example:

```txt id="ngs4hh"
app/
│
├── (admin)/
├── (user)/
├── (auth)/
├── error.tsx
├── global-error.tsx
├── not-found.tsx
└── layout.tsx
```

---

# Feature-Based Architecture

Each feature must remain self-contained.

Structure:

```txt id="shnlhn"
features/
│
├── users/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── schemas/
│   ├── constants/
│   ├── literals/
│   ├── utils/
│   ├── data/
│   └── config/
```

---

# Reusable Component Architecture

Global reusable components:

```txt id="f02z35"
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

Requirements:

* reusable
* composable
* scalable
* isolated
* typed

Avoid:

* oversized components
* duplicated UI
* feature-coupled reusable components

---

# API Architecture

API architecture must remain centralized.

Structure:

```txt id="tl6rkc"
services/
│
├── api.ts
├── interceptors.ts
└── base.service.ts
```

Feature service naming:

```txt id="v9jlwm"
feature-name.service.ts
```

Examples:

```txt id="jlwm4a"
users.service.ts
expenses.service.ts
auth.service.ts
```

Architecture Flow:

```txt id="jlwm4b"
UI
↓
Hooks
↓
Service Layer
↓
Axios Client
↓
Backend API
```

Rules:

* never call axios inside components
* keep API logic isolated
* use centralized interceptors

---

# State Management Architecture

Use Redux Toolkit for:

* authentication
* theme
* permissions
* sidebar
* global filters
* global modal state
* shared app state

Use React Query for:

* server state
* API caching
* pagination
* mutations
* refetching

Architecture Rule:

```txt id="jlwm4c"
Redux = App State
React Query = Server State
```

---

# Error Handling Architecture

All frontend errors must pass through centralized handling.

Architecture Flow:

```txt id="jlwm4d"
API Error
↓
Axios Interceptor
↓
Global Error Handler
↓
Error Store
↓
Error UI
```

Handle:

* 401
* 403
* 404
* 422
* 429
* 500
* network errors
* timeout errors

Required files:

```txt id="jlwm4e"
error.tsx
global-error.tsx
not-found.tsx
```

---

# Validation Architecture

Use:

* React Hook Form
* Zod

Each feature must contain:

```txt id="jlwm4f"
schemas/
```

Examples:

```txt id="jlwm4g"
login.schema.ts
user.schema.ts
expense.schema.ts
```

Requirements:

* reusable validation
* strong typing
* centralized validation messages

---

# Centralized Text Architecture

Avoid hardcoded UI text.

Each feature should contain:

```txt id="jlwm4h"
literals/
```

Contains:

* labels
* button text
* titles
* descriptions
* validation text
* toast messages

Purpose:

* maintainability
* future localization
* centralized content management

---

# Centralized Message Architecture

Use centralized message management.

Structure:

```txt id="jlwm4i"
messages/
│
├── success.messages.ts
├── error.messages.ts
├── validation.messages.ts
└── api.messages.ts
```

Used for:

* toast messages
* API errors
* validation text
* success messages

---

# Layout Architecture

Separate layouts:

```txt id="jlwm4j"
AdminLayout
UserLayout
AuthLayout
```

Admin Layout:

* desktop sidebar
* dashboard layout
* breadcrumb system
* large content container

User Layout:

* mobile responsive
* bottom navigation
* responsive navbar
* mobile drawer navigation

---

# UI/UX Architecture

Requirements:

* responsive layouts
* clean UI
* reusable design system
* soft shadows
* rounded corners
* loading skeletons
* empty states
* smooth interactions

---

# Performance Architecture

Requirements:

* dynamic imports
* lazy loading
* memoization
* optimized rerenders
* image optimization
* optimized large tables/lists

Avoid:

* unnecessary rerenders
* oversized page components
* excessive global state

---

# Security Architecture

Requirements:

* protected routes
* safe token handling
* secure API communication
* permission-based rendering
* safe form validation

Avoid:

* exposing sensitive data
* unsafe localStorage usage
* unvalidated user input

---

# Development Standards

Requirements:

* small reusable components
* modular code
* scalable architecture
* maintainable structure
* consistent naming
* centralized systems

---

# Important Architecture Rules

DO NOT:

* duplicate reusable components
* mix feature logic
* create massive page files
* hardcode messages/text
* call axios directly inside UI
* create unstructured folders
* mix business logic with presentation logic

---

# Expected Engineering Quality

The frontend architecture must always remain:

* scalable
* maintainable
* modular
* reusable
* strongly typed
* production-ready
* enterprise-grade
