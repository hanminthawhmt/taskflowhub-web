# Frontend Architecture
## Task Management SaaS

Version: 1.0

---

# Goal

This document defines how the React application should be organized.

The architecture prioritizes:

- scalability
- maintainability
- modularity
- feature isolation
- reusable components

---

# Tech Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- shadcn/ui

---

# Folder Structure

src/

    api/
    assets/
    components/
    config/
    features/
    hooks/
    layouts/
    lib/
    pages/
    providers/
    routes/
    services/
    store/
    styles/
    types/
    utils/

---

# Feature Organization

Every business feature lives inside

features/

Example

features/

    auth/
    billing/
    companies/
    dashboard/
    projects/
    tasks/
    settings/
    members/

Each feature contains

components/
hooks/
pages/
services/
types/
utils/

---

# Components

Shared UI components belong in

components/

Feature-specific components belong inside

features/<feature>/components

Never mix the two.

---

# API Layer

Never call Axios directly from components.

Correct flow

Component

↓

Custom Hook

↓

API Service

↓

Axios Client

---

# State Management

Server state

TanStack Query

Global UI state

Zustand

Local component state

useState

Avoid unnecessary global state.

---

# Routing

Use React Router.

Protected routes

Public routes

Role-aware routes

Nested layouts

---

# Layouts

AuthLayout

DashboardLayout

AdminLayout

Each layout owns

Sidebar

Navbar

Footer

Breadcrumb

---

# Data Flow

Backend

↓

Axios Client

↓

Service

↓

TanStack Query

↓

Hook

↓

Component

---

# Forms

Page

↓

Form Component

↓

React Hook Form

↓

Zod Validation

↓

API Service

---

# Error Handling

Errors should propagate upward.

API

↓

Query

↓

Hook

↓

UI

---

# Reusability Rules

Never duplicate

Buttons

Cards

Dialogs

Tables

Forms

Skeletons

Use shared components.

---

# Dependency Direction

Pages

↓

Feature Components

↓

Shared Components

↓

Utilities

Never reverse this dependency.

---

# Design Patterns

Use

Composition

Hooks

Dependency Injection where appropriate

Avoid

Singleton services

God components

Massive utility files

---

# Performance

Lazy routes

Memoized expensive components

Query caching

Code splitting

Pagination

Virtualization for large tables

---

# Testing Ready

Architecture should support

Unit testing

Component testing

Integration testing

without refactoring.