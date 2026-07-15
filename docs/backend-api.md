BACKEND API SKILL — Task Management SaaS (task-management-node)
==================================================================

PURPOSE OF THIS FILE
--------------------
This file describes the existing Node.js/Express backend API for a multi-tenant
SaaS task management platform. Use this as ground truth when building the
frontend. Do NOT invent endpoints, field names, or response shapes that
contradict what's documented here — if a needed capability doesn't exist yet,
log it in `new-endpoint-suggestions.txt` instead of assuming it exists.

Base URL (local dev): http://localhost:3000/api/v1
Base URL (Docker):    http://localhost:3000/api/v1 (same, containerized)


TECH CONTEXT
------------
- Backend: Node.js / Express, modular structure (route → controller → service → repository)
- ORM: Prisma 7 with MySQL
- Auth: JWT bearer tokens (Authorization: Bearer <token>)
- Validation: Zod (server returns 400 with a structured errors array on failure)
- All mutating endpoints require Content-Type: application/json
- Error responses are always JSON: { "message": "..." } (never HTML)


AUTHENTICATION
--------------
POST /auth/register
  Body: { name, email, password, companyName }
  Effect: creates a User AND a new Company (user becomes Owner of it) in one transaction
  Response: { message, user, company, token }
  Note: this is "register as a company owner" — there is no separate bare user registration

POST /auth/login
  Body: { email, password }
  Response: { message, user, token }

Auth header for all protected routes:
  Authorization: Bearer <token>

JWT payload shape: { userId, email, iat, exp }
  (platformRole is NOT currently in the JWT — super admin checks re-query the DB)


AUTHORIZATION MODEL (important for frontend UX/state)
-------------------------------------------------------
- A user can belong to MULTIPLE companies (many-to-many via company_members)
- A user can belong to MULTIPLE projects across companies (via project_members)
- There is no single "current company" concept on the backend — the frontend
  must track which company/project context the user is currently viewing and
  include companyId/projectId in the URL for every scoped request
- Roles are scoped independently: "company" scope roles (Owner, Admin, Manager,
  Member, Guest) vs "project" scope roles (Owner, Manager, Developer, Viewer)
- Permissions are granular and role-driven (role_permissions table) — the
  frontend should not hardcode "only Owners can X" assumptions; treat 403
  responses as the source of truth for what the current user can/can't do,
  and consider hiding UI affordances based on membership role where known


COMPANIES
---------
POST /companies/:companyId/invitations
  Auth: required | Requires company membership + "invite_company_member" permission
  Body: { email, role_id }
  Effect: creates a pending CompanyInvitation, sends an email with an accept link
  Response: { message, data: invitation }

GET /companies/invitations/:token
  Auth: NOT required (public — invitee may not have an account yet)
  Response: { data: { email, companyId, userExists } }
  Use this to decide whether to show a "log in to accept" or "create account" flow

POST /companies/invitations/:token/accept
  Auth: required (invitee must already be logged in)
  Response: { message, data: membership }

POST /companies/invitations/:token/register
  Auth: NOT required
  Body: { name, password }
  Effect: creates the user AND accepts the invitation in one step
  Response: { message, user, token }

POST /companies/:companyId/checkout
  Auth: required | company membership + "update_company_settings" permission
  Body: { plan_id }
  Response: { checkoutUrl }  → redirect the browser to this Stripe-hosted URL

[NOT YET BUILT] GET /companies/:companyId — fetch single company details
[NOT YET BUILT] GET /companies — list companies the current user belongs to
[NOT YET BUILT] PATCH /companies/:companyId — update company settings
[NOT YET BUILT] GET /companies/:companyId/members — list company members


PROJECTS
--------
POST /companies/:companyId/projects
  Auth: required | company membership + "create_project" permission +
        active subscription + under plan's max_projects limit
  Body: { title, description? }
  Response: { project }
  Note: creator automatically becomes project Owner (transaction)

POST /companies/:companyId/projects/:projectId/members
  Auth: required | company membership + "invite_project_member" permission
  Body (flexible): single object { user_id, role_id }
                   OR array [{ user_id, role_id }, ...]
                   OR { members: [{ user_id, role_id }, ...] }
  Effect: direct-add of EXISTING users (already known user_id) — no email involved
  Response: { message, data: members }

POST /projects/:projectId/invitations   
  Auth: required | project membership + "invite_project_member" permission
  Body: { email, role_id }
  Effect: invitee must ALREADY be a company member of the project's parent
          company (checked server-side) — this is an email invite, not a direct add
  Response: { message, data: invitation }

POST /projects/:projectId/invitations/:token/accept  
  Auth: required (invitee already has an account by definition)
  Response: { message, data: membership }

[NOT YET BUILT] GET /companies/:companyId/projects — list projects in a company
[NOT YET BUILT] GET /companies/:companyId/projects/:projectId — single project detail
[NOT YET BUILT] PATCH /companies/:companyId/projects/:projectId — update project settings
[NOT YET BUILT] DELETE /companies/:companyId/projects/:projectId — delete project
[NOT YET BUILT] GET /companies/:companyId/projects/:projectId/members — list project members
[NOT YET BUILT] DELETE .../members/:userId — remove a project member


