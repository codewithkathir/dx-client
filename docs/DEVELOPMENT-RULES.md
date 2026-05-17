# DEVELOPMENT-RULES.md

# Frontend Development Rules

This document defines the mandatory frontend engineering rules, architecture principles, implementation constraints, coding behavior expectations, and enterprise-grade development standards for the entire project.

Every developer must follow these rules strictly.

The goal is to maintain:

* scalable architecture
* reusable systems
* maintainable codebase
* clean engineering standards
* consistent implementation quality
* enterprise-grade frontend development

---

# Core Development Philosophy

All development must prioritize:

* scalability
* maintainability
* reusability
* predictability
* performance
* security
* clean architecture

Every implementation decision must support:

* long-term maintainability
* team scalability
* enterprise growth

Avoid:

* shortcuts
* rushed architecture
* duplicated systems
* unstructured implementations

---

# Primary Architecture Rules

---

# Rule 1 — Feature-Based Architecture Only

All business logic must follow:

* feature-based modular architecture

Every feature must remain isolated.

Example:

```txt id="dev1"
features/
│
├── users/
├── expenses/
├── auth/
└── dashboard/
```

Avoid:

* dumping everything globally
* tightly coupled features

---

# Rule 2 — Reusable-First Development

Before creating any new component:

* check if reusable architecture already exists

Mandatory rule:

```txt id="dev2"
If reused more than once,
convert into reusable architecture.
```

Examples:

* buttons
* forms
* tables
* modals
* loaders
* cards
* filters

Avoid:

* duplicate UI implementations

---

# Rule 3 — No Direct Axios Usage Inside UI

Never call axios directly inside:

* pages
* components
* tables
* forms

Correct flow:

```txt id="dev3"
UI
↓
Custom Hook
↓
Service Layer
↓
Axios Client
↓
Backend
```

Use:

* centralized service architecture

---

# Rule 4 — Separate Admin and User Logic

Admin portal and user portal must remain isolated.

Admin:

* desktop-first
* management-focused

User:

* mobile-first
* customer-focused

Routes:

```txt id="dev4"
/admin/*
/app/*
```

Avoid:

* mixing portal components
* shared business logic confusion

---

# Rule 5 — Strong TypeScript Only

TypeScript must remain:

* strict
* predictable
* scalable

Avoid:

* any
* unknown unsafe handling
* loosely typed APIs

Requirements:

* typed props
* typed APIs
* typed Redux
* typed forms

---

# Rule 6 — Centralized Text System

Never hardcode UI text directly inside components.

Use:

* literals
* messages

Examples:

```txt id="dev5"
auth.literal.ts
validation.messages.ts
```

Avoid:

* duplicated text strings
* scattered UI messages

---

# Rule 7 — Centralized Error Handling

All errors must flow through:

* centralized error handling architecture

Requirements:

* interceptor handling
* reusable error panels
* safe fallback UI

Avoid:

* scattered try/catch handling everywhere

---

# Rule 8 — Redux Usage Rules

Use Redux ONLY for:

* global app state

Examples:

* auth
* sidebar
* theme
* permissions

Use React Query for:

* API state
* caching
* server data

Rule:

```txt id="dev6"
Redux = Global App State
React Query = Server State
```

Avoid:

* storing server cache in Redux

---

# Rule 9 — Form Standards

All forms must use:

* React Hook Form
* Zod

Avoid:

* uncontrolled complex forms
* inline validation chaos

Requirements:

* reusable validation
* reusable form fields
* typed form values

---

# Rule 10 — Table Standards

All large tables must support:

* pagination
* filtering
* sorting
* loading states
* empty states

Use:

* TanStack Table

Avoid:

* hardcoded tables
* huge dataset rendering

---

# Rule 11 — Responsive Architecture Required

Every screen must support:

* responsive behavior

Requirements:

* mobile support
* tablet support
* desktop support

Portal rules:

* admin = desktop-first
* user = mobile-first

Avoid:

* desktop-only layouts
* broken mobile UX

---

# Rule 12 — Accessibility Required

All UI must support:

* keyboard navigation
* focus states
* labels
* screen readers

Avoid:

* inaccessible UI patterns

---

# Rule 13 — Loading UX Mandatory

Every async action must support:

* loading state
* skeleton UI
* safe fallback UX

Avoid:

* blank loading screens

---

# Rule 14 — Empty States Mandatory

Every data-driven screen must support:

* empty state UI
* no-result state
* filter-empty state

Avoid:

* blank broken screens

---

# Rule 15 — Performance Optimization Required

Optimize:

* rerenders
* bundle size
* API calls
* table rendering

Use:

* memoization
* lazy loading
* pagination
* dynamic imports

