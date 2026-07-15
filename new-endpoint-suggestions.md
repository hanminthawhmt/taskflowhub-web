# New Endpoint Suggestions

This document lists the recommended API endpoints currently missing from the backend API that are necessary or highly beneficial for standard frontend workflows.

---

### 1. List User's Companies
- **Proposed Endpoint**: `GET /companies`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Returns all companies that the currently logged-in user belongs to (via `company_members`). This is essential to populate the Company Switcher dropdown in the navigation header.
- **Response Shape**:
  ```json
  {
    "data": [
      { "id": "company-uuid-1", "name": "Acme Corp", "role": "Owner" },
      { "id": "company-uuid-2", "name": "Beta LLC", "role": "Member" }
    ]
  }
  ```

---

### 2. Fetch Single Company Details
- **Proposed Endpoint**: `GET /companies/:companyId`
- **Method**: `GET`
- **Auth Required**: Yes (requires company membership)
- **Description**: Returns details for a specific company, including its active subscription status or plan.
- **Response Shape**:
  ```json
  {
    "data": {
      "id": "company-uuid-1",
      "name": "Acme Corp",
      "createdAt": "2026-07-15T12:00:00Z",
      "planId": "starter"
    }
  }
  ```

---

### 3. List Company Members
- **Proposed Endpoint**: `GET /companies/:companyId/members`
- **Method**: `GET`
- **Auth Required**: Yes (requires company membership)
- **Description**: List all members of a company to allow management of roles, adding members to projects, and visual avatar lists.
- **Response Shape**:
  ```json
  {
    "data": [
      { "user_id": "user-uuid-1", "name": "Jane Doe", "email": "jane@doe.com", "role_id": "owner" }
    ]
  }
  ```

---

### 4. List Company Projects
- **Proposed Endpoint**: `GET /companies/:companyId/projects`
- **Method**: `GET`
- **Auth Required**: Yes (requires company membership)
- **Description**: List all projects for a company, scoped by the user's project memberships.
- **Response Shape**:
  ```json
  {
    "data": [
      { "id": "project-uuid-1", "title": "Web Redesign", "description": "Update the marketing website" }
    ]
  }
  ```

---

### 5. List All Project Tasks
- **Proposed Endpoint**: `GET /projects/:projectId/tasks`
- **Method**: `GET`
- **Auth Required**: Yes (requires project membership)
- **Description**: Returns all tasks in a project, enabling Kanban and full list board displays.
- **Response Shape**:
  ```json
  {
    "data": [
      {
        "id": "task-uuid-1",
        "title": "Setup repository",
        "status": "complete",
        "priority": "high",
        "user_id": "user-uuid-1"
      }
    ]
  }
  ```

---

### 6. List Billing Plans
- **Proposed Endpoint**: `GET /plans`
- **Method**: `GET`
- **Auth Required**: No (publicly available for pricing page)
- **Description**: List available pricing tiers and subscription options.
- **Response Shape**:
  ```json
  {
    "data": [
      { "id": "free", "name": "Free", "price": 0, "max_projects": 1 },
      { "id": "starter", "name": "Starter", "price": 299, "max_projects": 5 }
    ]
  }
  ```