TASKS
-----
POST /projects/:projectId/tasks
  Auth: required | project membership + "create_task" permission
  Body: { title, description?, priority?, status?, start_date?, end_date?, user_id? }
    - priority: "high" | "medium" | "low"
    - status: "pending" | "complete" (defaults to "pending")
    - start_date / end_date: ISO date strings
    - user_id: assignee — if provided, MUST already be a project member
               (validated server-side; 400 if not)
  Response: { project: task }  [NOTE: verify actual response key — may be
             inconsistent, check controller before wiring frontend]

GET /projects/:projectId/tasks/mine
  Auth: required | project membership
  Response: { data: [task, task, ...] }
  Returns tasks in this project assigned to the CURRENT user only

PATCH /projects/:projectId/tasks/:taskId/status
  Auth: required | project membership
  Body: { status: "pending" | "complete" }
  Authorization rule: only the task's assignee can currently update status
                        (not the creator, not other roles — unless/until
                        "update_any_task" permission logic is added)
  Response: { message, data: task }

[NOT YET BUILT] GET /:projectId/tasks — list ALL tasks in a project (not just "mine")
[NOT YET BUILT] GET /:projectId/tasks/:taskId — single task detail
[NOT YET BUILT] PATCH /:projectId/tasks/:taskId — update task fields (title, description, priority, dates, reassignment)
[NOT YET BUILT] DELETE /:projectId/tasks/:taskId — delete a task


BILLING
-------
POST /billing/:companyId/checkout — see COMPANIES section above
POST /billing/webhook
  This is a Stripe-only endpoint (raw body, signature-verified). The frontend
  never calls this directly. After Stripe Checkout, the user is redirected to:
    {APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}
    {APP_URL}/billing/cancel
  These are FRONTEND routes the frontend must implement — the backend just
  redirects the browser there after Stripe checkout completes/cancels.

Plans (seeded, read-only for now):
  Free (฿0, 1 project), Starter (฿299, 5 projects),
  Pro (฿799, 20 projects), Business (฿1,999, unlimited)

[NOT YET BUILT] GET /plans — list available plans (frontend needs this for pricing page)
[NOT YET BUILT] GET /companies/:companyId/subscription — current subscription status


ADMIN / SUPER ADMIN
--------------------
POST /admin/promote-super-admin  [confirm exact mount prefix]
  Auth: required | requires super admin (platformRole === "super_admin")
  Body: { user_id }
  Response: { message, data: user }

POST /permissions
  Auth: required | requires super admin
  Body: { name }
  Response: [confirm response shape — not fully specified yet]

[NOT YET BUILT] Full admin dashboard endpoints (list all companies, all users,
  platform-wide activity, revenue overview, etc.) — build as needed


ACTIVITY LOGS
-------------
[PARTIALLY BUILT — confirm exact routes before wiring frontend]
GET /activity-logs  (super admin, platform-wide)
[NOT YET BUILT] GET /companies/:companyId/activity-logs (company-scoped feed)
[NOT YET BUILT] GET /:projectId/activity-logs (project-scoped feed)


ERROR HANDLING (what the frontend should expect)
--------------------------------------------------
All errors return JSON: { "message": "human-readable string" }
Common status codes actually used in this API:
  400 — validation failure or bad business-rule input
  401 — not authenticated / invalid or expired token
  403 — authenticated but not authorized (permission/membership/plan/billing issue)
  404 — resource not found
  409 — conflict (e.g. duplicate email on register)
  500 — unexpected server error

Zod validation failures (400) may include an additional `errors` array with
{ field, message } objects — confirm exact shape from a live 400 response
before building form error-display logic around it.


FRONTEND IMPLEMENTATION NOTES
-------------------------------
- Store JWT in memory or a secure cookie strategy — this backend does not
  currently implement refresh tokens (tokens are long-lived, ~7d default)
- No CORS configuration has been confirmed yet — if frontend runs on a
  different port during dev, backend CORS middleware may need to be added
  (flag this as a potential new backend requirement if it blocks you)
- The backend does not return a "list of companies I belong to" endpoint yet —
  this is very likely needed early for any real frontend (company switcher UI)
  — see new-endpoint-suggestions.txt
- Task creation response key naming should be double-checked against the
  actual running controller before assuming { project: task } vs { task }
- Always confirm exact route mount prefixes (some route files above have
  [confirm exact mount path] notes) by checking routes/routes.js directly
  before building frontend API calls against assumed paths


HOW TO USE THIS FILE
---------------------
When building a frontend feature:
1. Check this file for the exact existing endpoint, method, auth requirements,
   and body/response shape.
2. If the endpoint exists, build against it exactly as documented — do not
   guess field names.
3. If the endpoint does NOT exist (marked [NOT YET BUILT] above, or not
   mentioned at all), STOP and add an entry to new-endpoint-suggestions.txt
   instead of fabricating a fake API call. Continue building the UI using
   mock/placeholder data if needed, clearly marked as such, so backend work
   can catch up afterward.
