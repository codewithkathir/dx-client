# FOLDER-STRUCTURE.md

# Frontend Folder Structure Standards

This document defines the complete frontend folder architecture, modular structure strategy, scalable organization rules, and enterprise-grade project structure standards.

The goal is to build:

* scalable project structure
* modular architecture
* maintainable code organization
* reusable feature systems
* clean separation of concerns
* enterprise-grade frontend architecture

---

# Core Folder Structure Philosophy

The project structure must prioritize:

* scalability
* feature isolation
* maintainability
* discoverability
* reusability
* clean architecture

Avoid:

* dumping everything globally
* deeply nested chaos
* mixed responsibilities
* unstructured folders

---

# High-Level Architecture Structure

Use this root architecture:

```txt id="folder1"
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

# Root Folder Responsibilities

---

# app/

Purpose:

* Next.js App Router
* route handling
* layouts
* route groups
* route-level pages

Contains:

* layouts
* route groups
* error pages
* page.tsx files

Example:

```txt id="folder2"
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

# components/

Purpose:

* reusable global UI components

Contains:

* shared UI systems
* reusable visual architecture

Structure:

```txt id="folder3"
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

Examples:

* Button
* Input
* DataTable
* Modal
* Loader
* Pagination

---

# features/

Purpose:

* feature-based modular architecture

Each feature must remain isolated.

Example:

```txt id="folder4"
features/
│
├── users/
├── auth/
├── expenses/
├── dashboard/
└── settings/
```

Every feature contains its own:

* components
* hooks
* services
* store
* schemas
* types
* constants
* literals
* utils
* config
* data

---

# Feature Folder Structure

Example:

```txt id="folder5"
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
│   ├── config/
│   └── index.ts
```

---

# services/

Purpose:

* centralized API architecture

Contains:

* axios client
* interceptors
* API helpers
* base services

Structure:

```txt id="folder6"
services/
│
├── api.ts
├── interceptors.ts
├── base.service.ts
└── endpoints.ts
```

Avoid:

* direct axios usage inside components

---

# store/

Purpose:

* global Redux store
* root reducers
* middleware
* app providers

Structure:

```txt id="folder7"
store/
│
├── index.ts
├── rootReducer.ts
├── middleware.ts
├── hooks.ts
└── providers/
```

---

# hooks/

Purpose:

* reusable global hooks

Contains:

* app-wide reusable hooks

Examples:

```txt id="folder8"
hooks/
│
├── useDebounce.ts
├── usePagination.ts
├── useLocalStorage.ts
└── useResponsive.ts
```

Avoid:

* placing feature-specific hooks globally

Feature hooks belong inside features.

---

# lib/

Purpose:

* shared libraries
* utility wrappers
* framework helpers

Examples:

* date utilities
* formatter helpers
* reusable configs
* helper integrations

---

# constants/

Purpose:

* centralized constants

Examples:

* route constants
* app configs
* enum values
* static app settings

Structure:

```txt id="folder9"
constants/
│
├── routes.constants.ts
├── app.constants.ts
├── table.constants.ts
└── auth.constants.ts
```

---

# messages/

Purpose:

* centralized message architecture

Structure:

```txt id="folder10"
messages/
│
├── success.messages.ts
├── error.messages.ts
├── validation.messages.ts
└── api.messages.ts
```

Used for:

* toast messages
* validation messages
* reusable API messages

---

# providers/

Purpose:

* global providers

Examples:

* Redux Provider
* Query Provider
* Theme Provider
* Session Provider

Structure:

```txt id="folder11"
providers/
│
├── ReduxProvider.tsx
├── QueryProvider.tsx
└── ThemeProvider.tsx
```

---

# assets/

Purpose:

* imported static assets

Contains:

* SVG files
* icons
* illustrations
* images

Examples:

```txt id="folder12"
assets/
│
├── icons/
├── images/
└── illustrations/
```

---

# static/

Purpose:

* static files
* reusable frontend resources

Examples:

* JSON files
* static text
* mock data
* static configs

---

# styles/

Purpose:

* global styling architecture

Contains:

* global styles
* Tailwind setup
* reusable style layers

Structure:

```txt id="folder13"
styles/
│
├── globals.css
├── theme.css
└── animations.css
```

---

# types/

Purpose:

* global shared types

Contains:

* reusable app-wide TypeScript types

Examples:

```txt id="folder14"
types/
│
├── api.types.ts
├── common.types.ts
└── auth.types.ts
```

Avoid:

* placing feature-specific types globally

Feature types belong inside features.

---

# config/

Purpose:

* application configuration

Examples:

* environment configs
* feature flags
* app metadata

Structure:

```txt id="folder15"
config/
│
├── env.config.ts
├── app.config.ts
└── feature.config.ts
```

---

# utils/

Purpose:

* reusable utility functions

Examples:

* formatters
* validators
* parsers
* helper functions

Structure:

```txt id="folder16"
utils/
│
├── date.utils.ts
├── string.utils.ts
├── number.utils.ts
└── validation.utils.ts
```

Avoid:

* placing business logic inside utils

---

# Middleware Structure

Use:

```txt id="folder17"
middleware.ts
```

Responsibilities:

* auth route protection
* redirects
* permission validation
* request middleware

---

# Next.js Route Group Standards

Use route groups for separation.

Example:

```txt id="folder18"
app/
│
├── (admin)/
├── (user)/
├── (auth)/
```

Benefits:

* clean route architecture
* isolated layouts
* scalable navigation

---

# Admin Route Structure

Example:

```txt id="folder19"
app/
│
├── (admin)/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── expenses/
│   │   └── settings/
```

---

# User Route Structure

Example:

```txt id="folder20"
app/
│
├── (user)/
│   ├── app/
│   │   ├── home/
│   │   ├── profile/
│   │   └── orders/
```

---

# Authentication Route Structure

Example:

```txt id="folder21"
app/
│
├── (auth)/
│   ├── login/
│   ├── forgot-password/
│   └── reset-password/
```

---

# File Naming Standards

Use consistent naming.

Examples:

```txt id="folder22"
users.service.ts
user.schema.ts
UserTable.tsx
useUsers.ts
auth.slice.ts
```

---

# Index File Standards

Use barrel exports.

Example:

```txt id="folder23"
index.ts
```

Purpose:

* cleaner imports
* scalable exports
* easier maintenance

---

# Feature Isolation Rules

Every feature must remain self-contained.

Avoid:

* importing unrelated feature internals
* cross-feature tight coupling
* shared business logic chaos

Shared reusable logic belongs in:

* components/
* hooks/
* utils/
* lib/

---

# Reusable Architecture Rules

If reused more than once:

* move to reusable architecture

Examples:

* forms
* tables
* filters
* cards
* modals
* loaders

---

# Folder Depth Standards

Avoid:

* excessive nested folders
* overengineering simple structures

Preferred:

* shallow predictable structure

---

# Scalability Standards

The structure must support:

* additional portals
* micro-feature expansion
* future team scaling
* modular feature growth

---

# Developer Experience Standards

The structure should provide:

* fast navigation
* predictable organization
* easy onboarding
* maintainable architecture

Benefits:

* easier scaling
* faster development
* cleaner collaboration

---

# Important Folder Structure Rules

DO NOT:

* dump all code into shared folders
* create unstructured directories
* mix unrelated feature logic
* duplicate reusable utilities
* store feature logic globally unnecessarily
* create massive component folders without structure

---

# Expected Folder Structure Quality

The project structure must remain:

* scalable
* modular
* organized
* maintainable
* reusable
* discoverable
* enterprise-grade
