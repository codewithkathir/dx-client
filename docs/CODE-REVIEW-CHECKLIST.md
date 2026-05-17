# CODE-REVIEW-CHECKLIST.md

# Frontend Code Review Checklist

This document defines the official frontend code review checklist for maintaining scalable architecture, reusable systems, security compliance, performance optimization, clean code quality, and enterprise-grade engineering standards.

The goal is to ensure:

* maintainable code quality
* scalable architecture consistency
* reusable development patterns
* secure implementation standards
* optimized frontend performance
* enterprise-grade engineering quality

---

# Core Code Review Philosophy

Every pull request must be reviewed for:

* architecture quality
* scalability
* maintainability
* readability
* security
* performance
* consistency

Code reviews are mandatory for:

* feature additions
* bug fixes
* refactors
* UI changes
* API integrations
* architecture updates

---

# General Review Standards

Reviewers must verify:

* clean implementation
* scalable structure
* reusable architecture
* predictable behavior
* minimal technical debt

Avoid approving:

* rushed code
* duplicated logic
* unstructured architecture
* unclear implementations

---

# Architecture Review Checklist

## Feature Isolation

Check:

* feature logic remains isolated
* feature structure follows standards
* no unrelated cross-feature coupling

Verify:

* feature-based architecture compliance

---

## Folder Structure

Check:

* proper folder organization
* correct file placement
* reusable logic separation

Avoid:

* dumping logic into shared folders unnecessarily

---

## Reusable Architecture

Check:

* reusable components are extracted
* duplicated UI is avoided
* reusable utilities are centralized

Rule:

```txt id="review1"
If reused more than once,
convert into reusable architecture.
```

---

## Component Size

Check:

* components remain small and focused
* page files are not oversized

Avoid:

* massive monolithic components

---

# UI Review Checklist

## Responsive Design

Check:

* mobile responsiveness
* tablet responsiveness
* desktop responsiveness

Verify:

* admin = desktop-first
* user portal = mobile-first

---

## UI Consistency

Check:

* spacing consistency
* typography consistency
* reusable UI usage
* modal consistency
* table consistency

Avoid:

* inconsistent UI implementations

---

## Accessibility

Check:

* keyboard accessibility
* labels
* aria support
* focus handling
* screen reader compatibility

Avoid:

* inaccessible interactions

---

## Loading States

Check:

* skeleton loaders
* loading indicators
* disabled submission states

Avoid:

* blank loading screens

---

## Empty States

Check:

* meaningful empty states
* reusable empty components

Avoid:

* empty broken layouts

---

# Component Review Checklist

## Reusable Components

Check:

* reusable component extraction
* prop-driven architecture
* reusable variants

Avoid:

* feature-specific hardcoded reusable components

---

## Prop Validation

Check:

* proper TypeScript typing
* optional prop handling
* safe default values

Avoid:

* any types
* unsafe props

---

## Component Responsibility

Check:

* single responsibility principle
* clean separation of concerns

Avoid:

* business-heavy UI components

---

# API Review Checklist

## Service Layer Compliance

Check:

* APIs use service layer
* no direct axios inside components

Correct Flow:

```txt id="review2"
UI
↓
Hook
↓
Service
↓
Axios
↓
Backend
```

---

## API Naming

Check:

* service naming standards
* descriptive API function names

Examples:

```txt id="review3"
users.service.ts
getUsers()
createExpense()
```

---

## Error Handling

Check:

* centralized error handling
* safe API fallback handling
* reusable error panels

Avoid:

* scattered try/catch chaos

---

## API Performance

Check:

* pagination support
* optimized payload handling
* request deduplication

Avoid:

* unnecessary API requests

---

# Redux Review Checklist

## State Responsibility

Check:

```txt id="review4"
Redux = Global App State
React Query = Server State
```

Avoid:

* storing server cache inside Redux

---

## Slice Organization

Check:

* clean slice structure
* isolated reducers
* scalable selectors

Avoid:

* oversized Redux slices

---

## State Mutations

Check:

* predictable state updates
* immutable-safe handling

Avoid:

* unsafe state mutations

---

# React Query Review Checklist

## Query Handling

Check:

* proper query keys
* reusable hooks
* invalidation handling

Avoid:

* duplicated query logic

---

## Caching

Check:

* cache optimization
* stale handling
* refetch strategy

Avoid:

* excessive API refetching

---

# Form Review Checklist

## Validation

Check:

* Zod validation
* React Hook Form usage
* reusable validation schemas

Avoid:

* inline validation chaos

---

## Error Messages

Check:

* centralized validation messages
* user-friendly messaging

Avoid:

* raw backend validation exposure

---

## Form UX

Check:

* loading states
* disabled submit handling
* accessible labels

Avoid:

* broken form interactions

---

# Table Review Checklist

## Table Reusability

Check:

* reusable DataTable usage
* reusable filters
* reusable pagination

Avoid:

* hardcoded tables everywhere

---

## Large Dataset Handling

Check:

* server-side pagination
* virtualization when needed

Avoid:

* rendering huge datasets directly

---

# Performance Review Checklist

## Rendering Optimization

Check:

* memoization where needed
* optimized rerenders
* lazy loading

Avoid:

* unnecessary rerenders

---

## Bundle Optimization

Check:

* dynamic imports
* route-based splitting
* lightweight dependencies

Avoid:

* importing heavy libraries globally

---

## Client Component Usage

Check:

* minimal "use client"

Prefer:

* Server Components when possible

Avoid:

* unnecessary client rendering

---

# Security Review Checklist

## Authentication

Check:

* protected routes
* auth validation
* secure logout handling

Avoid:

* insecure auth bypasses

---

## Sensitive Data

Check:

* no token exposure
* no sensitive logging
* no secret leakage

Avoid:

* exposing backend internals

---

## Input Sanitization

Check:

* safe input validation
* sanitization support

Avoid:

* unsafe rendering

---

## XSS Prevention

Check:

* safe rendering
* no dangerous HTML rendering

Avoid:

* unsafe dynamic HTML

---

# Naming Convention Review Checklist

Check:

* consistent file naming
* predictable folder naming
* reusable naming standards

Examples:

```txt id="review5"
UserTable.tsx
users.service.ts
login.schema.ts
```

Avoid:

* unclear naming
* inconsistent naming patterns

---

# Code Quality Review Checklist

## Readability

Check:

* readable code
* clear naming
* maintainable structure

Avoid:

* overcomplicated logic

---

## Function Size

Check:

* small focused functions
* reusable helpers

Avoid:

* giant functions

---

## Comment Standards

Check:

* meaningful comments only

Avoid:

* unnecessary noisy comments
* commented dead code

---

## Dead Code

Check:

* unused imports removed
* unused variables removed
* obsolete code removed

Avoid:

* leftover debug code

---

# Logging Review Checklist

Check:

* production-safe logging
* no sensitive logs

Avoid:

* console spam
* token logging

---

# Dependency Review Checklist

Check:

* required dependencies only
* maintained libraries
* lightweight packages

Avoid:

* unnecessary dependencies

---

# Styling Review Checklist

## Tailwind Standards

Check:

* reusable utility usage
* readable class organization

Avoid:

* duplicated giant class chains

---

## CSS Consistency

Check:

* spacing consistency
* responsive behavior
* theme consistency

Avoid:

* inconsistent styling patterns

---

# Route Review Checklist

Check:

* route separation
* admin/user isolation
* protected route handling

Examples:

```txt id="review6"
/admin/*
/app/*
```

Avoid:

* mixed portal logic

---

# Authentication Review Checklist

Check:

* separate auth flows
* route protection
* permission handling

Avoid:

* auth duplication
* insecure auth shortcuts

---

# Error Handling Review Checklist

Check:

* reusable error handling
* global error flow
* safe fallback UI

Avoid:

* scattered error logic

---

# Documentation Review Checklist

Check:

* architecture consistency
* updated documentation
* scalable implementation notes

Avoid:

* undocumented architectural changes

---

# PR Quality Checklist

Before approval verify:

* build passes
* lint passes
* type checks pass
* no console errors
* responsive UI verified
* API handling verified
* edge cases tested

---

# Developer Experience Checklist

Check:

* maintainable implementation
* scalable architecture
* reusable patterns
* onboarding friendliness

Avoid:

* overly clever code
* hidden architecture complexity

---

# Important Review Rules

DO NOT APPROVE:

* duplicated code
* untyped logic
* direct axios usage inside UI
* hardcoded text/messages
* massive page files
* insecure implementations
* non-responsive layouts
* architecture violations
* unoptimized large datasets
* inconsistent naming patterns

---

# Expected Code Quality

All reviewed code must remain:

* scalable
* reusable
* secure
* maintainable
* optimized
* responsive
* strongly typed
* enterprise-grade
