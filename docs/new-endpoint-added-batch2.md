# New Endpoint Suggestions — Added (Batch 2)

## Purpose

This is the backend's response to the second batch of gaps logged in
`docs/new-endpoint-suggestions.md` (the audit that found hardcoded/mocked
data in `DashboardPage.tsx`, `project.service.ts`, and `SettingsPage.tsx`).
All 8 endpoints from that batch are now implemented.

Update `docs/backend-api.md` with these confirmed shapes. Treat this file as
the source of truth over the original proposal entries for this batch.

---

## Global notes for this batch

- All corrections from the first response file still apply (integer IDs,
  satang pricing, camelCase response fields).
- Several of these endpoints depend on `activity_logs` actually being
  populated. **As of this batch, the `activityLogService.log(...)` calls
  have NOT yet been added to `task/service.js`, `project/service.js`, etc.**
  This means `activity_logs` is currently empty in the database, and the
  activity-log endpoint below will return `data: []` until those logging
  calls are wired in on the backend. This is a known, tracked gap — not a
  frontend bug if the activity feed looks empty right now.

---

## 1. `GET /companies/:companyId/projects/:projectId/members`

**STATUS: DONE**
Auth: required, requires company membership AND project membership
(`checkCompanyMember` + `checkProjectMember`)

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

Matches the originally proposed shape exactly — no corrections needed
beyond the standard integer-ID convention.

Known limitation: this endpoint does not verify that `:projectId` actually
belongs to `:companyId` — it independently checks "is the user a member of
this company" and "is the user a member of this project," but not that the
two path params are relationally consistent. Not currently exploitable
(both checks still require real membership), but worth being aware of if
you ever pass a mismatched company/project pair in a URL by mistake.

---

## 2. `PATCH /companies/:companyId/projects/:projectId`

**STATUS: DONE**
Auth: required, company + project membership, `update_project_settings`
permission (project-scoped Owner only, per current role seed)

Request body (all fields optional):

```json
{ "title": "New Title", "description": "New description" }
```

Response:

```json
{
  "message": "Project updated successfully",
  "data": {
    "id": 5,
    "title": "New Title",
    "description": "...",
    "updatedAt": "..."
  }
}
```

Note: only project-scoped **Owner** currently has `update_project_settings`
in the seeded `role_permissions`. If your UI shows an edit button to
Managers/Developers, expect a `403` when they attempt to submit — hide the
affordance based on the member's `roleTitle` from endpoint #1 above, or
handle the 403 gracefully in the UI.

---

## 3. `DELETE /companies/:companyId/projects/:projectId`

**STATUS: DONE**
Auth: required, company + project membership, `delete_project` permission

Response:

```json
{ "message": "Project deleted successfully" }
```

Important: **this is a hard delete, not reversible.** Deleting a project
also cascades and permanently deletes all of its tasks, project members,
and project invitations in the same transaction. There is no soft-delete /
restore capability for projects (unlike tasks, which have a `deletedAt`
field in the schema, currently unused). Recommend a confirmation dialog on
the frontend before calling this endpoint.

---

## 4. `PATCH /companies/:companyId`

**STATUS: DONE** (implemented by Han Min directly — confirming shape here
for consistency with this doc)

Request body:

```json
{ "name": "New Company Name" }
```

---

## 5. `GET /companies/:companyId/stats`

**STATUS: DONE**
Auth: required, company membership, `view_company` permission

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

Optional query param: `?period=week|month` — filters `tasksCompleted` /
`pendingTasks` / `successRate` to tasks created within that window.
Omitting `period` returns all-time counts.

**Important naming correction:** `activeProjects` is actually a **total
project count** for the company, not a true "active vs. archived" filter —
the `Project` model has no status field to distinguish active from
inactive/archived projects. If the frontend label implies filtering
(e.g. "4 Active Projects" suggesting others are inactive), consider
relabeling to "Total Projects" for accuracy, or flag back if a real
active/archived distinction is needed (would require a schema change).

