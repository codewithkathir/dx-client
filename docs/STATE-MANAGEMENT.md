# STATE-MANAGEMENT.md

# Frontend State Management Architecture

This document defines the complete frontend state management architecture, Redux standards, React Query standards, global state rules, server state handling, and scalable state organization patterns.

The goal is to build:

* scalable state architecture
* predictable state flow
* centralized state handling
* maintainable global state
* optimized server state management
* enterprise-grade frontend systems

---

# Core State Stack

Global State:

* Redux Toolkit

Server State:

* React Query

Local State:

* React useState
* React useReducer (when needed)

Persistence:

* Redux Persist (optional/future-ready)

---

# Core State Management Philosophy

The project follows:

* centralized app state
* isolated feature state
* predictable state flow
* minimal global state
* optimized server state handling

Always prioritize:

* maintainability
* performance
* scalability
* separation of concerns

---

# State Architecture Rule

```txt id="state1"
Redux = Global App State
React Query = Server/API State
Local State = UI-only State
```

This rule must always be followed.

---

# State Management Layers

The application contains 3 state layers:

---

# 1. Global App State

Managed using:

* Redux Toolkit

Purpose:

* shared application state

Examples:

* authentication
* session
* permissions
* sidebar state
* theme
* global filters
* modal state
* app configuration

---

# 2. Server State

Managed using:

* React Query

Purpose:

* backend/API data

Examples:

* users list
* dashboard data
* expenses
* paginated API data
* reports
* statistics

---

# 3. Local UI State

Managed using:

* useState
* useReducer

Purpose:

* temporary UI state

Examples:

* modal open state
* input toggle
* dropdown state
* tabs
* accordion state

Avoid moving small temporary state into Redux.

---

# Global Store Architecture

Structure:

```txt id="state2"
src/
│
├── store/
│   ├── index.ts
│   ├── rootReducer.ts
│   ├── middleware.ts
│   └── providers/
```

---

# Feature Store Architecture

Each feature may contain:

```txt id="state3"
features/
│
├── users/
│   └── store/
```

Purpose:

* feature-specific Redux slices
* feature selectors
* feature actions

---

# Redux Toolkit Standards

Use:

* createSlice
* createAsyncThunk (only if needed)
* typed hooks
* selectors

Avoid:

* old Redux patterns
* switch-case reducers
* manual action types

---

# Redux Store Responsibilities

Redux should ONLY manage:

* authentication state
* app session
* theme state
* permissions
* global UI state
* shared filters
* reusable app-wide state

Redux should NOT manage:

* API caching
* paginated API lists
* server response caching
* heavy backend data

---

# Recommended Redux Structure

Example:

```txt id="state4"
store/
│
├── auth/
│   ├── auth.slice.ts
│   ├── auth.selectors.ts
│   ├── auth.types.ts
│   └── auth.constants.ts
```

---

# Redux Slice Naming Standards

Examples:

```txt id="state5"
auth.slice.ts
theme.slice.ts
sidebar.slice.ts
modal.slice.ts
```

Avoid:

* generic names
* unclear slice purposes

---

# Redux Selector Standards

Always use selectors.

Examples:

```txt id="state6"
selectCurrentUser
selectIsAuthenticated
selectSidebarState
```

Benefits:

* cleaner components
* reusable state access
* optimized rerenders

---

# Typed Redux Standards

Use typed hooks.

Examples:

```txt id="state7"
useAppDispatch
useAppSelector
```

Requirements:

* fully typed store
* fully typed selectors
* typed actions

Avoid:

* any types
* unsafe store access

---

# React Query Standards

Use React Query for:

* API requests
* caching
* pagination
* mutations
* background refetching
* optimistic updates

React Query becomes the single source of truth for server state.

---

# React Query Architecture

Structure:

```txt id="state8"
features/
│
├── users/
│   ├── hooks/
│   │   ├── useUsers.ts
│   │   ├── useCreateUser.ts
│   │   └── useUpdateUser.ts
```

---

# Query Key Standards

Use predictable query keys.

Examples:

```txt id="state9"
["users"]
["users", userId]
["expenses", filters]
["dashboard", params]
```

Requirements:

* centralized query keys
* scalable invalidation
* grouped cache management

---

# Mutation Standards

Mutations should:

* invalidate related queries
* support optimistic updates
* use centralized error handling
* remain reusable

Avoid:

* scattered mutation logic
* manual cache chaos

---

# Cache Management Standards

Requirements:

* stale time optimization
* cache invalidation strategy
* avoid duplicate requests
* reuse cached data

Avoid:

* unnecessary refetching
* aggressive polling

---

# Async State Standards

Every async state should support:

* loading state
* success state
* error state
* empty state

UI must safely handle all scenarios.

---

# Global Modal State Standards

Reusable modals may use centralized modal state.

Examples:

* confirmation modal
* delete modal
* global dialog system

Avoid:

* deeply nested modal state management

---

# Theme State Standards

Theme state should remain centralized.

Examples:

* dark mode
* layout preferences
* UI settings

---

# Permission State Standards

Permissions must remain centralized.

Examples:

* role access
* feature access
* route access
* action permissions

Avoid:

* hardcoded permission checks everywhere

---

# Pagination State Standards

Pagination should preferably use:

* query params
* React Query
* reusable pagination hooks

Avoid:

* duplicated pagination logic

---

# Search & Filter State Standards

Use reusable filter state patterns.

Requirements:

* debounced search
* reusable filter hooks
* centralized query param handling

Avoid:

* duplicated filter state logic

---

# State Persistence Standards

Persist only required state.

Recommended:

* auth session
* theme preferences

Avoid persisting:

* large API datasets
* temporary UI state
* sensitive information

---

# Error State Standards

Global error handling should support:

* API errors
* permission errors
* network failures
* validation errors

Requirements:

* reusable error panels
* centralized handling

---

# Performance Standards

Requirements:

* avoid unnecessary rerenders
* memoize expensive selectors
* normalize large datasets if needed
* split state properly

Use:

* memoized selectors
* React.memo
* query caching

Avoid:

* oversized global state
* deeply nested store structures

---

# File Organization Standards

Each state module may contain:

```txt id="state10"
feature.slice.ts
feature.selectors.ts
feature.types.ts
feature.constants.ts
feature.actions.ts
```

Use only when required.
Avoid overengineering simple state.

---

# Local State Rules

Use local state for:

* dropdown toggles
* form visibility
* temporary UI interactions

Avoid:

* pushing all state into Redux

---

# Business Logic Rules

Business logic should remain:

* inside hooks
* inside services
* inside utilities
* inside state actions when appropriate

Avoid:

* heavy business logic inside UI components

---

# State Debugging Standards

Development support:

* Redux DevTools
* React Query Devtools

Requirements:

* predictable actions
* readable query keys
* clean debugging experience

---

# Security Standards

Avoid storing:

* sensitive tokens insecurely
* permission-sensitive data unnecessarily

Requirements:

* secure auth persistence
* safe session handling

---

# Important State Rules

DO NOT:

* store API cache inside Redux
* duplicate server state
* create oversized global state
* store unnecessary UI state globally
* mix business logic with UI rendering
* mutate state directly
* use untyped state handling

---

# Expected State Architecture Quality

The state management system must remain:

* scalable
* predictable
* centralized
* optimized
* reusable
* maintainable
* strongly typed
* enterprise-grade
