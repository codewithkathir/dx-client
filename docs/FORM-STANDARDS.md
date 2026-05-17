# FORM-STANDARDS.md

# Frontend Form Architecture Standards

This document defines the complete frontend form architecture, validation systems, reusable form patterns, input standards, submission handling, and enterprise-grade form management principles.

The goal is to build:

* reusable forms
* scalable validation systems
* maintainable form architecture
* predictable form handling
* accessible user input systems
* enterprise-grade frontend forms

---

# Core Form Philosophy

All forms must prioritize:

* reusability
* scalability
* accessibility
* validation safety
* maintainability
* predictable UX

Avoid:

* duplicated form logic
* hardcoded validation
* inconsistent field UI
* massive uncontrolled forms

---

# Core Form Stack

Form Management:

* React Hook Form

Validation:

* Zod

UI:

* shadcn/ui

Styling:

* Tailwind CSS

---

# Form Architecture Principles

The project follows:

* reusable-first form architecture
* centralized validation systems
* isolated feature forms
* typed validation handling
* reusable field components

---

# Form Folder Structure

Every feature may contain:

```txt id="form1"
features/
│
├── users/
│   ├── schemas/
│   ├── components/
│   ├── types/
│   └── literals/
```

---

# Reusable Form Component Structure

Global reusable forms:

```txt id="form2"
components/
│
├── forms/
│   ├── FormInput/
│   ├── FormSelect/
│   ├── FormTextarea/
│   ├── FormCheckbox/
│   ├── FormDatePicker/
│   ├── FormFileUpload/
│   └── FormWrapper/
```

---

# Form Component Naming Standards

Forms must use:

* PascalCase

Examples:

```txt id="form3"
LoginForm.tsx
UserForm.tsx
ExpenseForm.tsx
ProfileForm.tsx
```

Reusable fields:

```txt id="form4"
FormInput.tsx
FormSelect.tsx
FormTextarea.tsx
```

Avoid:

```txt id="form5"
input1.tsx
myForm.tsx
testForm.tsx
```

---

# Validation Schema Standards

Every form must use:

* Zod schemas

Schema naming:

```txt id="form6"
feature.schema.ts
```

Examples:

```txt id="form7"
login.schema.ts
user.schema.ts
expense.schema.ts
```

---

# Validation Rules

Validation must remain:

* centralized
* typed
* reusable
* predictable

Requirements:

* field validation
* API validation mapping
* reusable validation helpers

Avoid:

* inline validation chaos
* duplicated validation logic

---

# Typed Form Standards

All forms must use:

* strongly typed form values

Example:

```txt id="form8"
type LoginFormValues
type UserFormValues
```

Avoid:

* any types
* untyped form data

---

# React Hook Form Standards

Use:

* FormProvider
* Controller (when needed)
* reusable field wrappers

Benefits:

* cleaner forms
* reusable validation
* optimized rendering

---

# Form Layout Standards

Forms must remain:

* clean
* responsive
* readable
* accessible

Requirements:

* proper spacing
* grouped fields
* responsive layouts
* section separation

Avoid:

* overcrowded forms
* inconsistent spacing

---

# Input Standards

All inputs must be reusable.

Supported fields:

* text input
* email input
* password input
* textarea
* select
* multi-select
* checkbox
* radio
* date picker
* file upload

Requirements:

* consistent sizing
* reusable error handling
* loading support
* disabled states

---

# Label Standards

Every input must support:

* visible labels
* helper text
* validation messaging

Requirements:

* accessible label linking
* readable typography

Avoid:

* placeholder-only forms

---

# Placeholder Standards

Placeholders should:

* support UX guidance
* remain minimal

Avoid:

* replacing labels entirely

---

# Error Message Standards

Validation errors must:

* remain centralized
* use reusable messages
* remain user-friendly

Examples:

```txt id="form9"
Email is required
Password must contain 8 characters
```

Avoid:

* raw technical errors
* inconsistent messaging

---

# Form Submission Standards

Every form must support:

* loading state
* disabled submit state
* validation state
* API error handling
* success handling

Avoid:

* multiple duplicate submissions
* silent failures

---

# Submit Button Standards

Submit buttons must:

* show loading state
* disable during submission
* remain reusable

Examples:

```txt id="form10"
Loading...
Saving...
Submitting...
```

---

# Async Validation Standards

Async validation may support:

* email uniqueness
* username validation
* OTP validation

Requirements:

* debounced requests
* loading feedback
* safe error handling

---

# API Error Mapping Standards

Backend validation errors must map safely to:

* form fields
* reusable error UI

Avoid:

* exposing raw backend errors

---

# Form Reset Standards

Forms should support:

* reset functionality
* default value restoration
* clean submission reset

Avoid:

* stale form state

---

# Multi-Step Form Standards

Multi-step forms must support:

* step validation
* state persistence
* safe navigation
* progress indication

Avoid:

* losing form state between steps

---

# Dynamic Form Standards

Dynamic fields should support:

* field arrays
* conditional rendering
* reusable field logic

Use:

* React Hook Form field arrays

---

# Modal Form Standards

Forms inside modals must:

* support scroll-safe layouts
* handle close/reset safely
* maintain validation state correctly

Avoid:

* stale modal form data

---

# File Upload Standards

File upload fields must support:

* type validation
* size validation
* upload progress
* preview support

Avoid:

* unsafe file handling

---

# Search Form Standards

Search/filter forms should support:

* debounced input
* query synchronization
* reusable filter handling

Avoid:

* excessive API calls

---

# Accessibility Standards

All forms must support:

* keyboard navigation
* focus states
* screen readers
* accessible labels
* aria support

Avoid:

* inaccessible inputs
* hidden validation feedback

---

# Mobile Form Standards

Forms must remain mobile-friendly.

Requirements:

* responsive spacing
* touch-friendly fields
* proper keyboard handling
* optimized input sizing

Avoid:

* tiny inputs
* broken mobile layouts

---

# Security Standards

Forms must safely handle:

* sensitive inputs
* password masking
* validation sanitization

Avoid:

* exposing sensitive form data
* unsafe client validation trust

---

# Performance Standards

Requirements:

* optimized rerenders
* reusable field components
* lazy loading when needed

Avoid:

* rerendering entire forms unnecessarily

Use:

* React Hook Form optimizations
* memoized reusable fields

---

# Form State Standards

Form state should remain:

* isolated
* predictable
* reusable

Avoid:

* globalizing temporary form state unnecessarily

---

# Centralized Text Standards

All form text should come from:

* literals
* messages

Avoid:

* hardcoded form text

Examples:

```txt id="form11"
auth.literal.ts
validation.messages.ts
```

---

# Reusable Form Wrapper Standards

Reusable wrappers may support:

* standardized spacing
* error handling
* loading handling
* section grouping

Examples:

```txt id="form12"
FormWrapper
FormSection
FormActions
```

---

# Developer Experience Standards

Forms must remain:

* easy to maintain
* easy to scale
* easy to validate
* easy to debug

Benefits:

* faster development
* reusable patterns
* safer form handling

---

# Important Form Rules

DO NOT:

* duplicate validation logic
* hardcode validation messages
* directly call APIs inside fields
* mix heavy business logic into UI
* create inconsistent field UI
* use uncontrolled complex forms
* use untyped form data

---

# Expected Form Architecture Quality

The form system must remain:

* reusable
* scalable
* accessible
* maintainable
* strongly typed
* responsive
* predictable
* enterprise-grade
