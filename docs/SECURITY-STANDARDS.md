# SECURITY-STANDARDS.md

# Frontend Security Standards

This document defines the complete frontend security architecture, authentication security rules, session protection standards, API safety practices, frontend vulnerability prevention guidelines, and enterprise-grade application security principles.

The goal is to build:

* secure frontend systems
* protected authentication flows
* safe API communication
* hardened client architecture
* scalable security standards
* enterprise-grade frontend security

---

# Core Security Philosophy

Security must be treated as:

* a mandatory architecture layer
* part of every feature decision
* a continuous engineering responsibility

The application must prioritize:

* secure authentication
* safe session handling
* protected routes
* sanitized data handling
* secure API communication
* least privilege access

Avoid:

* trusting frontend-only validation
* exposing sensitive data
* insecure token storage
* weak permission handling

---

# Core Security Principles

Follow:

* defense in depth
* least privilege access
* centralized security handling
* secure-by-default architecture

Every feature must prioritize:

* authentication safety
* authorization safety
* data protection
* secure rendering
* safe API communication

---

# Authentication Security Standards

Authentication must support:

* secure session handling
* token expiry handling
* refresh token architecture
* forced logout support

Requirements:

* centralized auth flow
* secure token injection
* safe logout handling
* permission validation

Avoid:

* duplicated auth logic
* insecure auth storage
* frontend-only authorization trust

---

# Token Security Standards

Preferred:

* HTTP-only secure cookies (backend-managed)

If token storage is required:

* minimize localStorage usage
* avoid storing sensitive metadata

Requirements:

* token expiry handling
* automatic logout flow
* refresh token management

Avoid:

* exposing tokens in URLs
* storing sensitive auth data insecurely

---

# Axios Security Standards

Axios must support:

* centralized interceptors
* token injection
* request sanitization
* response sanitization
* timeout handling

Requirements:

* secure request handling
* consistent auth headers
* safe retry logic

Avoid:

* direct axios calls inside UI
* exposing backend errors directly

---

# Route Protection Standards

All protected routes must support:

* authentication validation
* permission validation
* role validation
* redirect handling

Use:

* middleware.ts
* centralized route guards

Avoid:

* frontend-only route hiding
* inconsistent permission checks

---

# Role-Based Access Control Standards

RBAC architecture must support:

* role permissions
* action permissions
* route permissions
* feature permissions

Examples:

```txt id="sec1"
Admin
Manager
Staff
Customer
```

Requirements:

* centralized permission utilities
* reusable access guards

Avoid:

* hardcoded role checks everywhere

---

# Permission Validation Standards

Frontend permissions must:

* improve UX
* hide restricted actions
* prevent accidental access

BUT:

* backend must remain the final authority

Avoid:

* trusting frontend permissions alone

---

# Input Validation Standards

All user input must support:

* client-side validation
* backend validation
* sanitization
* safe parsing

Use:

* Zod
* React Hook Form

Avoid:

* trusting raw user input
* unsafe parsing logic

---

# XSS Protection Standards

Prevent:

* Cross-Site Scripting (XSS)

Requirements:

* sanitize unsafe HTML
* avoid dangerouslySetInnerHTML
* escape user-generated content

Avoid:

* rendering untrusted HTML directly

---

# CSRF Protection Standards

Authentication architecture should support:

* CSRF-safe backend patterns
* secure cookie usage
* same-site cookie protection

Preferred:

* backend-managed CSRF protection

---

# Sensitive Data Standards

Never expose:

* passwords
* access tokens
* refresh tokens
* internal API secrets
* backend stack traces

Avoid:

* logging sensitive information
* exposing internal architecture

---

# Environment Variable Standards

Environment variables must use:

```txt id="sec2"
NEXT_PUBLIC_
```

ONLY for:

* safe public frontend variables

Never expose:

* backend secrets
* private API credentials
* database credentials

Examples:

```txt id="sec3"
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_NAME
```

---

# File Upload Security Standards

Uploads must support:

* file type validation
* file size validation
* upload restrictions
* safe previews

Avoid:

* trusting uploaded file metadata
* unsafe file rendering

---

