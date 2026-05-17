# TABLE-STANDARDS.md

# Frontend Table Architecture Standards

This document defines the complete frontend table architecture, reusable data table systems, filtering standards, pagination patterns, responsive table handling, and enterprise-grade data management UI principles.

The goal is to build:

* reusable table systems
* scalable data handling
* maintainable table architecture
* high-performance rendering
* responsive data management UI
* enterprise-grade table experiences

---

# Core Table Philosophy

All tables must prioritize:

* reusability
* scalability
* performance
* readability
* accessibility
* responsiveness
* maintainability

Avoid:

* duplicated table logic
* hardcoded columns
* non-responsive tables
* oversized table components

---

# Core Table Stack

Table Engine:

* TanStack Table

UI:

* shadcn/ui

Styling:

* Tailwind CSS

State:

* React Query
* Redux (only when globally required)

---

# Table Architecture Principles

The project follows:

* reusable-first table architecture
* centralized table systems
* modular table features
* scalable column management
* server-driven data handling

---

# Global Table Structure

Reusable table architecture:

```txt id="table1"
components/
│
├── tables/
│   ├── DataTable/
│   ├── TablePagination/
│   ├── TableToolbar/
│   ├── TableFilters/
│   ├── TableSearch/
│   ├── TableEmptyState/
│   ├── TableLoader/
│   └── TableActions/
```

---

# Feature Table Structure

Feature-specific tables belong inside features.

Example:

```txt id="table2"
features/
│
├── users/
│   ├── components/
│   │   ├── UserTable.tsx
│   │   └── UserTableColumns.tsx
```

---

# Table Naming Standards

Tables must use:

* PascalCase

Examples:

```txt id="table3"
UserTable.tsx
ExpenseTable.tsx
OrdersTable.tsx
```

Column definitions:

```txt id="table4"
UserTableColumns.tsx
ExpenseTableColumns.tsx
```

Avoid:

```txt id="table5"
table.tsx
data.tsx
grid1.tsx
```

---

# Reusable Table Standards

Every table must support reusable architecture.

Requirements:

* reusable columns
* reusable pagination
* reusable filters
* reusable loaders
* reusable empty states
* reusable actions

Avoid:

* rewriting tables repeatedly

---

# Data Table Standards

The primary reusable component:

```txt id="table6"
DataTable.tsx
```

Responsibilities:

* rendering rows
* sorting
* pagination
* filtering
* loading states
* responsive handling

Avoid:

* business-specific logic inside reusable tables

---

# Column Definition Standards

Columns should remain:

* isolated
* reusable
* typed

Example responsibilities:

* headers
* cell renderers
* sorting logic
* formatting logic

Avoid:

* massive inline column definitions

---

# Table Data Standards

Data must come from:

* React Query
* service layer

Avoid:

* hardcoded mock data inside production tables
* direct API calls inside tables

---

# Table API Standards

All table data fetching must use:

* React Query
* centralized services

Flow:

```txt id="table7"
Table Component
↓
Custom Hook
↓
Service Layer
↓
Axios Client
↓
Backend API
```

Avoid:

* direct axios usage inside table components

---

# Pagination Standards

All large tables must support pagination.

Requirements:

* reusable pagination component
* server-side pagination support
* page size controls
* current page indicators

Examples:

```txt id="table8"
TablePagination.tsx
```

Avoid:

* rendering massive datasets at once

---

# Sorting Standards

Tables should support:

* ascending sort
* descending sort
* server-side sorting when required

Requirements:

* reusable sorting logic
* predictable sort behavior

Avoid:

* inconsistent sorting UI

---

# Filtering Standards

Tables should support:

* search filtering
* dropdown filters
* date filters
* multi-filter combinations

Requirements:

* reusable filter components
* debounced filtering
* query synchronization

Examples:

```txt id="table9"
TableFilters.tsx
TableSearch.tsx
```

---

# Search Standards

Search inputs must support:

* debounced requests
* query param syncing
* reusable architecture

Avoid:

* API requests on every keystroke

---

# Toolbar Standards

Reusable table toolbars may contain:

* search
* filters
* export actions
* bulk actions
* create buttons

