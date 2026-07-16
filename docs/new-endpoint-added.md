NEW ENDPOINT SUGGESTIONS — ADDED (Backend Response)
=======================================================

PURPOSE OF THIS FILE
---------------------
This is the backend's response to `new-endpoint-suggestions.md` (proposed by
the frontend agent). All 8 originally proposed endpoints have now been
implemented. Several response shapes and assumptions in the original proposal
were corrected during implementation to match the real database schema and
existing conventions — read the corrections below carefully before building
or updating frontend code against these endpoints.

Update `backend-api-skill.txt` / the SKILL.md reference with these confirmed
shapes once reviewed — treat THIS file as the source of truth over the
original proposal document.


GLOBAL CORRECTIONS APPLIED TO EVERY ENDPOINT BELOW
-----------------------------------------------------
1. ALL IDs ARE INTEGERS, NOT UUIDs.
   The original proposal used string UUIDs (e.g. "company-uuid-1",
   "user-uuid-1") for every ID field. The actual database uses
   `Int @id @default(autoincrement())` throughout. Every `id`, `userId`,
   `roleId`, `planId`, `companyId`, `projectId`, `taskId` field in real
   responses is a plain number (e.g. `1`, `42`), never a string.

2. MONETARY VALUES ARE IN SATANG, NOT BAHT.
   `price` on the Plan model is stored in the smallest THB unit (satang),
   matching Stripe's convention (e.g. Starter plan = 29900, not 299).
   Format for display on the frontend: `price / 100` → "฿299.00".
   Do not expect the API to pre-convert this.

3. PASSWORD HASHES ARE NEVER RETURNED.
   Every endpoint below that returns user data strips or excludes `password`
   at the query level or via destructuring before responding.


===================================================================
1. GET /companies — List User's Companies
===================================================================
STATUS: DONE
Auth: required (JWT only, no company-scoping possible on this route)

Actual response shape:
{
  "data": [
    {
      "id": 1,
      "name": "Acme Corp",
      "role": "Owner",
      "roleId": 1,
      "planName": "Free",
      "subscriptionStatus": "active",
      "createdAt": "2026-07-15T12:00:00.000Z"
    }
  ]
}

Corrections from proposal:
- id is an integer, not a UUID string
- role is a readable string (role.title); roleId is also included as the
  numeric FK, in case the frontend needs it for permission-based UI logic
- added planName and subscriptionStatus — not in the original proposal, but
  needed almost immediately for any dashboard/company-switcher UI showing
  plan/billing state at a glance


===================================================================
2. GET /companies/:companyId — Fetch Single Company Details
===================================================================
STATUS: DONE
Auth: required, requires company membership (checkCompanyMember)

Actual response shape:
{
  "data": {
    "id": 1,
    "name": "Acme Corp",
    "subscriptionStatus": "active",
    "planName": "Free",
    "planId": 1,
    "maxProjects": 1,
    "createdBy": { "id": 3, "name": "Han Min", "email": "han@example.com" },
    "memberCount": 5,
    "projectCount": 2,
    "trialEndsAt": null,
    "createdAt": "2026-07-15T12:00:00.000Z"
  }
}

Corrections from proposal:
- id / planId are integers, not strings ("starter" style slugs don't exist —
  plan identity is always the numeric plans.id)
- response expanded beyond the original { id, name, createdAt, planId } —
  added subscriptionStatus, planName, maxProjects, createdBy, memberCount,
  projectCount since a real "company details" page needs more than the bare
  minimum originally proposed


===================================================================
3. GET /companies/:companyId/members — List Company Members
===================================================================
STATUS: DONE
Auth: required, requires company membership (checkCompanyMember)

Actual response shape:
{
  "data": [
    {
      "userId": 7,
      "name": "Jane Doe",
      "email": "jane@doe.com",
      "roleId": 2,
      "roleTitle": "Member",
      "joinedAt": "2026-07-10T09:00:00.000Z"
    }
  ]
}

Corrections from proposal:
- userId is an integer, not a UUID
- role_id is now roleId (camelCase, matching the rest of the API's
  convention) and is the real numeric FK, not a string like "owner"
- roleTitle added as the human-readable label, since the frontend needs
  something displayable, not just the FK
- field naming uses camelCase throughout (userId, not user_id) — matches
  every other GET response in this API; only REQUEST bodies use snake_case
  in a few places (see note below)

NOTE ON NAMING CONVENTION: request bodies for some existing POST endpoints
(e.g. company/project invitations, add-members) use snake_case field names
like role_id, user_id — this was inherited from earlier development and is
inconsistent with response bodies, which are camelCase. This inconsistency
is a known rough edge, not a frontend bug. If it causes friction, flag it
here as a suggested future backend cleanup (would be a breaking change to
existing request shapes, so not fixed automatically).


===================================================================
4. GET /companies/:companyId/projects — List Company Projects
===================================================================
STATUS: DONE
Auth: required, requires company membership (checkCompanyMember)

IMPORTANT BEHAVIOR NOTE: this endpoint is scoped to the REQUESTING USER'S
OWN project memberships within the company — it does NOT return every
project in the company, only ones the current user has actually been added
to as a project member. This was a deliberate correction to match the
original proposal's own description ("scoped by the user's project
memberships") after an initial draft implementation returned all company
projects unscoped.

