# NAMING-CONVENTIONS.md

# Frontend Naming Convention Standards

This document defines the complete naming standards for files, folders, components, hooks, services, Redux, APIs, utilities, constants, schemas, and scalable frontend architecture patterns.

The goal is to build:

* consistent codebase naming
* scalable architecture readability
* predictable project structure
* maintainable frontend systems
* enterprise-grade engineering standards

---

# Core Naming Philosophy

All naming must prioritize:

* clarity
* consistency
* readability
* predictability
* scalability

Names should clearly describe:

* purpose
* responsibility
* usage
* scope

Avoid:

* vague names
* short unclear names
* inconsistent patterns
* random abbreviations

---

# General Naming Rules

Use:

* descriptive names
* meaningful names
* scalable naming patterns

Avoid:

* temp
* test
* data1
* helper2
* misc
* commonStuff

Bad Examples:

```txt id="name1"
temp.ts
data.ts
test.tsx
helper.ts
```

Good Examples:

```txt id="name2"
users.service.ts
date.utils.ts
ExpenseTable.tsx
login.schema.ts
```

---

# Case Convention Standards

Use the following case rules consistently:

| Type       | Convention                           |
| ---------- | ------------------------------------ |
| Components | PascalCase                           |
| Hooks      | camelCase                            |
| Variables  | camelCase                            |
| Functions  | camelCase                            |
| Constants  | UPPER_SNAKE_CASE                     |
| Enums      | PascalCase                           |
| Types      | PascalCase                           |
| Interfaces | PascalCase                           |
| Folders    | kebab-case OR feature-name           |
| Files      | kebab-case OR descriptive dot naming |

---

# Component Naming Standards

Components must use:

* PascalCase

Examples:

```txt id="name3"
UserTable.tsx
ExpenseCard.tsx
DashboardHeader.tsx
LoginForm.tsx
```

Avoid:

```txt id="name4"
table.tsx
usercard.tsx
myComponent.tsx
```

---

# Page Naming Standards

Next.js pages use:

```txt id="name5"
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
```

Route folders should remain meaningful.

Examples:

```txt id="name6"
/admin/users
/app/orders
```

---

# Hook Naming Standards

Hooks must:

* start with use
* use camelCase

Examples:

```txt id="name7"
useUsers.ts
usePagination.ts
useAuth.ts
useDebounce.ts
```

Avoid:

```txt id="name8"
usersHook.ts
pagination.ts
authHook.ts
```

---

# Service Naming Standards

Services must use:

```txt id="name9"
feature-name.service.ts
```

Examples:

```txt id="name10"
users.service.ts
expenses.service.ts
auth.service.ts
dashboard.service.ts
```

Avoid:

```txt id="name11"
api.ts
services.ts
backend.ts
```

---

# Redux Naming Standards

Redux files must remain predictable.

Examples:

```txt id="name12"
auth.slice.ts
theme.slice.ts
sidebar.slice.ts
auth.selectors.ts
auth.types.ts
```

---

# Redux Selector Naming Standards

Selectors should begin with:

* select

Examples:

```txt id="name13"
selectCurrentUser
selectIsAuthenticated
selectSidebarState
```

Avoid:

```txt id="name14"
getUser
sidebarData
```

---

# Schema Naming Standards

Validation schemas must use:

```txt id="name15"
feature.schema.ts
```

Examples:

```txt id="name16"
login.schema.ts
user.schema.ts
expense.schema.ts
```

---

# Type Naming Standards

Types and interfaces must use:

* PascalCase

Examples:

```txt id="name17"
User
UserResponse
ExpensePayload
LoginFormValues
```

Avoid:

```txt id="name18"
userType
responseData
myInterface
```

---

# Enum Naming Standards

Enums must use:

* PascalCase

Enum values should use:

* UPPER_SNAKE_CASE

Example:

```txt id="name19"
enum UserRole {
  ADMIN,
  MANAGER,
  CUSTOMER
}
```

---

# Constant Naming Standards

Constants must use:

* UPPER_SNAKE_CASE

Examples:

```txt id="name20"
API_TIMEOUT
MAX_FILE_SIZE
DEFAULT_PAGE_SIZE
```

Files:

```txt id="name21"
auth.constants.ts
table.constants.ts
app.constants.ts
```

---

# Literal Naming Standards

Text/literal files must use:

```txt id="name22"
feature.literal.ts
```

Examples:

```txt id="name23"
auth.literal.ts
user.literal.ts
expense.literal.ts
```

---

# Message Naming Standards

Message files must remain centralized.

Examples:

```txt id="name24"
success.messages.ts
error.messages.ts
validation.messages.ts
api.messages.ts
```

---

# Utility Naming Standards