Avoid:

* unnecessary rerenders
* oversized bundles

---

# Rule 16 — Security Standards Mandatory

Never:

* expose secrets
* expose tokens
* trust frontend-only authorization

Requirements:

* protected routes
* permission validation
* secure auth handling

---

# Rule 17 — No Massive Components

Components/pages must remain:

* small
* reusable
* focused

Avoid:

* 1000+ line components
* giant business-heavy UI files

Split:

* sections
* hooks
* utilities
* reusable components

---

# Rule 18 — Naming Standards Mandatory

All naming must follow:

* predictable conventions

Examples:

```txt id="dev7"
users.service.ts
login.schema.ts
UserTable.tsx
useUsers.ts
```

Avoid:

* vague names
* inconsistent naming

---

# Rule 19 — Shared Logic Standards

Shared logic belongs in:

* hooks/
* utils/
* lib/
* components/

Avoid:

* duplicating utility logic across features

---

# Rule 20 — Route Structure Standards

Routes must remain:

* predictable
* scalable
* isolated

Examples:

```txt id="dev8"
/admin/users
/admin/settings
/app/orders
```

Avoid:

* mixed route responsibilities

---

# Rule 21 — Folder Structure Standards

Follow official folder structure only.

Avoid:

* random folders
* unstructured directories
* inconsistent placement

---

# Rule 22 — Clean Import Standards

Prefer:

* barrel exports
* absolute imports
* organized imports

Avoid:

* deep messy relative imports

Bad Example:

```txt id="dev9"
../../../../components
```

---

# Rule 23 — Dependency Standards

Before installing any package:

* validate necessity
* validate maintenance status
* validate bundle impact

Avoid:

* unnecessary dependencies
* duplicate libraries

---

# Rule 24 — Console Log Rules

Development:

* allowed temporarily

Production:

* remove unnecessary logs

Avoid:

* noisy production logs
* sensitive logging

---

# Rule 25 — API Payload Optimization

Never fetch unnecessary data.

Requirements:

* pagination
* filtering
* optimized payload handling

Avoid:

* oversized API responses

---

# Rule 26 — Environment Standards

Environment variables must:

* remain centralized
* follow naming conventions

Examples:

```txt id="dev10"
NEXT_PUBLIC_API_URL
```

Never expose:

* secrets
* backend credentials

---

# Rule 27 — File Upload Standards

Uploads must support:

* validation
* size restrictions
* safe handling

Avoid:

* unsafe uploads
* unrestricted files

---

# Rule 28 — Modal Standards

All modals must:

* remain reusable
* support accessibility
* support loading states
* support responsive UX

Avoid:

* duplicated modal implementations

---

# Rule 29 — API Error UX Standards

Never expose:

* backend stack traces
* raw SQL errors
* internal server details

Use:

* reusable user-friendly error handling

---

# Rule 30 — PR Quality Standards

Every PR must:

* pass lint
* pass build
* pass type checks
* follow architecture standards

Avoid merging:

* broken builds
* failing lint
* untyped implementations

---

# Rule 31 — Future Scalability Required

Every implementation must consider:

* future modules
* team scaling
* architecture growth
* maintainability

Avoid:

* temporary hacks
* hardcoded architecture limitations

---

# Rule 32 — Documentation Standards

Complex logic must include:

* maintainable documentation
* understandable architecture notes

Avoid:

* undocumented critical flows

---

# Rule 33 — Client Component Usage Rules

Prefer:

* Server Components

Use Client Components only when necessary:

* interactivity
* browser APIs
* local state

Avoid:

* marking everything with "use client"

---

# Rule 34 — Clean Code Standards

Code must remain:

* readable
* predictable
* maintainable

Avoid:

* overengineering
* overly clever implementations
* unreadable abstractions

---

# Rule 35 — Developer Experience Standards

Architecture must support:

* fast onboarding
* predictable development
* reusable implementation
* maintainable collaboration

Benefits:

* faster scaling
* cleaner codebase
* improved productivity

---

# Mandatory Engineering Mindset

Every developer must think like:

* system architect
* scalability engineer
* product-focused engineer
* long-term maintainer

Avoid:

* short-term quick fixes
* architecture-breaking shortcuts

---

# Important Non-Negotiable Rules

DO NOT:

* duplicate code
* directly call axios inside UI
* hardcode UI text
* use unsafe any types
* create giant components
* mix admin/user logic
* bypass centralized systems
* ignore responsive design
* ignore accessibility
* ignore performance
* ignore security
* ignore reusable architecture

---

# Expected Development Quality

Every implementation must remain:

* scalable
* reusable
* secure
* maintainable
* responsive
* optimized
* strongly typed
* enterprise-grade