Actual response shape:
{
  "data": [
    {
      "id": 5,
      "title": "Web Redesign",
      "description": "Update the marketing website",
      "memberCount": 4,
      "taskCount": 12,
      "createdAt": "2026-07-12T08:00:00.000Z"
    }
  ]
}

Corrections from proposal:
- id is an integer, not a UUID
- added memberCount / taskCount — not in the original proposal, but useful
  for any project-list card UI showing at-a-glance stats without a second
  fetch per project


===================================================================
5. GET /projects/:projectId/tasks — List All Project Tasks
===================================================================
STATUS: DONE
Auth: required, requires project membership (checkProjectMember) +
      requirePermission("view_task")

ACTUAL MOUNT PATH DIFFERS FROM PROPOSAL:
  Proposed: GET /projects/:projectId/tasks
  Actual:   GET /:projectId/tasks
  (confirm final mount prefix in routes/routes.js — the project router in
  this backend is not nested under a literal "/projects" segment the way
  the proposal assumed)

Supports optional query filters (not in original proposal, added for
Kanban/board use cases):
  ?status=pending|complete
  ?priority=high|medium|low
  ?assignee=<userId>

Actual response shape:
{
  "data": [
    {
      "id": 14,
      "title": "Setup repository",
      "description": "...",
      "priority": "high",
      "status": "complete",
      "startDate": null,
      "endDate": null,
      "assignee": { "id": 7, "name": "Jane Doe", "email": "jane@doe.com" },
      "createdAt": "2026-07-11T10:00:00.000Z"
    }
  ]
}

Corrections from proposal:
- id is an integer, not a UUID
- user_id replaced with a nested assignee object ({ id, name, email }) —
  the original proposal's bare user_id would force the frontend to make a
  separate lookup per task just to display a name; returning the assignee
  inline avoids that
- this route ALSO requires requirePermission("view_task"), not just project
  membership — membership alone doesn't guarantee the member's role is
  permitted to view the task list (currently a non-issue since all seeded
  project roles have view_task, but enforced correctly regardless)


===================================================================
6. GET /billing/plans — List Billing Plans
===================================================================
STATUS: DONE
Auth: NOT required (public)

Actual response shape:
{
  "data": [
    { "id": 1, "name": "Free", "price": 0, "maxProjects": 1 },
    { "id": 2, "name": "Starter", "price": 29900, "maxProjects": 5 },
    { "id": 3, "name": "Pro", "price": 79900, "maxProjects": 20 },
    { "id": 4, "name": "Business", "price": 199900, "maxProjects": null }
  ]
}

Corrections from proposal:
- id is the real integer plans.id — REQUIRED for calling the existing
  POST /companies/:companyId/checkout endpoint, which expects plan_id as
  a coerced number. The proposal's slug-style ids ("free", "starter") would
  not have worked against checkout at all.
- price is in satang, not baht (see global correction #2 above)
- maxProjects is null for the Business (unlimited) tier — frontend should
  treat null as "no limit" when rendering, not as zero or missing data
- stripePriceId is deliberately EXCLUDED from the public response — internal
  detail, not needed by the frontend, and shouldn't be exposed publicly


===================================================================
7. PATCH /users/me — Update Current User Profile
===================================================================
STATUS: DONE
Auth: required
NEW MODULE CREATED: users/ (did not exist before this endpoint)

Request body (both fields optional — send only what's changing):
{ "name": "Jane Doe", "email": "jane@doe.com" }

Actual response shape:
{
  "message": "Profile updated successfully",
  "data": { "id": 7, "name": "Jane Doe", "email": "jane@doe.com" }
}

Corrections from proposal:
- id is an integer, not a UUID
- server-side duplicate-email check added (returns 409 if another account
  already uses the requested email) — not specified in the original
  proposal but necessary since users.email has a unique constraint

OPEN DESIGN QUESTION (not yet resolved, flag if it becomes a blocker):
Email changes currently have NO verification step — a user can change their
email to anything unclaimed with no confirmation email sent. Acceptable for
now; revisit if email verification is added to the platform later.


===================================================================
8. PUT /users/me/password — Update Current User Password
===================================================================
STATUS: DONE
Auth: required

Request body:
{ "currentPassword": "old-password-here", "newPassword": "new-secure-password-here" }

Actual response shape:
{ "message": "Password changed successfully" }

Corrections/additions beyond proposal:
- requires bcrypt verification of currentPassword against the stored hash
  before allowing the change — returns 401 if it doesn't match (this was
  implied by the proposal's description but not detailed in its spec)
- rejects the change with 400 if newPassword matches the current password
  (not in original proposal — minor UX/no-op prevention)
- newPassword enforces the same minimum length as registration (8 chars)

OPEN DESIGN QUESTION (not yet resolved, flag if it becomes a blocker):
Changing password does NOT invalidate other active JWT sessions/tokens —
this API has no token revocation mechanism. A stolen token remains valid
until natural expiry even after a password change. Acceptable for the
current stage of the project; would need refresh-token architecture or a
token blocklist to fully close this gap.


===================================================================
SUMMARY
===================================================================
All 8 proposed endpoints are implemented and testable. Please update any
frontend code that was built against the ORIGINAL proposal's UUID-style IDs
or baht-formatted prices — those do not match the real API and will cause
type mismatches or incorrect display values if not corrected.

Recommended next step: re-run/re-verify any frontend components built
against these endpoints before this response file existed, specifically
checking ID type handling (string vs number) and price formatting.