Utility files must use:

```txt id="name25"
feature.utils.ts
```

Examples:

```txt id="name26"
date.utils.ts
string.utils.ts
validation.utils.ts
currency.utils.ts
```

Avoid:

* generic helper names

Bad Examples:

```txt id="name27"
helper.ts
common.ts
utils.ts
```

---

# API Function Naming Standards

API functions must clearly describe actions.

Examples:

```txt id="name28"
getUsers()
getUserById()
createExpense()
updateProfile()
deleteUser()
```

Avoid:

```txt id="name29"
fetch()
submit()
sendData()
```

---

# React Query Naming Standards

Query Hooks:

```txt id="name30"
useUsers()
useUserDetails()
useExpenses()
```

Mutation Hooks:

```txt id="name31"
useCreateUser()
useUpdateExpense()
useDeleteUser()
```

---

# Query Key Naming Standards

Use predictable query keys.

Examples:

```txt id="name32"
["users"]
["users", id]
["expenses", filters]
["dashboard", params]
```

Avoid:

* random query keys
* inconsistent query structures

---

# Form Naming Standards

Form components must remain descriptive.

Examples:

```txt id="name33"
LoginForm.tsx
UserForm.tsx
ExpenseForm.tsx
```

Reusable form fields:

```txt id="name34"
FormInput.tsx
FormSelect.tsx
FormTextarea.tsx
```

---

# Table Naming Standards

Examples:

```txt id="name35"
UserTable.tsx
ExpenseTable.tsx
DataTable.tsx
TablePagination.tsx
```

---

# Modal Naming Standards

Examples:

```txt id="name36"
DeleteConfirmationModal.tsx
UserDetailsModal.tsx
CreateExpenseModal.tsx
```

Avoid:

```txt id="name37"
Popup.tsx
Modal1.tsx
```

---

# Folder Naming Standards

Feature folders should use:

* kebab-case
  OR
* feature-name

Examples:

```txt id="name38"
user-management/
expense-management/
dashboard/
settings/
```

Avoid:

* spaces
* unclear abbreviations

---

# Route Naming Standards

Routes must remain readable.

Examples:

```txt id="name39"
/admin/users
/admin/settings
/app/orders
/app/profile
```

Avoid:

```txt id="name40"
/admin/usr
/app/p
```

---

# CSS/Tailwind Naming Standards

Use:

* reusable utility patterns
* semantic class grouping

Avoid:

* random utility chaos
* duplicated class chains

---

# Boolean Naming Standards

Booleans should begin with:

* is
* has
* can
* should

Examples:

```txt id="name41"
isLoading
hasPermission
canEdit
shouldRefetch
```

Avoid:

```txt id="name42"
loading
permission
editAccess
```

---

# Event Handler Naming Standards

Event handlers should begin with:

* handle

Examples:

```txt id="name43"
handleSubmit
handleDelete
handleClose
handleSearch
```

Avoid:

```txt id="name44"
submitClick
deleteUserBtn
```

---

# Async Function Naming Standards

Async actions should remain action-oriented.

Examples:

```txt id="name45"
fetchUsers
createExpense
updateSettings
deleteAccount
```

Avoid:

* generic async names

---

# Environment Variable Naming Standards

Use:

* UPPER_SNAKE_CASE

Examples:

```txt id="name46"
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_ENVIRONMENT
```

---

# File Export Naming Standards

Use named exports whenever possible.

Avoid:

* unnecessary default exports

Exception:

* Next.js pages/layouts
* main React component exports if needed

---

# Barrel Export Standards

Use:

```txt id="name47"
index.ts
```

Purpose:

* cleaner imports
* centralized exports
* scalable architecture

---

# Database/API Model Naming Standards

Frontend models should match backend naming where possible.

Examples:

```txt id="name48"
User
Expense
Order
Permission
```

Avoid:

* mismatched frontend/backend naming chaos

---

# Abbreviation Standards

Avoid unnecessary abbreviations.

Bad Examples:

```txt id="name49"
usr.ts
expTbl.tsx
cfg.ts
```

Good Examples:

```txt id="name50"
users.service.ts
ExpenseTable.tsx
app.config.ts
```

---

# Naming Scalability Standards

Names should scale for:

* large teams
* large modules
* future features
* long-term maintenance

Always optimize for:

* readability
* onboarding
* maintainability

---

# Important Naming Rules

DO NOT:

* use vague names
* create inconsistent naming patterns
* abbreviate unnecessarily
* mix naming styles
* create unreadable filenames
* use generic helper/common names everywhere

---

# Expected Naming Quality

The naming system must remain:

* consistent
* readable
* scalable
* predictable
* maintainable
* enterprise-grade
