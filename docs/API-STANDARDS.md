# API-STANDARDS.md

# Frontend API Architecture Standards

This document defines the complete API communication architecture, service layer standards, Axios configuration patterns, response handling, and scalable API development rules.

The goal is to build:

* centralized API architecture
* scalable service layer
* reusable API handling
* safe backend communication
* enterprise-grade frontend API management

---

# Core API Stack

API Communication:

* Axios

Server State:

* React Query

Validation:

* Zod

State Management:

* Redux Toolkit (global app state only)

---

# API Architecture Principles

The API architecture must follow:

* centralized API handling
* service-based architecture
* reusable request logic
* scalable API structure
* typed API responses
* centralized error handling
* clean separation of concerns

---

# Core Architecture Flow

Frontend API flow:

```txt id="0zn4r2"
UI Component
↓
Custom Hook
↓
Feature Service
↓
Central Axios Client
↓
Backend API
```

Important:

* UI components must never directly call Axios
* API logic must remain isolated inside service layer

---

# Global API Structure

Use this structure:

```txt id="31g9pb"
src/
│
├── services/
│   ├── api.ts
│   ├── interceptors.ts
│   ├── base.service.ts
│   └── endpoints.ts
```

---

# Axios Client Architecture

## api.ts

Purpose:

* centralized Axios instance
* shared API configuration

Responsibilities:

* base URL
* headers
* timeout
* token injection
* content type
* request configuration

Example Responsibilities:

```txt id="jlwm61"
Base URL
Authorization Headers
JSON Headers
Request Timeout
Credentials
```

---

# Interceptor Architecture

## interceptors.ts

Purpose:

* centralized request handling
* centralized response handling
* centralized API error handling

Responsibilities:

* attach tokens
* refresh token flow
* response normalization
* API error transformation
* logout handling
* session expiry handling

---

# Base Service Architecture

## base.service.ts

Purpose:

* reusable CRUD helpers
* shared API methods
* common request utilities

Example Methods:

```txt id="jlwm62"
get()
post()
put()
patch()
delete()
upload()
download()
```

Avoid duplicating common API logic across services.

---

# Feature Service Architecture

Every feature must contain its own service layer.

Example:

```txt id="jlwm63"
features/
│
├── users/
│   └── services/
│       └── users.service.ts
```

---

# Service Naming Convention

Use:

```txt id="jlwm64"
feature-name.service.ts
```

Examples:

```txt id="jlwm65"
users.service.ts
auth.service.ts
expenses.service.ts
settings.service.ts
```

---

# Service Layer Rules

Services should ONLY handle:

* API calls
* request params
* request payloads
* response typing
* query params
* endpoint mapping

Services should NOT handle:

* UI rendering
* component state
* toast notifications
* modal logic
* navigation logic

---

# API Endpoint Standards

Use centralized endpoint management.

Example:

```txt id="jlwm66"
endpoints.ts
```

Structure:

```txt id="jlwm67"
API_ENDPOINTS = {
  AUTH: {},
  USERS: {},
  EXPENSES: {},
}
```

Benefits:

* centralized API control
* easier maintenance
* easier API version migration

---

# API Versioning Standards

Use API versioning support.

Example:

```txt id="jlwm68"
/api/v1/
/api/v2/
```

Never hardcode repeated API paths across services.

---

# API Response Standards

Expected backend response structure:

```txt id="jlwm69"
{
  success: boolean,
  message: string,
  data: {},
  errors: [],
  pagination: {}
}
```

Frontend must normalize responses centrally.

---

# API Error Handling Standards

All API errors must flow through centralized handling.

Error Flow:

```txt id="jlwm70"
API Error
↓
Axios Interceptor
↓
Global Error Handler
↓
UI Error Panel / Toast
```

Handle:

* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 422 Validation Error
* 429 Too Many Requests
* 500 Internal Server Error
* Network Errors
* Timeout Errors

---

# Authentication Token Standards

Token handling responsibilities:

```txt id="jlwm71"
Attach Access Token
Handle Refresh Token
Logout On Invalid Session
Handle Token Expiry
```

Requirements:

* centralized token injection
* centralized session handling
* avoid duplicated auth logic

---

# React Query Standards

Use React Query for:

* API caching
* mutations
* pagination
* refetching
* background sync

Do NOT use Redux for:

* API cache
* paginated server data
* mutation states

---

# Query Key Standards

Use centralized query key naming.

Examples:

```txt id="jlwm72"
["users"]
["users", id]
["expenses", filters]
```

Requirements:

* predictable query keys
* scalable cache invalidation
* grouped query management

---

# Mutation Standards

Mutations should:

* invalidate relevant queries
* handle optimistic updates safely
* use centralized error handling
* use reusable mutation hooks

---

# API Hook Standards

Feature hooks should wrap service calls.

Example:

```txt id="jlwm73"
useUsers()
useCreateUser()
useUpdateExpense()
```

Responsibilities:

* query handling
* mutation handling
* cache invalidation
* loading state handling

Avoid:

* placing React Query directly everywhere inside pages

---

# File Upload Standards

Requirements:

* centralized upload handling
* multipart/form-data support
* upload progress support
* reusable upload helpers

Supported:

* image uploads
* document uploads
* CSV uploads

---

# Pagination Standards

Use server-side pagination.

Requirements:

* reusable pagination params
* reusable pagination UI
* centralized pagination types

Standard Params:

```txt id="jlwm74"
page
limit
search
sort
filters
```

---

# Search & Filter Standards

Requirements:

* debounced search
* reusable filter architecture
* centralized query param handling

Avoid:

* duplicate filter logic
* hardcoded search handling

---

# Retry & Timeout Standards

Requirements:

* API timeout handling
* safe retry strategies
* network failure fallback

Avoid:

* infinite retries
* aggressive polling

---

# API Security Standards

Requirements:

* secure token handling
* safe request validation
* permission-based access
* avoid exposing sensitive data

Avoid:

* storing sensitive data insecurely
* unsafe client-side permission trust

---

# Performance Standards

Requirements:

* minimize duplicate requests
* cache API responses properly
* lazy load heavy modules
* avoid unnecessary refetching

Use:

* React Query caching
* stale time optimization
* query invalidation

---

# Logging Standards

Development:

* safe console logging

Production:

* centralized error reporting support

Future-ready support:

* Sentry
* LogRocket
* monitoring integrations

---

# Important API Rules

DO NOT:

* call axios directly inside UI
* duplicate API request logic
* mix API logic with UI rendering
* hardcode API URLs repeatedly
* handle errors differently in every component
* store API cache inside Redux

---

# Expected API Quality

The API architecture must always remain:

* centralized
* scalable
* maintainable
* reusable
* strongly typed
* production-ready
* enterprise-grade
