# AUTHENTICATION.md

# Frontend Authentication Architecture Standards

This document defines the complete authentication architecture, session management standards, route protection systems, token handling strategy, and secure frontend authentication flow.

The goal is to build:

* secure authentication systems
* scalable auth architecture
* separated portal authentication
* safe session handling
* reusable auth flows
* enterprise-grade frontend security

---

# Authentication Architecture Overview

The application contains 2 completely separated authentication systems.

---

# 1. Admin Authentication System

Purpose:

* Internal management access
* Restricted administrative operations

Routes:

```txt id="auth1"
/admin/login
/admin/forgot-password
/admin/reset-password
```

Requirements:

* desktop-first UI
* stricter permission handling
* role-based access
* protected admin routes

---

# 2. User Authentication System

Purpose:

* Customer/client authentication

Routes:

```txt id="auth2"
/login
/forgot-password
/reset-password
```

Requirements:

* mobile-first UI
* responsive authentication flow
* user-friendly experience

---

# Core Authentication Principles

The authentication system must prioritize:

* security
* scalability
* maintainability
* centralized auth handling
* reusable auth flows

Avoid:

* duplicated auth logic
* scattered token handling
* unsafe session storage
* hardcoded permission checks

---

# Authentication Architecture Flow

Authentication Flow:

```txt id="auth3"
Login Form
↓
Validation Layer
↓
Auth Service
↓
Axios Client
↓
Backend API
↓
Token Storage
↓
Redux Auth State
↓
Protected Application Access
```

---

# Authentication Folder Structure

Global Structure:

```txt id="auth4"
src/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── literals/
│   │   └── utils/
```

---

# Authentication State Management

Use:

* Redux Toolkit

Redux should manage:

* authentication session
* current user
* access permissions
* authentication status
* session state

Avoid:

* storing large API cache in Redux

---

# Authentication Redux Structure

Example:

```txt id="auth5"
auth/
│
├── auth.slice.ts
├── auth.selectors.ts
├── auth.types.ts
├── auth.constants.ts
└── auth.utils.ts
```

---

# Authentication Service Standards

Authentication API logic must remain centralized.

Structure:

```txt id="auth6"
auth.service.ts
```

Responsibilities:

* login
* logout
* refresh token
* forgot password
* reset password
* profile fetch
* session validation

Avoid:

* calling axios directly inside UI

---

# Authentication Hook Standards

Use reusable auth hooks.

Examples:

```txt id="auth7"
useLogin()
useLogout()
useCurrentUser()
useRefreshSession()
usePermissions()
```

Purpose:

* reusable auth logic
* cleaner components
* centralized auth flow

---

# Token Handling Standards

Authentication must support:

* access token
* refresh token
* session expiry handling

Requirements:

* centralized token handling
* automatic token injection
* automatic refresh flow
* secure logout handling

Avoid:

* duplicated token logic
* scattered auth checks

---

# Axios Authentication Standards

Axios interceptors must handle:

* token injection
* expired token handling
* unauthorized responses
* refresh token flow
* auto logout handling

Architecture Flow:

```txt id="auth8"
Request
↓
Attach Access Token
↓
API Request
↓
401 Response?
↓
Refresh Token Flow
↓
Retry Request
```

---

# Session Management Standards

Requirements:

* centralized session state
* session expiry handling
* auto logout support
* safe auth persistence

Session flow should remain predictable and secure.

---

# Route Protection Standards

All protected routes must support:

* authentication checks
* permission validation
* role validation
* safe redirects

Avoid:

* scattered route protection logic

---

# Admin Route Protection

Admin routes must:

* require authenticated admin access
* validate permissions
* validate roles
* block unauthorized users

Examples:

```txt id="auth9"
/admin/dashboard
/admin/users
/admin/settings
```

---

# User Route Protection

User routes must:

* require authenticated user access
* validate user session safely

Examples:

```txt id="auth10"
/app/home
/app/orders
/app/profile
```

---

# Middleware Authentication Standards

Use Next.js middleware for:

* protected routes
* role validation
* redirect handling
* authentication checks

Example:

```txt id="auth11"
middleware.ts
```

Responsibilities:

* auth redirects
* session validation
* unauthorized route blocking

---

# Permission Management Standards

Permissions must remain centralized.

Examples:

* role access
* feature access
* action permissions
* navigation visibility

Avoid:

* hardcoded permission checks everywhere

---

# Role-Based Access Standards

Support scalable RBAC architecture.

Examples:

```txt id="auth12"
Admin
Manager
Staff
Customer
```

Requirements:

* reusable permission utilities
* reusable role guards
* centralized access control

---

# Authentication UI Standards

Authentication UI must remain:

* clean
* lightweight
* responsive
* reusable

Required pages:

* Login
* Forgot Password
* Reset Password

Requirements:

* reusable auth forms
* loading states
* validation handling
* API error handling

---

# Form Validation Standards

Use:

* React Hook Form
* Zod

Requirements:

* reusable auth schemas
* centralized validation messages
* typed validation

Examples:

```txt id="auth13"
login.schema.ts
forgot-password.schema.ts
reset-password.schema.ts
```

---

# Authentication Error Handling Standards

Handle centrally:

* invalid credentials
* expired session
* permission denied
* refresh token failures
* network failures

Requirements:

* reusable error UI
* centralized auth messages
* safe logout flow

---

# Logout Standards

Logout flow must:

* clear session
* clear tokens
* clear auth state
* redirect safely

Avoid:

* partial session cleanup

---

# Refresh Token Standards

Requirements:

* silent token refresh
* retry failed requests safely
* avoid infinite refresh loops

Avoid:

* multiple simultaneous refresh requests

---

# Secure Storage Standards

Avoid insecure storage practices.

Preferred:

* secure cookie handling (backend preferred)
* minimal localStorage usage

Avoid:

* storing sensitive user data
* storing permissions insecurely

---

# Authentication Persistence Standards

Persist only required auth state.

Examples:

* access token
* session state
* theme preferences (optional)

Avoid persisting:

* sensitive backend data
* unnecessary user details

---

# Social Authentication Standards (Future Ready)

Architecture should support:

* Google Login
* Microsoft Login
* GitHub Login
* OTP Authentication

Requirements:

* pluggable auth providers
* scalable auth strategy

---

# OTP Authentication Standards (Optional)

OTP flow should support:

* resend timer
* retry limits
* secure verification flow

Avoid:

* insecure OTP handling

---

# Multi-Device Session Standards

Future-ready support:

* device management
* forced logout
* session invalidation

---

# Navigation Authentication Standards

Navigation must react to:

* auth status
* role permissions
* session state

Examples:

* protected sidebar items
* conditional navigation
* permission-based menus

---

# Authentication Loading Standards

All auth flows must support:

* loading states
* skeleton states
* retry states
* safe redirects

Avoid:

* flashing protected UI before auth validation

---

# Authentication Security Standards

Requirements:

* secure token handling
* safe redirects
* CSRF-safe architecture
* validated session handling
* protected route checks

Avoid:

* trusting frontend permissions alone
* exposing sensitive auth details

---

# Developer Experience Standards

Authentication architecture must remain:

* reusable
* centralized
* scalable
* debuggable
* maintainable

Benefits:

* cleaner auth flow
* safer security
* scalable permission handling

---

# Important Authentication Rules

DO NOT:

* call auth APIs directly inside components
* hardcode permission checks
* duplicate auth flow logic
* expose sensitive auth data
* trust frontend-only authorization
* scatter token handling across the app
* mix admin and user authentication logic

---

# Expected Authentication Quality

The authentication system must remain:

* secure
* scalable
* centralized
* reusable
* maintainable
* predictable
* production-ready
* enterprise-grade
