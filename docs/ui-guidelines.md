# UI Guidelines
## Task Management SaaS Frontend

Version: 1.0

---

# Purpose

This document defines the visual design language, layout rules, component behavior, and UX standards for the frontend.

Every generated page and component MUST follow these guidelines.

The goal is consistency, maintainability, accessibility, and a modern SaaS appearance.

---

# Design Philosophy

The UI should feel similar to:

- Linear
- Notion
- GitHub
- Jira
- Vercel Dashboard
- ClickUp

Design principles:

- Clean
- Minimal
- Spacious
- Professional
- Fast
- Accessible

Avoid overly colorful interfaces.

Prefer whitespace over borders.

---

# Technology

UI Library

- shadcn/ui

Styling

- Tailwind CSS

Icons

- Lucide React

Charts

- Recharts

Calendar

- FullCalendar

Tables

- TanStack Table

Animations

- Framer Motion (only where necessary)

Notifications

- Sonner

---

# Theme

Support both:

- Light Mode
- Dark Mode

All colors must use CSS variables.

Never hardcode colors.

---

# Color Palette

Primary

Blue

Used for

- Primary buttons
- Links
- Active navigation
- Selected items

Success

Green

Used for

- Success alerts
- Completed tasks
- Positive indicators

Warning

Yellow

Used for

- Pending states
- Warnings

Danger

Red

Used for

- Delete actions
- Errors
- Failed operations

Neutral

Gray

Used for

- Borders
- Backgrounds
- Disabled elements

---

# Border Radius

Cards

rounded-xl

Buttons

rounded-lg

Inputs

rounded-lg

Dialogs

rounded-xl

---

# Shadows

Use subtle shadows only.

Avoid heavy shadows.

Cards:

shadow-sm

Dialogs:

shadow-lg

---

# Typography

Font

Inter

Fallback

system-ui

Hierarchy

H1

32px
Bold

H2

24px
Semibold

H3

20px
Semibold

Body

16px

Caption

14px

Small

12px

---

# Spacing

Always use 8-point spacing.

Examples

4
8
12
16
24
32
48
64

Never use arbitrary spacing values.

---

# Layout

Desktop

Sidebar

Left

Top Navbar

Fixed

Content

Scrollable

Mobile

Sidebar becomes Drawer.

---

# Navigation

Sidebar contains

Dashboard

Companies

Projects

My Tasks

Members

Billing

Settings

Admin (if authorized)

Collapse support is required.

Current page must be highlighted.

---

# Page Layout

Every page should have:

Page Title

Optional Description

Primary Action Button

Filters

Content

Example

--------------------------------------------------

Projects

Manage your company projects.

[ New Project ]

--------------------------------------------------

Project Table

--------------------------------------------------

---

# Cards

Cards should contain

Title

Optional subtitle

Content

Optional footer

Padding

24px

---

# Buttons

Variants

Primary

Secondary

Outline

Ghost

Destructive

Loading

Disabled

Every async button must support loading state.

---

# Forms

Always use

React Hook Form

Validation

Zod

Rules

Show validation below field.

Required fields must have *

Disable submit during loading.

---

# Inputs

Use shadcn Input.

Support

Placeholder

Validation

Disabled

Read-only

Prefix/Suffix when appropriate

---

# Tables

Always use

TanStack Table

Support

Sorting

Pagination

Searching

Filtering

Column visibility

Empty state

Loading skeleton

---

# Empty State

Every list page must have an empty state.

Example

No projects found.

Create your first project to get started.

[ Create Project ]

---

# Loading State

Never use blank pages.

Use Skeleton components.

---

# Error State

Display

Icon

Message

Retry button

Example

Unable to load projects.

[ Retry ]

---

# Dialogs

Use for

Delete confirmation

Create

Edit

Invite user

Billing confirmation

Never navigate away for simple CRUD.

---

# Toast Notifications

Use Sonner.

Success

Project created successfully.

Error

Unable to create project.

---

# Authentication Screens

Center aligned

Card layout

Company logo

Simple background

Pages

Login

Register

Forgot Password

Accept Invitation

---

# Dashboard

Should contain

Statistics Cards

Recent Tasks

Recent Activity

Projects

Upcoming Deadlines

Charts

Quick Actions

---

# Project Page

Contains

Project Details

Members

Task List

Activity

Statistics

---

# Task Board

Support

Kanban

List

Calendar

Filters

Search

Assignment

Priority

Status

---

# Task Card

Displays

Title

Priority

Status

Due Date

Assignee Avatar

---

# Priority Colors

High

Red

Medium

Yellow

Low

Green

---

# Status Colors

Pending

Gray

In Progress

Blue

Completed

Green

Blocked

Red

---

# Avatars

Show initials if image unavailable.

---

# Icons

Use Lucide icons only.

Avoid mixing icon libraries.

---

# Accessibility

Every button needs

Accessible label

Every input needs

Associated label

Keyboard navigation must work.

Dialog focus must be trapped.

---

# Responsive Design

Desktop

≥1024px

Tablet

768–1023px

Mobile

<768px

Every page must work on mobile.

---

# Performance

Lazy load pages.

Use React.lazy()

Avoid unnecessary re-renders.

Memoize expensive components.

Paginate large datasets.

---

# API Integration

Never hardcode data.

Always fetch from backend.

Use TanStack Query.

Loading

Error

Success

must all be handled.

---

# Permissions

Hide UI actions the user cannot perform.

Still rely on backend authorization.

Never assume frontend checks are sufficient.

---

# Component Organization

components/

ui/

buttons/

cards/

dialogs/

tables/

forms/

charts/

avatars/

navigation/

features/

projects/

tasks/

billing/

companies/

settings/

---

# Naming Convention

Components

PascalCase

ProjectCard.tsx

TaskBoard.tsx

Hooks

camelCase

useProjects.ts

useTasks.ts

Types

PascalCase

Project.ts

Task.ts

Files

One component per file.

---

# Code Style

Keep components under 250 lines.

Extract reusable logic into hooks.

Avoid duplicated code.

Prefer composition over inheritance.

---

# UX Principles

Always provide feedback.

Never leave users wondering.

Every async action should show:

Loading

Success

Error

Never surprise users.

Always confirm destructive actions.

---

# AI Development Rules

When generating UI:

- Use existing reusable components before creating new ones.
- Follow shadcn/ui patterns.
- Keep components modular.
- Never invent backend fields.
- Follow backend-api.md exactly.
- If an endpoint is missing, use placeholder data and document the missing endpoint.
- Build production-quality code.
- Prioritize readability over cleverness.
- Prefer reusable components over page-specific implementations.

---

End of Document