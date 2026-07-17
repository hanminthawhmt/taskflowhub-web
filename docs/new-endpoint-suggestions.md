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

---

### 7. Update Current User Profile
- **Proposed Endpoint**: `PATCH /users/me`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Description**: Update profile details (such as full name and email address) for the logged-in user.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@doe.com"
  }
  ```
- **Response Shape**:
  ```json
  {
    "message": "Profile updated successfully",
    "data": {
      "id": "user-uuid-1",
      "name": "Jane Doe",
      "email": "jane@doe.com"
    }
  }
  ```

---

### 8. Update Current User Password
- **Proposed Endpoint**: `PUT /users/me/password`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Description**: Securely change the logged-in user's password after validating their current password.
- **Request Body**:
  ```json
  {
    "currentPassword": "old-password-here",
    "newPassword": "new-secure-password-here"
  }
  ```
- **Response Shape**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

---

### [STATUS: NEEDED] Single Project Detail
- Suggested method + path: `GET /companies/:companyId/projects/:projectId`
- Why the frontend needs it: `getProjectById` in `project.service.ts` (line 173) never calls the API — it reads exclusively from localStorage mock data. `ProjectDetailPage` therefore always serves a potentially stale/fake project object. The real endpoint is explicitly marked `[NOT YET BUILT]` in `backend-api.md`.
- Expected request body / params: No body. Path params: `companyId` (int), `projectId` (int).
- Expected response shape:
  ```json
  {
    "data": {
      "id": 5,
      "title": "Web Redesign",
      "description": "...",
      "memberCount": 4,
      "taskCount": 12,
      "createdAt": "2026-07-12T08:00:00.000Z",
      "updatedAt": "2026-07-16T10:00:00.000Z"
    }
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership + project membership.
- Related existing endpoint(s), if any: `GET /companies/:companyId/projects` (returns list, not single item)
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] List Project Members
- Suggested method + path: `GET /companies/:companyId/projects/:projectId/members`
- Why the frontend needs it: `getProjectMembers` in `project.service.ts` (line 183) never calls the API — reads only from localStorage mock DB. Project members panel in `ProjectDetailPage` shows hardcoded fake members ('Han Min', 'Jane Doe'). The endpoint is marked `[NOT YET BUILT]` in `backend-api.md`.
- Expected request body / params: No body. Path params: `companyId` (int), `projectId` (int).
- Expected response shape:
  ```json
  {
    "data": [
      {
        "userId": 7,
        "name": "Jane Doe",
        "email": "jane@doe.com",
        "roleId": 2,
        "roleTitle": "Developer",
        "joinedAt": "2026-07-10T09:00:00.000Z"
      }
    ]
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership + project membership.
- Related existing endpoint(s), if any: `GET /companies/:companyId/members` (company scope, not project scope)
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] Update Project Settings
- Suggested method + path: `PATCH /companies/:companyId/projects/:projectId`
- Why the frontend needs it: `updateProject` in `project.service.ts` (line 225) never calls the API — it only writes to localStorage. Any project edit is local-only and lost on logout. Marked `[NOT YET BUILT]` in `backend-api.md`.
- Expected request body / params: `{ "title"?: "...", "description"?: "..." }` (all optional)
- Expected response shape:
  ```json
  {
    "message": "Project updated successfully",
    "data": { "id": 5, "title": "...", "description": "...", "updatedAt": "..." }
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership + project membership + `update_project` permission.
- Related existing endpoint(s), if any: `POST /companies/:companyId/projects` (create only)
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] Delete Project
- Suggested method + path: `DELETE /companies/:companyId/projects/:projectId`
- Why the frontend needs it: `deleteProject` in `project.service.ts` (line 242) never calls the API — deletes only from localStorage. Project deletions are local-only and do not persist. Marked `[NOT YET BUILT]` in `backend-api.md`.
- Expected request body / params: No body.
- Expected response shape:
  ```json
  { "message": "Project deleted successfully" }
  ```
