# API Conventions

Version 1.0

---

# HTTP Client

Axios

Single instance

api/client.ts

---

# Base URL

Use environment variables.

Never hardcode.

---

# Authentication

JWT

Authorization

Bearer <token>

Automatically attach using interceptor.

---

# Error Handling

Centralized.

401

Logout

Redirect Login

403

Permission error

404

Resource missing

500

Unexpected server error

---

# Services

One service per feature.

Example

project.service.ts

task.service.ts

company.service.ts

---

# TanStack Query

Use

useQuery

useMutation

invalidateQueries

optimistic updates when appropriate

---

# Query Keys

Use constants.

Example

["projects"]

["tasks", projectId]

["company", companyId]

---

# Mutations

On success

Invalidate affected queries.

Show success toast.

On error

Show error toast.

---

# API Types

Every endpoint

Request interface

Response interface

Error interface

---

# Retries

GET

Retry

POST

No retry

DELETE

No retry

PATCH

No retry

---

# Pagination

Backend-driven.

Never paginate locally.

---

# Loading

Always display skeleton.

---

# Empty

Display empty state.

---

# Timeout

30 seconds

---

# Cancellation

Cancel requests on component unmount where appropriate.

---

# Cache

Use React Query defaults.

Avoid duplicate requests.

---

# Never

Call Axios from components.

Store API data in Zustand.

Duplicate requests.

Ignore HTTP errors.