Example:

```txt id="table10"
TableToolbar.tsx
```

---

# Row Action Standards

Tables should support reusable row actions.

Examples:

* edit
* delete
* view
* duplicate
* status change

Requirements:

* centralized action dropdowns
* permission-based actions

Avoid:

* duplicated action buttons everywhere

---

# Bulk Action Standards

Large tables may support:

* multi-select rows
* bulk delete
* bulk export
* bulk status update

Requirements:

* scalable selection architecture
* safe confirmation handling

---

# Loading State Standards

Every table must support:

* skeleton loading
* loader rows
* async loading indicators

Avoid:

* blank table UI during loading

---

# Empty State Standards

Every table must support reusable empty states.

Examples:

* no data available
* no search results
* no filtered results

Requirements:

* meaningful messaging
* optional action buttons

---

# Error State Standards

Tables must safely handle:

* API failures
* timeout errors
* permission failures
* network failures

Requirements:

* reusable error panels
* retry support

Avoid:

* broken table rendering

---

# Responsive Table Standards

Tables must remain responsive.

Strategies:

* horizontal scrolling
* mobile cards
* responsive column visibility
* compact layouts

Avoid:

* broken mobile tables
* overflowing layouts

---

# Mobile Table Standards

For mobile:

* simplify columns
* use stacked layouts when needed
* hide non-critical columns

Avoid:

* forcing desktop tables onto mobile screens

---

# Table Performance Standards

Requirements:

* memoized columns
* optimized rendering
* server-side pagination
* virtualization when required

Use:

* React.memo
* TanStack optimizations
* lazy loading

Avoid:

* rendering thousands of rows directly

---

# Virtualization Standards

Use virtualization for:

* very large datasets
* infinite scrolling
* analytics-heavy tables

Examples:

* react-virtual
* TanStack virtualization

---

# Table State Standards

Table state may include:

* sorting
* filtering
* pagination
* row selection

Keep state:

* predictable
* reusable
* isolated

Avoid:

* globalizing unnecessary table state

---

# Query Param Synchronization Standards

Advanced tables should support:

* URL-based filters
* URL pagination
* sharable search states

Benefits:

* bookmarkable table states
* better UX

---

# Table Permission Standards

Table actions must support:

* role validation
* permission checks
* hidden restricted actions

Avoid:

* frontend-only permission trust

---

# Table Accessibility Standards

All tables must support:

* keyboard navigation
* screen reader compatibility
* accessible sorting
* accessible pagination

Avoid:

* inaccessible action buttons

---

# Table Styling Standards

Requirements:

* consistent spacing
* readable row height
* sticky headers when required
* hover states
* selected states

Avoid:

* overcrowded rows
* inconsistent table spacing

---

# Export Standards

Tables may support:

* CSV export
* Excel export
* PDF export

Requirements:

* reusable export architecture
* permission-based exports

---

# Audit/Logging Standards

Critical tables may support:

* action tracking
* audit visibility
* user action history

Future-ready support only.

---

# Reusable Table Hook Standards

Examples:

```txt id="table11"
useTableFilters.ts
useTablePagination.ts
useTableSorting.ts
```

Purpose:

* reusable table logic
* cleaner table components

---

# Table Folder Organization Standards

Example:

```txt id="table12"
tables/
│
├── DataTable/
│   ├── DataTable.tsx
│   ├── DataTable.types.ts
│   ├── DataTable.utils.ts
│   ├── DataTable.constants.ts
│   └── index.ts
```

---

# Developer Experience Standards

Tables must remain:

* reusable
* easy to configure
* scalable
* easy to debug
* maintainable

Benefits:

* faster CRUD development
* consistent UX
* scalable admin systems

---

# Important Table Rules

DO NOT:

* hardcode tables repeatedly
* directly call APIs inside tables
* render massive datasets without optimization
* duplicate filter logic
* create non-responsive tables
* tightly couple reusable tables to features
* mix heavy business logic inside reusable table UI

---

# Expected Table Architecture Quality

The table system must remain:

* reusable
* scalable
* responsive
* performant
* maintainable
* accessible
* predictable
* enterprise-grade