# API Security Standards

Frontend API handling must support:

* request validation
* response validation
* timeout handling
* centralized error handling

Avoid:

* exposing raw backend responses
* duplicated API security logic

---

# Session Management Standards

Sessions must support:

* expiration handling
* logout cleanup
* refresh handling
* inactivity protection

Requirements:

* centralized session state
* safe session invalidation

Avoid:

* stale authenticated sessions

---

# Logout Security Standards

Logout flow must:

* clear auth state
* clear tokens
* clear persisted session data
* redirect safely

Avoid:

* partial logout cleanup

---

# Password Security Standards

Password fields must:

* use masked inputs
* disable unsafe auto-fill when needed
* support secure reset flows

Requirements:

* strong password validation
* safe reset handling

Avoid:

* exposing password rules insecurely

---

# Error Security Standards

Never expose:

* backend stack traces
* SQL errors
* internal exception messages
* infrastructure details

Use:

* sanitized user-friendly messages

Bad Example:

```txt id="sec4"
SQLSTATE[500]
```

Good Example:

```txt id="sec5"
Something went wrong.
Please try again later.
```

---

# Logging Security Standards

Development:

* readable logs

Production:

* sanitized logging only

Avoid logging:

* passwords
* tokens
* sensitive user data
* API secrets

---

# Dependency Security Standards

Dependencies must be:

* actively maintained
* secure
* lightweight
* trusted

Requirements:

* regular dependency audits
* remove unused packages
* avoid abandoned libraries

Avoid:

* installing unnecessary packages

---

# Third-Party Integration Standards

Third-party integrations must:

* use trusted providers
* isolate sensitive keys
* follow permission-based access

Avoid:

* exposing provider secrets to frontend

---

# Browser Storage Standards

Avoid storing sensitive data in:

* localStorage
* sessionStorage

Preferred:

* secure backend-managed sessions
* minimal frontend persistence

Persist only:

* non-sensitive UI preferences
* minimal session metadata if required

---

# Clipboard Security Standards

Sensitive information should:

* avoid automatic clipboard copying
* require explicit user action

Avoid:

* silently copying sensitive data

---

# Secure Rendering Standards

UI rendering must:

* validate data safely
* avoid unsafe dynamic HTML
* sanitize dynamic content

Avoid:

* rendering unknown external content directly

---

# Security Headers Standards

Application should support:

* Content Security Policy (CSP)
* X-Frame-Options
* Referrer Policy
* Strict-Transport-Security

Handled primarily by:

* backend
* hosting platform
* CDN configuration

---

# HTTPS Standards

All production traffic must use:

* HTTPS only

Avoid:

* insecure HTTP production traffic

---

# Rate Limit Awareness Standards

Frontend must safely handle:

* 429 rate limit errors
* retry timing
* temporary API lockouts

Avoid:

* retry storms
* aggressive repeated requests

---

# Offline Security Standards

Offline states must:

* safely clear protected data when needed
* avoid exposing cached sensitive information

---

# Mobile Security Standards

Mobile-responsive UI must:

* protect sensitive screens
* avoid exposing secure data unnecessarily
* maintain safe auth handling

---

# Security Monitoring Standards

Future-ready support:

* Sentry
* audit logging
* suspicious activity tracking
* monitoring integrations

Requirements:

* centralized security observability

---

# Security Testing Standards

Security testing should include:

* auth flow testing
* permission testing
* route protection testing
* session expiry testing
* API error testing

Requirements:

* validation against common frontend vulnerabilities

---

# Developer Security Standards

Developers must:

* follow centralized auth patterns
* avoid insecure shortcuts
* respect permission architecture
* validate all user input

Avoid:

* bypassing security utilities
* exposing internal APIs

---

# Important Security Rules

DO NOT:

* trust frontend-only authorization
* expose tokens insecurely
* log sensitive information
* render unsafe HTML
* expose backend stack traces
* hardcode secrets
* bypass centralized authentication systems
* ignore permission validation

---

# Expected Security Quality

The frontend security architecture must remain:

* secure
* scalable
* centralized
* maintainable
* protected
* production-ready
* enterprise-grade