- Auth / permission requirements (best guess): Required, requires company membership + `delete_project` permission (likely owner-only).
- Related existing endpoint(s), if any: None.
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] Update Company / Workspace Settings
- Suggested method + path: `PATCH /companies/:companyId`
- Why the frontend needs it: `onWorkspaceSubmit` in `SettingsPage.tsx` (line 103) is a synchronous function that never calls the API — workspace name changes are written to localStorage only and the toast explicitly says `(Mock Synced)`. Marked `[NOT YET BUILT]` in `backend-api.md`.
- Expected request body / params: `{ "name": "New Company Name" }` (other fields like `description` could be added later)
- Expected response shape:
  ```json
  {
    "message": "Company updated successfully",
    "data": { "id": 1, "name": "New Company Name" }
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership + `update_company_settings` permission (likely owner/admin only).
- Related existing endpoint(s), if any: `GET /companies/:companyId`
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] Dashboard Stats Summary
- Suggested method + path: `GET /companies/:companyId/stats`
- Why the frontend needs it: `DashboardPage.tsx` (lines 47–52) renders 4 KPI stat cards with hardcoded values `'4'`, `'52'`, `'18'`, `'74%'` that never reflect real data. No existing endpoint provides a pre-computed summary of active projects, task counts, and success rate. Marked `[NOT YET BUILT]` in `backend-api.md`.
- Expected request body / params: No body. Optional: `?period=week|month` for time-scoped stats.
- Expected response shape:
  ```json
  {
    "data": {
      "activeProjects": 4,
      "tasksCompleted": 52,
      "pendingTasks": 18,
      "successRate": 74
    }
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership.
- Related existing endpoint(s), if any: `GET /companies/:companyId/projects` (returns project list + taskCount per project, but not aggregated)
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] Weekly Task Activity Chart Data
- Suggested method + path: `GET /companies/:companyId/analytics/weekly`
- Why the frontend needs it: `DashboardPage.tsx` (lines 19–28, comment `// Mock data for analytics`) renders an `<AreaChart>` with 7 completely hardcoded data points for Mon–Sun. No existing endpoint provides per-day task creation/completion counts for the current week.
- Expected request body / params: No body. Optional: `?from=<ISO date>&to=<ISO date>` for custom range.
- Expected response shape:
  ```json
  {
    "data": [
      { "day": "Mon", "completed": 4, "created": 6 },
      { "day": "Tue", "completed": 8, "created": 5 }
    ]
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership.
- Related existing endpoint(s), if any: None.
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] Company-Scoped Activity Logs Feed
- Suggested method + path: `GET /companies/:companyId/activity-logs`
- Why the frontend needs it: `DashboardPage.tsx` (lines 30–35) renders a "Recent Activity" timeline with 4 hardcoded entries using fake user names ('John Doe', 'Sarah Connor') and fabricated action targets. The backend-api.md documents this as `[PARTIALLY BUILT — confirm exact routes before wiring frontend]` for platform-wide logs, and `[NOT YET BUILT]` for company-scoped.
- Expected request body / params: `GET` (optional `?page=1&limit=10`)
- Expected response shape:
  ```json
  {
    "data": [
      {
        "id": 1,
        "userId": 3,
        "userName": "Han Min",
        "action": "completed task",
        "target": "Design Auth Layout",
        "createdAt": "2026-07-16T10:00:00.000Z"
      }
    ]
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership.
- Related existing endpoint(s), if any: `GET /activity-logs` (super admin, platform-wide — different scope)
- Date logged: 2026-07-16

---

### [STATUS: NEEDED] Tasks With Upcoming Deadlines
- Suggested method + path: `GET /projects/companies/:companyId/tasks/upcoming`
- Why the frontend needs it: `DashboardPage.tsx` (lines 37–41) renders an "Upcoming Deadlines" panel with 3 completely hardcoded task items, fake project names, and fake relative due dates. No existing endpoint returns tasks sorted/filtered by upcoming `end_date` across all projects in a company.
- Expected request body / params: `GET` (optional `?days=7` for lookahead window)
- Expected response shape:
  ```json
  {
    "data": [
      {
        "id": 14,
        "title": "API Route Security Review",
        "projectTitle": "Core Engine",
        "endDate": "2026-07-17T00:00:00.000Z",
        "priority": "high"
      }
    ]
  }
  ```
- Auth / permission requirements (best guess): Required, requires company membership and project membership for each included task.
- Related existing endpoint(s), if any: `GET /:projectId/tasks` (per-project only, not cross-project)
- Date logged: 2026-07-16
