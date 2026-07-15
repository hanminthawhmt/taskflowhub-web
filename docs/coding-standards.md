# Coding Standards

Version 1.0

---

# General

Write code for humans first.

Readable > Clever.

---

# Language

TypeScript only.

No JavaScript.

Strict mode enabled.

---

# Naming

Components

PascalCase

TaskCard.tsx

Hooks

camelCase

useProjects.ts

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Interfaces

PascalCase

Enums

PascalCase

Types

PascalCase

---

# Components

One component per file.

Prefer functional components.

Never exceed 250 lines.

Extract logic into hooks.

---

# Hooks

Every reusable logic belongs in a hook.

Never duplicate API logic.

---

# Functions

Small.

Pure whenever possible.

Single responsibility.

---

# Props

Always type props.

Avoid any.

---

# Imports

Order

React

Libraries

Internal modules

Styles

---

# Comments

Explain WHY.

Do not explain WHAT.

---

# Formatting

Use Prettier defaults.

No manual alignment.

---

# Async

Use async/await.

Avoid chained .then()

---

# Error Handling

Never ignore errors.

Always display user feedback.

---

# API

Never hardcode URLs.

Use centralized API client.

---

# Types

Prefer interfaces for API models.

Prefer type aliases for unions.

---

# Boolean Variables

Use

isLoading

hasError

canEdit

shouldRefresh

Avoid

flag

temp

value

---

# Files

One responsibility per file.

---

# Reuse

Search before creating.

Prefer extending existing components.

---

# Forbidden

Duplicated logic

Nested ternary operators

Magic numbers

Inline styles

Anonymous default exports

Large components

Unused code

Console.log in production