`successRate` is `tasksCompleted / (tasksCompleted + pendingTasks) * 100`,
rounded to the nearest integer. Returns `0` (not `NaN`/`null`) for a
company with zero relevant tasks.

---

## 6. `GET /companies/:companyId/analytics/weekly`

**STATUS: DONE**
Auth: required, company membership, `view_company` permission

Optional query params: `?from=<ISO date>&to=<ISO date>` (defaults to the
last 7 days if omitted).

```json
{
  "data": [
    { "day": "Mon", "completed": 4, "created": 6 },
    { "day": "Tue", "completed": 8, "created": 5 }
  ]
}
```

**Important accuracy limitation — read before displaying this data as
precise:**
The `Task` model has no `completedAt` timestamp. `completed` counts are
approximated as "tasks currently marked `status: complete`, attributed to
the day of their last `updatedAt`." This means:

- A task completed then later edited again (e.g. a title fix) will show
  its completion count on the day of that LATER edit, not the actual
  completion day.
- A task completed then reopened back to `pending` will not be counted at
  all, on any day.

`created` counts are fully accurate (based on `createdAt`, which never
changes).

If chart accuracy matters for a demo, the real fix is adding a
`completedAt DateTime?` field to `Task`, set only when `status` transitions
to `complete` in `updateTaskStatus`. Not yet implemented — flag if this
becomes a priority.

Every day in the requested range is included in the response, even days
with zero activity (returned as `{ day: "Wed", completed: 0, created: 0 }`)
— the array length is always consistent with the date range, useful for
chart libraries expecting a fixed number of data points.

---

## 7. `GET /companies/:companyId/activity-logs`

**STATUS: DONE, BUT CURRENTLY RETURNS EMPTY DATA — see global note above**
Auth: required, company membership, `view_company` permission

Optional query params: `?page=1&limit=10`

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
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Corrections from proposal:

- Response now includes a `pagination` object alongside `data`, not just a
  bare array — needed since `?page=`/`?limit=` were requested in the
  original proposal, and the frontend will likely want `totalPages` to
  render pagination controls.
- `target` is derived from the log's `meta.title` field, which is only
  populated if the backend's internal `activityLogService.log(...)` call
  included a `title` in its `meta` object at the time the event happened.
  Until those logging calls are added throughout `task/service.js`,
  `project/service.js`, etc., `target` will be `null` on any log that
  does eventually appear.

**This endpoint is functionally complete but will return an empty array
until the backend adds logging calls to its existing services.** This is
tracked as backend follow-up work, not a frontend integration issue.

---

## 8. `GET /projects/companies/:companyId/tasks/upcoming`

**STATUS: DONE**
Auth: required, company membership, `view_task` permission

Optional query param: `?days=7` (default: 7-day lookahead)

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

Matches the proposed shape closely. One behavior worth noting: this is
scoped to tasks in projects **the requesting user is personally a member
of**, not every task across every project in the company — matching the
proposal's own auth guess ("project membership for each included task").
A company Owner/Admin who is not personally added to a given project will
NOT see that project's upcoming tasks here, even though they may have
broader company-level visibility elsewhere.

Only tasks with `status: "pending"` and a non-null `end_date` within the
lookahead window (and not already overdue) are included. Overdue tasks
(`end_date` in the past) are deliberately excluded — if an "overdue tasks"
view is needed separately, that would be a new endpoint.

---

## Summary of open items for backend follow-up

1. **Activity logging calls are not yet wired into existing services** —
   blocks endpoint #7 from having real data. Needs `activityLogService.log(...)`
   calls added to `task/service.js` (`createTask`, `updateTaskStatus`),
   `project/service.js` (`createProject`, member additions), and
   `company/service.js` (member invitations) at minimum.
2. **No `completedAt` field on `Task`** — endpoint #6's `completed` counts
   are an approximation. Low priority unless chart accuracy becomes
   important for a demo.
3. **No active/archived status on `Project`** — endpoint #5's
   `activeProjects` is really just a total count. Low priority unless a
   true archival feature is planned.
4. **No cascade-consistency check between `:companyId` and `:projectId`**
   on endpoint #1 — not a security gap, just worth being aware of.
